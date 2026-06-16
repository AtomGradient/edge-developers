---
sidebar_position: 5
title: 构建并发布 iOS App
---

# 示例：构建并发布 iOS app

本 walkthrough 将一个模型从 Edge Studio 带到由 Edge Scaffold 生成并签名的 iOS app。

## 本示例构建什么

你将创建一个私有端侧聊天 app，包含：

- 在 Edge Studio 中优化的模型。
- 由 Edge Scaffold 生成的 SwiftUI App。
- 一个用于 app 名称、模型类别和 prompt 的配置文件。
- 在真实 iPhone 或 iPad 上测试过的 Release 构建。

## 1. 优化模型

打开 Edge Studio 并加载源模型。

对于第一个 app，请使用简单模式：

1. 选择目标设备类别。
2. 选择模型类别。
3. 运行推荐优化。
4. 在目标设备画像上验证短 prompt。

当你需要自定义 benchmark matrix、多个导出目标，或手动比较模型变体时，使用 Pro pipeline。

## 2. 导出 Edge Scaffold app

在 Edge Studio 中选择 **Export**，然后选择 **Edge Scaffold app**。

需要检查的导出设置：

| 设置 | 建议 |
| --- | --- |
| App name | 使用你希望在 Xcode 中看到的产品名称。 |
| Model category | 与导出的模型匹配：LLM、VLM、TTS 或 STT。 |
| Model delivery | 小模型使用 bundle；较大模型使用 remote 或 on-demand delivery。 |
| Minimum OS | 与你验证过的设备匹配。 |

Edge Studio 会写入一个 ZIP，其中包含 Edge Kit 所需的 app 模板、配置和模型 元数据。

## 3. 在 Xcode 中打开

解压导出文件，并在 Xcode 中打开生成的项目。

运行前：

1. 选择你的 开发者团队。
2. 设置唯一 bundle identifier。
3. 选择真实设备作为 run destination。
4. 确认 deployment target 是 iOS 17 或更高。

使用 Release 构建 进行性能验证。Debug build 适合编辑 UI，但不代表最终加载时间或吞吐。

## 4. 配置 ScaffoldConfig.swift

`ScaffoldConfig.swift` 控制生成 App 的行为。

```swift
import EdgeInference

enum ScaffoldConfig {
    static let appName = "Pocket Research"
    static let appDescription = "A private on-device research assistant."
    static let defaultSystemPrompt = """
    You are a concise research assistant. Answer with citations when context is provided.
    """

    static let modelCategory: ModelCategory = .llm
    static let modelID = "qwen3.5-9b-4bit"
    static let modelDisplayName = "Qwen3.5 9B 4bit"
    static let modelSizeGB: Double = 5.4

    // Use this when the model is included in the App bundle.
    static let bundleModelName: String? = "Qwen3.5-9B-4bit"

    // Used only by TTS apps.
    static let defaultTTSSpeaker: String? = nil
}
```

### ScaffoldConfig 参考

| 字段 | 控制内容 |
| --- | --- |
| `appName` | app UI 中使用的显示名称。 |
| `appDescription` | 简短 onboarding 和设置描述。 |
| `defaultSystemPrompt` | 聊天类 App 的初始 system instruction。 |
| `modelCategory` | App 使用哪条 UI 和 engine 路径。 |
| `modelID` | 用于日志、缓存 key 和设置的稳定标识符。 |
| `modelDisplayName` | 人类可读的模型名称。 |
| `modelSizeGB` | 设备检查中显示的近似大小。 |
| `bundleModelName` | 将模型随 app 发布时的 bundle 文件夹名称。 |
| `defaultTTSSpeaker` | TTS 模型的可选默认说话人。 |

## 5. 配置权限和 entitlements

对于较大模型，请在 iOS target 上启用 Increased Memory Limit entitlement。

为 app 暴露的能力添加 usage string：

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app records your voice for private on-device transcription.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>This app lets you choose photos for private on-device analysis.</string>

<key>NSLocalNetworkUsageDescription</key>
<string>This app discovers your nearby devices for private on-device AI.</string>
```

只包含已发布 App 实际使用的权限。

## 6. 在设备上测试

Archive 前运行此检查清单：

| 区域 | 验证内容 |
| --- | --- |
| First launch | App 打开，模型设置出现，没有缺失文件。 |
| Model load | 在最低支持设备上冷加载成功。 |
| Generation | 第一条回复流式输出并完成。 |
| Long session | 多轮使用保持响应。 |
| Backgrounding | app 处理后台和前台切换。 |
| Storage | 模型缓存和用户数据可以清理。 |
| Permissions | 只出现必需的权限提示。 |

对于 VLM、TTS、STT 或 mesh app，在提交前请在设备上端到端运行对应功能路径。

## 7. Archive 并提交

在 Xcode 中：

1. 选择 **Any iOS Device** 或你的 distribution destination。
2. 选择 **Product > Archive**。
3. 打开 Organizer。
4. 验证 archive。
5. 上传到 App Store Connect。

在 App Store Connect 中，确保 privacy nutrition labels 与 app 实际行为一致。如果 app 将所有 prompt、音频、图像和模型数据都留在设备上，请在 review notes 和用户可见文案中明确说明。

## 部署检查清单

- App name、icon、bundle ID 和 signing team 已最终确定。
- 需要时已启用 Increased Memory Limit entitlement。
- 模型交付策略已测试：bundled、on-demand 或 remote download。
- 首次启动不依赖 developer-only 路径。
- 已使用 Release 构建 在最低支持设备上测试。
- 设置中包含清理本地模型和个性化数据的方法。
- App Store 隐私回答与已发布 App 行为一致。

## 下一步

- 查看 [Edge Scaffold 配置](/docs/optimize-and-ship/scaffold)。
- 查看 [平台要求](/docs/guides/platform-requirements)。
