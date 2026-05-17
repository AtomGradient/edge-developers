---
sidebar_position: 1
title: Overview
---

# Edge Engine

Edge Engine is the native inference runtime foundation for AtomGradient Edge products.

:::info Developer Preview
Edge Engine is in **Developer Preview**. Most app developers should use [Edge Kit](/docs/edge-kit/overview), which provides higher-level Swift APIs.
:::

## What it does

Edge Engine provides the low-level runtime layer that Edge Kit builds on:

| Area | Description |
| --- | --- |
| Runtime | Apple Silicon-focused inference execution. |
| Tensor and storage abstractions | Model weight and tensor primitives used by higher-level engines. |
| Model-family runtime code | Native support paths for supported text, vision, speech, and audio families. |
| Package boundary | A focused runtime package, not a general-purpose ML framework. |

## When to use Edge Engine directly

Use Edge Engine directly if you are building:

- A runtime integration layer.
- A custom engine on top of AtomGradient model bundles.
- Low-level validation or smoke tests for exported models.

Use Edge Kit if you want:

- `LLMEngine`, `VLMEngine`, `TTSEngine`, or speech APIs.
- SwiftUI-friendly state.
- Model download and cache helpers.
- Edge Mesh or Edge Data integration.

## Package

```swift
.package(url: "https://github.com/AtomGradient/edge-engine.git", from: "1.0.0")
```

Add the product:

```swift
.product(name: "EdgeEngine", package: "edge-engine")
```

## Version

```swift
import EdgeEngine

print(EdgeEngine.version)
```

## Next steps

- [Install Edge Engine](/docs/edge-engine/installation)
- [Install Edge Kit](/docs/edge-kit/installation)
