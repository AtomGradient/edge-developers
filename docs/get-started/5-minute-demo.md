---
sidebar_position: 1
title: See local learning in 5 minutes
slug: /get-started/minute-demo
---

# See local learning in 5 minutes

Imagine a local finance assistant. A user tells it:

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

In a normal app, this quickly becomes awkward. You can paste that preference
into every prompt, send it to a cloud profile service, or retrain an adapter.
Edge takes a different path: keep the preference as local learning state, verify
it before restore, and leave the base model package unchanged.

This guide proves the mechanism with the current CLI demo. The built-in sample
is synthetic and deliberately simple: it teaches a concise, evidence-bound
answer style. In the finance assistant story, that is the first behavior you
would want before touching real financial data: shorter advice, no unsupported
claims, and local-only proof.

The local learning artifact Edge generates is called a **Neural Imprint**.

## What you will prove

By the end, you will have:

- installed the public `edge-studio` package,
- prepared the preview model explicitly,
- inspected the synthetic learning input before running it,
- generated a local Neural Imprint artifact,
- restored it with a receipt,
- compared before/after answers,
- kept the base model package intact.

No private data is used. No model weights are modified. The demo runs locally on
your Mac.

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

## 2. Prepare the demo model

The demo uses `qwen3.5-9b-4bit`.

```bash
edge models where qwen3.5-9b-4bit
```

If the model is missing, download it explicitly:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

The demo does not silently download models. If the model is already present, the
fetch command reuses the local match and reports the cached path.

## 3. Inspect what will be learned

Before you run the learning step, inspect the synthetic sample:

```bash
edge demo learn run --dry-run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

Look for `sample_text` in the output:

```json
{
  "question": "How should this assistant respond to technical workflow questions?",
  "records": [
    {
      "kind": "preference",
      "text": "The synthetic user prefers concise technical answers."
    },
    {
      "kind": "trust_boundary",
      "text": "The synthetic user asks for local-only receipts before trusting a workflow."
    }
  ],
  "corrections": [
    {
      "correction_type": "profile_correction",
      "target": {"profile_field": "answer_style"},
      "correction": {
        "profile_overlay": {
          "style": "short direct summaries",
          "boundary": "avoid quality claims without evidence"
        }
      }
    }
  ]
}
```

This is not financial advice and does not contain financial data. It is a safe
stand-in for a finance product preference: "keep the advice short, conservative
in claims, and prove that private state stayed local."

The dry run does not load the model, write demo state, restore an artifact, or
use the network.

## 4. Ask before learning

Start a base-model chat:

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive
```

Ask the same probe used by the demo:

```text
[chat:load] loading model=Qwen3.5-9B-4bit (first load can take 30-90s)
[chat:ready] type a message, /exit to quit
you> How should this assistant respond to technical workflow questions?
assistant> A good assistant should first understand the user's goal, identify
the relevant workflow constraints, break the problem into steps, and explain
tradeoffs clearly...
you> /exit
```

This is the base model path. It has not loaded the local learning artifact yet.

## 5. Run the learning demo

Now run the local learning flow and print the before/after text:

```bash
edge demo learn run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 64 \
  --include-text
```

`--include-text` is safe here because the sample is synthetic. Do not use it
with real user prompts or private financial data that you would not want printed
in a terminal or stored in a local receipt.

You should see output shaped like this:

```text
Edge demo learn (edge.demo.learn.run.v1)
status: completed
model: qwen3.5-9b-4bit
sample: synthetic_profile_correction_v1
artifact: .../neural_imprint_full_cache.safetensors
metadata: .../neural_imprint_metadata.json
answers_differ: true
receipt: .../learn_receipt.json
next: edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
raw_text_in_receipt: true

[Before]
To respond effectively to technical workflow questions, an assistant should
adopt a structured, user-centric, and context-aware approach...

[After]
Provide short, direct summaries of the workflow steps. Avoid making quality
claims unless you have specific evidence to support them.
```

The exact wording can vary. What matters is that the after answer reflects the
preference you inspected: shorter, more direct, and more careful about claims.
In a finance assistant, that is the same kind of shift you want after a user
says they prefer cash-flow-aware, low-risk guidance.

The `next:` line is the handoff. It passes `learn_receipt.json` to
`--with-imprint`. You do not need to find the lower-level artifact path yourself;
the CLI reads the receipt and restores the artifact recorded inside it.

## 6. Ask after learning

Copy the `next:` line printed in step 5 and run it:

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
```

Ask the same question:

```text
[chat:load] loading model=Qwen3.5-9B-4bit (first load can take 30-90s)
[chat:imprint] restoring artifact=.../neural_imprint_full_cache.safetensors
[chat:ready] type a message, /exit to quit
you> How should this assistant respond to technical workflow questions?
assistant> Provide short, direct summaries of the workflow steps. Avoid making
quality claims unless you have specific evidence to support them.
you> /exit
```

The second chat is still local. `--with-imprint` reads the completed learning
receipt, restores the generated Neural Imprint artifact, and fails closed if the
receipt or artifact is missing.

## 7. Read the receipt

The run did four local things:

1. Wrote the synthetic records into isolated demo state.
2. Recorded the synthetic correction.
3. Generated and restored a local Neural Imprint artifact.
4. Compared the answer before and after restore.

`answers_differ: true` means the answer changed after restoring the local
artifact for this controlled sample.

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

That is the contract you should carry into an app: prove the change locally,
keep the learning state removable, and avoid uploading private user data.

## Next: build the app

After the CLI proof works, build the finance assistant shape as an iOS app:

- [Build a learnable iOS app](/docs/examples/build-and-ship)
- [Minimal iOS app shell](/docs/get-started/minimal-ios-app)

The app path uses public Swift packages, Edge Scaffold, Edge Kit, and the Edge
Halo binary package. Validate on a real device before treating the integration
as complete.

## Common questions

### Is this fine-tuning?

No. Fine-tuning and LoRA create new weights or adapter artifacts. That requires
training infrastructure, enough compute, release packaging, rollback planning,
and a regression suite because the adapted model can shift baseline behavior.

Neural Imprint uses a different contract. The base model package stays intact.
User-specific learning is restored as a local artifact only when compatibility
checks pass, so the product can keep a stable base model path while allowing
user-owned learning state to evolve on device.

For the deployment differences between Neural Imprint, LoRA/SFT, and prompt
stuffing, see [Neural Imprint vs LoRA](/docs/guides/neural-imprint-vs-lora).

### What did the model learn?

In this demo, the only learning input is the synthetic sample you inspected in
step 3. It teaches a controlled answer-style preference: keep answers short,
direct, and evidence-bound.

In a real finance app, that input would come from app-approved local user
signals such as explicit preferences, settings, or corrections. The app owns
that policy.

### Why does `--with-imprint` take a receipt instead of the artifact path?

The receipt is the handoff object. It points to the generated artifact and also
records the metadata, hashes, schema versions, and local-only status needed to
restore safely. Passing the receipt lets the CLI validate and fail closed if the
artifact or metadata is missing.

### Does `answers_differ: true` prove production quality?

No. It proves that the restored Neural Imprint artifact is active for this
controlled synthetic example and that the answer moved after the local learning
artifact was restored.

For production quality claims, use task-specific evaluation. The important
product contract is already visible here: personalization can be activated
locally without replacing the base model release.

### Is this prompt stuffing?

No. Prompt stuffing repeats profile summaries or instructions inside every
request. That consumes context budget, replays private state, and gets harder to
govern as the user history grows.

The after-learning chat restores a local Neural Imprint artifact and then uses
the normal generation path for the current user message. The private learning
state is not pasted back into every prompt.

### Where is the local state?

The command prints the demo state path, artifact path, metadata path, and
receipt path. These files stay in local Edge Studio application data for this
demo run.

## Deeper checks

Inspect the receipt without loading the model again:

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

For lower-level Neural Imprint smoke tests:

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

These are implementation checks, not required steps for the five-minute path.
