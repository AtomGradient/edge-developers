---
sidebar_position: 6
title: 优化工具
---

# 优化工具

优化工具帮助你创建更小或更适合设备的模型候选，同时跟踪质量。

:::caution
将优化输出视为候选，而不是最终 artifact。发布前请在目标设备上运行验证和测试。
:::

## 工具摘要

| 工具 | Route | 最适合 |
| --- | --- | --- |
| Optimization Advisor | `/optimization` | 为已加载模型选择起始方案。 |
| Auto Optimizer | `/auto-optimizer` | 以最少手动设置搜索候选。 |
| Optimization Pipeline | `/pipeline` | 运行受控的多步骤优化工作流。 |
| Pruning Simulator | `/pruning` | 在应用变更前预览尺寸缩减影响。 |
| Mixed Precision Panel | `/mixed-precision` | 按层组分配精度设置。 |
| Quality Validator | `/quality` | 优化后检查质量。 |
| Knowledge Distillation | `/distill` | 从 teacher model 创建更小的 student model。 |
| Model Merge | `/merge` | 将模型或适配器来源合并为新候选。 |
| Auto Tune | `/auto-tune` | 为模型和设备寻找推理参数。 |

## Optimization Advisor

Route: `/optimization`

Optimization Advisor 为当前模型和目标设备推荐起始方案。

关键功能：

- 显示模型身份和就绪卡片。
- 汇总推荐优化方向。
- 在优化任务运行时提供执行状态。
- 自然连接到 pipeline、validation 和 export 流程。

当你想在手动配置优化步骤前获得建议路径时使用它。

## Auto Optimizer

Route: `/auto-optimizer`

Auto Optimizer 搜索候选设置，并展示质量和尺寸对比。

关键功能：

- 需要已加载模型和 profile 数据。
- 显示候选数量和 frontier 摘要。
- 跟踪搜索进度。
- 展示前后对比指标。
- 突出显示适配所选设备类别的候选。

在常见优化场景中，如果希望 Edge Studio 代你探索候选，请使用它。

## Optimization Pipeline

Route: `/pipeline`

Optimization Pipeline 是手动、逐步的优化工作流。

关键功能：

- 让你构建有序优化阶段列表。
- 运行前显示风险和顺序警告。
- 显示每一步结果。
- 包含验证选项和 benchmark 后续入口。
- 提供前往聊天测试和导出的下一步链接。

当你需要明确控制运行哪些阶段以及顺序时使用它。

## Pruning Simulator

Route: `/pruning`

Pruning Simulator 在提交优化运行前预览模型尺寸缩减效果。

关键功能：

- 需要 profile 数据。
- 显示预计保留大小和节省大小。
- 提供可调整的模拟控制。
- 允许保护所选层不被移除。
- 在其他地方应用变更前展示摘要卡片。

用它估算某个尺寸缩减目标对模型和目标设备是否现实。

## Mixed Precision Panel

Route: `/mixed-precision`

Mixed Precision Panel 允许你跨层分配精度设置。

关键功能：

- 显示层配置表。
- 支持批量精度更新。
- 支持逐层 override。
- 根据所选设置估算输出大小。
- 运行后显示结果状态。

当单一全局精度设置对所需质量和尺寸取舍过于粗糙时使用它。

## Quality Validator

Route: `/quality`

Quality Validator 检查模型候选是否仍满足你的质量门槛。

关键功能：

- 快速 perplexity 模式。
- 完整报告模式。
- 自定义 prompt 模式。
- 生成 benchmark 摘要。
- 结果和耗时对比卡片。

每次优化 pass 后都使用它。验证结果对你的应用可接受前，不要导出候选。

## Knowledge Distillation

Route: `/distill`

Knowledge Distillation 使用更大的 teacher model 创建紧凑的 student model。

关键功能：

- 选择 teacher 和 student 来源。
- 选择训练数据。
- 显示训练进度。
- 报告最终候选指标。
- 运行成功时提供 export-ready 输出。

当你需要更小模型但希望保留较大源模型行为时使用它。

## Model Merge

Route: `/merge`

Model Merge 将模型或适配器来源组合成新候选。

关键功能：

- 添加多个源模型或适配器。
- 配置 merge 输入和输出位置。
- 显示任务进度。
- 完成后展示结果候选。

当你希望把兼容来源组合为一个部署候选时使用它。

## Auto Tune

Route: `/auto-tune`

Auto Tune 为当前设备上的已加载模型搜索推理参数。

关键功能：

- 针对参数选择运行自动 benchmark。
- 显示找到的最佳配置。
- 缓存结果以便后续读取。
- 报告吞吐和质量导向摘要指标。

在模型候选已选定后、最终 benchmark 和导出验证前使用它。
