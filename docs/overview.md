---
sidebar_position: 1
slug: /
title: Overview
---

# AtomGradient Edge

Build private AI agents that run on the user's own devices.

Currently shipping on Apple platforms. Android, Linux, HarmonyOS, and Windows are on the roadmap.

:::info Developer Preview
All Edge products are in **Developer Preview**. APIs may change between releases. Pin your package versions and validate on real devices after each upgrade.
:::

## The product stack

| Product | What developers use it for |
| --- | --- |
| **Edge Studio** | Local workbench for model analysis, optimization, benchmark, Neural Imprint generation, device management, and export. |
| **Edge Engine** | Native on-device inference runtime. It is packaged under Edge Kit; most apps do not import it directly. |
| **Edge Kit** | Swift SDK for LLM, VLM, speech, model management, EdgeData, EdgeMesh, EdgeDataMeshBridge, EdgeSession, and EdgeUI. |
| **Edge Halo** | Personalization lifecycle layer: profile jobs, Neural Imprint capsule validation, restore orchestration, and compatibility gates. |
| **Edge Scaffold** | Reference app and export template that shows the recommended iOS integration pattern. |

The short version:

```text
Edge Studio prepares artifacts
        ↓
Edge Scaffold shows the reference app structure
        ↓
Your agent imports Edge Kit + Edge Halo
        ↓
Edge Engine runs the model locally
```

## Choose your path

### I want to see the learning loop first

1. [5-minute Neural Imprint learning demo](/docs/get-started/minute-demo) — One CLI command for a synthetic correction-learning loop
2. [Minimal iOS app](/docs/get-started/minimal-ios-app) — Build the reference app shell quickly
3. [Swift CLI validation](/docs/get-started/swift-cli) — Validate SDK contracts before app integration

### I want to build an on-device chat agent

1. [Install Edge Kit](/docs/get-started/quickstart) — SPM, 5 minutes
2. [Text generation](/docs/build/text-generation) — Load a model, stream tokens
3. [Basic chat example](/docs/examples/basic-chat) — Complete SwiftUI agent
4. [Memory management](/docs/guides/memory-management) — Ship without crashing

### I want to add vision, voice, or personalization

- [Vision](/docs/build/vision) — Image understanding with VLM
- [Speech to text](/docs/build/speech-to-text) + [Text to speech](/docs/build/text-to-speech) — Voice pipeline
- [Model evolution](/docs/build/model-evolution) — Neural Imprint and Edge Halo lifecycle
- [Personalized model example](/docs/examples/personalized-model) — Profile, capsule, and restore workflow

### I want to optimize a model and ship an agent

1. [Edge Studio overview](/docs/optimize-and-ship/studio-overview) — Local workbench
2. [Optimize and benchmark](/docs/optimize-and-ship/optimize-and-benchmark) — Analyze, compress, validate
3. [Export](/docs/optimize-and-ship/export) — Edge Kit bundle, scaffold project, GGUF, or CoreML
4. [Edge Scaffold](/docs/optimize-and-ship/scaffold) — Generate a publishable reference app
5. [Build and ship example](/docs/examples/build-and-ship) — End-to-end walkthrough

## Core concepts

| Concept | Developer-facing meaning |
| --- | --- |
| **Local-first inference** | Models, prompts, user data, and personalization artifacts stay on user-owned devices unless the user explicitly enables local mesh transfer. |
| **Neural Imprint** | A local personalization artifact that lets a compatible base model restore a user-specific state without changing model weights. |
| **EdgeMesh** | Local-network trust, discovery, and device-to-device transfer for user-owned devices. |
| **Memory intent** | A high-level policy hint such as `balanced`, `longSession`, `exactRecall`, or `batteryFriendly`; Edge Kit resolves the runtime memory details. |
| **Fail-closed compatibility** | Personalization and model artifacts must match model identity, tokenizer/template identity, runtime version, and tool schema before restore. |

## Quick start

```swift
import EdgeInference

let engine = LLMEngine()
try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(
    messages: [.user("What is edge AI?")]
) {
    print(chunk.text, terminator: "")
}
```

## Privacy model

Edge is designed around user-owned compute:

- Inference runs locally.
- Training inputs, corrections, and conversation history remain app-managed local data.
- EdgeMesh transfer is local-network and trust-gated.
- Neural Imprint artifacts are compatibility-checked before restore and can be removed by the app.

Do not upload user transcripts, corrections, or profile artifacts to analytics, crash logs, or remote support systems.
