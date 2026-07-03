---
sidebar_position: 4
title: Edge Scaffold
---

# Edge Scaffold

Edge Scaffold 会从优化后的模型生成可直接构建的参考 agent。它展示 Edge Kit、Edge Halo、EdgeMesh、EdgeData 和 Neural Imprint 的推荐 iOS 接入方式。

:::info 开发者预览
生成的 app 在发布前仍需要签名、真机测试和商店审核。
:::

## 工作方式

```text
Edge Studio (export) → Edge Scaffold (template + config) → Xcode project → App
```

Edge Studio 会写出一个 ZIP，其中包含 app 模板、模型 元数据、运行时配置和可选个性化资源。你解压、配置签名、构建、在真机测试，然后拥有生成出的 app 项目。

## ScaffoldConfig.swift

所有 app 行为都由一个文件控制：

```swift
enum ScaffoldConfig {
    static let appName = "MyApp"
    static let appDescription = "A private on-device assistant."
    static let defaultSystemPrompt = "You are a concise assistant."
    static let modelCategory: ModelCategory = .llm  // .llm | .vlm | .tts
    static let bundleModelName: String? = "Qwen3.5-9B-4bit"
    static let defaultTTSSpeaker: String? = nil
}
```

| 字段 | 控制内容 |
|-------|---------|
| `appName` | app UI 中显示的名称 |
| `modelCategory` | App 使用的 engine 和 UI 路径 |
| `bundleModelName` | 模型随 app 内置时的 bundle 文件夹名 |
| `defaultSystemPrompt` | 聊天初始 system instruction |

App UI 会根据 `modelCategory` 自动适配：

| 类别 | 输入 | 输出 |
|----------|-------|--------|
| LLM | 文本 | 流式文本 |
| VLM | 文本 + 照片 | 流式文本 |
| TTS | 文本 | 音频 |

## 参考个性化分层

Edge Scaffold 包含开发者可见的设置页，用于展示完整本地个性化生命周期：

| 分层 | 展示内容 |
| --- | --- |
| **Base Model** | 加载模型、检查 runtime 状态、切换 Neural Imprint restore 做 A/B 检查。 |
| **Tool Protocol Learning** | 注册 App 拥有 read-only 工具，并测试 tool-call 行为；不把 live 工具 schema 塞进每次 prompt。 |
| **User Profile Learning** | 从本地样本数据运行 profile workflow，并激活 combined Neural Imprint 产物。 |
| **Correction Learning** | 将反馈和纠正记录为本地数据，供后续 profile refresh 使用。 |
| **EdgeMesh** | 与 Mac 配对、上传 receipts、接收兼容 capsule，并报告 apply status。 |

这些页面是参考代码。请把样本数据和样本工具替换成你的 agent 自己的领域模型。

## 构建和测试

1. 解压导出结果，在 Xcode 中打开。
2. 选择开发团队和唯一 bundle identifier。
3. 将运行 destination 设置为**真实设备**，不要用模拟器。
4. 用 **Release** 构建做性能验证。
5. 测试：首次启动、模型加载、首次响应、多轮对话、后台切换。

对较大模型，启用 **Increased Memory Limit** entitlement，并在目标设备上用 Release 构建 验证。

## 模型分发

| 层级 | 使用时机 |
|------|-------------|
| **Bundle** | 小模型（< 2GB）。随 app binary 一起发布。 |
| **On-Demand Resources** | 中等模型。安装后下载，由 OS 管理。 |
| **HuggingFace** | 大模型。首次启动时从 HuggingFace 下载。 |
| **Cache** | 之前已下载的模型。后续启动最快路径。 |

## 需要自定义什么

从这里开始：

1. `ScaffoldConfig.swift`：产品名、模型 ID、模型类别、样本领域和打包资源。
2. 样本数据 provider：替换成你的 agent 本地 facts。
3. Tool registry：替换成你的 App 拥有 read-only 工具。
4. 设置页文案：向用户解释个性化和 reset 行为。

不要把 dogfood-specific 业务逻辑复制进生产 agent。App policy 留在 App 层，Edge Kit / Edge Halo 只承担可复用基础设施。

## 下一步

- [构建 Agent 载体](/docs/quickstart/build-agent-carrier) — 从 Edge Studio 导出到真机验证的端到端 walkthrough。
- [平台要求](/docs/reference/platform-requirements) — 设备和 OS 约束。
