---
sidebar_position: 9
title: EdgeDataMeshBridge
---

# EdgeDataMeshBridge API reference

`EdgeDataMeshBridge` is a small optional bridge target between `EdgeData` and `EdgeMesh`. It lets apps send generic EdgeData training events into an EdgeMesh `DataCollector` without making `EdgeMesh` depend on `EdgeData`.

:::info Developer Preview boundary
This module is generic glue only. App-specific event schemas, correction text, privacy policy, and business rules remain app-owned.
:::

## EdgeMeshTrainingSink

```swift
@available(iOS 17.0, macOS 14.0, *)
public final class EdgeMeshTrainingSink: EdgeTrainingDataSink
```

Training sink implementation backed by an `EdgeMesh` `DataCollector`.

| API | Description |
| --- | --- |
| `init(storeURL:)` | Creates an `EventStore` at the URL and wires a `DataCollector`. |
| `init(store:)` | Uses an app-provided `EventStore`. |
| `collectTrainingSample(appId:eventType:payload:tags:)` | Appends a generic training event to the mesh event store. |
| `eventStoreCount()` | Returns the current event count when available. |

## Usage shape

```swift
import EdgeData
import EdgeDataMeshBridge

let sink = try EdgeMeshTrainingSink()
try Edge.bootstrap(dbQueue: dbQueue, trainingDataSink: sink)
```

Only pass payloads that your app has already classified as eligible for the target sink. Respect `Sensitivity` and avoid raw correction text in logs, collaboration messages, or exported receipts.

## Safety boundaries

- Do not put app business fields or domain-specific interpretation into this bridge.
- Keep data retention, consent, and redaction policy in the app.
- Treat this bridge as local infrastructure; it is not cross-device sync by itself.
