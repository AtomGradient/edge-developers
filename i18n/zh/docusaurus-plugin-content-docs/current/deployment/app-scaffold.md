---
sidebar_position: 1
title: 总览
---

# Edge Scaffold

Edge Scaffold 是面向 Edge Kit 模型的可发布 iOS app 模板。

:::info 开发者预览
Edge Scaffold 目前处于**开发者预览**阶段。生成的 app 仍然需要常规 iOS 签名、真机测试和 App Store 审核。
:::

## 包含什么

| 区域 | 包含内容 |
| --- | --- |
| App shell | SwiftUI app 结构和设置。 |
| Onboarding | 设备检查和模型设置流程。 |
| Chat UI | 流式文本界面。 |
| VLM UI | 面向视觉语言模型的照片选择器路径。 |
| TTS UI | 文本输入和音频播放路径。 |
| 模型加载 | 缓存、内置模型、On-Demand Resources 和 Hugging Face 路径。 |
| 推理 | 由 Edge Kit 提供支持。 |

## 流程

```text
Edge Studio optimize -> Edge Scaffold template + Edge Kit SDK -> App Store
```

## 配置

一个文件控制生成的 app：

```swift
enum ScaffoldConfig {
    static let appName = "My Edge App"
    static let appDescription = "Private on-device AI"
    static let defaultSystemPrompt = "You are a helpful assistant."
    static let modelCategory: ModelCategory = .llm
    static let bundleModelName: String? = "MyModel"
    static let defaultTTSSpeaker: String? = nil
}
```

## 模型类别

| 类别 | App 行为 |
| --- | --- |
| `.llm` | 文本聊天。 |
| `.vlm` | 文本加照片输入。 |
| `.tts` | 文本输入和音频输出。 |
| `.stt` | 启用时支持音频输入和转写。 |

## 下一步

- [配置 Edge Scaffold](/docs/deployment/scaffold-configuration)
- [构建并发布](/docs/deployment/building)
