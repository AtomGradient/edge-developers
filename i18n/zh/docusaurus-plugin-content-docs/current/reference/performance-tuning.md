---
sidebar_position: 2
title: 性能调优
---

# 性能调优

使用 Edge Kit 在生成后记录的指标来衡量性能。Edge Kit 的推理路径使用 **DSR Attention**，让长多轮对话保持稳定吞吐量。

## 读取推理指标

`LLMEngine` 和 `VLMEngine` 会在一次生成完成后暴露 `lastMetrics`。

```swift
for try await chunk in engine.generate(messages: [.user("Summarize this.")]) {
    print(chunk.text, terminator: "")
}

if let metrics = engine.lastMetrics {
    print("TTFT:", metrics.ttftMs)
    print("Decode TPS:", metrics.decodeTPS)
    print("Prompt tokens:", metrics.promptTokenCount)
    print("Generated tokens:", metrics.generationTokenCount)
    print("Memory delta:", metrics.memoryDeltaMB)
}
```

## 在 Release 中做基准测试

Debug build 可能比 Release 构建 慢得多。始终从以下环境采集基准数字：

- Release configuration。
- 真实目标设备。
- 温度稳定的冷却设备。
- 跨运行保持相同 prompt 和模型。

## 先选择模型大小

更大的模型可能提升质量，但也会增加加载时间、内存压力和每 token 成本。

| 目标 | 建议 |
| --- | --- |
| 最低延迟 | 从 0.8B 或小型 4-bit 模型开始。 |
| 均衡聊天质量 | 从 4B 4-bit 模型开始。 |
| 最高本地质量 | 只在已验证的高内存设备上使用更大模型。 |
| Edge Studio 优化或 artifact 生成 | 将更高精度源模型保存在 Mac 上。 |

## 为对话使用提示缓存

多轮 LLM 和 VLM 对话会自动复用对话上下文。一次对话保持同一个 engine 实例，然后在用户开始新对话时清理缓存。

```swift
engine.clearPromptCache()
```

## 监控进程 footprint

调试内存压力时使用进程物理 footprint。iOS 上可用内存 API 可能具有误导性，因为系统限制低于物理 RAM。

## 参考基准

使用 Qwen3.5 模型在真实设备上测量，20 轮对话压力测试：

| 设备 | 模型 | 首轮 | 中位数 | T20 | TTFT |
|--------|-------|-----------|--------|-----|------|
| iPhone 17 (A19, 11GB) | 9B-4bit | 12.6 TPS | 11.6 TPS | 10.8 TPS | 566ms |
| iPhone Air (A19, 11GB) | 9B-4bit | 9.5 TPS | 7.8 TPS | 7.5 TPS | 918ms |
| iPhone 17 (A19, 11GB) | 4B-4bit | 21.8 TPS | 19.6 TPS | 17.3 TPS | 420ms |

自研 engine prefill 与通用框架对比（M2 Ultra 192GB）：

| 工作负载 | Edge Engine | 通用框架 | 加速 |
|----------|-----------|---------|---------|
| Text prefill (4B) | 1,305 TPS | 187 TPS | 7× |
| Text prefill (9B) | 843 TPS | 122 TPS | 6.9× |
| VLM image prefill (4B) | 1,803 TPS | 851 TPS | 2.1× |
| VLM image prefill (9B) | 1,234 TPS | 511 TPS | 2.4× |

把这些数字作为参考。你的结果会受模型、设备热状态和对话长度影响。

## 实用检查清单

- 为交互式推理使用量化模型。
- 开发期间优先使用本地模型目录，以获得可重复测试。
- 每个 engine 实例保持一个活跃生成。
- 切换模型类别前卸载未使用 engine。
- 更改模型大小、build configuration 或目标设备后重新运行基准测试。
