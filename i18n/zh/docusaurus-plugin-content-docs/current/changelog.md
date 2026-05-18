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

### 1.0.0-rc13 (current)

- Edge Kit initial Developer Preview.
- Modules: EdgeInference, EdgeModelKit, EdgeVoice, EdgeMesh, EdgeData, EdgeUI.
- LLM, VLM, TTS, STT engine support.
- DSR Attention for long-context multi-turn sessions.
- Automatic KV cache memory policy.
- LoRA adapter loading.

## edge-halo

### 1.0.0-rc1 (current)

- Edge Halo initial Developer Preview.
- HALO algorithm system for on-device model evolution.
- User profiling, adapter lifecycle, activation steering.
- `HaloTextGenerator` and `HaloEngineSession` protocols.

## edge-engine

### 1.0.0-rc96 (current)

- Edge Engine initial Developer Preview.
- Native Metal inference runtime.
- DSR Attention implementation.

## edge-scaffold

### Current

- Edge Scaffold initial Developer Preview.
- iOS app template generation from Edge Studio export.
- ScaffoldConfig-based customization.
- Four-tier model delivery (Cache → Bundle → ODR → HuggingFace).
