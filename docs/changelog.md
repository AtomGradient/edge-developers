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
