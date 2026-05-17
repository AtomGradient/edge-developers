---
sidebar_position: 5
title: EdgeHalo
---

# EdgeHalo API reference

`EdgeHalo` manages user profiles, adapters, and session steering.

:::info Developer Preview
Some profile-analysis APIs are intentionally low-level in the current preview and may change.
:::

## EdgeHalo

```swift
public actor EdgeHalo
```

Main entry point.

| Property or method | Description |
| --- | --- |
| `init(engine:generator:dataStream:)` | Creates an `EdgeHalo` actor with injected engine and generator providers. |
| `evolutionState` | Current `EvolutionState`. |
| `currentProfile` | Most recent `UserProfile`, if available. |
| `activeAdapter` | Active `AdapterVersion`, if any. |
| `runProfileAnalysis(...)` | Runs local profile analysis and updates `currentProfile`. |
| `validateAdapter(_:)` | Returns an `AdapterDecision` for an incoming adapter. |
| `applyAdapter(path:version:scale:)` | Applies an adapter through the engine session. |
| `rollback()` | Removes the active adapter. |
| `updateSteering(scales:)` | Applies steering from the current profile. |

## HaloTextGenerator

```swift
public protocol HaloTextGenerator: Sendable
```

Text-generation provider implemented by the app.

| Method | Description |
| --- | --- |
| `tokenize(_:)` | Converts text into token IDs. |
| `generate(prompt:maxTokens:)` | Generates text for labels and profile summaries. |

## HaloEngineSession

```swift
public protocol HaloEngineSession: Sendable
```

Engine-session operations needed by Edge Halo.

| Method | Description |
| --- | --- |
| `injectLoRA(adapterPath:scale:)` | Loads an adapter into the engine session. |
| `removeLoRA()` | Removes the active adapter. |
| `captureHiddenState(tokens:layer:)` | Captures a profile-analysis vector. |
| `injectSteering(vectors:layers:scales:)` | Applies steering vectors. |
| `removeSteering()` | Removes steering vectors. |

## EvolutionState

```swift
public enum EvolutionState: Sendable, Equatable
```

| Case | Description |
| --- | --- |
| `.idle` | No active evolution task. |
| `.collecting(progress:)` | Collecting data toward the next training trigger. |
| `.readyToTrain` | Enough data is available to request training. |
| `.training` | Training is running on the user's Mac. |
| `.validating` | A new adapter is being validated. |
| `.evolved(version:)` | An adapter is active. |

## AdapterVersion

```swift
public struct AdapterVersion: Sendable, Equatable, Codable
```

| Property | Type |
| --- | --- |
| `version` | `Int` |
| `hash` | `String` |
| `baseModelID` | `String` |
| `trainingDataHash` | `String` |
| `trainedAt` | `Date` |

## AdapterDecision

```swift
public enum AdapterDecision: Sendable, Equatable
```

| Case | Description |
| --- | --- |
| `.apply` | Apply immediately. |
| `.validateFirst(rounds:)` | Run local validation before applying. |
| `.rejectIncompatible(reason:)` | Reject due to base-model mismatch. |
| `.rejectOutdated` | Reject because the active adapter is newer. |

## UserProfile

```swift
public struct UserProfile: Sendable
```

| Property | Type |
| --- | --- |
| `directions` | `[[Float]]` |
| `directionNames` | `[String]` |
| `narrative` | `String` |
| `sampleCount` | `Int` |
| `computedAt` | `Date` |
| `stabilityScore` | `Float` |

## HaloDataEvent

```swift
public enum HaloDataEvent: Sendable
```

| Case | Description |
| --- | --- |
| `.feedback(accepted:conversationID:)` | User feedback for a response. |
| `.correction(original:corrected:conversationID:)` | User correction for a response. |
| `.sessionCompleted(turnCount:conversationID:)` | Completed conversation session. |
