---
sidebar_position: 5
title: 模型进化
---

# 使用 Edge Halo 做模型进化

Edge Halo 帮助你的 agent 构建并恢复本地个性化状态，而不把私有用户数据发送到服务器。

当你的 agent 需要以下能力时，可以使用它：

- 从 app-approved 数据得到本地用户画像。
- 生成可由兼容 base model 恢复的 Neural Imprint 产物。
- 在模型、tokenizer、runtime 或 工具 schema identity 变化时 失败即关闭。
- 提供清晰的用户可见生命周期：base model、learning、artifact ready、restored、incompatible 或 needs 重新生成eration。

Edge Halo 是开发者预览包。agent 仍然是组合点：它连接 Edge Kit 推理、Edge Halo 生命周期 API、本地存储、EdgeData、可选 EdgeMesh 传输和产品策略。

## 模型进化做什么

从开发者 API 角度，模型进化是在 base model 周围加一个私有生命周期：

1. 你的 agent 收集符合条件的本地事件和事实。
2. 你的 agent 从本地数据准备 profile inputs。
3. Edge Halo 使用 Edge Studio 导出或 Edge Scaffold 打包的资源运行 profile job。
4. Edge Studio 或你的本地 runtime 生成 Neural Imprint 产物。
5. Edge Halo 根据当前模型与 runtime 校验 artifact。
6. Runtime 恢复 artifact；如果不兼容则 失败即关闭，保持 base model active。

Base model 保持不变。个性化状态是本地、可审计、可删除的用户数据。

## 设置 Edge Halo

Edge Halo 不拥有你的推理 runtime。你的 agent 需要提供两个 bridge：

- `HaloTextGenerator`：profile workflow 需要的短文本本地生成。
- `HaloEngineSession`：模型会话操作，例如 profile capture 和 Neural Imprint restore。

这个页面记录 lifecycle contract，不是 standalone runnable bridge。Use the Edge Scaffold 运行时 bridge as the runnable reference. 可运行参考见 `edge-scaffold` 仓库中的 `EdgeScaffold/AI/ScaffoldHaloRuntimeAdapter.swift`。

Scaffold adapter 属于 app-layer code：

- `ScaffoldHaloRuntimeAdapter` 实现 `HaloTextGenerator` 和 `HaloEngineSession`。
- 它通过 chat 使用的已加载 `LLMEngine` 或 `VLMEngine` session 做 tokenize 和 generate。
- 它通过 `LLMEngine.captureHiddenStates(...)` 或 `VLMEngine.captureHiddenStates(...)` 捕获 profile activations。
- 它通过 `AIManager.restorePersonaKVCacheForHalo(from:)` 恢复兼容的 Neural Imprint 产物。

生产 agent 中，bridge 方法应调用同一个服务用户请求的已加载模型会话。这样推理、profile job 和 restore 行为都与用户实际使用的模型保持一致。

## 准备 profile inputs

你的 agent 拥有数据策略。Edge Halo 应只接收你的 agent 明确允许用于个性化的本地输入。

常见输入：

- 来自 `EdgeData` 的已分类本地 facts。
- 显式用户反馈。
- 用户 corrections。
- App-owned records 转换成你的集成所使用的 profile input shape。

原始用户文本应留在 app 存储中。不要把 transcript 或 correction 复制到 analytics、日志、crash report 或 support bundle。

## 运行 profile job

Preview profile API 接收 prepared examples，以及由 Edge Studio 导出或 Edge Scaffold 打包的 model-matched profile resources。

生产 agent 中：

1. 从 app storage 或 EdgeData 查询本地 facts。
2. 转换成你的集成使用的 profile input shape。
3. 加载为 exact base model 导出的 profile resources。
4. 运行 Edge Halo profile job。
5. 读取 `await halo.currentProfile`。

当前低层参数请参考 Edge Scaffold 的具体实现。Profile result 属于本地用户数据：只在产品合适的层级展示，并提供 reset 路径。

## 恢复 Neural Imprint capsule

恢复 artifact 前，先根据已加载 runtime 做兼容性校验。如果任意 requirement 不匹配，保持 base model active。

```swift
let result = await halo.validateCapsule(
    capsule.manifest,
    currentRequirements: currentRequirements
)

guard result.isCompatible else {
    // Show a recovery action: 重新生成erate, re-export, or load the matching model.
    return
}

try await halo.activateCapsule(
    capsule,
    currentRequirements: currentRequirements
)
```

恢复后，chat 仍然走同一条 Edge Kit generation path。不要在请求时把 profile text 重新拼进 system prompt。

## 生命周期状态

使用 `evolutionState` 和 `haloState` 驱动设置页 UI 和恢复动作。

| 状态 | agent 应做什么 |
| --- | --- |
| `.idle` | Base model active。用户允许时可收集本地数据。 |
| `.collecting(progress:)` | 展示距离 profile refresh 或 artifact 重新生成eration 的进度。 |
| `.readyToBuildCapsule` | 提供用户可见的 build/receive artifact 动作。 |
| `.buildingCapsule` | 本地 artifact 准备中，展示进度。 |
| `.validating(capsuleID:)` | 正在运行兼容性闸门。 |
| `.evolved(capsuleID:)` | 显示 active personalized state，并提供 reset 控件。 |

`haloState` 还提供 capsule 级恢复状态，例如 `.active(capsuleID:)`、
`.incompatible(capsuleID:reason:)` 和 `.failed(reason:)`。只要校验失败，就保持
base model active。

## 推荐 agent 流程

1. 用 Edge Kit 加载 base model。
2. 注册 app 工具 和本地数据 surface。
3. 收集符合条件的本地 facts 与 corrections。
4. 从 Settings 或用户允许的后台流程运行 profile learning。
5. 生成或接收 Neural Imprint 产物。
6. 校验并恢复 artifact。
7. 提供 base-vs-personalized smoke test 和 reset 按钮。

参考实现见 [Edge Scaffold](/docs/optimize-and-ship/scaffold)。

## 隐私 checklist

- Profile inputs 留在本地。
- Neural Imprint 产物 作为可删除用户数据存储。
- EdgeMesh 只用于受信任的用户自有设备。
- 诊断日志记录 hash、schema version 和 状态回执，不记录原始用户内容。
- 兼容性不匹配时 失败即关闭。

## API 概览

| 方法或类型 | 作用 |
| --- | --- |
| `EdgeHalo(engine:generator:dataStream:)` | 使用 App 提供 bridges 创建 lifecycle actor。 |
| `runProfileAnalysis(...)` | 从 prepared inputs 和导出资源运行本地 profile job。 |
| `currentProfile` | 最近一次本地 profile result。 |
| `validateCapsule(_:currentRequirements:)` | 检查 Neural Imprint capsule 是否匹配已加载 runtime。 |
| `activateCapsule(_:currentRequirements:)` | 将兼容 capsule 恢复进当前模型会话。 |
| `evolutionState` | 面向 UI 的高层生命周期状态。 |
| `haloState` | Capsule validation 和 restore 状态。 |
| `HaloCapsuleRequirements` | 用于 失败即关闭 compatibility 的 runtime identity。 |

完整签名见 [EdgeHalo API Reference](/docs/api-reference/edge-halo)。

## 下一步

- [个性化模型示例](/docs/examples/personalized-model) — 最小设置页流程。
- [设备 Mesh](/docs/build/device-mesh) — 在受信任的用户自有设备之间传输 artifacts。
- [架构](/docs/guides/architecture) — 产品边界与数据归属。
- [Neural Imprint vs LoRA](/docs/guides/neural-imprint-vs-lora) — 与 weight adaptation 和 prompt stuffing 的部署取舍。
