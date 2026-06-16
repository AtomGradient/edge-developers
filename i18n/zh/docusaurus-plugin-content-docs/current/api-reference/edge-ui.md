---
sidebar_position: 8
title: EdgeUI
---

# EdgeUI API 参考

`EdgeUI` 包含面向 Edge App 的通用 SwiftUI 构建块。这些 view 是基础设施组件，不是产品 UI 规定。

> **开发者预览边界**
>
> 这些 view 可作为参考或小型可复用组件。产品级 layout、文案、navigation 和业务 workflow 仍由 App 自己决定。

## Agent workbench 组件

| Type | 说明 |
| --- | --- |
| `EdgeActivityStatus` | 活跃 agent operation 的显示模型。 |
| `EdgeActivityMotion` | activity chrome 的 motion profile。 |
| `EdgeActivityStatusView` | 展示活跃推理或工具执行的 SwiftUI status row。 |
| `EdgeActivityPulseView` | 紧凑 pulse indicator。 |
| `EdgeActivityMetaLabel` | 小型元数据 label。 |
| `EdgeActivityShimmer` | 可选 activity shimmer modifier。 |
| `EdgeAgentTranscriptRow` | 支持 App 提供 actions、trace 内容和正文内容的通用 transcript row。 |
| `EdgeAgentWorkbench` | 通用 workbench 组合表面。 |

## Classification UI

| Type | 说明 |
| --- | --- |
| `ClassificationListView(namespace:)` | 按 status 分组的通用 EdgeData classification inbox。 |
| `ClassificationCorrectionSheet(fact:onComplete:)` | 面向 EdgeData `Fact` 的元数据驱动 correction sheet。 |

这些组件从 `EdgeData` schema 元数据渲染。它们不应包含 App 专属 categories、fields、prompts 或业务规则。

## Diagnostics UI

| Type | 说明 |
| --- | --- |
| `EdgeDiagnostics.shared` | Observable diagnostics toggle state。 |
| `setDetailedMetricsEnabled(_:)` | 设置是否显示 detailed metrics。 |
| `toggleDetailedMetrics()` | 切换 detailed metrics，并返回新状态。 |
| `EdgeDiagnosticTapModifier` | 用于 developer diagnostics 的隐藏 tap gesture。 |

## 安全边界

- 产品级文案和信息架构留在 App 内。
- 不要用 `EdgeUI` 编码 DogFood behavior、domain defaults 或 App 专属 data schemas。
- 在完成可访问性、本地化和设备布局验证前，把这些 view 当作预览参考。
