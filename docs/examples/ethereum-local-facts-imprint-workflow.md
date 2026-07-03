---
title: "Ethereum Workflow: Local Facts + Neural Imprint"
sidebar_label: Ethereum Local Facts
---

# Ethereum Workflow: Local Facts + Neural Imprint

This example is for Ethereum application developers evaluating Edge Developer
Preview. It shows how to combine two local personalization paths:

- local facts for protocol, contract, audit, and app-policy knowledge that
  changes over time
- Neural Imprint for behavior: risk posture, refusal boundaries, answer style,
  confirmation flow, and tool-use habits

The core rule is simple: **do not train every piece of business knowledge into
the model.**

## Split Knowledge From Behavior

Start by sorting your material into two buckets.

| Material | Put it in | Why |
|---|---|---|
| EIP summaries, protocol rules, audit conclusions, contract ABI notes, safety checklists | `edge demo facts` local facts store | This knowledge changes. Re-import the file when it changes; no learning run is required. |
| Risk posture, answer ordering, confirmation boundaries, missing-field policy | `edge demo learn` or `edge demo imprint` | These are behavior preferences that should become recoverable Neural Imprint state. |

Ethereum is only the example domain. The Edge commands and schema names are
generic:

- facts store: any store name, such as `ethereum_research_v1`
- built-in tool shortcut: `edge demo chat --facts-store <store>` registers `local_facts_lookup`
- developer-named tool path: `edge demo tools validate ./tools.json`, then `edge demo chat --tools-manifest ./tools.json`
- behavior learning: `edge demo learn run --sample-file ...`

Tool names must stay aligned. If a learn sample teaches
`tool_schema_export.tools[].name = "ethereum_facts_lookup"`, runtime chat should
register that same name through `--tools-manifest`. If you use the
`--facts-store` shortcut instead, the sample should still use the built-in
`local_facts_lookup` name.

## Prerequisites

Install Edge Studio Developer Preview and prepare a local model:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio

edge doctor
edge models where qwen3.5-9b-4bit
```

If the model is not available locally:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

All following commands assume the same Python environment.

## Create An Ethereum Facts File

Create `eth-facts-v1.json`:

```json
{
  "schema_version": "edge.demo.facts.v1",
  "store": "ethereum_research_v1",
  "facts": [
    {
      "fact_id": "eip-1559-base-fee",
      "topic": "EIP-1559 base fee",
      "text": "EIP-1559 introduces a protocol-defined base fee that is burned and changes per block based on gas demand.",
      "tags": ["ethereum", "eip", "gas"],
      "source_label": "developer-notes"
    },
    {
      "fact_id": "erc20-approve-risk",
      "topic": "ERC-20 approve risk",
      "text": "An ERC-20 approve call can grant a spender permission to transfer tokens up to the approved allowance. Large or unlimited approvals should be highlighted as a risk before the user confirms.",
      "tags": ["ethereum", "erc20", "risk", "approval"],
      "source_label": "security-notes"
    },
    {
      "fact_id": "transaction-no-auto-sign",
      "topic": "transaction signing boundary",
      "text": "The assistant must not sign or broadcast a transaction. It may explain a transaction plan and ask the user for explicit confirmation.",
      "tags": ["ethereum", "transaction", "boundary"],
      "source_label": "app-policy"
    }
  ]
}
```

Import it:

```bash
edge demo facts import ./eth-facts-v1.json \
  --store ethereum_research_v1 \
  --json
```

List imported facts:

```bash
edge demo facts list \
  --store ethereum_research_v1 \
  --json
```

Inspect one fact during development:

```bash
edge demo facts inspect erc20-approve-risk \
  --store ethereum_research_v1 \
  --include-text \
  --json
```

By default, command output and receipts are hash-only. Fact text is shown only
when you pass `--include-text`.

### Optional: Import An Index Page From A URL

For public documentation indexes, you can import one bounded HTTP(S) URL
directly. This example imports table rows as facts and stores row links as data;
Edge does not follow those links.

```bash
edge demo facts import-url "https://eips.ethereum.org/all" \
  --store ethereum_research_v1 \
  --topic "EIP index" \
  --tags ethereum,eip,index \
  --split html-table-rows \
  --fact-id-prefix eip-index \
  --json
```

Use explicit leaf-page imports or local fact files for the detailed material you
want the Agent to rely on. `import-url` is a single-URL import command, not a
crawler.

### Optional: Extract Facts With A Larger Local Model

Requires edge-studio `0.0.1rc22` or later.

For long prose pages where table-row splitting is not enough, use an explicit
host-model extractor. The extractor runs on the local Mac model you name; Edge
then validates the model output against `edge.demo.facts.v1` before writing to
the store.

```bash
edge demo facts import-url "https://example.org/protocol-note" \
  --store ethereum_research_v1 \
  --topic "protocol note" \
  --tags ethereum,protocol,notes \
  --extractor host-model \
  --extractor-model qwen3.5-27b-4bit \
  --json
```

Use this when a stronger local model is useful for extraction quality. The
receipt records the extractor model, prompt/schema hashes, input/output hashes,
validation status, whether the model input was truncated by `--max-chars`, and
`non_deterministic_extraction: true`. It is still an explicit local import path,
not background crawling or cloud RAG.

### Optional: Crawl A Small Same-Origin Documentation Set

Requires edge-studio `0.0.1rc22` or later.

When a documentation set spans a few linked pages, use `crawl-url` instead of
hiding crawling inside `import-url`.

```bash
edge demo facts crawl-url "https://example.org/docs" \
  --store ethereum_research_v1 \
  --topic "protocol docs" \
  --tags ethereum,protocol,docs \
  --max-depth 1 \
  --max-urls 10 \
  --max-bytes 1000000 \
  --max-bytes-total 5000000 \
  --timeout 15 \
  --json
```

This is a bounded static HTTP(S) crawl: same origin only, no browser, no
JavaScript execution, explicit URL/byte/depth limits, and hash-first receipts.
Same-origin enforcement is always on — there is no cross-origin mode. The
command stores fetched URL hashes, redirect-chain hashes, failed URL statuses,
total bytes, and the policy decision. `crawl-url` does not consult
`robots.txt`; the receipt discloses this as an explicit policy decision, so
point it only at documentation sets you are entitled to fetch. It is a generic
material import surface; Ethereum is only the example domain on this page.

## Register A Developer-Named Read-Only Tool

The `--facts-store` shortcut is useful for quick checks. For app integration,
prefer a stable tool name owned by the carrier. This manifest path, introduced
in rc20, names and binds the built-in read-only local facts lookup executor. It
does not register developer-implemented tool code. Create `tools.json`:

```json
{
  "schema_version": "edge.demo.tools.manifest.v1",
  "tools": [
    {
      "name": "ethereum_facts_lookup",
      "kind": "local_facts_lookup",
      "store": "ethereum_research_v1",
      "description": "Read-only lookup for imported Ethereum facts and app policies."
    }
  ]
}
```

Validate it:

```bash
edge demo tools validate ./tools.json --json
```

The only executable kind in this preview is `local_facts_lookup`. Edge owns that
executor and the dispatcher that calls it. The manifest does not authorize
network access, process execution, signing, broadcasting, file writes, or
developer-implemented tool code. For developer-authored function logic, use the
Python tools path below.

## Implement Your Own Tool Logic

When the logic itself is yours, write a Python tool instead of a manifest. The
minimal tool is just a function:

```python
# tools.py
from edgestudio.tools import edge_tool

@edge_tool
def hello_world() -> str:
    return "hello world"
```

Validate and run it:

```bash
edge tools validate ./tools.py --json

edge demo chat \
  --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --prompt "Call hello_world and report the result." \
  --json
```

Edge discovers the decorated functions, generates schemas from type hints,
freezes the active set, and executes calls in an Edge-owned runner subprocess.
The model only emits JSON tool calls; Edge validates and dispatches them. See
[Custom Python Tools](/docs/guides/custom-python-tools) for multiple tools,
selection with `--tool` / `--tool-tag`, receipts, and `edge demo learn run
--tools`.

## Use Local Facts In Chat

Enable the manifest explicitly with `--tools-manifest`:

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --prompt "What risk should I check before an ERC-20 approve call? Check local facts." \
  --tools-manifest ./tools.json \
  --include-text \
  --json
```

In the JSON receipt, check these fields:

```json
{
  "facts_store": "ethereum_research_v1",
  "tools_manifest_sha256": "sha256:...",
  "tool_loop_status": "completed",
  "tool_instruction_mode": "system",
  "tool_instruction_sha256": "sha256:...",
  "tool_calls": [
    {
      "name": "ethereum_facts_lookup",
      "status": "matched",
      "rows": 1,
      "args_sha256": "sha256:...",
      "result_sha256": "sha256:...",
      "network_used": false
    }
  ],
  "network_used": false
}
```

Acceptance checks:

| Field | Expected result |
|---|---|
| `tool_calls[].name` | `ethereum_facts_lookup` |
| `tool_calls[].rows` | Greater than `0` when local facts matched |
| `tool_calls[].result_sha256` | Hash of the local lookup result |
| `network_used` | `false` |
| `tool_instruction_sha256` | Hash of the model-visible tool instruction |

Without `--tools-manifest` or `--facts-store`, chat does not register a local
facts tool and remains ordinary base-model chat.

## Learn Ethereum Behavior Boundaries

Facts answer "what should the model look up?" Learn samples answer "how should
the agent act?"

For Ethereum apps, useful behavior boundaries include:

- explain risk before transaction structure
- ask follow-up questions when chain ID, contract address, ABI, spender, amount,
  recipient, or value is missing
- never sign transactions
- never broadcast transactions
- do not claim that a token, contract, or transaction is safe unless that
  conclusion is present in local facts
- use local facts for protocol and risk claims

Edge Learn does not change base model weights and does not stuff a large prompt
into every request. It generates a recoverable, removable, auditable Neural
Imprint artifact. Later chat commands restore it with `--with-imprint`.

### Learn, Imprint, And Facts

| Path | Use when | Input | Output |
|---|---|---|---|
| `edge demo learn` | You have explicit corrections and want to teach "that was wrong; do this instead" | records + corrections + tool policy | learn receipt + Neural Imprint artifact |
| `edge demo imprint` | You have behavior records and preferences, but no correction | records + questions | imprint receipt + Neural Imprint artifact |
| `edge demo facts` | You have factual knowledge that may change often | fact rows | local SQLite facts store |

Most Ethereum applications use both:

1. EIP, contract, audit, and app-policy knowledge goes into facts.
2. Transaction safety posture and answer style go into learn.

### Create A Learn Sample

Start from the guided template:

```bash
edge demo learn sample init --interactive --output ./eth-risk-sample.json
```

If you write it manually, keep this shape:

```json
{
  "schema_version": "edge.demo.learn.sample.v1",
  "sample_id": "ethereum_risk_boundary_v1",
  "peer_id": "ethereum-demo-peer",
  "app_id": "com.example.ethereum-agent",
  "base_model_id": "qwen3.5-9b-4bit",
  "question": "Help me assess this token approval transaction.",
  "questions": [
    "Help me assess this token approval transaction.",
    "Can you build a transaction plan if the spender and amount are missing?"
  ],
  "records": [
    {
      "record_id": "eth-boundary-001",
      "kind": "trust_boundary",
      "text": "The assistant must never sign or broadcast transactions. It may only explain a transaction plan and ask for explicit user confirmation.",
      "tags": ["ethereum", "transaction", "boundary"]
    },
    {
      "record_id": "eth-risk-001",
      "kind": "answer_style",
      "text": "The assistant should explain risks before transaction structure and should call out missing chain ID, contract address, ABI, spender, recipient, amount, and value.",
      "tags": ["ethereum", "risk", "style"]
    }
  ],
  "corrections": [
    {
      "peer_id": "ethereum-demo-peer",
      "app_id": "com.example.ethereum-agent",
      "correction_type": "profile_correction",
      "target": {"profile_field": "ethereum_transaction_guidance"},
      "correction": {
        "profile_overlay": {
          "priority": "risk first, transaction structure second",
          "boundary": "never sign or broadcast; require explicit confirmation",
          "missing_information_policy": "ask follow-up questions for chain ID, contract address, ABI, spender, amount, recipient, and value"
        }
      },
      "status": "recorded"
    }
  ],
  "tool_schema_export": {
    "schema_version": "edgestudio.tool_schema_export.v1",
    "tools": [
      {
        "name": "ethereum_facts_lookup",
        "description": "Read-only lookup for imported Ethereum facts and app policies.",
        "permissions": ["read_facts"],
        "intentTags": ["exact_fact"],
        "parameters": {
          "type": "object",
          "properties": {
            "query": {"type": "string"},
            "topic": {"type": "string"},
            "limit": {"type": "integer"}
          }
        }
      }
    ]
  },
  "expected_tool_policy": {
    "description": "Use local facts for protocol rules, risk checks, and app policies before giving transaction guidance.",
    "tools_available": [
      {
        "name": "ethereum_facts_lookup",
        "when": "The user asks about protocol rules, EIP behavior, transaction risk, token approval, or app policy.",
        "args_constraint": "Use a short query or topic; do not include private keys or secrets."
      }
    ],
    "negative_policy": [
      "Do not call network tools.",
      "Do not sign or broadcast transactions.",
      "Do not invent safety claims.",
      "Do not claim returns or security guarantees."
    ]
  }
}
```

The tool name must match the runtime registry. This example uses
`ethereum_facts_lookup`, so chat must run with the `tools.json` manifest that
registers `ethereum_facts_lookup`. If you choose the `--facts-store` shortcut
instead of a manifest, use the built-in `local_facts_lookup` name in the sample.

### Validate And Dry Run

Validate the sample:

```bash
edge demo learn sample validate ./eth-risk-sample.json --json
```

Then validate the manifest against the sample:

```bash
edge demo tools validate ./tools.json \
  --learn-sample ./eth-risk-sample.json \
  --json
```

The report should have `warning_count: 0`. A
`tool_schema_export_name_mismatch` warning means the Neural Imprint prefix and
runtime registry are teaching different tool names.

Expected shape:

```json
{
  "ok": true,
  "status": "valid",
  "sample_id": "ethereum_risk_boundary_v1",
  "sample": {
    "record_count": 2,
    "correction_count": 1,
    "question_count": 2,
    "sample_sha256": "sha256:...",
    "tool_schema_sha256": "sha256:..."
  }
}
```

Then audit the learning plan without loading the model or writing demo state:

```bash
edge demo learn run \
  --dry-run \
  --sample-file ./eth-risk-sample.json \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

Use the dry run to confirm records, corrections, tool schema, expected policy,
and question coverage before model execution.

### Run Edge Learn

```bash
edge demo learn run \
  --sample-file ./eth-risk-sample.json \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

Save the returned `receipt_path`. Later chat calls pass it to `--with-imprint`.
The stdout report nests sample metadata under `sample` and generation paths
under `generation`; full restored artifact details are also recorded in the
`learn_receipt.json` file pointed to by `receipt_path`.

Key fields:

```json
{
  "status": "completed",
  "receipt_path": ".../learn_receipt.json",
  "network_used_during_demo": false,
  "question_count": 2,
  "sample": {
    "sample_id": "ethereum_risk_boundary_v1",
    "record_count": 2,
    "correction_count": 1
  },
  "generation": {
    "artifact_path": ".../neural_imprint.safetensors",
    "metadata_path": ".../neural_imprint_metadata.json"
  }
}
```

## Combine Facts And Neural Imprint

Run chat with both local facts and the learned behavior state:

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --with-imprint ./learn_receipt.json \
  --tools-manifest ./tools.json \
  --prompt "Assess this ERC-20 approval plan. Check local facts first. Spender is 0xabc..., amount is unlimited." \
  --include-text \
  --json
```

In combined mode, expect:

```json
{
  "neural_imprint": {
    "active": true,
    "artifact_id": "..."
  },
  "facts_store": "ethereum_research_v1",
  "tools_manifest_sha256": "sha256:...",
  "tool_instruction_mode": "hidden_turns",
  "tool_instruction_sha256": "sha256:...",
  "tool_calls": [
    {
      "name": "ethereum_facts_lookup",
      "status": "matched",
      "rows": 1
    }
  ]
}
```

Acceptance checks:

1. `neural_imprint.active == true`
2. `tool_instruction_mode == "hidden_turns"`
3. `tool_calls[].name == "ethereum_facts_lookup"`
4. `tool_calls[].rows > 0`
5. `network_used == false`

## Update Knowledge Without Re-Learning

This is the key product behavior for Ethereum developers: facts can change
without re-running learn.

Import a v1 policy:

```json
{
  "schema_version": "edge.demo.facts.v1",
  "store": "ethereum_research_v1",
  "facts": [
    {
      "fact_id": "app-policy-max-approval",
      "topic": "approval review policy",
      "text": "For unlimited ERC-20 approvals, the assistant should warn that the spender may transfer tokens up to the approved allowance until approval is changed.",
      "tags": ["ethereum", "erc20", "approval", "risk"],
      "source_label": "app-policy-v1"
    }
  ]
}
```

Run chat with the same `learn_receipt.json`, then re-import v2 using the same
`fact_id` and changed `text`:

```json
{
  "schema_version": "edge.demo.facts.v1",
  "store": "ethereum_research_v1",
  "facts": [
    {
      "fact_id": "app-policy-max-approval",
      "topic": "approval review policy",
      "text": "For unlimited ERC-20 approvals, the assistant should warn that the spender may transfer tokens up to the approved allowance and should suggest a bounded allowance when the app supports it.",
      "tags": ["ethereum", "erc20", "approval", "risk"],
      "source_label": "app-policy-v2"
    }
  ]
}
```

Compare receipts before and after re-import:

| Field | Expected result |
|---|---|
| `model.sha256` | unchanged |
| `neural_imprint.artifact_id` | unchanged |
| `tool_calls[0].result_sha256` | changed |
| `answer_sha256` | usually changed |
| `tool_calls[0].name` | always `ethereum_facts_lookup` in this manifest path |

That proves knowledge refresh happened through facts re-import, not another
learning run.

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Large EIP text was placed in `records` | Put protocol knowledge in facts; keep records focused on behavior. |
| Model emits `unknown_tool` | Ensure `tool_schema_export.tools[].name` matches the runtime tool name. Use `ethereum_facts_lookup` with this manifest, or `local_facts_lookup` with `--facts-store`. |
| The assistant claims a contract is safe | Teach the boundary in learn and require facts for safety claims. |
| Facts text appears in stdout unexpectedly | Remove `--include-text`; default receipts are hash-only. |
| Knowledge changed but behavior should not | Re-import facts; do not re-run learn unless behavior changed. |

## Minimum Developer Checklist

Ask the Ethereum developer to complete these six tasks:

1. Create `eth-facts-v1.json`.
2. Run `edge demo facts import ./eth-facts-v1.json --store ethereum_research_v1 --json`.
3. Create `tools.json`, run `edge demo tools validate ./tools.json --json`, then run `edge demo chat --tools-manifest ./tools.json ... --json` and confirm `tool_calls[].rows > 0`.
4. Create `eth-risk-sample.json` with `ethereum_facts_lookup` as the tool name, and run `edge demo tools validate ./tools.json --learn-sample ./eth-risk-sample.json --json`.
5. Run `edge demo learn run --sample-file ./eth-risk-sample.json ... --json`.
6. Run chat with the same `learn_receipt.json` plus `--tools-manifest`, then re-import v2 facts and confirm the answer follows the updated local facts.

If all six pass, the developer has completed the current Developer Preview
business integration loop: local facts for changing knowledge, Neural Imprint
for recoverable behavior, and receipts for audit.
