---
sidebar_position: 1
title: First Device Agent (CLI)
sidebar_label: First Agent (CLI)
slug: /quickstart/first-agent
---

# Build your first device Agent

Runnable in current preview.

In Edge, the device is the Agent. The app is the carrier.

This page is the shortest complete proof of the learning loop: inspect a local
finance signal, ask the base model, run local learning, ask again, and check
the receipts. Everything runs on your Mac; nothing leaves it.

You will see two moments here, and a third in the next step:

| Moment | What you prove |
| --- | --- |
| Aha #1 | The same base model answers differently after local Neural Imprint restore. |
| Aha #2 | The Agent learns which local tools are available, when to use them, and when not to use them. |
| Aha #3 | The Mac proof becomes a carrier app — that is [the next quickstart step](/docs/quickstart/build-agent-carrier). |

The finance sample is synthetic and inspectable. It is not financial advice.
For why this path exists instead of LoRA, prompt stuffing, or a cloud profile,
see [Why The Device Agent](/docs/concepts/why-device-agent).

## 1. Before You Start

You need Edge Studio installed — that is the
[previous step](/docs/quickstart/install). Verify and prepare the demo model:

```bash
edge doctor
edge models where qwen3.5-9b-4bit
```

If the model is missing, fetch it explicitly:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

The demo does not silently download models. If the model is already present,
Edge reuses the local match and reports the cached path. On machines with
enough memory you can pass a larger local model such as `qwen3.5-27b-4bit` in
any of the commands below — the model is always explicit, never switched
silently.

## 2. The Scenario

Imagine a private finance assistant. The user says:

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

Later the user asks:

```text
I have $800 left after bills this month. What should I do with it?
```

The Agent should not become a stock picker. It should respect the user's local
risk boundary, explain cash-flow impact first, use only the local tools exposed
by the carrier, and avoid unsupported return claims.

## 3. Inspect The Local Learning Signal

Before any model load, inspect exactly what the Agent will learn:

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

Look for the records and correction:

```json
{
  "sample_id": "finance_conservative_cashflow_v1",
  "question": "I have $800 left after bills this month. What should I do with it?",
  "sample_text": {
    "records": [
      {
        "kind": "explicit_preference",
        "text": "The synthetic user avoids high-risk recommendations and prefers stable, cash-flow-aware guidance."
      },
      {
        "kind": "cashflow_context",
        "text": "The synthetic user's rent and fixed subscriptions are already covered; they have $800 left after bills this month."
      },
      {
        "kind": "trust_boundary",
        "text": "The synthetic user wants cash-flow impact explained before any recommendation and does not want unsupported return claims."
      }
    ],
    "corrections": [
      {
        "correction_type": "profile_correction",
        "target": {"profile_field": "financial_guidance_style"}
      }
    ]
  }
}
```

The dry run does not load the model, write demo state, restore an artifact, or
use the network. It lets you audit the local learning signal first.

`finance_conservative_cashflow_v1` is a built-in synthetic sample. To teach the
Agent from your own local data, author a sample file and pass it with
`--sample-file` — see [Author Learning Samples](/docs/knowledge-tools/learning-samples).

## 4. Ask The Base Model

Start a base-model chat:

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

Ask:

```text
you> I have $800 left after bills this month. What should I do with it?
```

The answer is usually useful but generic: savings, debt, investing, and planning
based on goals and risk tolerance. That is the before state. The model has not
restored the user's local finance preference.

Exit with:

```text
you> /exit
```

## 5. Run RPP Self-Learning

Run the local learning flow:

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

`--include-text` is safe here because the sample is synthetic. Do not use it
with real user prompts or private financial records that you would not want
printed in a terminal or stored in a local receipt.

You should see output shaped like this:

```text
Edge demo learn (edge.demo.learn.run.v1)
status: completed
model: qwen3.5-9b-4bit
model_prepare: skipped_existing
sample: finance_conservative_cashflow_v1
state: .../demo_runs/edge-learn-.../learn_state
generation_job: neural_imprint_gen_...
artifact: .../neural_imprint.safetensors
metadata: .../neural_imprint_metadata.json
answers_differ: True
receipt: .../learn_receipt.json
next: edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
raw_text_in_receipt: true
```

The `receipt` path is the handoff object. You do not need to pass the raw
artifact path yourself. `--with-imprint` accepts `learn_receipt.json`, reads the
artifact and metadata recorded inside it, validates them, and fails closed if
they do not match.

## 6. Ask Again With Neural Imprint

Copy the `next:` command from the learn output:

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive \
  --max-tokens 160 \
  --with-imprint ".../learn_receipt.json"
```

Ask the same question:

```text
you> I have $800 left after bills this month. What should I do with it?
```

The answer should move toward conservative, cash-flow-first guidance. In a
verified local run, the restored session produced this behavior shape:

```text
Based on your current cash flow of $800 and your preference for stability, here
is the best way to handle that money:

Priority 1: Preserve Your Cash Flow Stability
...
Emergency Fund Top-up
...
Pay Down High-Interest Debt
```

**Aha #1:** same base model package, same question, local learning state
restored from the receipt.

Exact wording can vary by model build and generation settings. The contract is
that behavior changed after restoring the local Neural Imprint artifact for the
inspected synthetic signal.

## 7. Inspect The Tool Policy

The same dry-run JSON also includes `expected_tool_policy` — which local tools
the carrier exposes, when they apply, and a negative policy of out-of-bounds
actions:

```json
{
  "tool_learning": {
    "policy_kind": "deterministic_preview",
    "actual_tool_calls": false,
    "expected_tool_policy": {
      "tools_available": [
        {
          "name": "sample_finance_facts_lookup",
          "when": "User asks about specific financial preferences or risk boundaries"
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

**Aha #2:** the Agent is not only learning who the user is. It is also learning
which local tools the carrier exposes, when they are appropriate, and which
tools or claims are out of bounds.

This is a deterministic preview with synthetic read-only tools, not a live
tool-call trace. How tool schemas enter the learning loop — including baking
your own Python tools into the imprint — is covered in
[Tool Learning](/docs/knowledge-tools/tool-learning).

## 8. Check The Receipt

The learning run wrote a local receipt recording everything it did. Inspect it
without loading the model again:

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

The local-only check verifies that non-localhost network access did not occur
during the demo. Receipts are hash-only unless you opted into `--include-text`.
The full receipt contract — and how to carry it into your own app — is in
[Receipts and the Local-Only Contract](/docs/knowledge-tools/receipts-and-local-contract).

## 9. What You Proved, And What Is Next

Same base model package; a local, inspectable signal; a removable Neural
Imprint artifact; behavior change after a compatibility-checked restore; and a
learned tool policy with explicit negative boundaries.

| Next | Where |
| --- | --- |
| Export this Agent path into an iPhone carrier app | [Build the Agent carrier](/docs/quickstart/build-agent-carrier) |
| See on-device learning on a real iPhone | [Device Learning (iPhone)](/docs/labs/device-learning-iphone) |
| Teach the Agent from your own data | [Author Learning Samples](/docs/knowledge-tools/learning-samples) |
| Give the Agent refreshable knowledge | [Local Facts Stores](/docs/knowledge-tools/local-facts) |
| Implement your own tools | [Custom Python Tools](/docs/knowledge-tools/custom-python-tools) |
| Understand why this is not LoRA or prompt stuffing | [Why The Device Agent](/docs/concepts/why-device-agent) |
