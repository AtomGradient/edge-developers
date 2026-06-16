---
sidebar_position: 1
title: CLI learning demo
---

# CLI learning demo

:::tip Runnable in current preview
This flow uses shipped B2/B4/B5/B6/B7 CLI commands. It runs on a synthetic sample, can explicitly prepare a compatible local model, and writes hash-only local receipts/manifests by default.
:::

The first-wow goal is to show a minimal local learning loop: a synthetic correction is written into isolated demo state, a new Neural Imprint artifact is generated, the artifact is restored under compatibility gates, and the command compares before/after answer hashes without storing raw private text by default. Neural Imprint is a local artifact and restore flow. Restoring a compatible local Neural Imprint artifact can change behavior under compatibility gates without changing model weights.

## Flow

The one-command path is:

```bash
edge demo learn run --prepare-model --model qwen3.5-9b-4bit --source auto --max-tokens 8 --json
```

`--prepare-model` is explicit. If the model is already present, the command skips download. If the model is missing, model preparation may use the network and writes a model-fetch receipt. The learning demo itself remains local-only and records `network_used_during_demo=false`; the report records model preparation separately as `network_used_during_model_prepare`.

The expanded auditable flow is:

1. Check local environment and preview package access.
2. Resolve or explicitly fetch a supported local model.
3. Dry-run the synthetic learning sample plan.
4. Write synthetic Persona/RPP input and correction entries under isolated demo state.
5. Trigger correction-based Neural Imprint regeneration.
6. Restore the regenerated artifact under compatibility gates.
7. Compare before/after answer hashes.
8. Inspect the completed run from the local receipt without loading a model.
9. Write and validate a local receipt with paths, hashes, schema versions, and status.
10. Optionally write per-app reuse manifests as an artifact reuse smoke, not cross-device sync.

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

```bash
edge doctor
edge models list
edge models where qwen3.5-9b-4bit
edge models doctor qwen3.5-9b-4bit
edge models fetch qwen3.5-9b-4bit --source auto
edge demo learn run --prepare-model --model qwen3.5-9b-4bit --source auto --max-tokens 8 --json
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model auto
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --max-tokens 8 --json
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model auto --question "Summarize this synthetic profile."
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --question "Summarize this synthetic profile." --max-tokens 8 --json
edge demo imprint compare --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json --json
edge demo receipt --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json
edge demo local-only --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json --json
edge demo reuse --run edge-run-example --apps notes,finance --json
```

`edge models fetch` is explicit and separate from ordinary demo runs. If `edge models where qwen3.5-9b-4bit` already reports a complete local model, you can skip the fetch command. The demo path does not silently download models. `edge demo learn run --prepare-model` is the only one-command path here that may prepare a model, and the flag makes that behavior explicit.

The real run prints a `receipt_path`. Use that path for receipt inspection commands; `edge-run-example` above is only a placeholder. The compare command reads the receipt only: it does not load a model, restore an artifact, generate answers, or use the network.

`edge demo reuse` reads the completed B4 receipt and writes per-app reuse manifests under the same demo run. It is an artifact reuse smoke only: it does not copy artifacts, sync devices, restore artifacts, load models, or use the network.

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
