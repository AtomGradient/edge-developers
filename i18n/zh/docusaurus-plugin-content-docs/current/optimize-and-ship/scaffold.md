---
sidebar_position: 4
title: Edge Scaffold
---

# Edge Scaffold

Edge Scaffold 会从优化后的模型生成可直接构建的 app 项目。一个配置文件、自动设备检测、四层模型分发。当前生成 iOS app，更多平台在规划中。

:::info Developer Preview
生成的 app 在发布前仍需要签名、真机测试和商店审核。
:::

## 工作方式

```text
Edge Studio (export) → Edge Scaffold (template + config) → Xcode project → App
```

Edge Studio 会写出一个 ZIP，其中包含 app 模板、模型 metadata 和配置。你解压、配置、构建，然后发布。

## ScaffoldConfig.swift

所有 app 行为都由一个文件控制：

```swift
enum ScaffoldConfig {
    static let appName = "MyApp"
    static let appDescription = "A private on-device assistant."
    static let defaultSystemPrompt = "You are a concise assistant."
    static let modelCategory: ModelCategory = .llm  // .llm | .vlm | .tts
    static let bundleModelName: String? = "Qwen3.5-0.8B"
    static let defaultTTSSpeaker: String? = nil
}
```

| 字段 | 控制内容 |
|-------|---------|
| `appName` | app UI 中显示的名称 |
| `modelCategory` | app 使用的 engine 和 UI 路径 |
| `bundleModelName` | 模型随 app 内置时的 bundle 文件夹名 |
| `defaultSystemPrompt` | 聊天初始 system instruction |

App UI 会根据 `modelCategory` 自动适配：

| 类别 | 输入 | 输出 |
|----------|-------|--------|
| LLM | 文本 | 流式文本 |
| VLM | 文本 + 照片 | 流式文本 |
| TTS | 文本 | 音频 |

## 构建和测试

1. 解压导出结果，在 Xcode 中打开。
2. 选择开发团队和唯一 bundle identifier。
3. 将运行 destination 设置为**真实设备**，不要用模拟器。
4. 用 **Release** 构建做性能验证。
5. 测试：首次启动、模型加载、首次响应、多轮对话、后台切换。

对大于约 2B 参数的模型，启用 **Increased Memory Limit** entitlement。

## 模型分发

| 层级 | 使用时机 |
|------|-------------|
| **Bundle** | 小模型（< 2GB）。随 app binary 一起发布。 |
| **On-Demand Resources** | 中等模型。安装后下载，由 OS 管理。 |
| **HuggingFace** | 大模型。首次启动时从 HuggingFace 下载。 |
| **Cache** | 之前已下载的模型。后续启动最快路径。 |

## 下一步

- [构建并发布示例](/docs/examples/build-and-ship) — 从优化到 App Store 的端到端 walkthrough。
- [平台要求](/docs/guides/platform-requirements) — 设备和 OS 约束。
