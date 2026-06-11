---
sidebar_position: 2
title: 5-minute Neural Imprint demo
---

# 5-minute Neural Imprint demo

:::warning Not shipped in current preview
This is a planned first-wow flow tracked by B4/B6 in the Developer Preview DX roadmap. The full flow should not be treated as runnable until the demo CLI commands are shipped. `edge doctor`, read-only `edge models list/where/doctor`, and explicit `edge models fetch` are shipped, but the demo commands are not shipped yet.
:::

This page defines the intended demo contract before the CLI lands. The goal is to show a base answer and a restored Neural Imprint answer from the same compatible model, with local receipts that prove what happened without storing raw private text.

## Intended flow

The planned flow is:

1. Check local environment and preview package access.
2. Resolve or fetch a supported local model outside the demo run.
3. Load a synthetic or redacted sample pack.
4. Generate a local Neural Imprint artifact.
5. Restore that artifact under compatibility gates.
6. Compare the base answer and restored-artifact answer.
7. Write a local receipt with paths, hashes, schema versions, and status.

Neural Imprint is a local artifact and restore flow. Restoring a compatible local Neural Imprint artifact can change behavior under compatibility gates without changing model weights.

## Receipt privacy contract

Receipts must be local by default and hash-only by default:

```json
{
  "schema_version": "edge.demo.receipt.v1",
  "run_id": "edge-run-example",
  "sample_id": "synthetic_finance_v1",
  "artifact_sha256": "sha256:example",
  "metadata_sha256": "sha256:example",
  "raw_text_in_receipt": false,
  "network_used_during_demo": false,
  "status": "planned_contract"
}
```

The default receipt should contain hashed identifiers, local paths, schema versions, and status. It should not contain raw user text. A future explicit include-text mode must be opt-in and visible in the receipt.

## Offline and fail-closed requirements

The planned demo must:

- Separate model download from demo execution.
- Fail closed if a required local model or artifact is missing.
- Avoid silent network access during the demo run.
- Treat non-localhost network access as disallowed in offline mode.
- Record error status in the local receipt instead of continuing silently.

## Planned commands

The planned flow combines shipped environment/model commands with planned demo commands:

```bash
edge doctor
edge models list
edge models where qwen3.5-0.8b
edge models doctor qwen3.5-0.8b
edge models fetch qwen3.5-0.8b
edge demo imprint run --sample synthetic-finance --model auto --question "Summarize this synthetic finance profile."
edge demo receipt --last
```

`edge doctor` and `edge models list/where/doctor/fetch` are shipped in current preview. `edge demo imprint run` and `edge demo receipt` are pending B4/B6.

## Acceptable wording

Use:

- "behavior changed after restoring local Neural Imprint artifact"
- "restore local Neural Imprint artifact can change behavior under compatibility gates"
- "receipt contains hashed identifiers and no raw user text by default"

Do not use quality-improvement claims without evaluation evidence.
