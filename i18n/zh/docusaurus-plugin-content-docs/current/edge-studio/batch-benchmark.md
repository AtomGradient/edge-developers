---
sidebar_position: 9
title: 批处理与基准测试
---

# 批处理操作和基准测试

Batch 和 benchmark 工具会跨一个或多个模型重复运行工作。

## Benchmark Dashboard

Route: `/benchmark-dashboard`

Benchmark Dashboard 运行 benchmark job，并并排比较结果。

关键功能：

- 将一个或多个模型目录添加到 benchmark 队列。
- 跨所选模型运行 benchmark 任务。
- 显示并排结果卡片。
- 使用图表进行可视化比较。
- 将结果导出为 CSV。
- 跟踪磁盘大小、峰值内存、每秒 token 数、首 token 时间和 perplexity。

当你需要为多个模型候选或导出变体获得可比较测量时使用它。

## Batch Operations

Route: `/batch`

Batch Operations 为多个模型排队优化工作。

关键功能：

- 将多个模型添加到队列。
- 对每个模型应用所选优化操作。
- 跟踪队列进度和单模型状态。
- 完成后显示结果表。
- 估算耗时并汇总失败项，便于后续处理。

当你需要处理模型目录，或跨多个候选运行同一工作流时使用它。

## 典型工作流

1. 加载或添加你想处理的模型。
2. 运行 Batch Operations 创建候选。
3. 打开 Benchmark Dashboard。
4. 一起 benchmark 原始候选和优化候选。
5. 只导出通过质量和设备适配检查的候选。
