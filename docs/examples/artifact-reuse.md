---
sidebar_position: 5
title: Artifact Reuse
---

# Example: Neural Imprint artifact reuse

This page explains a cross-app **compatibility check pattern** for Neural Imprint artifacts. It is not a runtime sharing feature, not a distribution mechanism, and not cross-device sync.

Use it when two apps, such as a synthetic `NotesAgent` and `FinanceAgent`, need to verify whether they could restore the same local Neural Imprint capsule under their own compatibility gates.

## What reuse means

In this preview, artifact reuse means:

1. A local Neural Imprint capsule already exists.
2. Each app independently reads a receipt or manifest that points to that capsule.
3. Each app builds its own runtime requirements from its loaded base model, tokenizer, runtime version, and tool schema hash.
4. Each app validates the capsule before restore.
5. If validation fails, the app keeps the base model active and offers a recovery path such as regenerate, re-export, or load the matching model.

The artifact file does not move by default. How the capsule reaches each app sandbox is outside this preview page. It can be handled later by an OS-level file handoff, a user-selected import, or an explicit trusted transport.

## Two-app reference scenario

`NotesAgent` and `FinanceAgent` are synthetic reference roles:

| App | Owns | Uses shared artifact for |
|---|---|---|
| `NotesAgent` | notes UI, notes storage, note tools, app policy | Compatibility validation against the loaded notes model |
| `FinanceAgent` | finance UI, finance storage, finance tools, app policy | Compatibility validation against the loaded finance model |

Both apps keep their own data and tools. A Neural Imprint artifact can only be restored if the app's compatibility gates pass. Tool schema hashes are part of that gate, so a capsule prepared for one tool surface can fail closed in another app.

## Python receipt smoke

The Developer Preview CLI includes a receipt/manifest smoke for this concept:

```bash
edge demo reuse --run edge-run-example --apps notes,finance --json
```

This command reads an existing completed local demo receipt and writes per-app reuse manifests. It is an artifact reuse smoke. It does not copy artifacts, does not load a model, does not restore an artifact, and does not use the network.

Use it to verify that the receipt shape, per-app manifests, and local-only safety contract are clear. It is not runtime evidence for multiple apps.

## Swift validation path

For Swift-side validation of the lower-level package and restore coordinator receipts, use the Swift CLI validation guide:

- [`edge-swift imprint validate --fixture --json`](/docs/get-started/swift-cli)
- [`edge-swift imprint restore --fixture --json`](/docs/get-started/swift-cli)

Those commands run in EdgeStudio's `tests/smoke_test` package. The restore fixture is receipt-only smoke for the coordinator path, not production restore.

## App integration boundary

In a real app, the app layer stays responsible for:

- Which local data can contribute to personalization.
- Where local receipts and manifests live.
- How the user imports, selects, or removes a Neural Imprint capsule.
- Which tools are available to that app.
- How failed compatibility is explained to the user.

Edge Kit and Edge Halo provide reusable SDK infrastructure. They should not own app-specific records, product policy, or private business logic.

## Safety boundaries

- Artifact reuse is a compatibility check pattern.
- It is not automatic sharing.
- It is not cross-device sync.
- One app does not trigger restore in another app.
- The receipt smoke does not copy artifacts by default.
- The receipt smoke does not load models or restore artifacts.
- The base model stays active whenever compatibility validation fails.
- Do not replay profile text into prompts; restore a compatible artifact instead.
- Do not claim quality improvement without separate evaluation evidence.

## Related guides

- [Neural Imprint lifecycle](personalized-model.md)
- [Swift CLI validation](/docs/get-started/swift-cli)
- [Architecture and product boundaries](/docs/guides/architecture)
