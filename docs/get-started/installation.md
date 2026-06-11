---
sidebar_position: 2
title: Installation
---

# Install Edge Kit

Install Edge Kit with Swift Package Manager.

## Requirements

| Requirement | Version |
| --- | --- |
| iOS | 17.0 or later |
| macOS | 14.0 or later |
| Xcode | 15 or later |
| Swift | 5.9 or later |
| Hardware | Apple Silicon |

For iOS apps that run larger models, enable the Increased Memory Limit entitlement.

## Package

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc94")
]
```

Developer Preview releases should be pinned exactly. Re-run your real-device validation before moving to a newer `1.0.0-rcN` tag.

## Add the umbrella product

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeKit", package: "edge-kit")
    ]
)
```

Then import the umbrella module:

```swift
import EdgeKit
```

## Add individual modules

Use individual products when you want a narrower dependency surface.

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeInference", package: "edge-kit"),
        .product(name: "EdgeModelKit", package: "edge-kit")
    ]
)
```

Common imports:

```swift
import EdgeInference
import EdgeModelKit
import EdgeVoice
import EdgeMesh
import EdgeData
```

## Verify installation

```swift
import EdgeInference

let engine = LLMEngine()
print(engine.state)
```

## iOS entitlement

For models larger than small preview models, add the Increased Memory Limit entitlement in the app target. Without it, iOS may terminate the process before physical memory is exhausted.
