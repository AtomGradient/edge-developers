# AtomGradient Edge Developer Preview

Local-first AI platform for Apple devices. Build apps where models run, learn, and coordinate on user-owned hardware.

## Quick Start

Install the CLI from source (PyPI package not yet public):

```bash
git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
edge doctor
```

Download a model and start a local chat:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive
```

After chatting, run the [CLI learning demo](docs/get-started/5-minute-demo.md) to generate a local Neural Imprint artifact and compare before/after answer hashes.

For the public release, the install command will be:

```bash
python -m pip install edgestudio
```

## Components

| Component | Description |
|---|---|
| Edge Studio | Mac workbench and CLI for model optimization, benchmark, export, device coordination, and Neural Imprint management. |
| Edge Kit | Swift SDK for loading optimized models, EdgeMesh transport, EdgeData, and app runtime integration. |
| Edge Halo | Personalization lifecycle: local profile jobs, Neural Imprint capsule compatibility, restore orchestration, and fail-closed gates. |
| Edge Engine | Native on-device inference runtime, packaged under Edge Kit. |
| Edge Scaffold | Reference iOS app template showing the recommended Edge Kit + Edge Halo integration. |

Neural Imprint is a local artifact and restore flow. A compatible base model can restore a Neural Imprint artifact and change behavior under compatibility gates without changing model weights.

## Version Pins

| Component | Version |
|---|---|
| edge-kit | `1.0.0-rc96` |
| edge-halo | `1.0.0-rc21` |
| edge-engine | `1.0.0-rc137` |
| edge-scaffold | Pins edge-kit `1.0.0-rc96` and edge-halo `1.0.0-rc21` |

## Documentation

| Topic | Path |
|---|---|
| Overview and first steps | `docs/overview.md` |
| CLI learning demo | `docs/get-started/5-minute-demo.md` |
| Minimal iOS app | `docs/get-started/minimal-ios-app.md` |
| Swift SDK quickstart | `docs/get-started/quickstart.md` |
| Swift CLI validation | `docs/get-started/swift-cli.md` |
| Model evolution and Neural Imprint lifecycle | `docs/build/model-evolution.md` |
| Generate an iOS app from Edge Studio | `docs/optimize-and-ship/scaffold.md` |

Install the Swift SDK:

```swift
.package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc96")
```

Some package resolution paths may require AtomGradient preview access or SSH access for transitive dependencies such as Edge Engine.

## CLI Reference

Phase 2 SDK Proof commands are available through `edge-swift` for halo bridge checks and receipt-only restore coordinator smoke.

### Environment checks

```bash
edge doctor                 # Check environment readiness (read-only)
edge doctor --json
```

### Model management

Model preparation commands download models only when explicitly invoked.
The one-command learning flow records `network_used_during_model_prepare` separately from demo execution.

```bash
edge models list                                  # List catalog entries (read-only)
edge models where qwen3.5-9b-4bit                 # Show local path (read-only)
edge models doctor qwen3.5-9b-4bit                # Check model readiness (read-only)
edge models fetch qwen3.5-9b-4bit --dry-run       # Preview download
edge models fetch qwen3.5-9b-4bit --source auto   # Download model, write fetch receipt
```

### Chat

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive          # Multi-turn local chat
edge demo chat --model qwen3.5-9b-4bit --prompt "..." --max-tokens 64  # One-shot for scripts
```

Interactive mode loads the model once, keeps a session KV cache across turns, and writes one hash-only chat receipt per turn. Exit with `/exit` or `/quit`.

### Receipt inspection

```bash
edge demo receipt --schema                      # Show receipt schema
edge demo receipt --path ./receipt.json          # Inspect a receipt
edge demo local-only --path ./receipt.json       # Validate local-only invariants
```

### Neural Imprint demo

```bash
edge demo imprint run --dry-run --question "Summarize this synthetic profile."   # Plan only, no artifact generation
edge demo imprint run --question "Summarize this synthetic profile." --model qwen3.5-9b-4bit  # Generate and compare
edge demo imprint compare --path ./receipt.json  # Compare from existing receipt (read-only)
```

### Correction learning demo

`edge demo learn run` without `--dry-run` is the shipped local correction-learning demo.

```bash
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model auto     # Plan only
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --max-tokens 8  # Run learning flow
edge demo learn run --prepare-model --model qwen3.5-9b-4bit --source auto --max-tokens 8 --json      # Prepare model + run
```

### Artifact reuse

```bash
edge demo reuse --run edge-run-example --apps notes,finance --json  # Manifest-only smoke (read-only, no artifact copy)
```

## Swift Validation CLI

The `tests/smoke_test` directory contains the `edge-swift` Swift CLI for SDK validation, halo bridge checks, and receipt-only restore coordinator smoke. See `docs/get-started/swift-cli.md`.

## Docs Development

```bash
npm ci
npm run start
npm run build
```

Builds English and Chinese documentation.

## Trust Boundaries

- User data and Neural Imprint artifacts stay local unless the user explicitly moves them to trusted user-owned devices.
- Docs avoid unevaluated quality-improvement claims.
- Edge Scaffold is a developer reference app, not dogfood business logic.
- Roadmap items are labeled as planned until implementation and tests land.
