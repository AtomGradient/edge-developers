---
sidebar_position: 4
title: Pro 仪表盘
---

# Pro Dashboard

Pro Dashboard 是专家模式的模型驾驶舱。

## Route

`/dashboard`

## 它显示什么

dashboard 会适配当前工作流阶段：

| 阶段 | Dashboard 重点 | 建议下一步 |
| --- | --- | --- |
| 刚加载 | 模型身份、大小、架构摘要和基本指标。 | 检查架构或开始分析。 |
| 已画像 | Profile 摘要和分析状态。 | 打开优化工具。 |
| 已优化 | 前后对比摘要和导出就绪状态。 | 导出候选或运行 benchmark。 |

## 组件

| 组件 | 描述 |
| --- | --- |
| Metrics row | 显示模型大小、参数量、量化级别和层信息。 |
| Quick actions | 链接到分析工具、聊天、pipeline、benchmark 和导出。 |
| Progress timeline | 跟踪从加载到分析、优化和导出的路径。 |
| Model info card | 汇总已加载模型及其当前就绪状态。 |
| Recommended paths | 基于当前进度突出显示下一步有用工具。 |

## 如何使用

1. 从欢迎页或侧边栏模型选择器加载模型。
2. 打开 `/dashboard`。
3. 查看 metrics row 和推荐路径。
4. 按建议操作，或从侧边栏跳转到工具。
5. 在分析、优化、benchmark 或导出后返回 dashboard 查看更新后的进度。

## 何时使用

将 dashboard 作为 Pro mode 的起点。它是了解当前模型已完成工作以及下一步应做什么的最快方式。
