---
sidebar_position: 1
title: Quickstart
---

# Getting started

Install Edge Kit, load a local model, and stream tokens from an on-device LLM.

:::info Developer Preview
Edge Kit is in **Developer Preview**. Pin the package version you test with and re-run device validation after each upgrade.
:::

## Requirements

Edge Kit currently ships on Apple platforms. Support for Android, Linux, HarmonyOS, and Windows is planned.

| Requirement | Version |
| --- | --- |
| iOS | 17.0 or later |
| macOS | 14.0 or later |
| Xcode | 15 or later |
| Swift | 5.9 or later |

For iOS apps that run larger models, enable the Increased Memory Limit entitlement in your app target.

## Install with Swift Package Manager

Add Edge Kit to your package:

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-kit.git", from: "1.0.0")
]
```

Then add the product you need:

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeInference", package: "edge-kit")
    ]
)
```

Use `EdgeKit` if you want the umbrella product:

```swift
.product(name: "EdgeKit", package: "edge-kit")
```

## Run your first LLM

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/qwen-model")

try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(
    messages: [.user("Write a one sentence definition of edge AI.")]
) {
    print(chunk.text, terminator: "")
}
```

## Load from the model registry

`ModelConfig` contains preview model entries for supported model families.

```swift
import EdgeInference

let engine = LLMEngine()

guard let config = ModelConfig.find(modelID: "qwen3.5-0.8b") else {
    throw EdgeRuntimeError.modelNotFound("qwen3.5-0.8b")
}

try await engine.load(config: config) { progress in
    print("Download/load progress:", progress)
}
```

## Run your first VLM

Use `VLMEngine` when the model accepts images and text.

```swift
import EdgeInference

let engine = VLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/vlm-model")
let imageURL = URL(fileURLWithPath: "/path/to/image.jpg")

try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(
    messages: [.user("Describe this image in one paragraph.")],
    images: [imageURL]
) {
    print(chunk.text, terminator: "")
}
```

On iOS, prefer the `ciImages:` overload after loading an image into memory:

```swift
for try await chunk in engine.generate(
    messages: [.user("What is visible in this photo?")],
    ciImages: [ciImage]
) {
    print(chunk.text, terminator: "")
}
```

## Next steps

| Task | Guide |
| --- | --- |
| Text generation | [LLM guide](/docs/build/text-generation) |
| Vision-language inference | [VLM guide](/docs/build/vision) |
| Model cache and downloads | [Model management](/docs/guides/model-management) |
| iOS memory guidance | [Memory management](/docs/guides/memory-management) |
| Platform support | [Platform requirements](/docs/guides/platform-requirements) |
