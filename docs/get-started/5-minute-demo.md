---
sidebar_position: 1
title: Build your first device Agent
slug: /get-started/minute-demo
---

# Build your first device Agent

Runnable in current preview.

In Edge, the device is the Agent. The app is the carrier.

This tutorial starts with a real product shape instead of a toy answer-style
sample: a private finance assistant. The user has a simple local preference:

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

Later the user asks:

```text
I have $800 left after bills this month. What should I do with it?
```

This is not financial advice. The sample is synthetic, inspectable, and built
to show the Edge learning contract: local signal, RPP self-learning, a local
Neural Imprint artifact, and the same base model answering with restored local
learning state.

## What You Will Prove

You will run the full Agent path:

1. Install the public `edge-studio` package.
2. Prepare the local preview model.
3. Inspect the raw local learning signal.
4. Compare common personalization approaches.
5. Ask the base model first.
6. Run RPP self-learning and generate a Neural Imprint.
7. Ask again with base model + Neural Imprint.
8. Inspect the receipt and local-only contract.
9. Export the first Agent carrier from Edge Studio.

No private data is used. The base model package stays intact. The learning
artifact is local, removable, and restored only when compatibility checks pass.

## 1. Install Edge Studio

Create a Python 3.11 environment and install the Developer Preview package:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

If you use `uv`:

```bash
uv venv --python 3.11 .venv
source .venv/bin/activate
uv pip install --upgrade --pre edge-studio
edge doctor
```

`--pre` installs the current release candidate. Keep it until the first stable
package is published. `edge doctor` checks the Python environment, model paths,
and system compatibility.

For source install and local UI development, see [Install Edge Studio](/docs/get-started/source-build).

## 2. Prepare The Demo Model

The demo uses `qwen3.5-9b-4bit`.

```bash
edge models where qwen3.5-9b-4bit
```

If the model is missing, download it explicitly:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

The demo does not silently download models. The fetch command is explicit and
writes a model receipt. If the model is already present, Edge reuses the local
match and reports the cached path.

## 3. Inspect The Local Learning Signal

Before any model load, inspect exactly what the Agent will learn:

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

Look for the sample block:

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
use the network. It shows the local learning signal first, so you can reason
about what the device Agent is allowed to learn before any generation happens.

## 4. Compare Common Approaches

For this finance preference, common personalization patterns carry different
costs:

| Approach | What it would do here | Why Edge uses a different primitive |
| --- | --- | --- |
| LoRA / SFT | Train an adapter or model around the user's preference | Needs compute, curated data, packaging, rollout, rollback, and regression work for a per-user state change. |
| Prompt stuffing | Paste "low risk, cash-flow first" into every request | Replays private profile text, burns context budget, and becomes hard to inspect as history grows. |
| Cloud personalization | Upload the finance preference to a server profile | Moves sensitive local state off device and adds trust, latency, connectivity, and compliance burden. |
| Edge RPP + Neural Imprint | Convert local signals into a removable artifact restored into a compatible session | The base model package stays stable; learned state remains local; restore is compatibility-gated and removable. |

Neural Imprint is not a universal replacement for model training. It is the
right contract when the product needs continuous, user-specific learning on a
device while preserving a stable base model path.

## 5. Ask The Base Model First

Start a base-model chat:

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

Ask:

```text
you> I have $800 left after bills this month. What should I do with it?
```

A base-model answer is usually helpful but generic. It may mention savings,
debt, investing, or planning based on your goals and risk tolerance. That is the
before state: the model has not restored the user's local finance preference.

Exit with:

```text
you> /exit
```

## 6. Run RPP Self-Learning And Generate Neural Imprint

Now run the local learning flow:

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

For this sample, the after answer moves toward cash-flow stability:

```text
Based on your current cash flow and preference for stability, the best move is
to cover your upcoming rent or fixed subscriptions first. Since you mentioned
those are already covered, prioritize an emergency fund, high-interest debt,
and conservative savings before considering upside.
```

Exact wording can vary by model build and generation settings. The important
contract is that behavior changed after restoring local Neural Imprint artifact
for the inspected synthetic signal.

## 7. Ask Again With Base Model + Neural Imprint

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

You should now see a conservative, cash-flow-first answer. In a verified local
run, the restored session produced:

```text
Based on your current cash flow of $800 and your preference for stability, here
is the best way to handle that money:

Priority 1: Preserve Your Cash Flow Stability
...
Emergency Fund Top-up
...
Pay Down High-Interest Debt
```

This is the "base model + Neural Imprint" moment. Same base model package, same
question, local learning state restored from the receipt.

## 8. Inspect The Receipt And Local-Only Contract

The learning run did four local things:

1. Wrote the synthetic records into isolated demo state.
2. Recorded the synthetic correction.
3. Generated and restored a local Neural Imprint artifact.
4. Compared the answer before and after restore.

By default, receipts are local and hash-only. In this guide, `--include-text`
prints and stores raw text only because the sample is synthetic and meant to be
read. Without `--include-text`, the receipt keeps hashed identifiers and no raw
user text:

```json
{
  "raw_text_included": false,
  "network_used_during_demo": false,
  "network_used_during_model_prepare": false,
  "question_sha256": "sha256:...",
  "before_answer_sha256": "sha256:...",
  "after_answer_sha256": "sha256:..."
}
```

Inspect a receipt without loading the model again:

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

The local-only check is where you verify non-localhost network access did not
occur during the demo. Carry the same principle into your app: keep private
signals local by default, keep learning state removable, and keep restore
fail-closed.

For lower-level Neural Imprint smoke tests:

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

These commands are useful for artifact reuse and implementation checks. They
are not required for the 5-minute demo.

## 9. Export The First Agent Carrier

After the CLI proof works, open the local workbench:

```bash
edge studio
```

Then:

1. Open `http://127.0.0.1:18842`.
2. Load the same model.
3. Export an Edge Scaffold carrier.
4. Open the generated Xcode project.
5. Validate on a physical iPhone or iPad.

Edge Studio is the workbench. Edge Scaffold is the carrier template. The iOS
app is the user surface for the device Agent, not the learning primitive itself.

Continue with [Build the Agent carrier](/docs/examples/build-and-ship).

## Common Questions

### Is this LoRA or SFT?

No. LoRA and SFT are useful when you intentionally want a trained model or
adapter release. That requires compute, data curation, release packaging,
rollback, and regression evaluation. Neural Imprint is a different contract for
per-user device learning: the base model package stays stable, and local
learning state is restored only when compatibility checks pass.

### Is this prompt stuffing?

No. Prompt stuffing repeats profile text or instructions inside every request.
That consumes context budget and replays private state. The after-learning chat
restores local runtime state from a Neural Imprint receipt, then handles the
current message through the normal generation path.

### What did the Agent learn?

Only the synthetic signal you inspected in step 3: risk boundary, cash-flow
context, and trust boundary. In a real finance product, those signals would come
from app-approved local settings, explicit user preferences, and user-visible
corrections. The carrier app owns that policy.

### Does `answers_differ: True` prove production readiness?

No. It proves that the restored Neural Imprint artifact is active for this
controlled synthetic example and that the answer moved after restore. Production
readiness still needs task-specific evaluation, UI controls, deletion UX, and
real-device validation.
