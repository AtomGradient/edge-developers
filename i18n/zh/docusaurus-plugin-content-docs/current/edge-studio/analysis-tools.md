---
sidebar_position: 5
title: 分析工具
---

# 分析工具

分析工具用于在优化、验证或导出前检查已加载模型。

## 工具摘要

| 工具 | Route | 最适合 |
| --- | --- | --- |
| Architecture Browser | `/architecture` | 理解模型结构和层组织。 |
| Weight Analysis | `/weights` | 检查 tensor 大小、数据类型和分布摘要。 |
| Activation Heatmap | `/activation` | 在 profile 可用后查看激活摘要。 |
| Attention Patterns | `/attention` | 在 trace 数据可用时检查 attention trace。 |
| KV Cache Analysis | `/kv-cache` | 估算长上下文和多轮会话的内存使用。 |
| MoE Analyzer | `/moe` | 查看 Mixture-of-Experts 模型的 expert 使用情况。 |
| Inference Tracer | `/inference` | 逐步查看生成 token 和置信信号。 |
| Model Comparison | `/comparison` | 并排比较两个已加载模型变体。 |

## Architecture Browser

Route: `/architecture`

Architecture Browser 将已加载模型显示为可导航结构。

关键功能：

- 显示模型概览，包括大小、层数、参数量和量化摘要。
- Tree、treemap 和 3D 可视化模式。
- 可展开的层级结构。
- 带结构化配置和 tensor 元数据的详情面板。
- 面向模型组件的搜索和可视化过滤。

优化前使用它来了解你加载了哪类模型，以及最大组件在哪里。

## Weight Analysis

Route: `/weights`

Weight Analysis 汇总模型权重和 tensor 级存储特征。

关键功能：

- 按 module class 拆分。
- 带大小和数据类型信息的 tensor 表。
- 所选 tensor 的分布视图。
- 最大组件和异常值指示。
- 继续进入优化或聊天测试的快捷入口。

用它在选择优化设置前识别模型中主导磁盘和内存使用的部分。

## Activation Heatmap

Route: `/activation`

Activation Heatmap 在 profile 可用后可视化层级激活摘要。

关键功能：

- 2D heatmap、3D surface 和 3D scatter 视图。
- 层选择。
- 最大或平均激活摘要的指标选择器。
- 阈值比较卡片。
- 激活数据不可用时的 profile-required 空状态。

用它理解模型在代表性工作负载中最活跃的位置。

## Attention Patterns

Route: `/attention`

Attention Patterns 可视化已加载模型的 attention trace 摘要。

关键功能：

- Attention pattern 计数。
- Head-level 和 layer-level 可视化。
- 所选 attention 数据的矩阵视图。
- 没有 trace 时带指引的 trace-required 空状态。

在为你关心的 prompt 捕获 trace 后，用它检查 attention 行为。

## KV Cache Analysis

Route: `/kv-cache`

KV Cache Analysis 估算已加载模型的对话内存使用。

关键功能：

- 上下文长度卡片。
- 所选 Apple 设备的设备适配表。
- 内存拆分图表。
- trace 数据可用时的序列长度增长图表。
- 用于比较目标硬件的设备选择器。

在规划需要长上下文或多轮的聊天、编程或助手工作流时使用它。

## MoE Analyzer

Route: `/moe`

MoE Analyzer 汇总 Mixture-of-Experts 模型的 expert 使用情况。

关键功能：

- Expert 数量和 selected-expert 摘要。
- Utilization 和 load-balance 卡片。
- Expert 活动图表。
- Dense-model 和 no-trace 空状态。

部署 MoE 模型前，用它确认 trace 数据存在，并且 expert 使用对你的工作负载可理解。

## Inference Tracer

Route: `/inference`

Inference Tracer 记录并可视化一次生成运行。

关键功能：

- 用于 trace run 的 prompt 输入。
- Token-by-token stepper。
- Chosen-token probability 和 top-candidate 视图。
- Prefill、decode 和总生成时间卡片。
- 可用时的 layer-contribution 和 hidden-state norm 视图。

用它调试生成质量、检查置信度，并理解一次样例运行中的时间花在哪里。

## Model Comparison

Route: `/comparison`

Model Comparison 将当前模型与第二个已加载模型进行比较。

关键功能：

- 并排模型身份卡片。
- 大小、耗时和质量指标。
- 架构和层比较视图。
- Benchmark 对比图表。

在优化或导出验证后，用它将候选与原始模型比较。
