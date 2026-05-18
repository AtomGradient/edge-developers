---
sidebar_position: 2
title: 优化与基准测试
---

# 优化与基准测试

Edge Studio 的核心循环：分析模型、应用优化、对结果做基准测试，并重复这一过程，直到候选模型适配目标设备。

## 分析

优化前，先理解模型：

| 工具 | 显示内容 | 使用时机 |
|------|-------------|-------------|
| Architecture browser | Layer tree、参数数量、类型 | 首次加载，理解结构 |
| Weight analysis | Tensor 尺寸、数据类型、分布 | 识别内存主要来源 |
| Activation heatmap | Layer 级 activation magnitude | profiling 后寻找热点 |
| Attention patterns | Head 重要性、attention traces | 调试生成质量 |
| KV cache analysis | 面向对话长度的内存预测 | 规划多轮内存预算 |
| MoE analyzer | Expert routing 和利用率 | 仅用于 MoE 模型 |
| Inference tracer | Token 概率、逐步耗时 | 调试特定输出 |
| Model comparison | 原始模型与优化模型并排对比 | 优化后使用 |

## 优化

| 工具 | 作用 | 适合场景 |
|------|-------------|----------|
| **Auto optimizer** | 自动搜索候选 | 快速开始，让 Studio 决定 |
| **Optimization pipeline** | 分步骤手动控制 | 精细调整每个阶段 |
| **Pruning simulator** | 应用前预览尺寸缩减 | 估算目标是否现实 |
| **Mixed precision** | 按 layer 控制量化 bit-width | 细粒度平衡质量与尺寸 |
| **Distillation** | 从 teacher 训练更小的 student | 创建紧凑模型 |
| **Merge** | 合并模型或适配器 | 从多个来源组装 |
| **Auto tune** | 搜索推理参数 | 寻找最优设备配置 |

## 质量验证

每次优化后：

1. 运行 **Quality validator**：perplexity 检查、完整报告或自定义 prompts。
2. 在 **Model comparison** 中与原始模型对比。
3. 在 **Chat** 中用真实使用场景 prompts 测试。
4. 验证通过前不要导出。

## 批处理操作

**Benchmark dashboard**：对多个模型运行基准测试。支持 Plotly 图表、CSV 导出、并排对比。

**Batch operations**：将多个模型排队优化。支持进度追踪和失败复盘。

在评估模型目录或对候选模型做回归检查时使用批处理工具。

## 下一步

- [导出模型](/docs/optimize-and-ship/export) — 输出格式和验证。
- [Edge Scaffold](/docs/optimize-and-ship/scaffold) — 生成可发布 app。
