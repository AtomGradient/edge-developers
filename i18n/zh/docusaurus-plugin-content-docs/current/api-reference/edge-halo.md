---
sidebar_position: 5
title: EdgeHalo
---

# EdgeHalo API 参考

`EdgeHalo` 模块管理本地个性化生命周期：profile jobs、Neural Imprint capsule compatibility 和 restore orchestration。

:::info 开发者预览
Edge Halo 通过公开的 `edge-halo-binary` Swift package 分发给 app。源码仓库保持私有；二进制包暴露文档化 API，不暴露实现。
:::

## 安装

```swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-halo-binary", exact: "1.0.0-rc26")
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

然后导入模块：

```swift
import EdgeHalo
```

## EdgeHaloRuntime

```swift
public actor EdgeHaloRuntime
```

主入口。

| 属性或方法 | 说明 |
| --- | --- |
| `init(engine:generator:dataStream:)` | 使用 App 提供的运行时 bridges 创建 `EdgeHaloRuntime` actor。 |
| `evolutionState` | 面向产品 UI 的高层模型进化状态。 |
| `currentProfile` | 最近一次本地 profile result。 |
| `haloState` | Capsule validation 和 restore 状态。 |
| `activeCapsule` | 已恢复兼容 Neural Imprint 时的 active `HaloCapsule`。 |
| `runProfileAnalysis(...)` | 从 prepared inputs 和导出资源运行本地 profile job。 |
| `validateCapsule(_:currentRequirements:)` | 检查 capsule 是否能恢复到当前 runtime。 |
| `activateCapsule(_:currentRequirements:)` | 恢复兼容 capsule；不匹配时 失败即关闭。 |

## HaloTextGenerator

```swift
public protocol HaloTextGenerator: Sendable
```

由 agent 实现的文本生成 provider。

| 方法 | 说明 |
| --- | --- |
| `tokenize(_:)` | 使用匹配已加载模型的 tokenizer 将文本转为 token IDs。 |
| `generate(prompt:maxTokens:)` | 运行 profile workflow 需要的短文本本地生成。 |

## HaloEngineSession

```swift
public protocol HaloEngineSession: Sendable
```

由 agent 实现的 运行时 bridge。Edge Halo 不直接 import Edge Kit；app 负责把两个包接起来。

| 方法 | 说明 |
| --- | --- |
| `captureHiddenState(tokens:layer:)` | 捕获 profile workflow 需要的模型状态。 |
| `captureFullCache(tokenIds:)` | 在支持时捕获本地 Neural Imprint prefix artifact。 |
| `restoreFullCache(_:artifactURL:)` | 恢复兼容的 Neural Imprint 产物。 |

当前预览版 protocol 还包含高级可选 运行时 hooks。多数 agent 可以保持不支持，除非 release notes 或 scaffold 集成明确需要。

## EvolutionState

```swift
public enum EvolutionState: Sendable, Equatable
```

| Case | 说明 |
| --- | --- |
| `.idle` | 没有活动中的 evolution task。 |
| `.collecting(progress:)` | 正在收集本地数据，等待 profile refresh。 |
| `.readyToBuildCapsule` | 已有足够数据，可以 build 或 receive 新 artifact。 |
| `.buildingCapsule` | 本地 产物正在准备。 |
| `.validating(capsuleID:)` | Capsule 恢复前正在校验。 |
| `.evolved(capsuleID:)` | 兼容 capsule 已 active。 |

## HaloState

```swift
public enum HaloState: Sendable, Equatable
```

面向设置页和诊断的 capsule-level 状态。

| Case | 说明 |
| --- | --- |
| `.idle` | 没有 capsule 状态。 |
| `.collecting(factsCount:threshold:)` | 个性化运行前还需要更多本地数据。 |
| `.profiling` | Profile inputs 正在准备。 |
| `.buildingCapsule` | Neural Imprint 产物正在准备。 |
| `.validating(capsuleID:)` | 正在运行兼容性闸门。 |
| `.active(capsuleID:)` | 兼容 capsule 已恢复。 |
| `.incompatible(capsuleID:reason:)` | Restore 被拒绝。保持 base model active。 |
| `.failed(reason:)` | 生命周期失败。展示恢复动作。 |

## HaloCapsule

```swift
public struct HaloCapsule: Sendable, Equatable, Codable
```

Neural Imprint capsule manifest 和可选本地 产物 URL 的容器。

| 属性 | 类型 |
| --- | --- |
| `manifest` | `HaloCapsuleManifest` |
| `artifactURL` | `URL?` |

## HaloCapsuleManifest

```swift
public struct HaloCapsuleManifest: Sendable, Equatable, Codable
```

用于校验和描述 capsule 的 元数据。

| 属性 | 说明 |
| --- | --- |
| `capsuleID` | Capsule 的稳定 ID。 |
| `createdAt` | 创建时间。 |
| `baseModelID` | Capsule 目标 base model。 |
| `requirements` | 恢复所需 runtime identity。 |
| `cacheSnapshot` | Artifact snapshot 元数据。 |
| `artifactSHA256` | 本地 产物字节哈希，如可用。 |

## HaloCapsuleRequirements

```swift
public struct HaloCapsuleRequirements: Sendable, Equatable, Codable
```

用于 失败即关闭 restore check 的 runtime identity。

| 属性 | 说明 |
| --- | --- |
| `modelFamily`, `hiddenSize`, `layerCount` | Model-shape identity。 |
| `modelConfigSHA256`, `modelWeightsFingerprint` | Model config 和 weights identity。 |
| `tokenizerJSONSHA256`, `tokenizerConfigSHA256` | Tokenizer identity。 |
| `chatTemplateSHA256` | Chat-template identity。 |
| `toolSchemaSHA256` | Tool schema identity。 |
| `profileBodySHA256` | Profile source identity，不暴露 profile text。 |
| `cacheBackend`, `cacheBackendVersion`, `cacheTopologySHA256` | Runtime cache identity。 |

用法：

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

Preview profile workflow 产出的本地 profile summary。

| 属性 | 类型 |
| --- | --- |
| `directionNames` | `[String]` |
| `narrative` | `String` |
| `sampleCount` | `Int` |
| `computedAt` | `Date` |
| `stabilityScore` | `Float` |

Numeric fields 属于 runtime data。产品 UI 通常展示 narrative、freshness、sample count 和 reset 控件，而不是 raw vectors。

## HaloDataEvent

```swift
public enum HaloDataEvent: Sendable
```

用于 lifecycle decisions 的可选事件流。

| Case | 说明 |
| --- | --- |
| `.feedback(accepted:conversationID:)` | 用户对回复的反馈。 |
| `.correction(original:corrected:conversationID:)` | 用户对回复的纠正。 |
| `.sessionCompleted(turnCount:conversationID:)` | 已完成的对话 session。 |
