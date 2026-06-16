---
sidebar_position: 7
title: EdgeSession
---

# EdgeSession API 参考

`EdgeSession` 提供 SDK owned 的对话编排 helper。它把 chat history、mode 切换、取消、超时、可选工具循环和 memory-policy compaction 从产品业务代码中拆出来。

:::info Developer Preview 边界
`EdgeSession` 不负责模型加载、产品 prompt、工具实现或业务数据。App 需要提供 `EdgeGenerationClient`，桥接到自己已经加载好的 `LLMEngine` 或 `VLMEngine`。
:::

## ChatSessionController

```swift
@MainActor
public final class ChatSessionController: ObservableObject
```

用于多轮对话的有状态 controller。

| 属性或方法 | 说明 |
| --- | --- |
| `history` | 当前 compacted `ChatMessage` history。 |
| `isGenerating` | 当前是否有活跃 turn。 |
| `lastMetrics` | generation client 报告的 inference metrics。 |
| `lastEvent` | 最近的 session event，包括 reset reason 和可用时的 compaction audit。 |
| `init(client:maxHistoryMessages:historyCharacterBudget:)` | 基于 app-provided generation client 创建 session。 |
| `runTurn(userText:systemPrompt:mode:images:tools:onToolCall:parameters:memoryPolicy:timeoutSeconds:watchdogConfiguration:onChunk:)` | 追加用户 turn、准备 history、生成输出并流式回调 chunk。 |
| `generatePrepared(messages:mode:images:tools:onToolCall:parameters:memoryPolicy:timeoutSeconds:watchdogConfiguration:onChunk:)` | 对已准备好的 message list 运行生成。 |
| `replaceHistory(_:mode:)` | 使用 compactor budget 替换 history。 |
| `reset(systemPrompt:reason:)` | 清空 session state，并要求 client reset runtime state。 |
| `cancel(reason:)` | 取消本地 session generation，并要求 client reset runtime state。 |

## EdgeGenerationClient

```swift
@MainActor
public protocol EdgeGenerationClient: AnyObject
```

`EdgeSession` 与 app-owned inference runtime 之间的协议边界。

| Requirement | 说明 |
| --- | --- |
| `currentInferenceMetrics` | 当前已加载 engine 的可选 metrics。 |
| `generate(messages:ciImages:tools:onToolCall:parameters:onChunk:)` | 通过 app-owned engine 运行一次生成。 |
| `resetRuntime(reason:)` | 在取消、mode 变化或显式 reset 后释放或重置 runtime state。 |

## ChatSessionController.Mode

| Case | 说明 |
| --- | --- |
| `.plain` | 纯文本 turn。 |
| `.image` | 带 `CIImage` 输入的视觉 turn。 |
| `.tool` | 可使用工具的 turn。 |
| `.isolated(String)` | 用于 app-defined boundary 的显式隔离模式。 |

## ChatSessionMemoryPolicy

```swift
public struct ChatSessionMemoryPolicy: Sendable
```

把 `EdgeInference` memory-policy plan 中的 compaction 部分应用到 chat session。它刻意不激活 recall、mesh 或 quality-loop behavior。

| API | 说明 |
| --- | --- |
| `init(plan:estimatedCharactersPerToken:minimumCharacterBudget:)` | 从 `MemoryPolicyPlanner.Plan` 创建 compaction policy。 |
| `compactorConfig(base:)` | 当 plan 要求 compact 时收紧 history compaction budget。 |
| `compactionAudit(...)` | 产出 raw-free audit record，描述 compaction decision。 |

## ToolChatLoop

```swift
public enum ToolChatLoop
```

用于 session 内 bounded tool orchestration 的 utility。App 仍然拥有 tool schema、permission policy 和 tool execution。

| Type | 说明 |
| --- | --- |
| `Request` | Messages、mode、allowed tool names、planned calls、limits 和 timeout settings。 |
| `Hooks` | App-provided execution 和 observation callbacks。 |
| `PlannedToolCall` | 来自 app-owned planner 的 app-planned tool call。 |
| `ToolResult` | Tool result text 和 source metadata。 |

## Storage types

| Type | 说明 |
| --- | --- |
| `EdgeConversationRole` | 用于 persisted messages 的 Codable role mirror。 |
| `EdgeConversationMessage` | SDK-owned persisted message shape，不包含 UI payload。 |
| `EdgeConversation` | SDK-owned conversation metadata。 |
| `ConversationStore` | 本地 conversation persistence helper。 |

## 安全边界

- 不要把产品 prompt、业务规则或 app data schemas 放进 `EdgeSession`。
- Tool execution 留在 app 层，session boundary 只传 generic tool specs/results。
- Memory-policy audit 字段是 diagnostics，不是 answer quality improved 的证据。
