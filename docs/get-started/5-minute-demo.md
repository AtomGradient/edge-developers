---
sidebar_position: 1
title: See local learning in 5 minutes
---

# See local learning in 5 minutes

This guide shows one visible result: you chat with a local model before a
synthetic learning step, run the learning demo, then chat again with the local
Neural Imprint artifact loaded.

The demo uses a built-in synthetic sample. It does not use your private data,
does not change the model weights, and does not claim the model became better in
general. It only shows that a local learning artifact can change behavior for a
controlled example.

## What you will see

The built-in sample teaches this preference:

- Prefer concise technical answers.
- Keep workflow explanations short and direct.
- Avoid quality claims unless there is specific evidence.

The demo asks:

```text
How should this assistant respond to technical workflow questions?
```

Before learning, the model may answer with a broad generic framework. After you
load the synthetic correction, the answer should move toward:

```text
Provide short, direct summaries of the workflow steps. Avoid making quality
claims unless you have specific evidence to support them.
```

Exact text can vary by model version and sampling, but the terminal flow lets
you ask the same question before and after learning.

## 1. Install Edge Studio

Create a Python 3.11 environment and install the developer preview package:

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

For source install and local UI development, see [Install from source](/docs/get-started/source-build).

## 2. Prepare the demo model

The preview demo uses `qwen3.5-9b-4bit`.

```bash
edge models where qwen3.5-9b-4bit
```

If the model is missing, download it explicitly:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

The demo does not silently download models. If the model is already present, the
fetch command reuses the local match and reports the cached path.

## 3. Inspect what the demo will learn

Before running the learning step, inspect the synthetic sample:

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

This dry run does not load the model, write demo state, restore an artifact, or
use the network. It is a preview of the exact synthetic learning data.

## 4. Chat before learning

Start an interactive base-model chat:

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive
```

Ask the demo question:

```text
[chat:load] loading model=Qwen3.5-9B-4bit (first load can take 30-90s)
[chat:ready] type a message, /exit to quit
you> How should this assistant respond to technical workflow questions?
assistant> A good assistant should first understand the user's goal, identify
the relevant workflow constraints, break the problem into steps, and explain
tradeoffs clearly...
you> /exit
```

This is the base model response. It has not loaded the synthetic learning
artifact yet.

## 5. Run the learning demo

Run the local learning flow and ask the CLI to print the before and after text:

```bash
edge demo learn run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 64 \
  --include-text
```

`--include-text` is used here because the sample is synthetic. Do not use it with
private prompts or real user data that you would not want printed in a terminal
or stored in a local receipt.

You should see output shaped like this:

```text
Edge demo learn (edge.demo.learn.run.v1)
status: completed
model: qwen3.5-9b-4bit
sample: synthetic_profile_correction_v1
answers_differ: true
receipt: .../learn_receipt.json
raw_text_in_receipt: true

[Before]
To respond effectively to technical workflow questions, an assistant should
adopt a structured, user-centric, and context-aware approach...

[After]
Provide short, direct summaries of the workflow steps. Avoid making quality
claims unless you have specific evidence to support them.
```

The important part is not the exact wording. The important part is that the
after answer reflects the synthetic correction you inspected in step 3.

Copy the path printed after `receipt:`. You will use it in the next step:

```bash
LEARN_RECEIPT="<path printed after receipt:>"
```

## 6. Chat after learning

Start interactive chat again, this time loading the local Neural Imprint
artifact from the learning receipt:

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive \
  --with-imprint "$LEARN_RECEIPT"
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

## 7. Read the result

The run does four local things:

1. Writes the synthetic records into isolated demo state.
2. Records the synthetic correction.
3. Generates and restores a local Neural Imprint artifact.
4. Compares the answer before and after restore.

`answers_differ: true` means the answer changed after restoring the local Neural
Imprint artifact for this synthetic sample.

It does not mean:

- The base model weights changed.
- The model became generally smarter.
- Your private data was used.
- A production learning pipeline was enabled.

By default, receipts are local and hash-only. In this guide, `--include-text`
prints and stores raw text only because the sample is synthetic and meant to be
read.

## Advanced checks

Inspect a receipt without loading the model again:

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

Lower-level Neural Imprint commands are available after you understand the
first demo:

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

These are implementation checks. They are not required for the 5-minute demo.
