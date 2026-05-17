---
sidebar_position: 2
title: Installation
---

# Install Edge Engine

Install Edge Engine only when you need direct runtime access. Most app developers should install Edge Kit instead.

## Requirements

| Requirement | Version |
| --- | --- |
| iOS | 17.0 or later |
| macOS | 14.0 or later |
| Swift | Check the selected release tag |
| Hardware | Apple Silicon |

## Swift Package Manager

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-engine.git", from: "1.0.0")
]
```

Add the library product:

```swift
.target(
    name: "RuntimeIntegration",
    dependencies: [
        .product(name: "EdgeEngine", package: "edge-engine")
    ]
)
```

## Import

```swift
import EdgeEngine

print(EdgeEngine.version)
```

## Use Edge Kit for app inference

If your goal is to run a model in an app, install Edge Kit:

```swift
.package(url: "https://github.com/AtomGradient/edge-kit.git", from: "1.0.0")
```

Then import `EdgeInference`:

```swift
import EdgeInference

let engine = LLMEngine()
```
