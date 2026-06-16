---
sidebar_position: 7
title: EdgeSession
---

# EdgeSession API reference

`EdgeSession` contains SDK-owned conversation orchestration helpers. It keeps chat history, mode transitions, cancellation, timeout handling, optional tool loops, and memory-policy compaction out of product-specific app code.

> **Developer Preview boundary**
>
> `EdgeSession` does not own model loading, product prompts, tool implementations, or business data. Apps provide an `EdgeGenerationClient` that bridges to their loaded `LLMEngine` or `VLMEngine`.

## ChatSessionController

```swift
@MainActor
public final class ChatSessionController: ObservableObject
```

Stateful controller for multi-turn chat.

| Property or method | Description |
| --- | --- |
| `history` | Current compacted `ChatMessage` history. |
| `isGenerating` | Whether a turn is active. |
| `lastMetrics` | Inference metrics reported by the generation client. |
| `lastEvent` | Last session event, including reset reason and compaction audit when available. |
| `init(client:maxHistoryMessages:historyCharacterBudget:)` | Creates a session around an app-provided generation client. |
| `runTurn(userText:systemPrompt:mode:images:tools:onToolCall:parameters:memoryPolicy:timeoutSeconds:watchdogConfiguration:onChunk:)` | Appends a user turn, prepares history, generates output, and streams chunks. |
| `generatePrepared(messages:mode:images:tools:onToolCall:parameters:memoryPolicy:timeoutSeconds:watchdogConfiguration:onChunk:)` | Runs generation for an already prepared message list. |
| `replaceHistory(_:mode:)` | Replaces history using the compactor budget. |
| `reset(systemPrompt:reason:)` | Clears session state and asks the client to reset runtime state. |
| `cancel(reason:)` | Cancels local session generation and asks the client to reset runtime state. |

## EdgeGenerationClient

```swift
@MainActor
public protocol EdgeGenerationClient: AnyObject
```

Protocol boundary between `EdgeSession` and the app-owned inference runtime.

| Requirement | Description |
| --- | --- |
| `currentInferenceMetrics` | Optional metrics from the current loaded engine. |
| `generate(messages:ciImages:tools:onToolCall:parameters:onChunk:)` | Runs one generation through the app-owned engine. |
| `resetRuntime(reason:)` | Releases or resets runtime state after cancellation, mode changes, or explicit reset. |

## ChatSessionController.Mode

| Case | Description |
| --- | --- |
| `.plain` | Text-only turn. |
| `.image` | Vision turn with `CIImage` inputs. |
| `.tool` | Tool-capable turn. |
| `.isolated(String)` | Explicit isolation mode for app-defined boundaries. |

## ChatSessionMemoryPolicy

```swift
public struct ChatSessionMemoryPolicy: Sendable
```

Applies the compaction portion of an `EdgeInference` memory-policy plan to a chat session. It intentionally does not activate recall, mesh, or quality-loop behavior.

| API | Description |
| --- | --- |
| `init(plan:estimatedCharactersPerToken:minimumCharacterBudget:)` | Creates a compaction policy from `MemoryPolicyPlanner.Plan`. |
| `compactorConfig(base:)` | Tightens history compaction budget when the plan says to compact. |
| `compactionAudit(...)` | Produces a raw-free audit record describing the compaction decision. |

## ToolChatLoop

```swift
public enum ToolChatLoop
```

Utility for bounded tool orchestration inside a session. Apps still own tool schemas, permission policy, and tool execution.

| Type | Description |
| --- | --- |
| `Request` | Messages, mode, allowed tool names, planned calls, limits, and timeout settings. |
| `Hooks` | App-provided execution and observation callbacks. |
| `PlannedToolCall` | App-planned tool call from an app-owned planner. |
| `ToolResult` | Tool result text and source metadata. |

## Storage types

| Type | Description |
| --- | --- |
| `EdgeConversationRole` | Codable role mirror for persisted messages. |
| `EdgeConversationMessage` | SDK-owned persisted message shape without UI payloads. |
| `EdgeConversation` | SDK-owned conversation metadata. |
| `ConversationStore` | Local conversation persistence helper. |

## Safety boundaries

- Do not put product prompts, business rules, or app data schemas into `EdgeSession`.
- Keep tool execution in the app layer and pass only generic tool specs/results through the session boundary.
- Treat memory-policy audit fields as diagnostics, not evidence that answer quality improved.
