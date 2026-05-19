---
sidebar_position: 1
slug: /
title: Overview
---

# AtomGradient Edge

Make AI grow on every device. No cloud. No latency. Complete privacy.

Currently shipping on Apple platforms. Android, Linux, HarmonyOS, and Windows are on the roadmap.

:::info Developer Preview
All Edge products are in **Developer Preview**. APIs may change between releases. Pin your package versions and validate on real devices after each upgrade.
:::

## Choose your path

### I want to build an on-device chat agent

1. [Install Edge Kit](/docs/get-started/quickstart) — SPM, 5 minutes
2. [Text generation](/docs/build/text-generation) — Load a model, stream tokens
3. [Basic chat example](/docs/examples/basic-chat) — Complete SwiftUI agent
4. [Memory management](/docs/guides/memory-management) — Ship without crashing

### I want to add vision, voice, or personalization

- [Vision](/docs/build/vision) — Image understanding with VLM
- [Speech to text](/docs/build/speech-to-text) + [Text to speech](/docs/build/text-to-speech) — Voice pipeline
- [Model evolution](/docs/build/model-evolution) — HALO-powered on-device continuous learning
- [Voice assistant example](/docs/examples/voice-assistant) — ASR → LLM → TTS end-to-end

### I want to optimize a model and ship an agent

1. [Edge Studio overview](/docs/optimize-and-ship/studio-overview) — Web UI workbench
2. [Optimize and benchmark](/docs/optimize-and-ship/optimize-and-benchmark) — Analyze, compress, validate
3. [Export](/docs/optimize-and-ship/export) — Edge Kit / GGUF / CoreML formats
4. [Edge Scaffold](/docs/optimize-and-ship/scaffold) — Generate a publishable agent
5. [Build and ship example](/docs/examples/build-and-ship) — End-to-end walkthrough

## Core technology

| Technology | What it means for you |
|------------|----------------------|
| **DSR Attention** | Dynamic sparse retention. Your 9B model runs 20-turn conversations on iPhones without speed degradation. You don't configure it — Edge Kit applies it automatically. |
| **HALO** (patented) | On-device model evolution. Your agent's model learns from user behavior without uploading data. Profile extraction, adapter training, real-time steering — all local. |

## Quick start

```swift
import EdgeKit

let engine = LLMEngine()
try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(
    messages: [.user("What is edge AI?")]
) {
    print(chunk.text, terminator: "")
}
```

## Performance

Real-device measurements. Qwen3.5-9B-4bit, 20-turn conversation:

| Device | First turn | Median | Turn 20 | TTFT |
|--------|-----------|--------|---------|------|
| iPhone 17 (11GB) | 12.6 TPS | 11.6 TPS | 10.8 TPS | 566ms |
| iPhone Air (11GB) | 9.5 TPS | 7.8 TPS | 7.5 TPS | 918ms |

Custom engine prefill (M2 Ultra):

| Workload | Edge Engine | Generic | Speedup |
|----------|-----------|---------|---------|
| Text (4B) | 1,305 TPS | 187 TPS | **7×** |
| VLM image (4B) | 1,803 TPS | 851 TPS | **2.1×** |
