---
sidebar_position: 6
title: Tool Learning
slug: /knowledge-tools/tool-learning
---

# Tool Learning

The Agent does not only learn who the user is. It also learns which local tools
the carrier exposes, when they are appropriate, and which tools or claims are
out of bounds. This page covers how tool schemas and tool policy enter the
learning loop — and what is deliberately **not** learned.

## What The Model Learns: Schemas, Never Implementation

The model learns tool *contracts*: names, descriptions, input schemas, and
usage policy. It never sees or learns tool implementation code. That boundary
is what makes restore gates schema-level: you can rewrite a tool's function
body freely, and a baked Neural Imprint stays valid as long as the schema is
unchanged.

## Expected Tool Policy In Learn Samples

A learn sample can declare the carrier's tool surface
(`tool_schema_export`) and the expected usage policy. The learn dry-run then
reports a deterministic preview:

```json
{
  "tool_learning": {
    "policy_kind": "deterministic_preview",
    "actual_tool_calls": false,
    "expected_tool_policy": {
      "description": "Deterministic tool-use policy learned from this sample",
      "tools_available": [
        {
          "name": "sample_finance_facts_lookup",
          "when": "User asks about specific financial preferences or risk boundaries",
          "args_constraint": "topic must be one of: risk_boundary, cashflow, trust_boundary"
        }
      ],
      "negative_policy": [
        "Do not call tools that require network access",
        "Do not invent financial return numbers without user-provided facts"
      ]
    }
  }
}
```

This is a deterministic preview, not a live tool-call trace. The
`negative_policy` matters as much as the tool list: it teaches which actions
stay out of bounds.

## Keep Learned Names Aligned With Runtime Names

If the sample's `tool_schema_export.tools[].name` is `protocol_docs_lookup`,
runtime chat must register that same name (via a tools manifest or Python
tools). Audit before a run:

```bash
edge demo tools validate ./tools.json \
  --learn-sample ./sample.json \
  --json
```

The validator warns on name mismatches but does not block; a mismatch means the
Neural Imprint prefix and the runtime tool registry teach different names. Fix
one side so they match.

## Bake Python Tool Schemas Into The Imprint

Requires edge-studio `0.0.1rc21` or later.

With [Custom Python Tools](/docs/knowledge-tools/custom-python-tools), the
learning run can freeze your decorated functions' generated schemas and bake
the tool contract into the Neural Imprint:

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --max-tokens 160
```

The artifact metadata then binds the active tool set: schema generator version,
per-tool schema hashes, and the active-set hash. At restore time, chat with
`--with-imprint` plus `--tools` passes only if the schemas still match.

## Schema-Level Restore Gates

Restore is fail-closed on the tool contract, not on file bytes:

| Restore situation | Result |
|---|---|
| Same tools file, unchanged | Restores |
| Implementation-only edit (function body, comments) | Restores — schema unchanged |
| Signature/type/name change (schema changes) | Fails closed: `imprint_tool_schema_mismatch` |
| Different active tool set | Fails closed: `imprint_tool_active_set_mismatch` |
| Imprint baked with tools, chat run without `--tools` | Fails closed: `imprint_requires_tools` |

When a gate fails, re-learn with the current tools file or run without the
imprint. The base-model path always remains available.

## What Comes Next

Tool learning today bakes contracts into the Neural Imprint prefix. Learning
better *usage* of tools from real trajectories is a separate, evaluation-gated
track — it is not part of the current preview.
