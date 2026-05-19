---
sidebar_position: 1
slug: /
title: 概览
---

# AtomGradient Edge

让 AI 在每台设备上生长。无云端依赖，无延迟，完全隐私。

当前支持 Apple 平台。Android、Linux、鸿蒙和 Windows 在路线图中。

:::info 开发者预览
所有 Edge 产品处于**开发者预览**阶段。API 可能在版本间发生变化。请锁定依赖版本，并在每次升级后在真机上验证。
:::

## 选择你的路径

### 我想构建端侧聊天 Agent

1. [安装 Edge Kit](/docs/get-started/quickstart) — SPM，5 分钟
2. [文本生成](/docs/build/text-generation) — 加载模型，流式输出
3. [基础聊天示例](/docs/examples/basic-chat) — 完整 SwiftUI Agent
4. [内存管理](/docs/guides/memory-management) — 稳定上线不崩溃

### 我想添加视觉、语音或个性化能力

- [视觉理解](/docs/build/vision) — 使用 VLM 理解图像
- [语音转文字](/docs/build/speech-to-text) + [文字转语音](/docs/build/text-to-speech) — 语音管线
- [模型进化](/docs/build/model-evolution) — HALO 驱动的端侧持续学习
- [语音助手示例](/docs/examples/voice-assistant) — ASR → LLM → TTS 端到端

### 我想优化模型并发布 Agent

1. [Edge Studio 概览](/docs/optimize-and-ship/studio-overview) — Web 优化工作台
2. [优化与基准测试](/docs/optimize-and-ship/optimize-and-benchmark) — 分析、压缩、验证
3. [导出](/docs/optimize-and-ship/export) — Edge Kit / GGUF / CoreML 格式
4. [Edge Scaffold](/docs/optimize-and-ship/scaffold) — 生成可发布的 Agent
5. [构建与发布示例](/docs/examples/build-and-ship) — 端到端完整流程

## 核心技术

| 技术 | 对你的意义 |
|------|-----------|
| **DSR Attention** | 动态稀疏保留。9B 模型在 iPhone 上跑 20 轮对话不掉速。无需配置 — Edge Kit 自动应用。 |
| **HALO**（专利） | 端侧模型进化。模型从用户行为中学习，数据不上传。画像提取、适配器训练、实时调控 — 全部在本地完成。 |

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

## 性能

真机实测数据。Qwen3.5-9B-4bit，20 轮对话：

| 设备 | 第 1 轮 | 中位数 | 第 20 轮 | TTFT |
|------|--------|--------|---------|------|
| iPhone 17 (11GB) | 12.6 TPS | 11.6 TPS | 10.8 TPS | 566ms |
| iPhone Air (11GB) | 9.5 TPS | 7.8 TPS | 7.5 TPS | 918ms |

自研引擎 prefill（M2 Ultra）：

| 工作负载 | Edge Engine | 通用实现 | 加速比 |
|----------|-----------|---------|--------|
| 文本 (4B) | 1,305 TPS | 187 TPS | **7×** |
| VLM 图像 (4B) | 1,803 TPS | 851 TPS | **2.1×** |
