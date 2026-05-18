---
sidebar_position: 6
title: EdgeData
---

# EdgeData API reference

`EdgeData` provides local data collection and classification primitives for Edge apps.

It is supporting infrastructure. Keep app-specific business rules in the app.

## Edge

```swift
public enum Edge
```

Static API for local data operations.

| Method | Description |
| --- | --- |
| `bootstrap(dbQueue:trainingDataSink:)` | Initializes EdgeData with a local GRDB queue and optional training sink. |
| `registerSchema(_:)` | Registers an app data shape at launch. |
| `schema(_:)` | Looks up a registered data shape. |
| `registeredSchemaNames()` | Lists registered names. |
| `recordRaw(fact:customFactId:)` | Records unclassified local data. |
| `record(fact:)` | Records already-classified local data. |
| `recordEvent(...)` | Records an AI interaction event. |
| `countFeedbackEvents(namespace:)` | Counts events with feedback. |
| `queryFacts(namespace:schema:status:limit:)` | Queries local facts. |
| `countFacts(namespace:schema:status:)` | Counts local facts. |
| `correctClassification(...)` | Applies a user correction to a classification. |
| `onClassified(_:)` | Registers a callback for successful classification. |
| `onClassificationFailed(_:)` | Registers a callback for failed classification. |
| `fetchFact(id:)` | Fetches one fact by ID. |
| `reclassifyAsync(...)` | Requests reclassification. |

## Core types

| Type | Description |
| --- | --- |
| `Sensitivity` | `.localOnly`, `.meshOk`, `.trainingOk`. |
| `FactStatus` | Local classification lifecycle state. |
| `FieldType` | Supported field kinds for app data shapes. |
| `FieldDef` | Field declaration. |
| `SemanticLabels` | Labels for primary timestamp, value, and entity fields. |
| `SchemaDef` | App data shape declaration. |
| `RawFact` | Raw local payload waiting for classification. |
| `Fact` | Classified local payload. |
| `QueryStatus` | Query filter for classified, pending, failed, or all facts. |

## ClassificationDaemon

```swift
public actor ClassificationDaemon
```

Background classifier for raw local data.

| API | Description |
| --- | --- |
| `ClassificationDaemon.shared` | Shared daemon. |
| `start(namespace:candidateSchemas:llmClient:toolNames:promptBuilder:)` | Starts classification for a namespace. |
| `stop()` | Stops the daemon. |
| `wake()` | Wakes the daemon from idle sleep. |

## EdgeClassificationLLMClient

```swift
public protocol EdgeClassificationLLMClient: Sendable
```

The app implements this protocol to provide local LLM classification.

| Requirement | Description |
| --- | --- |
| `isBusy` | Whether the local LLM is busy with user-facing work. |
| `generate(messages:)` | Generates a classification response. |
| `generate(messages:toolNames:)` | Optional tool-aware generation path. |

## ClassificationParser

```swift
public enum ClassificationParser
```

Parses local LLM classification output.

| Method | Description |
| --- | --- |
| `parse(llmOutput:candidateSchemas:)` | Parses and validates a classification response. |
| `stripMarkdownCodeFence(_:)` | Removes a Markdown code fence wrapper. |
| `extractJSONObject(_:)` | Extracts the first JSON object from text. |

## Privacy guidance

Use `Sensitivity` to keep local-only data local. Do not include raw user correction text in logs, analytics, or collaboration messages.
