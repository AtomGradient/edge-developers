---
sidebar_position: 5
title: 模型进化
---

# 模型进化

Edge Halo 让本地模型适应用户偏好，而无需把私有交互数据发送到服务器。

当你的 app 需要以下能力时，可以使用它：

- 随时间总结用户偏好的本地画像。
- 从用户自有数据训练的轻量适配器。
- 无需重新训练即可进行小幅行为调整的运行时调控。

Edge Halo 是开发者预览包。app 仍然是组合点：它连接 Edge Kit 推理、Edge Halo 进化、本地存储，以及可选的 Edge Mesh 传输。

## 模型进化做什么

模型进化围绕基础模型添加一个私有生命周期：

1. 收集 app 允许的交互事件。
2. 在设备上构建用户画像。
3. 在用户自有 Mac 上训练或接收一个小型适配器。
4. 验证、应用或回滚该适配器。
5. 为临时偏好变更应用会话级调控。

基础模型保持通用。画像、适配器和调控状态是让体验变得个性化的部分。

## 设置 Edge Halo

Edge Halo 不拥有你的推理运行时。你的 app 需要提供两个桥接：

- `HaloTextGenerator`：用于画像任务中的短文本本地生成。
- `HaloEngineSession`：用于适配器和调控操作。

```swift
import EdgeHalo
import Foundation

struct AppTextGenerator: HaloTextGenerator {
    func tokenize(_ text: String) async throws -> [Int] {
        // Use the tokenizer that matches your loaded model.
        Array(text.utf8.map(Int.init))
    }

    func generate(prompt: String, maxTokens: Int) async throws -> String {
        // In production, call your Edge Kit LLMEngine here.
        "Local summary for: \(prompt.prefix(80))"
    }
}

final class AppEngineSession: HaloEngineSession, @unchecked Sendable {
    func injectLoRA(adapterPath: String, scale: Float) throws {
        // Bridge to the loaded model session.
    }

    func removeLoRA() throws {
        // Remove the active adapter from the loaded model session.
    }

    func captureHiddenState(tokens: [Int], layer: Int) async throws -> [Float] {
        // Bridge to your model session's profile-capture path.
        Array(repeating: 0, count: 4096)
    }

    func injectSteering(vectors: [[Float]], layers: [Int], scales: [Float]) throws {
        // Apply the current profile to the loaded model session.
    }

    func removeSteering() throws {
        // Clear session-level steering.
    }
}

let halo = EdgeHalo(
    engine: AppEngineSession(),
    generator: AppTextGenerator()
)
```

在生产 app 中，桥接方法应调用服务用户请求的同一个已加载模型会话。这样可以让推理和进化与用户实际使用的模型保持一致。

## 用户画像分析

画像是对用户偏好行为相对默认模型行为差异的紧凑表示。它包含机器可读的方向和人类可读的标签，可用于设置、调试工具或验证 UI。

`UserProfile` 暴露：

| 属性 | 用途 |
| --- | --- |
| `directions` | 调控使用的数值画像方向。 |
| `directionNames` | 画像维度的短标签。 |
| `narrative` | 简短的自然语言摘要。 |
| `sampleCount` | 当前画像使用的示例数量。 |
| `stabilityScore` | 表示画像一致性的 `0` 到 `1` 分数。 |

从 app 自有的本地数据任务运行画像分析。将原始用户内容保存在 app 存储中，只传入预览 API 所需的已准备本地输入，并从 `currentProfile` 读取结果画像。

```swift
struct ProfileResources {
    let examples: [String]
    let preparedInputs: [PreparedProfileInput]
    let profileDirectionsURL: URL
    let modelID: String
}

func refreshProfile(
    halo: EdgeHalo,
    resources: ProfileResources
) async throws -> UserProfile? {
    try await halo.runProfileAnalysis(
        sentences: resources.examples,
        rawTransactions: resources.preparedInputs,
        directionsAURL: resources.profileDirectionsURL,
        modelID: resources.modelID,
        progress: { progress in
            print("Profile progress:", progress)
        }
    )

    return await halo.currentProfile
}
```

任务完成后，将画像用于产品 UI 和运行时调控。

```swift
if let profile = await halo.currentProfile {
    print(profile.narrative)
    print(profile.directionNames)
    print(profile.stabilityScore)
}
```

## 适配器生命周期

适配器是从本地用户数据训练得到的小型模型定制。常见流程是：

1. iPhone 或 iPad 收集已批准的交互事件。
2. 用户自有 Mac 从这些事件训练适配器。
3. 适配器通过本地网格传回。
4. app 在应用前验证适配器 offer。

使用 `AdapterVersion` 描述适配器，并使用 `AdapterDecision` 决定如何处理。

```swift
let offer = AdapterVersion(
    version: 3,
    hash: "sha256-adapter-file",
    baseModelID: "qwen3.5-0.8b",
    trainingDataHash: "sha256-training-data",
    trainedAt: Date()
)

switch await halo.validateAdapter(offer) {
case .apply:
    try await halo.applyAdapter(
        path: "/path/to/adapter",
        version: offer
    )

case .validateFirst(let rounds):
    let passed = try await runLocalValidation(rounds: rounds)
    if passed {
        try await halo.applyAdapter(
            path: "/path/to/adapter",
            version: offer
        )
    }

case .rejectIncompatible(let reason):
    print("Adapter rejected:", reason)

case .rejectOutdated:
    print("A newer adapter is already active.")
}
```

如果质量下降，或用户禁用个性化，请回滚到基础模型：

```swift
try await halo.rollback()
```

## 激活调控

调控可以在不生成新适配器的情况下调整当前会话中的模型行为。它适合用于语气、正式程度、领域焦点，或“在这次对话中更轻柔地遵循我的画像”等控制。

```swift
// Uses the current profile, if one is available.
try await halo.updateSteering(scales: [0.08, 0.04, 0.02])

// Generate with the same model session your app already uses.
let answer = try await generateAssistantReply()

// Clear steering when leaving the session or changing mode.
try engineSession.removeSteering()
```

保持调控保守，并让用户可见。它们应该像会话偏好，而不是永久模型变更。

## 进化状态机

使用 `evolutionState` 驱动 UI 和后台工作。

| 状态 | app 应做什么 |
| --- | --- |
| `.idle` | 正常使用。如果用户已选择加入，可以收集数据。 |
| `.collecting(progress:)` | 展示距离下一次本地训练机会的进度。 |
| `.readyToTrain` | 提供在用户自有 Mac 上训练的入口。 |
| `.training` | 显示训练状态，并保持基础模型可用。 |
| `.validating` | 在应用前评估传入的适配器。 |
| `.evolved(version:)` | 显示当前活跃适配器版本和回滚控件。 |

```swift
switch await halo.evolutionState {
case .idle:
    print("Base model active")
case .collecting(let progress):
    print("\(progress.collected) of \(progress.threshold) examples")
case .readyToTrain:
    print("Ready to train on this user's Mac")
case .training:
    print("Training in progress")
case .validating:
    print("Validating adapter")
case .evolved(let version):
    print("Adapter version \(version.version) active")
}
```

## 架构

Edge Halo 遵循 V 形组合模型：

```text
App
  |- Edge Kit for inference
  |- Edge Halo for evolution lifecycle
      \- shared engine runtime
```

app 拥有策略决策：哪些数据符合条件、何时训练、是否应用适配器、何时回滚，以及如何向用户解释个性化。

## 隐私

模型进化面向用户自有设备设计：

- 交互数据留在设备上。
- 训练在用户的 Mac 上运行。
- 启用时，适配器传输通过用户的本地网格完成。
- 用户可以禁用个性化并回滚到基础模型。

不要把原始 correction、转写内容或私有 prompt 复制到日志、分析、崩溃报告或支持包中。将本地画像 artifact 作为用户数据存储，并让用户能从 app 设置中移除它们。

## API 概览

| Method | 作用 |
|--------|-------------|
| `EdgeHalo(engine:generator:)` | 创建进化 actor。 |
| `runProfileAnalysis(...)` | 提取本地用户画像。 |
| `validateAdapter(_:)` | 检查传入的适配器 offer。 |
| `applyAdapter(path:version:)` | 将适配器应用到推理。 |
| `rollback()` | 回滚到基础模型。 |
| `updateSteering(scales:)` | 调整会话级行为。 |
| `evolutionState` | 当前生命周期状态。 |
| `currentProfile` | 最近的 `UserProfile`。 |

完整签名 → [EdgeHalo API Reference](/docs/api-reference/edge-halo)

## 下一步

- [个性化模型示例](/docs/examples/personalized-model) — 完整生命周期代码。
- [文本生成](/docs/build/text-generation) — 个性化之前的基础推理。
