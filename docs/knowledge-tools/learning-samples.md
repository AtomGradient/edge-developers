---
sidebar_position: 1
title: Author Learning Samples
slug: /knowledge-tools/learning-samples
---

# Author Learning Samples

The quickstart uses `finance_conservative_cashflow_v1`, a built-in synthetic
sample shipped with the CLI. To teach the Agent from your own local data, save
a sample file in the same shape and pass it with `--sample-file`. This page
covers authoring, validation, and the decision of which learning path your data
belongs to.

The Mac CLI learning path does not consume the `Resources/RPP/` A-library. Any
domain-shaped local sample can use `--sample-file`; the A-library is required
later by the on-device Edge Halo profile analysis path.

## Choose The Path By What The Data Should Do

| Data you have | Use this path | Output artifact |
|---|---|---|
| Behavior style, boundaries, or preferences, with explicit corrections | Learn | `edge.demo.learn.sample.v1` |
| Behavior style, boundaries, or preferences, without corrections | Imprint | `edge.demo.imprint.sample.v1` |
| Facts the assistant should look up or refresh over time | Local facts | `edge.demo.facts.v1` import skeleton, or URL import |

Facts belong in a [local facts store](/docs/knowledge-tools/local-facts), not in
the profile. See
[Keep factual knowledge out of the profile body](#keep-factual-knowledge-out-of-the-profile-body).

## Start From A Validated Template

```bash
edge demo learn sample init --output ./my-budget-sample.json
edge demo learn sample validate ./my-budget-sample.json
```

You can also use the minimal guided flow:

```bash
edge demo learn sample init --interactive --output ./my-sample.json
```

The interactive command asks whether your data teaches "how to respond" or
"factual answers". Response data then asks whether you have corrections. Factual
answer data emits a facts import skeleton instead of a profile sample.

Use the generated artifact with the matching command:

| Artifact | Validate or consume it with |
|---|---|
| `edge.demo.learn.sample.v1` | `edge demo learn sample validate ./sample.json`, then `edge demo learn run --sample-file ./sample.json ...` |
| `edge.demo.imprint.sample.v1` | `edge demo imprint run --dry-run --sample-file ./sample.json --model qwen3.5-9b-4bit --json` |
| `edge.demo.facts.v1` | `edge demo facts import ./facts.json --store <name>` or `edge demo facts import-url <url> ...` |

`sample validate` currently validates learn samples only. For imprint samples,
use `imprint run --dry-run` as the validation step.

`validate` reuses the same learn-sample loader as `--sample-file`. By default it
prints only hashes and counts; add `--json` for a machine-readable report.

## The Learn Sample Shape

The non-interactive learn template looks like this:

```json
{
  "schema_version": "edge.demo.learn.sample.v1",
  "sample_id": "my_budget_sample_v1",
  "peer_id": "my-demo-peer",
  "app_id": "com.example.myapp",
  "base_model_id": "qwen3.5-9b-4bit",
  "question": "How should I plan my remaining budget this month?",
  "records": [
    {
      "record_id": "budget-001",
      "kind": "explicit_preference",
      "text": "The user wants fixed expenses and emergency cash protected before discretionary spending.",
      "tags": ["budget", "cashflow"]
    },
    {
      "record_id": "budget-002",
      "kind": "cashflow_context",
      "text": "The user has $800 left after rent, utilities, and subscriptions this month.",
      "tags": ["budget", "cashflow"]
    },
    {
      "record_id": "budget-003",
      "kind": "trust_boundary",
      "text": "The user does not want unsupported return claims or speculative investment recommendations.",
      "tags": ["budget", "trust_boundary"]
    }
  ],
  "corrections": [
    {
      "peer_id": "my-demo-peer",
      "app_id": "com.example.myapp",
      "correction_type": "profile_correction",
      "target": {"profile_field": "budget_guidance_style"},
      "correction": {
        "profile_overlay": {
          "priority": "fixed expenses and emergency cash first",
          "boundary": "no unsupported return claims"
        }
      },
      "status": "recorded"
    }
  ],
  "tool_schema_export": {
    "schema_version": "edgestudio.tool_schema_export.v1",
    "tools": [
      {
        "name": "my_budget_facts_lookup",
        "description": "Read-only lookup for local budget facts.",
        "permissions": ["read_facts"],
        "intentTags": ["exact_fact", "budget"],
        "parameters": {
          "type": "object",
          "properties": {"topic": {"type": "string"}}
        }
      }
    ]
  },
  "expected_tool_policy": {
    "description": "Deterministic tool-use policy learned from this sample",
    "tools_available": [
      {
        "name": "my_budget_facts_lookup",
        "when": "User asks about budget priorities",
        "args_constraint": "topic must reference this budget sample"
      }
    ],
    "negative_policy": ["Do not call network tools", "Do not invent return claims"]
  }
}
```

Each `corrections[].peer_id` must match the top-level `peer_id`; mismatches fail
closed before the model is loaded.

## Translate App Data Into Canonical Records

Do not put app-specific tables such as `transactions`, `merchants`, or
`categories` at the sample-file top level. Edge Studio accepts the canonical
sample fields above and fails closed on unknown top-level fields. Your app owns
the translation from business data into canonical `records` and `corrections`.

Use `records[].kind` as a stable, semantic `snake_case` vocabulary. It is a free
string, but it is not cosmetic: the profile body sorts records by
`(kind, record_id)` and renders one `[kind]` block per group.

Keep each record to one independently restatable fact, preference, or boundary.
The built-in finance sample uses `explicit_preference`, `cashflow_context`, and
`trust_boundary` for that reason.

## Choose The Correction Type

| Type | Use when | Required shape |
|---|---|---|
| `eval_feedback` | The user rated a specific answer | `correction.rating` is `positive`, `negative`, or `neutral` |
| `fact_correction` | A concrete fact is wrong | `target.fact_id` plus corrected structured fields |
| `profile_correction` | Behavior style or boundary should change | `target.profile_field` or `target.direction_id` plus structured correction fields |

Fact corrections need at least two independent supporting corrections before
they enter the compiled overlay. A single fact correction is treated as
unstable and skipped, so use `profile_correction` for one-shot style or
guardrail changes.

## Keep Factual Knowledge Out Of The Profile Body

Use `records` for response posture: preferences, style, boundaries, and compact
context that should become the Neural Imprint profile. Do not use profile
records as a knowledge base for large or frequently changing facts. The facts
path produces `edge.demo.facts.v1`, which is meant for a local lookup store and
does not feed `profile_body`.

This split is intentional: changing the local facts file should not require
rebuilding the model or regenerating a Neural Imprint artifact. Change the
profile only when the assistant's behavior or boundary changes.

## Inspect Or Run Your Sample

```bash
edge demo learn run --dry-run \
  --sample-file ./my-budget-sample.json \
  --model qwen3.5-9b-4bit \
  --json
```

Without `--include-text`, the JSON report keeps the raw sample text out of the
terminal output and returns hashed identifiers instead.

## Next

- Store lookup knowledge in a [local facts store](/docs/knowledge-tools/local-facts)
- Teach the Agent your tool surface: [Tool Learning](/docs/knowledge-tools/tool-learning)
- Understand what the receipts prove: [Receipts and the Local-Only Contract](/docs/knowledge-tools/receipts-and-local-contract)
