---
sidebar_position: 1
title: 快速开始
---

# 开始使用

安装 Edge Kit，加载本地模型，并从端侧 LLM 流式输出 token。

:::info 开发者预览
Edge Kit 目前处于**开发者预览**阶段。请固定你测试过的包版本，并在每次升级后重新进行真机验证。
:::

## 要求

| 要求 | 版本 |
| --- | --- |
| iOS | 17.0 或更高 |
| macOS | 14.0 或更高 |
| Xcode | 15 或更高 |
| Swift | 5.9 或更高 |
| 硬件 | Apple Silicon |

对于运行较大模型的 iOS 应用，请在 app target 中启用 Increased Memory Limit entitlement。

## 使用 Swift Package Manager 安装

将 Edge Kit 添加到你的 package：

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc94")
]
```

开发者预览版本应使用 exact pin。升级到新的 `1.0.0-rcN` tag 前，请重新完成真机验证。

然后添加你需要的 product：

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeInference", package: "edge-kit")
    ]
)
```

如果需要 umbrella product，请使用 `EdgeKit`：

```swift
.product(name: "EdgeKit", package: "edge-kit")
```

## 运行你的第一个 LLM

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/qwen-model")

try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(
    messages: [.user("Write a one sentence definition of edge AI.")]
) {
    print(chunk.text, terminator: "")
}
```

## 从模型注册表加载

`ModelConfig` 包含受支持模型家族的预览模型条目。

```swift
import EdgeInference

let engine = LLMEngine()

guard let config = ModelConfig.find(modelID: "qwen3.5-0.8b") else {
    throw EdgeRuntimeError.modelNotFound("qwen3.5-0.8b")
}

try await engine.load(config: config) { progress in
    print("Download/load progress:", progress)
}
```

## 运行你的第一个 VLM

当模型接受图像和文本时，使用 `VLMEngine`。

```swift
import EdgeInference

let engine = VLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/vlm-model")
let imageURL = URL(fileURLWithPath: "/path/to/image.jpg")

try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(
    messages: [.user("Describe this image in one paragraph.")],
    images: [imageURL]
) {
    print(chunk.text, terminator: "")
}
```

在 iOS 上，将图像加载到内存后优先使用 `ciImages:` overload：

```swift
for try await chunk in engine.generate(
    messages: [.user("What is visible in this photo?")],
    ciImages: [ciImage]
) {
    print(chunk.text, terminator: "")
}
```

## 下一步

| 任务 | 指南 |
| --- | --- |
| 文本生成 | [LLM 指南](/docs/build/text-generation) |
| 视觉语言推理 | [VLM 指南](/docs/build/vision) |
| 模型缓存与下载 | [模型管理](/docs/guides/model-management) |
| iOS 内存指南 | [内存管理](/docs/guides/memory-management) |
| 平台支持 | [平台要求](/docs/guides/platform-requirements) |
