---
sidebar_position: 1
slug: /
title: Overview
---

# AtomGradient Edge Platform

Build AI-powered apps that run entirely on-device. No cloud. No latency. Complete privacy.

The Edge platform is a suite of developer tools for deploying large language models on Apple Silicon — from optimization to inference to a published App Store app.

:::info Developer Preview
All Edge products are currently in **Developer Preview**. APIs may change between releases.
:::

## The stack

| Layer | Product | What it does |
|-------|---------|-------------|
| **Core** | [Edge Engine](/docs/edge-engine/overview) | Native Metal inference runtime for Apple Silicon |
| **SDK** | [Edge Kit](/docs/edge-kit/overview) | Swift SDK — LLM, VLM, ASR, TTS inference |
| **Evolution** | [Edge Halo](/docs/edge-halo/overview) | Model self-evolution — models that grow with users |
| **Networking** | [Edge Mesh](/docs/edge-mesh/overview) | Private device mesh — route inference across devices |
| **Deployment** | [Edge Scaffold](/docs/edge-scaffold/overview) | iOS app template — optimized model to App Store |
| **Tooling** | [Edge Studio](/docs/edge-studio/overview) | Model optimization workbench |

## Architecture

```
Edge Studio (optimize) ─→ Edge Scaffold (deploy)
                              │
                          Edge Kit (SDK)
                         ┌────┼────┐
                    Edge Halo  │  Edge Mesh
                         └────┼────┘
                        Edge Engine (core)
```

## Product tiers

Choose the combination that fits your use case:

| Tier | Packages | For |
|------|----------|-----|
| **Inference** | Edge Engine + Edge Kit | Apps that need on-device LLM/VLM/ASR/TTS |
| **Personalization** | + Edge Halo | Apps where the model adapts to each user |
| **Multi-device** | + Edge Mesh | Apps that span a user's Apple device fleet |
| **Full pipeline** | + Edge Studio + Edge Scaffold | End-to-end: optimize → build → ship |

## Quick start

```swift
import EdgeKit

let engine = LLMEngine()
try await engine.load(from: "~/models/Qwen3.5-4B-4bit")

for try await chunk in engine.generate(
    messages: [.user("What is edge AI?")]
) {
    print(chunk.text, terminator: "")
}
```

Five lines of Swift. On-device. Private. Fast.

→ [Get started](/docs/getting-started)
