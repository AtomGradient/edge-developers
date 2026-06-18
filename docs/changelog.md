---
sidebar_position: 100
title: Changelog
---

# Changelog

Breaking changes, new features, and migration notes for each Developer Preview release.

:::info Info
Edge products are in **Developer Preview**. Expect breaking changes between releases. Pin your package versions and validate after each upgrade.
:::

## Versioning policy

During Developer Preview, releases follow `1.0.0-rcN` tags. Breaking changes are documented here with migration steps. After general availability, we will follow semantic versioning.

## How to upgrade

1. Update the version pin in your `Package.swift`.
2. Read the changelog entry for any breaking changes.
3. Build and fix compiler errors.
4. Run your test suite on a real device.
5. Verify first-launch, multi-turn, and memory behavior.

## Developer Preview boundaries

Developer Preview is a limited preview channel. The changelog documents what is shipped, what requires preview access, and what is deliberately not enabled yet.

### Access matrix

| Surface | Current access | Notes |
|---|---|---|
| Swift SDK docs | Edge Kit `1.0.0-rc95` | Docs use an exact version pin. Upgrade only after validation. |
| Edge Engine dependency | Edge Engine `1.0.0-rc136` | Some preview repos or dependencies may require AtomGradient internal preview access or SSH access today. This is surfaced here, not treated as a current internal preview blocker. |
| Edge Halo dependency | Edge Halo `1.0.0-rc17` | Edge Halo depends on Edge Engine `1.0.0-rc136`; validate package resolution in your environment. |
| Edge Scaffold | Pins Edge Kit `1.0.0-rc95` and Edge Halo `1.0.0-rc17` | Generated apps still require signing, device provisioning, and real-device validation. |

### Compatibility matrix

| Component | Compatible preview |
|---|---|
| Edge Kit | `1.0.0-rc95`, depends on Edge Engine `1.0.0-rc136` |
| Edge Halo | `1.0.0-rc17`, depends on Edge Engine `1.0.0-rc136` |
| Edge Scaffold | Current preview pins Edge Kit `1.0.0-rc95` and Edge Halo `1.0.0-rc17` |

Generic builds and simulator checks are not enough for runtime claims. Re-run real-device validation after changing any preview tag.

### Known limitations

- `edge doctor` is a read-only environment check. It does not download models, load models, start the backend, or run Neural Imprint workflows.
- `edge models list`, `edge models where`, and `edge models doctor` are read-only model readiness checks. They do not download models, write receipts, or probe the network.
- `edge models fetch` is an explicit model preparation command with `--dry-run`, source selection, local receipts, and no silent demo download.
- `edge demo chat` is a base-model chat command. It uses an explicitly prepared local model and writes a hash-only `edge.demo.chat.receipt.v1` receipt by default.
- `edge demo receipt` and `edge demo local-only` are receipt inspection tools. They validate `edge.demo.receipt.v1` local-only invariants and do not generate Neural Imprint artifacts or call model runtimes.
- `edge demo imprint run --dry-run` is a pre-flight planner. It emits `edge.demo.imprint.plan.v1` with hash-only sample/question metadata and local model prerequisite status.
- `edge demo imprint run` without `--dry-run` is the Neural Imprint demo. It generates and restores a local artifact and writes a comparison receipt.
- `edge demo imprint compare` is a receipt-only comparison inspector. It reads a completed `edge.demo.receipt.v1` receipt and emits `edge.demo.imprint.compare.v1` without loading models, restoring artifacts, generating answers, or using the network.
- `edge demo learn run --dry-run` is a correction-learning pre-flight planner. It emits `edge.demo.learn.plan.v1` with hash-only synthetic correction metadata and isolated-state paths; it does not write correction ledgers, call regen, load models, or write a learn receipt.
- `edge demo learn run` without `--dry-run` is the correction-learning demo. It writes synthetic Persona/RPP input and correction ledger entries under the demo run state, triggers correction regen, restores the regenerated local Neural Imprint artifact, compares before/after answer hashes, and writes `edge.demo.learn.receipt.v1`.
- `edge demo learn run --prepare-model` combines model preparation and the learning demo in one command. It may explicitly prepare a compatible local model first, then records model-preparation network use separately as `network_used_during_model_prepare` from the local learning demo.
- `edge demo reuse` is an artifact reuse smoke check. It reads a completed receipt and writes per-app `edge.demo.reuse.receipt.v1` manifests without copying artifacts, syncing devices, restoring artifacts, loading models, or using the network.
- Product-default paired-device route is not enabled by this preview documentation or changelog. Broad live routing still requires separate explicit policy, opt-in, and real-device evidence.
- Background automation scheduler is not shipped. The bounded automation API remains explicit, dry-run by default, and fail-closed.
- Generic capsule apply-status UI reference is shipped in Edge Scaffold and the dogfood validation app. Product-specific placement, layout, or copy remains outside the preview baseline.
- Model push and product-default Neural Imprint regen execution remain unsupported without separate explicit policy/design. The shipped `edge demo learn run` path is an explicit local synthetic demo.
- `edge demo reuse` is an artifact reuse smoke check, not cross-device sync.
- Background scheduler is not yet shipped.
- EdgeMesh capsule auto-restore SDK orchestration is already shipped through `HaloCapsuleAutoRestoreCoordinator` in Edge Kit `1.0.0-rc94`; it is not a current limitation.

---

## edge-kit

### 1.0.0-rc95 (current)

- Edge Kit current Developer Preview.
- Modules: EdgeInference, EdgeModelKit, EdgeVoice, EdgeMesh, EdgeData, EdgeDataMeshBridge, EdgeUI, EdgeSession.
- LLM, VLM, TTS, STT engine support.
- DSR Attention for long-context multi-turn sessions.
- Automatic KV cache memory policy.
- Neural Imprint runtime restore primitives and EdgeMesh capsule auto-restore coordinator APIs.
- Production app builds can embed generic `EdgeBuildCommit` metadata for snapshot traceability.
- Depends on Edge Engine `1.0.0-rc136`.

### 1.0.0-rc94

- Added EdgeMesh capsule auto-restore coordinator APIs.
- Depends on Edge Engine `1.0.0-rc136`.

## edge-halo

### 1.0.0-rc17 (current)

- Edge Halo current Developer Preview.
- Edge Halo lifecycle for local profile jobs and Neural Imprint capsule compatibility.
- Fail-closed validation for model, tokenizer, runtime, and tool-schema identity.
- `HaloTextGenerator` and `HaloEngineSession` protocols.
- RPP A-library provenance validation and profile artifact lifecycle helpers.
- Dependency version metadata aligned with the current preview tag.
- Depends on Edge Engine `1.0.0-rc136`.

## edge-engine

### 1.0.0-rc136 (current dependency tag)

- Edge Engine current dependency tag used by Edge Kit and Edge Halo.
- Native Metal inference runtime.
- DSR Attention implementation.
- Unreleased commits on `main` are not part of this Developer Preview tag until a new `1.0.0-rcN` release is published.

## edge-scaffold

### Current preview dependencies

- Edge Scaffold initial Developer Preview.
- iOS app template generation from Edge Studio export.
- ScaffoldConfig-based customization.
- Four-tier model delivery (Cache → Bundle → ODR → HuggingFace).
- Pins Edge Kit `1.0.0-rc95` and Edge Halo `1.0.0-rc17`.
