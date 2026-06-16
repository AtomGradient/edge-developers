---
sidebar_position: 1
slug: /
title: 概览
---

# AtomGradient Edge

构建运行在用户自有设备上的私有 AI agent。

当前版本面向 Apple 平台发布。Android、Linux、HarmonyOS 和 Windows 在路线图中。

:::info 开发者预览
所有 Edge 产品都处于 **Developer Preview**。API 可能在版本间变化。请固定包版本，并在每次升级后用真机重新验证。
:::

## 产品栈

| 产品 | 开发者用它做什么 |
| --- | --- |
| **Edge Studio** | 本地工作台：模型分析、优化、benchmark、Neural Imprint 生成、设备管理与导出。 |
| **Edge Engine** | 原生端侧推理运行时。通常由 Edge Kit 打包使用，app 不直接 import。 |
| **Edge Kit** | Swift SDK：LLM、VLM、语音、模型管理、EdgeData、EdgeMesh、EdgeDataMeshBridge、EdgeSession 和 EdgeUI。 |
| **Edge Halo** | 个性化生命周期层：画像任务、Neural Imprint capsule 校验、恢复编排与兼容性闸门。 |
| **Edge Scaffold** | 参考 app 和导出模板，展示推荐的 iOS 集成方式。 |

简化流程：

```text
Edge Studio 准备 artifacts
        ↓
Edge Scaffold 展示参考 app 结构
        ↓
你的 agent import Edge Kit + Edge Halo
        ↓
Edge Engine 在本地运行模型
```

## 选择路径

### 我想先看到学习闭环

1. [5 分钟 Neural Imprint 学习 demo](/docs/get-started/minute-demo) — 用一条 CLI 命令跑 synthetic correction-learning loop
2. [最小 iOS App](/docs/get-started/minimal-ios-app) — 快速构建参考 app shell
3. [Swift CLI 验证](/docs/get-started/swift-cli) — 在 app 集成前验证 SDK contract

### 我想构建端侧聊天 agent

1. [安装 Edge Kit](/docs/get-started/quickstart) — Swift Package Manager，5 分钟
2. [文本生成](/docs/build/text-generation) — 加载模型并流式输出
3. [基础聊天示例](/docs/examples/basic-chat) — 完整 SwiftUI agent
4. [内存管理](/docs/guides/memory-management) — 避免真机崩溃

### 我想加入视觉、语音或个性化

- [视觉](/docs/build/vision) — VLM 图像理解
- [语音转文本](/docs/build/speech-to-text) + [文本转语音](/docs/build/text-to-speech) — 语音流水线
- [模型进化](/docs/build/model-evolution) — Neural Imprint 与 Edge Halo 生命周期
- [个性化模型示例](/docs/examples/personalized-model) — 画像、capsule 和恢复流程

### 我想优化模型并发布 agent

1. [Edge Studio 概览](/docs/optimize-and-ship/studio-overview) — 本地工作台
2. [优化与 benchmark](/docs/optimize-and-ship/optimize-and-benchmark) — 分析、压缩、验证
3. [导出](/docs/optimize-and-ship/export) — Edge Kit bundle、scaffold project、GGUF 或 CoreML
4. [Edge Scaffold](/docs/optimize-and-ship/scaffold) — 生成可发布的参考 app
5. [构建与发布示例](/docs/examples/build-and-ship) — 端到端 walkthrough

## 核心概念

| 概念 | 面向开发者的含义 |
| --- | --- |
| **本地优先推理** | 模型、prompt、用户数据和个性化 artifact 默认留在用户自有设备上。 |
| **Neural Imprint** | 本地个性化 artifact，让兼容 base model 恢复用户相关状态，而不改模型权重。 |
| **EdgeMesh** | 面向用户自有设备的本地网络信任、发现与设备间传输。 |
| **Memory intent** | `balanced`、`longSession`、`exactRecall`、`batteryFriendly` 等高层策略提示；运行时细节由 Edge Kit 解析。 |
| **Fail-closed compatibility** | 个性化和模型 artifacts 必须匹配模型、tokenizer/template、runtime 和 tool schema 后才能恢复。 |

## 快速开始

```swift
import EdgeInference

let engine = LLMEngine()
try await engine.loadLocal(directory: modelURL)

for try await chunk in engine.generate(
    messages: [.user("What is edge AI?")]
) {
    print(chunk.text, terminator: "")
}
```

## 隐私模型

Edge 围绕用户自有计算设计：

- 推理在本地运行。
- 训练输入、纠错和对话历史由 app 本地管理。
- EdgeMesh 传输是本地网络并受信任关系约束。
- Neural Imprint artifacts 在恢复前做兼容性校验，也应由 app 提供删除路径。

不要把用户 transcript、correction 或 profile artifact 上传到分析、崩溃日志或远程支持系统。
