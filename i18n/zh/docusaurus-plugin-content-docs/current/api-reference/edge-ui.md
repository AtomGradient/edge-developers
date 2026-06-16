---
sidebar_position: 8
title: EdgeUI
---

# EdgeUI API 参考

`EdgeUI` 包含面向 Edge-based apps 的通用 SwiftUI building blocks。这些 view 是基础设施组件，不是产品 UI 规定。

:::info Developer Preview 边界
这些 view 可作为 reference 或小型可复用组件。产品级 layout、copy、navigation 和业务 workflow 仍由 app 自己决定。
:::

## Agent workbench components

| Type | 说明 |
| --- | --- |
| `EdgeActivityStatus` | 活跃 agent operation 的 display model。 |
| `EdgeActivityMotion` | activity chrome 的 motion profile。 |
| `EdgeActivityStatusView` | 展示 active inference 或 tool work 的 SwiftUI status row。 |
| `EdgeActivityPulseView` | 紧凑 pulse indicator。 |
| `EdgeActivityMetaLabel` | 小型 metadata label。 |
| `EdgeActivityShimmer` | 可选 activity shimmer modifier。 |
| `EdgeAgentTranscriptRow` | 支持 app-provided actions、trace content 和 body content 的 generic transcript row。 |
| `EdgeAgentWorkbench` | Generic workbench composition surface。 |

## Classification UI

| Type | 说明 |
| --- | --- |
| `ClassificationListView(namespace:)` | 按 status 分组的 generic EdgeData classification inbox。 |
| `ClassificationCorrectionSheet(fact:onComplete:)` | 面向 EdgeData `Fact` 的 metadata-driven correction sheet。 |

这些组件从 `EdgeData` schema metadata 渲染。它们不应包含 app-specific categories、fields、prompts 或业务规则。

## Diagnostics UI

| Type | 说明 |
| --- | --- |
| `EdgeDiagnostics.shared` | Observable diagnostics toggle state。 |
| `setDetailedMetricsEnabled(_:)` | 设置是否显示 detailed metrics。 |
| `toggleDetailedMetrics()` | 切换 detailed metrics，并返回新状态。 |
| `EdgeDiagnosticTapModifier` | 用于 developer diagnostics 的隐藏 tap gesture。 |

## 安全边界

- 产品级 copy 和 information architecture 留在 app 内。
- 不要用 `EdgeUI` 编码 DogFood behavior、domain defaults 或 app-specific data schemas。
- 在完成 accessibility、localization 和 device layout 验证前，把这些 view 当作 preview reference。
