---
sidebar_position: 5
title: EdgeHalo
---

# EdgeHalo API reference

The `EdgeHalo` module manages the local personalization lifecycle: profile jobs, Neural Imprint capsule compatibility, and restore orchestration.

:::info Developer Preview
Edge Halo is distributed to apps through the public `edge-halo-binary` Swift package. The source repository remains private; the binary package exposes the documented API surface without exposing the implementation.
:::

## Install

```swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-halo-binary", exact: "1.0.0-rc24")
]
```

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeHalo", package: "edge-halo-binary")
    ]
)
```

Then import the module:

```swift
import EdgeHalo
```

## EdgeHaloRuntime

```swift
public actor EdgeHaloRuntime
```

Main entry point.

| Property or method | Description |
| --- | --- |
| `init(engine:generator:dataStream:)` | Creates an `EdgeHaloRuntime` actor with app-provided runtime bridges. |
| `evolutionState` | High-level model evolution state for product UI. |
| `currentProfile` | Most recent local profile result, if available. |
| `haloState` | Capsule validation and restore state. |
| `activeCapsule` | Active `HaloCapsule`, if a compatible Neural Imprint is restored. |
| `runProfileAnalysis(...)` | Runs a local profile job from prepared inputs and exported resources. |
| `validateCapsule(_:currentRequirements:)` | Checks whether a capsule can be restored into the current runtime. |
| `activateCapsule(_:currentRequirements:)` | Restores a compatible capsule. Fails closed on mismatch. |

## HaloTextGenerator

```swift
public protocol HaloTextGenerator: Sendable
```

Text-generation provider implemented by the agent.

| Method | Description |
| --- | --- |
| `tokenize(_:)` | Converts text into token IDs with the tokenizer that matches the loaded model. |
| `generate(prompt:maxTokens:)` | Runs short local generations used by the profile workflow. |

## HaloEngineSession

```swift
public protocol HaloEngineSession: Sendable
```

Runtime bridge implemented by the agent. Edge Halo does not import Edge Kit directly; the app wires both packages together.

| Method | Description |
| --- | --- |
| `captureHiddenState(tokens:layer:)` | Captures model state needed by the profile workflow. |
| `captureFullCache(tokenIds:)` | Captures a local Neural Imprint prefix artifact when supported. |
| `restoreFullCache(_:artifactURL:)` | Restores a compatible Neural Imprint artifact. |

The current preview protocol also contains advanced optional runtime hooks. Most agents can leave those unsupported unless a release note or scaffold integration requires them.

## EvolutionState

```swift
public enum EvolutionState: Sendable, Equatable
```

| Case | Description |
| --- | --- |
| `.idle` | No active evolution task. |
| `.collecting(progress:)` | Collecting eligible local data toward a profile refresh. |
| `.readyToBuildCapsule` | Enough data is available to build or receive a new artifact. |
| `.buildingCapsule` | A local artifact is being prepared. |
| `.validating(capsuleID:)` | A capsule is being checked before restore. |
| `.evolved(capsuleID:)` | A compatible capsule is active. |

## HaloState

```swift
public enum HaloState: Sendable, Equatable
```

Capsule-level state for settings UI and diagnostics.

| Case | Description |
| --- | --- |
| `.idle` | No capsule state. |
| `.collecting(factsCount:threshold:)` | More local data is needed before personalization can run. |
| `.profiling` | Profile inputs are being prepared. |
| `.buildingCapsule` | A Neural Imprint artifact is being prepared. |
| `.validating(capsuleID:)` | Compatibility gates are running. |
| `.active(capsuleID:)` | A compatible capsule is restored. |
| `.incompatible(capsuleID:reason:)` | Restore was rejected. Keep the base model active. |
| `.failed(reason:)` | Lifecycle failed. Show a recovery action. |

## HaloCapsule

```swift
public struct HaloCapsule: Sendable, Equatable, Codable
```

Container for a Neural Imprint capsule manifest and optional local artifact URL.

| Property | Type |
| --- | --- |
| `manifest` | `HaloCapsuleManifest` |
| `artifactURL` | `URL?` |

## HaloCapsuleManifest

```swift
public struct HaloCapsuleManifest: Sendable, Equatable, Codable
```

Metadata used to validate and describe a capsule.

| Property | Description |
| --- | --- |
| `capsuleID` | Stable identifier for the capsule. |
| `createdAt` | Creation time. |
| `baseModelID` | Base model this capsule targets. |
| `requirements` | Runtime identity required for restore. |
| `cacheSnapshot` | Snapshot metadata for the artifact. |
| `artifactSHA256` | Hash of the local artifact bytes, when available. |

## HaloCapsuleRequirements

```swift
public struct HaloCapsuleRequirements: Sendable, Equatable, Codable
```

Runtime identity used for fail-closed restore checks.

| Property | Description |
| --- | --- |
| `modelFamily`, `hiddenSize`, `layerCount` | Model-shape identity. |
| `modelConfigSHA256`, `modelWeightsFingerprint` | Model config and weights identity. |
| `tokenizerJSONSHA256`, `tokenizerConfigSHA256` | Tokenizer identity. |
| `chatTemplateSHA256` | Chat-template identity. |
| `toolSchemaSHA256` | Tool schema identity. |
| `profileBodySHA256` | Profile source identity without exposing profile text. |
| `cacheBackend`, `cacheBackendVersion`, `cacheTopologySHA256` | Runtime cache identity. |

Use:

```swift
let result = capsule.manifest.requirements.compatibility(with: current)
if result.isCompatible {
    try await halo.activateCapsule(capsule, currentRequirements: current)
}
```

## UserProfile

```swift
public struct UserProfile: Sendable
```

Local profile narrative produced by the preview profile workflow.

| Property | Type |
| --- | --- |
| `directionNames` | `[String]` |
| `narrative` | `String` |
| `sampleCount` | `Int` |
| `computedAt` | `Date` |
| `stabilityScore` | `Float` |

The numeric fields are runtime data. Product UI should usually show the narrative, freshness, sample count, and reset controls rather than raw vectors.

## HaloDataEvent

```swift
public enum HaloDataEvent: Sendable
```

Optional event stream for lifecycle decisions.

| Case | Description |
| --- | --- |
| `.feedback(accepted:conversationID:)` | User feedback for a response. |
| `.correction(original:corrected:conversationID:)` | User correction for a response. |
| `.sessionCompleted(turnCount:conversationID:)` | Completed conversation session. |
