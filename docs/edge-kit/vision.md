---
sidebar_position: 2
title: Vision
---

# Vision-language inference with VLMEngine

`VLMEngine` streams text responses from models that accept images and text.

## Load a VLM

```swift
import EdgeInference

let engine = VLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/vlm-model")

try await engine.loadLocal(directory: modelURL)
```

## Send an image URL

```swift
let imageURL = URL(fileURLWithPath: "/path/to/photo.jpg")

for try await chunk in engine.generate(
    messages: [.user("Describe this image.")],
    images: [imageURL]
) {
    print(chunk.text, terminator: "")
}
```

## Send in-memory images

Use the `ciImages:` overload for iOS apps that already have image data in memory.

```swift
let ciImage = CIImage(image: uiImage)!

for try await chunk in engine.generate(
    messages: [.user("What objects are visible?")],
    ciImages: [ciImage]
) {
    print(chunk.text, terminator: "")
}
```

## Multi-turn with images

Include the full conversation history. Attach images to the user turn that introduces them.

```swift
var messages: [ChatMessage] = [
    .user("Describe this image.")
]

let first = try await collect(
    engine.generate(messages: messages, images: [imageURL])
)

messages.append(.assistant(first))
messages.append(.user("Now focus on the text in the image."))

for try await chunk in engine.generate(messages: messages) {
    print(chunk.text, terminator: "")
}
```

Example collector:

```swift
func collect(_ stream: AsyncThrowingStream<GenerateChunk, Error>) async throws -> String {
    var result = ""
    for try await chunk in stream {
        result += chunk.text
    }
    return result
}
```

## Parameters

`VLMEngine` uses the same `EdgeGenerateParameters` type as `LLMEngine`.

```swift
let parameters = EdgeGenerateParameters(maxTokens: 256)

for try await chunk in engine.generate(
    messages: [.user("Give a concise answer.")],
    images: [imageURL],
    parameters: parameters
) {
    print(chunk.text, terminator: "")
}
```

## Memory notes

Vision-language models have larger runtime requirements than text-only models because image processing and text generation run in the same session. Start with smaller image sizes and validate on the minimum device you support.

## API surface

| Method | What it does |
|--------|-------------|
| `VLMEngine()` | Create a vision-language engine. `@MainActor`. |
| `loadLocal(directory:)` | Load a local VLM model. |
| `generate(messages:images:)` | Stream text from URL images. |
| `generate(messages:ciImages:)` | Stream text from in-memory `CIImage` values. |
| `lastMetrics` | TTFT, TPS, token counts. |

Full signatures → [EdgeInference API Reference](/docs/api-reference/edge-inference)

## Try it next

- [Vision chat example](/docs/examples/vision-chat) — Complete SwiftUI app with PhotosPicker.
- [Text generation](/docs/edge-kit/text-generation) — Text-only chat.
- [Model evolution](/docs/concepts/model-evolution) — Personalize the vision model.
