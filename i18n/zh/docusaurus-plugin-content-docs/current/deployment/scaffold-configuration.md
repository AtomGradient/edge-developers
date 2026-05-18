---
sidebar_position: 2
title: 配置
---

# 配置

`ScaffoldConfig.swift` 是 Edge Scaffold app 的主配置文件。

## 必需设置

```swift
import EdgeInference

enum ScaffoldConfig {
    static let appName = "My Edge App"
    static let appDescription = "Runs a local model with Edge Kit"
    static let defaultSystemPrompt = "You are a helpful assistant."
    static let modelCategory: ModelCategory = .llm
    static let modelID = "qwen3.5-0.8b"
    static let modelDisplayName = "Qwen3.5 0.8B"
    static let modelSizeGB: Double = 1.6
    static let bundleModelName: String? = nil
    static let defaultTTSSpeaker: String? = nil
}
```

## 字段

| 字段 | 描述 |
| --- | --- |
| `appName` | app 使用的显示名称。 |
| `appDescription` | onboarding 和设置中使用的简短描述。 |
| `defaultSystemPrompt` | 聊天类模型的初始 system prompt。 |
| `modelCategory` | 选择 UI 和 engine 路径。 |
| `modelID` | 所选模型的稳定标识符。 |
| `modelDisplayName` | 人类可读的模型名称。 |
| `modelSizeGB` | 用于 UI 和设备检查的近似模型大小。 |
| `bundleModelName` | 当模型包含在 app 中时的 bundle 文件夹名称。 |
| `defaultTTSSpeaker` | TTS app 的可选默认说话人。 |

## 模型类别

| 类别 | 输入 | 输出 |
| --- | --- | --- |
| `.llm` | 文本 | 文本 |
| `.vlm` | 文本和照片 | 文本 |
| `.tts` | 文本 | 音频 |
| `.stt` | 音频 | 文本 |

app UI 会适配所选类别。

## 项目生成

Edge Scaffold 使用项目生成，使导出的 app 可以在 Xcode 中打开和构建。通常不需要手动编辑生成的项目文件。

## 更换模型

当你切换模型时：

1. 如果模型类型变化，更新 `modelCategory`。
2. 更新模型名称和大小字段。
3. 在真实设备上重新运行 app。
4. 验证首次启动和生成。
