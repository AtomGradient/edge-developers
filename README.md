# AtomGradient Edge Developer Preview

AtomGradient Edge is a local Apple-platform AI stack for building agents that can run, learn, and restore user-specific state on user-owned devices.

The preview is centered on four layers:

| Layer | Role |
|---|---|
| Edge Studio | Local Mac workbench for model optimization, benchmark, export, device coordination, and Neural Imprint artifact management. |
| Edge Kit | Swift SDK surface for loading optimized models, EdgeMesh transport, EdgeData, and app runtime integration. |
| Edge Halo | Personalization lifecycle layer for local profile jobs, Neural Imprint capsule compatibility, restore orchestration, and fail-closed gates. |
| Edge Scaffold | Developer reference iOS app template showing the recommended Edge Kit + Edge Halo integration. |

Neural Imprint is a local artifact and restore flow. A compatible base model can restore a local Neural Imprint artifact and change behavior under compatibility gates without changing model weights.

## Start Here

Current preview entry points:

- Read the docs: `docs/overview.md`
- Install the Swift SDK with the pinned preview package:

  ```swift
  .package(url: "git@github.com:AtomGradient/edge-kit.git", exact: "1.0.0-rc94")
  ```

- Follow the Swift quickstart: `docs/get-started/quickstart.md`
- Validate the Swift SDK path with EdgeStudio's CLI: `docs/get-started/swift-cli.md`
- Review model evolution and Neural Imprint lifecycle: `docs/build/model-evolution.md`
- Generate a reference app from Edge Studio with Edge Scaffold: `docs/optimize-and-ship/scaffold.md`

## Current Preview Versions

| Component | Current preview |
|---|---|
| edge-kit | `1.0.0-rc94` |
| edge-halo | `1.0.0-rc17` |
| edge-engine dependency tag | `1.0.0-rc136` |
| edge-scaffold | Pins edge-kit `1.0.0-rc94` and edge-halo `1.0.0-rc17` |

## Docs Development

This repository is the Docusaurus documentation site.

```bash
npm ci
npm run start
npm run build
```

The build emits English and Chinese documentation.

## CLI

Shipped in current preview:

```bash
edge doctor
edge doctor --json
edge models list
edge models where qwen3.5-0.8b
edge models doctor qwen3.5-0.8b
edge models fetch qwen3.5-0.8b --dry-run
edge models fetch qwen3.5-0.8b --source auto
edge demo chat --model qwen3.5-0.8b --prompt "What is edge AI?" --max-tokens 32
edge demo receipt --schema
edge demo receipt --path ./receipt.json
edge demo local-only --path ./receipt.json
edge demo imprint run --dry-run --question "Summarize this synthetic profile."
edge demo imprint run --question "Summarize this synthetic profile." --model qwen3.5-0.8b
edge demo imprint compare --path ./receipt.json
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model auto
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-0.8b --max-tokens 8
edge demo reuse --run edge-run-example --apps notes,finance --json
```

`edge doctor` is a read-only B1 environment check. It does not download models, load models, start the backend, or run Neural Imprint workflows.
`edge models list`, `edge models where`, and `edge models doctor` are read-only B2a model readiness checks. They resolve catalog entries and local model paths without downloading models, writing receipts, or probing the network.
`edge models fetch` is an explicit B2b model preparation command. It is never run silently by demo commands; it writes a local `edge.models.fetch.receipt.v1` receipt for real fetches.
`edge demo chat` is a B3 base-model sanity check. It loads an explicitly prepared local model, generates one local answer, and writes a hash-only `edge.demo.chat.receipt.v1` receipt by default.
`edge demo receipt` and `edge demo local-only` are B6a receipt inspection commands. They validate `edge.demo.receipt.v1` local-only invariants without generating Neural Imprint artifacts or calling model runtimes.
`edge demo imprint run --dry-run` is a B4a pre-flight planner. It emits `edge.demo.imprint.plan.v1` with hashes and local prerequisite status only; it does not generate artifacts, restore Neural Imprint, or write a demo receipt.
`edge demo imprint run` (without `--dry-run`) is the B4b real Neural Imprint demo. It loads a local model, captures a Neural Imprint artifact from a synthetic sample, compares base vs personalized answer hashes, and writes an `edge.demo.receipt.v1` local-only receipt.
`edge demo imprint compare` is a B4 receipt-only inspection command. It reads an existing completed `edge.demo.receipt.v1` receipt and emits `edge.demo.imprint.compare.v1`; it does not load models, restore artifacts, generate answers, or use the network.
`edge demo learn run --dry-run` is a B5a correction-learning pre-flight planner. It emits `edge.demo.learn.plan.v1` with hash-only synthetic correction metadata and isolated-state paths; it does not write correction ledgers, call regen, load models, or write a learn receipt.
`edge demo learn run` (without `--dry-run`) is the B5b real isolated correction-learning demo. It writes synthetic Persona/RPP input and correction ledger entries under the demo run state, triggers correction regen, restores the regenerated local Neural Imprint artifact, compares before/after answer hashes, and writes `edge.demo.learn.receipt.v1`.
`edge demo reuse` is a B7 artifact reuse smoke. It reads a completed local B4 receipt and writes per-app `edge.demo.reuse.receipt.v1` manifests under the demo run; it does not copy artifacts, sync devices, restore artifacts, load models, or use the network.

## Phase 2 SDK Proof

The B-group Python first-wow CLI is shipped. Phase 2 SDK proof now includes the `tests/smoke_test` `edge-swift` product for Swift smoke validation, halo bridge checks, local package validation, and receipt-only restore coordinator smoke.

Developer-facing Swift CLI docs live at:

```bash
docs/get-started/swift-cli.md
```

## Trust Boundaries

- User data and Neural Imprint artifacts stay local unless the user explicitly moves them to trusted user-owned devices.
- README and docs avoid unevaluated quality-improvement claims.
- Edge Scaffold is a developer reference app, not dogfood business logic.
- Roadmap items are labeled as planned until their implementation and tests land.
