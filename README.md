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

## Planned CLI

> Not shipped in current preview. These commands are tracked by the Developer Preview DX roadmap and should not be treated as runnable until the B1/B4 CLI work lands.

Planned preview commands include:

- `edge doctor` for local environment checks.
- `edge demo imprint run` for a Neural Imprint behavior-change demo.
- `edge demo receipt` for local-only receipt inspection.

## Trust Boundaries

- User data and Neural Imprint artifacts stay local unless the user explicitly moves them to trusted user-owned devices.
- README and docs avoid unevaluated quality-improvement claims.
- Edge Scaffold is a developer reference app, not dogfood business logic.
- CLI commands are labeled as planned until their implementation and tests land.
