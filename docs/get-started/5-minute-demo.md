---
sidebar_position: 1
title: CLI learning demo
---

# CLI learning demo

> **Runnable in current preview**
>
> This flow uses shipped B2/B4/B5/B6/B7 CLI commands. It runs on a synthetic sample, can explicitly prepare a compatible local model, and writes hash-only local receipts/manifests by default.

The first-wow path should feel familiar before it introduces personalization:

1. Download a model.
2. Chat with the base model.
3. Inspect the synthetic learning sample.
4. Run the local correction-learning flow.
5. Compare the base answer hash with the Neural Imprint restored answer hash.

Neural Imprint is a local artifact and restore flow. Restoring a compatible local Neural Imprint artifact can change generated behavior under compatibility gates without changing model weights. This demo proves the local artifact path and receipt path; it does not claim general model quality improvement.

## Install the preview CLI

During preview, install the `edge` command from an `edge-studio` source checkout:

```bash
git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
edge doctor
```

For the public release, `python -m pip install edgestudio` is the intended install command. During this preview phase, the package is not yet published to PyPI, so the source checkout path above is the runnable path.

For Web UI setup, see [Install Edge Studio from source](/docs/get-started/source-build).

## Commands

Run these commands from the `edge-studio` checkout:

### 1. Download the baseline model

Use `qwen3.5-9b-4bit` as the preview baseline:

```bash
edge models list --json
```

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

This command is explicit. The demo does not silently download models. If the model is already present, the downloader can reuse the local match and report the cached path.

Check readiness:

```bash
edge models where qwen3.5-9b-4bit --json
edge models doctor qwen3.5-9b-4bit --json
```

### 2. Chat with the base model

Run a normal local chat before learning:

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive
```

The first model load can take tens of seconds on Apple Silicon. After `[chat:ready]`, ask a few normal questions and exit with `/exit`.

Interactive chat loads the model once, keeps a session KV cache across turns, prints each answer, and writes one local chat receipt per turn. By default, each receipt stores hashes and paths, not raw prompt or answer text.

For scripts or CI smoke checks, the one-shot form is also available:

```bash
edge demo chat --model qwen3.5-9b-4bit --prompt "What is edge AI?" --max-tokens 64
```

### 3. Inspect the synthetic learning sample

Look at the synthetic correction-learning plan before writing any demo state:

```bash
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --include-text --json
```

`--include-text` is appropriate here because this is a synthetic fixture shipped for the demo. Do not use raw private user text in receipts or support logs. Without `--include-text`, the plan remains hash-only.

This dry-run does not load a model, write correction ledgers, trigger regeneration, restore Neural Imprint, or use the network.

### 4. Run local learning and Neural Imprint restore

Now run the local correction-learning flow:

```bash
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --max-tokens 64 --json
```

The command:

1. Writes synthetic Persona/RPP input under isolated demo state.
2. Writes synthetic correction entries under an isolated correction ledger.
3. Regenerates a local Neural Imprint artifact.
4. Restores that artifact under compatibility gates.
5. Generates a before answer and an after-restored answer.
6. Writes an `edge.demo.learn.receipt.v1` receipt.

### 5. Read the comparison

In the JSON output, look for:

```json
{
  "generation": {
    "artifact_path": ".../neural_imprint.safetensors"
  },
  "comparison": {
    "before_answer_sha256": "sha256:...",
    "after_answer_sha256": "sha256:...",
    "answers_differ": true
  },
  "receipt_path": "..."
}
```

The receipt stores the same comparison fields as top-level receipt fields.

`answers_differ=true` means the generated answer changed after restoring the local Neural Imprint artifact for this synthetic demo. It is not a broad claim that the model is better.

Inspect the receipt without loading the model again:

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

You can also inspect the lower-level Neural Imprint sample and comparison path directly:

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
```

The artifact reuse smoke is local and manifest-only:

```bash
edge demo reuse --run <run_id> --json
```

It does not copy artifacts and is not cross-device sync.

### Advanced shortcut

After you understand the steps, you can prepare the model and run the learning demo in one command:

```bash
edge demo learn run --prepare-model --model qwen3.5-9b-4bit --source auto --max-tokens 64 --json
```

`--prepare-model` is explicit. If the model is missing, model preparation may use the network and writes a model-fetch receipt. The learning demo itself remains local-only and records `network_used_during_demo=false`; the report records model preparation separately as `network_used_during_model_prepare`.

### Follow-up UX

Current preview exposes sample inspection through `edge demo learn run --dry-run --include-text --json`. A future CLI should add a more beginner-friendly `edge demo learn sample show/list` command and a direct base-vs-Neural-Imprint chat replay command.

## Receipt privacy contract

Receipts must be local by default and hash-only by default:

```json
{
  "schema_version": "edge.demo.learn.receipt.v1",
  "run_id": "edge-run-example",
  "model_path": "~/Documents/mlx-community/mlx-community_Qwen3.5-9B-4bit",
  "model_sha256": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "sample_id": "synthetic_profile_correction_v1",
  "sample_sha256": "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "correction_pack_sha256": "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "artifact_id": "learn-edge-run-example",
  "artifact_path": "~/Library/Application Support/edgestudio/demo_runs/edge-run-example/learn_state/neural_imprint_artifacts/neural_imprint.safetensors",
  "artifact_sha256": "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "metadata_sha256": "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
  "before_answer_sha256": "sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "before_answer_tokens": 8,
  "after_answer_sha256": "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "after_answer_tokens": 8,
  "answers_differ": true,
  "model_prepare": {
    "requested": true,
    "status": "skipped_existing",
    "network_used": false
  },
  "network_used_during_model_prepare": false,
  "raw_text_included": false,
  "network_used_during_demo": false,
  "status": "completed"
}
```

The default receipt should contain hashed identifiers, local paths, schema versions, and status. It should not contain raw user text. A future explicit include-text mode must be opt-in and visible in the receipt.

## Offline and fail-closed requirements

The demo must:

- Separate model download from demo execution.
- Allow the one-command learning demo to prepare a model only when `--prepare-model` is explicitly passed.
- Fail closed if a required local model or artifact is missing.
- Avoid silent network access during the demo run.
- Treat non-localhost network access as disallowed in offline mode.
- Record error status in the local receipt instead of continuing silently.

## Acceptable wording

Use:

- "behavior changed after restoring local Neural Imprint artifact"
- "restore local Neural Imprint artifact can change behavior under compatibility gates"
- "receipt contains hashed identifiers and no raw user text by default"

Do not use quality-improvement claims without evaluation evidence.
