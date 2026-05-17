---
sidebar_position: 1
title: Overview
---

# Edge Kit

Edge Kit is a Swift SDK for on-device AI inference on Apple Silicon.

:::info Developer Preview
Edge Kit is in **Developer Preview**. APIs may change between preview releases.
:::

## Modules

| Module | Description |
| --- | --- |
| `EdgeKit` | Umbrella product that re-exports the public modules. |
| `EdgeInference` | LLM, VLM, TTS, STT engines and shared inference types. |
| `EdgeModelKit` | Model download, cache, and tier helpers. |
| `EdgeVoice` | Audio recording and Whisper-based speech APIs. |
| `EdgeMesh` | Local-network device mesh. |
| `EdgeData` | Local data collection and classification primitives. |
| `EdgeUI` | SwiftUI components for EdgeData workflows. |

## Model categories

| Category | Engine | Input | Output |
| --- | --- | --- | --- |
| LLM | `LLMEngine` | Text messages | Streaming text |
| VLM | `VLMEngine` | Text messages and images | Streaming text |
| STT | `WhisperEngine` or `STTEngine` | Audio | Text |
| TTS | `TTSEngine` | Text | PCM audio |

## Basic usage

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/model")

try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(messages: [.user("Hello")]) {
    print(chunk.text, terminator: "")
}
```

## Automatic model-category loading

Use `EdgeRuntime` when you want Edge Kit to detect the model category from a local directory.

```swift
import EdgeInference

let runtime = EdgeRuntime()
let anyEngine = try await runtime.loadLocal(directory: modelURL)

switch anyEngine.category {
case .llm:
    print(anyEngine.llm as Any)
case .vlm:
    print(anyEngine.vlm as Any)
case .tts:
    print(anyEngine.tts as Any)
case .stt:
    print(anyEngine.stt as Any)
}
```

## Personalization

`LLMEngine` and `VLMEngine` can load LoRA adapters:

```swift
try await engine.loadLoRA(adapterPath: adapterURL)
engine.unloadLoRA()
```

For adapter lifecycle, validation, and profile-driven steering, use [Edge Halo](/docs/edge-halo/overview).

## Next steps

- [Install Edge Kit](/docs/edge-kit/installation)
- [Text generation](/docs/edge-kit/llm)
- [Vision-language inference](/docs/edge-kit/vlm)
- [Memory management](/docs/edge-kit/memory-management)
