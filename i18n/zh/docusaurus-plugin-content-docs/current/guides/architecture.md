---
sidebar_position: 6
title: 架构
---

# 架构与技术概念

Edge 平台各层如何连接，以及核心技术对你的 app 意味着什么。

## 分层图

```text
┌─────────────────────────────────────────────┐
│                Your App                      │
├──────────────┬──────────────┬───────────────┤
│  Edge Kit    │  Edge Halo   │  Edge Mesh    │
│  Inference   │  Evolution   │  Multi-device │
│  SDK         │  (HALO)      │               │
├──────────────┴──────────────┴───────────────┤
│          Edge Engine — Native Runtime        │
│          (DSR Attention)                     │
└─────────────────────────────────────────────┘

工具链（开发时使用，不随 app 一起发布）：
  Edge Studio  →  Edge Scaffold  →  App project
```

**Edge Engine** 是推理运行时。它负责 Metal command 调度、tensor 存储和模型家族执行。你的 app 不会直接 import 它，Edge Kit 会封装这层。

**Edge Kit** 是开发者接口层。它提供 `LLMEngine`、`VLMEngine`、`TTSEngine`、`WhisperEngine`、模型下载、内存管理和 mesh 网络。这是你在 app 中 `import` 的部分。

**Edge Halo** 是进化层。它基于专利 **HALO** 算法系统，处理用户画像分析、适配器生命周期和 activation steering。它位于 Edge Kit 旁边，由你的 app 组合两者。

**Edge Mesh** 是网络层。它负责本地网络设备发现、能力感知路由，以及设备之间的适配器传输。不需要云端中继。

**Edge Studio** 和 **Edge Scaffold** 是开发时工具。Studio 优化模型，Scaffold 生成 app 项目。两者都不会进入最终二进制。

## DSR Attention

DSR (Dynamic Sparse Retention) 是 Edge Kit 在内存受限设备上保持多轮对话速度的方式。

对你的意义：

- 9B 模型可以在 iPhone 上跨 20 轮对话保持稳定吞吐量。
- 你不需要配置 DSR。Edge Kit 会根据模型和设备自动应用。
- 内存策略在模型加载时计算。你可以通过 `engine.memoryPolicy` 读取，但通常不需要覆盖。
- 如果用 `clearPromptCache()` 清空对话，缓存会重置，下一轮从干净状态开始。

你会在指标中看到：

| 指标 | 健康模式 |
|--------|----------------|
| 跨轮 TPS | 稳定或缓慢下降，而不是断崖式下跌。 |
| TTFT | 随上下文长度增长；典型对话保持在 1 秒以内。 |
| 内存占用 | 有边界，而不是每轮线性增长。 |

## HALO（专利）

HALO 是 Edge Halo 端侧持续学习背后的算法系统。

对你的意义：

- 你的 app 收集交互事件（反馈、修正、会话完成）。
- HALO 提取本地用户画像，这是一种偏好的几何表示，而不是关键词。
- 适配器在用户的 Mac 上训练，并通过 mesh 传输。数据不会离开用户自己的设备。
- Activation steering 让你无需重新训练即可调整一次会话中的模型行为。
- 用户可以随时回滚到基础模型。

行业背景：Google、OpenAI 和 Anthropic 都在探索云端持续学习。HALO 在端侧解决这个问题，隐私来自架构，而不是政策。

## 数据边界

| 数据 | 存放位置 | 是否离开设备？ |
|------|----------------|---------------|
| 模型权重 | App bundle 或本地下载 | 否 |
| KV cache | GPU 内存 | 否 |
| 对话历史 | App 管理的本地存储 | 否 |
| 用户画像 (HALO) | App 管理的本地存储 | 否 |
| 训练后的适配器 | 用户的 Mac → mesh → 设备 | 仅在用户自己的设备内 |
| 优化产物 | Edge Studio 导出 | 仅在开发者机器上 |

## 平台架构

Edge 被设计为跨平台系统。当前版本面向 Apple（iOS 17+、macOS 14+）。运行时抽象层支持更多 backend，Android、Linux、HarmonyOS 和 Windows 在路线图中。
