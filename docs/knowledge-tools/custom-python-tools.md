---
sidebar_position: 2
title: Custom Python Tools
slug: /knowledge-tools/custom-python-tools
---

# Custom Python Tools

Write a Python function. The on-device model can call it — and can learn it.

```python
# tools.py
from edgestudio.tools import edge_tool

@edge_tool
def hello_world() -> str:
    return "hello world"

@edge_tool(description="Compute the service fee for an amount.", intent_tags=["billing"])
def calculate_fee(amount: float) -> dict:
    return {"fee": amount * 0.003}
```

```bash
edge demo chat --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --prompt "Use the calculate_fee tool for amount 250. State the exact fee."
```

You do not write a server, a manifest, a port, or an HTTP endpoint. Edge
discovers your functions, generates the model-visible schema from your type
hints, runs your code in an isolated runner process, validates every call, and
writes hash-first receipts.

:::info Version
Custom Python tools require `edge-studio` **0.0.1rc21 or newer**. On rc20 and
earlier, chat supports the built-in `local_facts_lookup` executor only — see
[the 5-minute demo](/docs/quickstart/first-agent) for the manifest-based path that
still works on every version.
:::

## How A Tool Call Actually Runs

The model never executes code. Your code never runs inside the Edge CLI or the
model process. The loop between them is deterministic and fail-closed:

| Step | Who | What happens |
| --- | --- | --- |
| 1 | Edge | Freezes the **active tool set** from your file before generation and injects the JSON tool-call contract |
| 2 | Model | Emits plain text; a tool call is a single strict JSON object: `{"tool_name": "...", "arguments": {...}}` |
| 3 | Edge | Parses and validates: tool name in the frozen active set, arguments match the schema, call limit not exceeded |
| 4 | Runner | Edge spawns its own fixed runner subprocess, verifies the tools file is byte-identical to the frozen state, imports it, and executes exactly one function |
| 5 | Edge | Validates the result (JSON object, size cap), appends the call and the result to the conversation, and lets the model continue |
| 6 | Model | Answers using the tool result, or issues another call (at most 4 per prompt) |

Anything unexpected — an unknown tool, invalid arguments, a changed file, a
timeout, an oversized result — fails closed: the tool is not executed, or its
result is not used, and the receipt records why.

## Writing Tool Functions

`@edge_tool` only attaches metadata. Your file stays a normal Python file.

```python
from typing import Literal, Optional
from edgestudio.tools import edge_tool

@edge_tool
def order_status(order_id: str) -> dict:
    """Look up the status of a local order record."""
    return {"order_id": order_id, "status": "shipped"}

@edge_tool(
    name="fee_quote",                 # defaults to the function name
    description="Quote the fee for a tier.",
    intent_tags=["billing", "quote"], # used by --tool-tag selection
)
def calculate_fee(
    amount: float,
    tier: Literal["basic", "pro"] = "basic",
    note: Optional[str] = None,
) -> dict:
    return {"fee": amount * (0.003 if tier == "basic" else 0.002)}
```

Rules:

- Tool names match `[A-Za-z_][A-Za-z0-9_]{0,63}` and must be unique per file.
- Every parameter needs a supported type hint. Missing or unsupported hints
  fail validation — nothing silently becomes `Any`.
- The docstring's first line is used as the description when the decorator does
  not set one.
- v1 tools are read-only JSON tools: `permissions` supports `read_local` only.
  Action tools, file writes, and network declarations are not accepted yet.

### Supported Parameter Types

| Type hint | JSON schema |
| --- | --- |
| `str`, `int`, `float`, `bool` | `string`, `integer`, `number`, `boolean` |
| `Literal["a", "b"]` | enum of one primitive type |
| `Optional[T]` / `T \| None` | nullable `T` |
| `list[T]` | array of a supported `T` |

Anything else — `dict`, dataclasses, unions of two non-None types, `**kwargs` —
is rejected by `edge tools validate` with an explicit error.

### Return Values

- Return a JSON-serializable `dict` to control the exact shape the model sees.
- Scalars and lists (`str`, `int`, `float`, `bool`, `list`, `None`) are wrapped
  as `{"result": value}`.
- Results are capped at 64 KB of canonical JSON. Oversized results fail closed.
- Exceptions raised by your function end the tool loop fail-closed; the model
  falls back to a safe answer. Return a normal payload such as
  `{"matches": []}` for "not found" cases you want the model to reason about.

## Validate And Inspect

```bash
edge tools validate ./tools.py --json
edge tools inspect  ./tools.py --json
```

`validate` checks names, type hints, duplicates, and the active-set limit.
`inspect` additionally prints each generated schema, a per-tool
`schema_sha256`, the `active_set_sha256`, and the `tools_file_sha256`.

:::warning Validation executes your file's top level
Discovery imports the file (inside the isolated runner, never in the Edge CLI
process). Top-level code runs, so `validate` is not a static scan and is not a
safety check for untrusted files. Only point Edge at tool files you trust.
:::

## Chatting With Tools

```bash
edge demo chat --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --prompt "Quote the fee for amount 400, tier pro." \
  --json
```

Selection and limits:

- Up to **8 tools** are exposed per run. A file may define more, but then you
  must narrow the active set with `--tool <name>` (repeatable) or
  `--tool-tag <tag>`.
- `--tools`, `--tools-manifest`, and `--facts-store` are mutually exclusive.
- `--tool` / `--tool-tag` require `--tools`.

Runtime behavior worth knowing:

- Each tool call runs in a fresh runner process: your file's top level executes
  on every call, and no state persists between calls. Keep the top level light;
  load data inside the function or from disk.
- `print()` output from your code goes to stderr. The runner's stdout carries
  only the JSON protocol.
- Per-call timeout is 10 seconds; a timed-out runner is killed and the call
  fails closed.
- If you edit the tools file while a chat session is running, the next call
  fails closed with `tools_file_changed` instead of silently executing code
  that was never frozen. Start a new session to pick up the edit.

## Learning Tools: Neural Imprint

Profile learning and tool learning ride the same artifact. `edge demo learn`
can bake your tool contract into the Neural Imprint, so a restored Agent
already knows your tools — the schemas are part of its computational state,
not a prompt pasted at runtime.

```bash
edge demo learn run \
  --sample-file ./learn_sample.json \
  --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --json
```

Then chat with the baked artifact and the same tools file:

```bash
edge demo chat --model qwen3.5-9b-4bit \
  --with-imprint <artifact-or-receipt-path> \
  --tools ./tools.py \
  --prompt "Quote the fee for amount 100." \
  --json
```

The chat receipt reports `tool_instruction_mode: imprint`: the tool contract
came from the restored prefix, and Edge injects no duplicate instruction.

### What Invalidates A Learned Imprint

The model learns your tools' **schemas**, never their implementation. The
restore gate is therefore schema-level:

| You changed | Restore |
| --- | --- |
| Function bodies, comments, formatting — signatures unchanged | ✅ Restores; no relearn needed |
| A parameter, a type hint, a tool name, a description, the active set | ❌ Fails closed — relearn with the current file |
| Chat without `--tools` while the imprint was learned with tools | ❌ Fails closed with `imprint_requires_tools` |

Fail-closed means exactly that: Edge refuses to pair a stale contract with a
different runtime instead of guessing. There is no compatibility mapping —
relearning is the only upgrade path, by design.

## Security And Audit Model

What Edge guarantees:

- The model only ever emits a JSON call; Edge validates and dispatches it.
- Your code executes only in an Edge-owned runner subprocess — never in the
  Edge CLI or model process — and only for tools in the frozen active set.
- The runner verifies the file it executes is byte-identical to the frozen
  state before importing it.
- Tools load only when you explicitly pass `--tools`. Edge never scans
  directories or auto-loads tool files.
- Receipts are hash-first: `tools_file_sha256`, `active_set_sha256`,
  `schema_generator_version`, and per-call `args_sha256`, `result_sha256`,
  `tool_schema_sha256`, `runner_secret_verified`, plus
  `network_used_by_edge: false` for every tool call.

What Edge does not claim:

- Your tool code runs with your user permissions. Edge attests what **Edge**
  did — it does not prove whether your code used the network, read files, or
  spawned processes. Tool behavior is your code, your responsibility.

## Troubleshooting

| Error code | Meaning | Fix |
| --- | --- | --- |
| `unsupported_type_hint` / `missing_parameter_type_hint` | A parameter hint is unsupported or absent | Use the supported types table above |
| `duplicate_tool_name` | Two tools resolve to the same name | Rename one |
| `active_tool_limit_exceeded` | More than 8 tools discovered | Select with `--tool` / `--tool-tag` |
| `invalid_tool_args` | Model sent unknown/missing/mistyped arguments | Usually retried automatically; recurring cases mean the schema is ambiguous — improve names and descriptions |
| `tools_file_changed` | File edited after the session froze it | Start a new chat session |
| `runner_timeout` | A call exceeded 10 s | Keep tools fast and local |
| `tool_result_oversized` / `unsupported_tool_result` | Result over 64 KB or not JSON-serializable | Return a bounded `dict` |
| `imprint_requires_tools` | Imprint was learned with tools; chat ran without `--tools` | Pass the matching tools file |
| `imprint_tool_active_set_mismatch` / `imprint_tool_schema_mismatch` | Tool schemas differ from the learned contract | Relearn, or restore the original signatures |
| `conflicting_tool_options` | `--tools` combined with `--tools-manifest` or `--facts-store` | Pick one tool surface per run |

## When To Use The Manifest Path Instead

`--tools-manifest` (see the [5-minute demo](/docs/quickstart/first-agent)) remains
the right surface when you only need stable developer-owned **names** over the
built-in local facts lookup, or when you are on rc20. Custom Python tools are
the path when the logic itself is yours.
