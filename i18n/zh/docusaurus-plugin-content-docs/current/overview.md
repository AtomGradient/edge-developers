---
sidebar_position: 1
slug: /
title: 总览
---

# AtomGradient Edge

面向 Apple Silicon 的端侧 AI。无云端。无延迟。完全隐私。

:::info 开发者预览
所有 Edge 产品目前都处于**开发者预览**阶段。API、包名和设置步骤可能会在版本之间变化。
:::

## 你可以构建什么

| 能力 | 描述 | 开始使用 |
|------------|-------------|-------------|
| **文本生成** | 从端侧 LLM 流式生成文本。支持多轮对话、LoRA 适配器和自动内存管理。 | [指南](/docs/capabilities/text-generation) |
| **视觉理解** | 将图像和文本发送给视觉语言模型。支持照片理解和多轮追问。 | [指南](/docs/capabilities/vision) |
| **语音转文字** | 在设备上转写音频。支持文件输入或流式麦克风输入。 | [指南](/docs/capabilities/speech-to-text) |
| **文字转语音** | 从文本生成语音音频。支持多说话人和流式输出。 | [指南](/docs/capabilities/text-to-speech) |
| **模型进化** | 随用户成长的模型。支持画像分析、适配器生命周期和实时调控。 | [指南](/docs/capabilities/model-evolution) |
| **设备网格** | 在用户的 Apple 设备之间路由推理。私有本地网络，零配置。 | [指南](/docs/capabilities/device-mesh) |

## 快速开始

```swift
import EdgeKit

let engine = LLMEngine()
try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(
    messages: [.user("What is edge AI?")]
) {
    print(chunk.text, terminator: "")
}
```

五行 Swift。端侧运行。私有。快速。

[安装并运行你的第一个模型](/docs/get-started/quickstart)

## 组件如何协同

```text
+-------------------------------------------------+
|                  Your App                        |
+----------------+---------------+-----------------+
|  Edge Kit      |  Edge Halo    |  Edge Mesh      |
|  (inference)   |  (evolution)  |  (multi-device) |
+----------------+---------------+-----------------+
|              Edge Engine (runtime)               |
+-------------------------------------------------+

Edge Studio (optimize models) --> Edge Scaffold (ship apps)
```

## 工具

| 工具 | 功能 | 了解更多 |
|------|-------------|------------|
| **Edge Studio** | 优化、基准测试和导出模型。提供包含 20 多个分析与优化工具的 Web UI。 | [总览](/docs/edge-studio/overview) |
| **Edge Scaffold** | 从优化后的模型生成可发布的 iOS 应用。只需一个配置文件。 | [总览](/docs/deployment/app-scaffold) |

## 示例

常见用例的完整可运行代码：

| 示例 | 展示内容 |
|---------|--------------|
| [基础聊天应用](/docs/examples/basic-chat) | 在 SwiftUI 中加载模型并流式运行对话。 |
| [视觉聊天](/docs/examples/vision-chat) | 使用照片选择器进行图像理解。 |
| [语音助手](/docs/examples/voice-assistant) | 全双工流程：说话、转写、思考、朗读。 |
| [个性化模型](/docs/examples/personalized-model) | 训练适配器、应用适配器并回滚。 |
| [构建并发布](/docs/examples/build-and-ship) | 从优化模型到提交 App Store。 |
