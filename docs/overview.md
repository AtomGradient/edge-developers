---
sidebar_position: 1
slug: /
title: Overview
---

# AtomGradient Edge

On-device AI for Apple Silicon. No cloud. No latency. Complete privacy.

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
| **Model evolution** | Models that grow with users. Profile extraction, adapter lifecycle, real-time steering. | [Guide](/docs/capabilities/model-evolution) |
| **Device mesh** | Route inference across a user's Apple devices. Private local network, zero configuration. | [Guide](/docs/capabilities/device-mesh) |

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
|  (inference)   |  (evolution)  |  (multi-device) |
+----------------+---------------+-----------------+
|              Edge Engine (runtime)               |
+-------------------------------------------------+

Edge Studio (optimize models) --> Edge Scaffold (ship apps)
```

## Tooling

| Tool | What it does | Learn more |
|------|-------------|------------|
| **Edge Studio** | Optimize, benchmark, and export models. Web UI with 20+ analysis and optimization tools. | [Overview](/docs/edge-studio/overview) |
| **Edge Scaffold** | Generate a publishable iOS app from an optimized model. One config file. | [Overview](/docs/deployment/app-scaffold) |

## Examples

Complete, runnable code for common use cases:

| Example | What it shows |
|---------|--------------|
| [Basic chat app](/docs/examples/basic-chat) | Load a model, stream a conversation in SwiftUI. |
| [Vision chat](/docs/examples/vision-chat) | Image understanding with photo picker. |
| [Voice assistant](/docs/examples/voice-assistant) | Full duplex: speak, transcribe, think, speak. |
| [Personalized model](/docs/examples/personalized-model) | Train an adapter, apply it, roll back. |
| [Build and ship](/docs/examples/build-and-ship) | From optimized model to App Store submission. |
