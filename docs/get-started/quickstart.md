---
sidebar_position: 1
title: Quickstart
---

# Getting started

Install Edge Kit, load a local model, and stream tokens from an on-device LLM.

:::info Developer Preview
Edge Kit is in **Developer Preview**. Pin the package version you test with and re-validate on real devices after each upgrade.
:::

## Requirements

Edge Kit ships on Apple platforms. Android, Linux, HarmonyOS, and Windows support is planned.

| Requirement | Version |
| --- | --- |
| iOS | 17.0 or later |
| macOS | 14.0 or later |
| Xcode | 15 or later |
| Swift | 5.9 or later |

For iOS apps that run larger models, enable the Increased Memory Limit entitlement in your agent target.

## Install with Swift Package Manager

Add Edge Kit to your package:

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc98")
]
```

Pin preview releases exactly. Re-validate on real devices before moving to a newer `1.0.0-rcN` tag.

:::info Public packages
Edge Kit and Edge Engine are public GitHub repositories. Run `swift package resolve` in your development and CI environment to verify the exact tags before treating the SDK as integrated.
:::

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

## Prepare a registered model

`ModelConfig` contains entries for supported model families. Prepare the model with `EdgeModelKit`, then load the local cache directory with `loadLocal(directory:)`.

```swift
import EdgeInference
import EdgeModelKit

let engine = LLMEngine()

guard let config = ModelConfig.find(modelID: "qwen3.5-9b-4bit") else {
    throw EdgeRuntimeError.modelNotFound("qwen3.5-9b-4bit")
}

try await HFDownloader.shared.download(config: config) { progress in
    print("Download progress:", progress)
}

try await engine.loadLocal(directory: ModelCache.shared.cachedURL(for: config))
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
