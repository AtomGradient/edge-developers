---
sidebar_position: 2
title: 5-minute Neural Imprint demo
---

# 5-minute Neural Imprint demo

:::tip Runnable in current preview
This flow uses shipped B2/B4/B6/B7 CLI commands. It runs on a synthetic sample, uses an explicitly prepared local model, and writes hash-only local receipts/manifests by default.
:::

The goal is to show a base answer and a restored Neural Imprint answer from the same compatible model, with local receipts that prove what happened without storing raw private text. Neural Imprint is a local artifact and restore flow. Restoring a compatible local Neural Imprint artifact can change behavior under compatibility gates without changing model weights.

## Flow

The runnable flow is:

1. Check local environment and preview package access.
2. Resolve or explicitly fetch a supported local model outside the demo run.
3. Dry-run the synthetic sample plan.
4. Generate a local Neural Imprint artifact from the synthetic sample.
5. Restore that artifact under compatibility gates.
6. Compare base and restored-artifact answer hashes.
7. Inspect the completed run from the local receipt without loading a model.
8. Write and validate a local receipt with paths, hashes, schema versions, and status.
9. Optionally write per-app reuse manifests as an artifact reuse smoke, not cross-device sync.

## Commands

Run these commands from the EdgeStudio checkout after installing the preview CLI:

```bash
edge doctor
edge models list
edge models where qwen3.5-0.8b
edge models doctor qwen3.5-0.8b
edge models fetch qwen3.5-0.8b --source auto
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model auto --question "Summarize this synthetic profile."
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-0.8b --question "Summarize this synthetic profile." --max-tokens 8 --json
edge demo imprint compare --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json --json
edge demo receipt --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json
edge demo local-only --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json --json
edge demo reuse --run edge-run-example --apps notes,finance --json
```

`edge models fetch` is explicit and separate from the demo run. If `edge models where qwen3.5-0.8b` already reports a complete local model, you can skip the fetch command. The demo command does not silently download models.

The real run prints a `receipt_path`. Use that path for `edge demo imprint compare`, `edge demo receipt`, and `edge demo local-only`; `edge-run-example` above is only a placeholder. The compare command reads the receipt only: it does not load a model, restore an artifact, generate answers, or use the network.

`edge demo reuse` reads the completed B4 receipt and writes per-app reuse manifests under the same demo run. It is an artifact reuse smoke only: it does not copy artifacts, sync devices, restore artifacts, load models, or use the network.

## Receipt privacy contract

Receipts must be local by default and hash-only by default:

```json
{
  "schema_version": "edge.demo.receipt.v1",
  "run_id": "edge-run-example",
  "model_path": "~/Documents/mlx-community/mlx-community_Qwen3.5-0.8B-MLX-4bit",
  "model_sha256": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "sample_id": "synthetic_profile_v1",
  "sample_sha256": "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "artifact_id": "ni-edge-run-example",
  "artifact_path": "~/Library/Application Support/edgestudio/demo_runs/edge-run-example/persona_kv.safetensors",
  "metadata_path": "~/Library/Application Support/edgestudio/demo_runs/edge-run-example/persona_kv_metadata.json",
  "artifact_sha256": "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "metadata_sha256": "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
  "prefix_tokens": 1234,
  "base_answer_sha256": "sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "base_answer_tokens": 8,
  "personalized_answer_sha256": "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "personalized_answer_tokens": 8,
  "answers_differ": true,
  "raw_text_included": false,
  "network_used_during_demo": false,
  "status": "completed"
}
```

The default receipt should contain hashed identifiers, local paths, schema versions, and status. It should not contain raw user text. A future explicit include-text mode must be opt-in and visible in the receipt.

## Offline and fail-closed requirements

The demo must:

- Separate model download from demo execution.
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
