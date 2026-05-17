---
sidebar_position: 1
slug: /
title: Overview
---

# AtomGradient Edge Platform

AtomGradient Edge Platform is a set of Developer Preview tools for building on-device AI apps on Apple Silicon.

The platform covers the full path from model preparation to a shippable iOS app:

1. Optimize a model in Edge Studio.
2. Run inference through Edge Kit.
3. Add personalization with Edge Halo.
4. Connect user-owned devices with Edge Mesh.
5. Ship an app with Edge Scaffold.

:::info Developer Preview
All Edge products are currently in **Developer Preview**. APIs, package names, and setup steps may change between releases.
:::

## Products

| Product | Use it for |
| --- | --- |
| [Edge Engine](/docs/edge-engine/overview) | Native inference runtime for Apple Silicon. |
| [Edge Kit](/docs/edge-kit/overview) | Swift SDK for LLM, VLM, speech-to-text, and text-to-speech inference. |
| [Edge Halo](/docs/edge-halo/overview) | User profile extraction, adapter lifecycle, and runtime steering. |
| [Edge Mesh](/docs/edge-mesh/overview) | Private local-network device discovery and routing. |
| [Edge Scaffold](/docs/edge-scaffold/overview) | Ready-to-ship iOS app template for Edge Kit apps. |
| [Edge Studio](/docs/edge-studio/overview) | Model analysis, optimization, benchmark, and export workbench. |

## Architecture

```text
App
├─ Edge Kit        Inference SDK
├─ Edge Halo       Personalization and adapter lifecycle
├─ Edge Mesh       Private device mesh
└─ Edge Engine     Native runtime foundation

Edge Studio -> Edge Scaffold -> App Store
```

## First inference

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/model")

try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(messages: [.user("What is edge AI?")]) {
    print(chunk.text, terminator: "")
}
```

## Choose a path

| Goal | Start here |
| --- | --- |
| Add local text generation to an app | [Edge Kit LLM](/docs/edge-kit/llm) |
| Add image understanding | [Edge Kit VLM](/docs/edge-kit/vlm) |
| Build a full iOS app from a model | [Edge Scaffold](/docs/edge-scaffold/overview) |
| Optimize and export a model | [Edge Studio](/docs/edge-studio/overview) |
| Add personalization | [Edge Halo](/docs/edge-halo/overview) |

## Privacy model

The default design is local-first. Model files, prompts, generated output, user profiles, and adapters stay on the user's devices unless your app explicitly moves them through user-owned infrastructure.

Continue with [Getting Started](/docs/getting-started).
