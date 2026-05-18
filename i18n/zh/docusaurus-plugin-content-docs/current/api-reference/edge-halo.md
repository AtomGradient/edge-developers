---
sidebar_position: 5
title: EdgeHalo
---

# EdgeHalo API 参考

`EdgeHalo` 管理用户画像、适配器和会话调控。

:::info 开发者预览
当前预览版中的部分画像分析 API 有意保持较低层级，后续可能变化。
:::

## EdgeHalo

```swift
public actor EdgeHalo
```

主入口点。

| 属性或方法 | 描述 |
| --- | --- |
| `init(engine:generator:dataStream:)` | 使用注入的 engine 和 generator provider 创建 `EdgeHalo` actor。 |
| `evolutionState` | 当前 `EvolutionState`。 |
| `currentProfile` | 最近的 `UserProfile`，如果可用。 |
| `activeAdapter` | 当前活跃的 `AdapterVersion`，如果有。 |
| `runProfileAnalysis(...)` | 运行本地画像分析并更新 `currentProfile`。 |
| `validateAdapter(_:)` | 为传入适配器返回 `AdapterDecision`。 |
| `applyAdapter(path:version:scale:)` | 通过 engine session 应用适配器。 |
| `rollback()` | 移除活跃适配器。 |
| `updateSteering(scales:)` | 从当前画像应用调控。 |

## HaloTextGenerator

```swift
public protocol HaloTextGenerator: Sendable
```

由 app 实现的文本生成 provider。

| 方法 | 描述 |
| --- | --- |
| `tokenize(_:)` | 将文本转换为 token ID。 |
| `generate(prompt:maxTokens:)` | 为标签和画像摘要生成文本。 |

## HaloEngineSession

```swift
public protocol HaloEngineSession: Sendable
```

Edge Halo 所需的 engine-session 操作。

| 方法 | 描述 |
| --- | --- |
| `injectLoRA(adapterPath:scale:)` | 将适配器加载到 engine session。 |
| `removeLoRA()` | 移除活跃适配器。 |
| `captureHiddenState(tokens:layer:)` | 捕获画像分析向量。 |
| `injectSteering(vectors:layers:scales:)` | 应用调控向量。 |
| `removeSteering()` | 移除调控向量。 |

## EvolutionState

```swift
public enum EvolutionState: Sendable, Equatable
```

| Case | 描述 |
| --- | --- |
| `.idle` | 没有活跃的进化任务。 |
| `.collecting(progress:)` | 正在收集数据，朝下一次训练触发推进。 |
| `.readyToTrain` | 已有足够数据可以请求训练。 |
| `.training` | 正在用户的 Mac 上训练。 |
| `.validating` | 正在验证新适配器。 |
| `.evolved(version:)` | 适配器处于活跃状态。 |

## AdapterVersion

```swift
public struct AdapterVersion: Sendable, Equatable, Codable
```

| 属性 | 类型 |
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

| Case | 描述 |
| --- | --- |
| `.apply` | 立即应用。 |
| `.validateFirst(rounds:)` | 应用前先运行本地验证。 |
| `.rejectIncompatible(reason:)` | 因基础模型不匹配而拒绝。 |
| `.rejectOutdated` | 因当前活跃适配器更新而拒绝。 |

## UserProfile

```swift
public struct UserProfile: Sendable
```

| 属性 | 类型 |
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

| Case | 描述 |
| --- | --- |
| `.feedback(accepted:conversationID:)` | 用户对响应的反馈。 |
| `.correction(original:corrected:conversationID:)` | 用户对响应的 correction。 |
| `.sessionCompleted(turnCount:conversationID:)` | 已完成的对话会话。 |
