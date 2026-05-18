---
sidebar_position: 1
slug: /
title: Overview
---

# AtomGradient Edge

Make AI grow on every device. No cloud. No latency. Complete privacy.

Currently shipping on Apple platforms. More platforms coming soon.

:::info Developer Preview
All Edge products are in **Developer Preview**. APIs, package names, and setup steps may change between releases.
:::

## What you can build

| Capability | Description | Get started |
|------------|-------------|-------------|
| **Text generation** | Stream text from an on-device LLM. Multi-turn, LoRA adapters, automatic memory management. | [Guide](/docs/capabilities/text-generation) |
| **Vision** | Send images and text to a vision-language model. Photo understanding, multi-turn follow-up. | [Guide](/docs/capabilities/vision) |
| **Speech to text** | Transcribe audio on-device. File or streaming microphone input. | [Guide](/docs/capabilities/speech-to-text) |
| **Text to speech** | Generate spoken audio from text. Multiple speakers, streaming output. | [Guide](/docs/capabilities/text-to-speech) |
| **Model evolution** | Models that grow with users. Built on the patented HALO algorithm system — profile extraction, adapter lifecycle, real-time steering, all on-device. | [Guide](/docs/capabilities/model-evolution) |
| **Device mesh** | Route inference across a user's devices. Private local network, zero configuration. | [Guide](/docs/capabilities/device-mesh) |

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

Five lines of Swift. On-device. Private. Fast.

[Install and run your first model](/docs/get-started/quickstart)

## How it fits together

```text
+-------------------------------------------------+
|                  Your App                        |
+----------------+---------------+-----------------+
|  Edge Kit      |  Edge Halo    |  Edge Mesh      |
|  (inference    |  (evolution   |  (multi-device) |
|   + DSR Attn)  |   + HALO)     |                 |
+----------------+---------------+-----------------+
|              Edge Engine (runtime)               |
+-------------------------------------------------+

Edge Studio (optimize models) --> Edge Scaffold (ship apps)
```

## Core technology

| Technology | Where | What it does |
|------------|-------|-------------|
| **DSR Attention** | Edge Engine, Edge Kit | Dynamic sparse retention for efficient long-context inference. Enables 9B models to run 20-turn conversations on phones without degradation. |
| **HALO** (patented) | Edge Halo | On-device model evolution algorithm system. User profiling, adapter training, and real-time activation steering — entirely local. |

## Tooling

| Tool | What it does | Learn more |
|------|-------------|------------|
| **Edge Studio** | Optimize, benchmark, and export models. Web UI with 20+ analysis and optimization tools. | [Overview](/docs/edge-studio/overview) |
| **Edge Scaffold** | Generate a publishable app from an optimized model. One config file. | [Overview](/docs/deployment/app-scaffold) |

## Performance

Real-device benchmarks with Qwen3.5-9B-4bit, 20-turn conversation stress test:

| Device | First turn | Median | T20 | TTFT |
|--------|-----------|--------|-----|------|
| iPhone 17 (A19, 11GB) | 12.6 TPS | 11.6 TPS | 10.8 TPS | 566ms |
| iPhone Air (A19, 11GB) | 9.5 TPS | 7.8 TPS | 7.5 TPS | 918ms |

Custom engine vs generic framework (M2 Ultra):

| Workload | Edge Engine | Generic | Speedup |
|----------|-----------|---------|---------|
| Text prefill (4B) | 1,305 TPS | 187 TPS | **7×** |
| VLM image prefill (4B) | 1,803 TPS | 851 TPS | **2.1×** |

## Examples

Complete, runnable code for common use cases:

| Example | What it shows |
|---------|--------------|
| [Basic chat app](/docs/examples/basic-chat) | Load a model, stream a conversation in SwiftUI. |
| [Vision chat](/docs/examples/vision-chat) | Image understanding with photo picker. |
| [Voice assistant](/docs/examples/voice-assistant) | Full duplex: speak, transcribe, think, speak. |
| [Personalized model](/docs/examples/personalized-model) | Train an adapter, apply it, roll back. |
| [Build and ship](/docs/examples/build-and-ship) | From optimized model to app submission. |
