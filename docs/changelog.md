---
sidebar_position: 100
title: Changelog
---

# Changelog

Breaking changes, new features, and migration notes for each Developer Preview release.

:::info
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

Developer Preview is an internal preview channel. The changelog documents what is shipped, what requires preview access, and what is deliberately not enabled yet.

### Access matrix

| Surface | Current access | Notes |
|---|---|---|
| Swift SDK docs | Edge Kit `1.0.0-rc94` | Docs use an exact version pin. Upgrade only after validation. |
| Edge Engine dependency | Edge Engine `1.0.0-rc136` | Some preview repos or dependencies may require AtomGradient internal preview access or SSH access today. This is surfaced here, not treated as a current internal preview blocker. |
| Edge Halo dependency | Edge Halo `1.0.0-rc17` | Edge Halo depends on Edge Engine `1.0.0-rc136`; validate package resolution in your environment. |
| Edge Scaffold | Pins Edge Kit `1.0.0-rc94` and Edge Halo `1.0.0-rc17` | Generated apps still require signing, device provisioning, and real-device validation. |

### Compatibility matrix

| Component | Compatible preview |
|---|---|
| Edge Kit | `1.0.0-rc94`, depends on Edge Engine `1.0.0-rc136` |
| Edge Halo | `1.0.0-rc17`, depends on Edge Engine `1.0.0-rc136` |
| Edge Scaffold | Current preview pins Edge Kit `1.0.0-rc94` and Edge Halo `1.0.0-rc17` |

Generic builds and simulator checks are not enough for runtime claims. Re-run real-device validation after changing any preview tag.

### Known limitations

- `edge doctor` is shipped in current preview as a read-only B1 environment check. It does not download models, load models, start the backend, or run Neural Imprint workflows.
- `edge models list`, `edge models where`, and `edge models doctor` are shipped in current preview as read-only B2a model readiness checks. They do not download models, write receipts, or probe the network.
- `edge models fetch` is shipped in current preview as an explicit B2b model preparation command with `--dry-run`, source selection, local receipts, and no silent demo download.
- Planned demo CLI commands are not shipped in current preview: `edge demo imprint run` and `edge demo receipt` are tracked by B4/B6 in the Developer Preview DX roadmap.
- Product-default paired-device route is not enabled by this preview documentation or changelog. Broad live routing still requires separate explicit policy, opt-in, and real-device evidence.
- Background automation scheduler is not shipped. The bounded automation API remains explicit, dry-run by default, and fail-closed.
- Model push and Neural Imprint regen execution remain unsupported without separate explicit policy/design.
- `edge demo reuse` is an artifact reuse smoke, not C2 cross-device sync.
- A5.8 follow-ups remain: background scheduler, apply-status UI reference, and optional production embedded build stamp.
- EdgeMesh capsule auto-restore SDK orchestration is already shipped through `HaloCapsuleAutoRestoreCoordinator` in Edge Kit `1.0.0-rc94`; it is not a current limitation.

---

## edge-kit

### 1.0.0-rc94 (current)

- Edge Kit current Developer Preview.
- Modules: EdgeInference, EdgeModelKit, EdgeVoice, EdgeMesh, EdgeData, EdgeUI.
- LLM, VLM, TTS, STT engine support.
- DSR Attention for long-context multi-turn sessions.
- Automatic KV cache memory policy.
- Neural Imprint runtime restore primitives and EdgeMesh capsule auto-restore coordinator APIs.
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
- Pins Edge Kit `1.0.0-rc94` and Edge Halo `1.0.0-rc17`.
