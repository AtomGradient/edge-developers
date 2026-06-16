---
sidebar_position: 8
title: EdgeUI
---

# EdgeUI API reference

`EdgeUI` contains generic SwiftUI building blocks for Edge-based apps. The views are infrastructure components, not a product UI mandate.

> **Developer Preview boundary**
>
> Use these views as references or small reusable components. Product layout, copy, navigation, and business workflows remain app-owned decisions.

## Agent workbench components

| Type | Description |
| --- | --- |
| `EdgeActivityStatus` | Display model for an active agent operation. |
| `EdgeActivityMotion` | Motion profile for activity chrome. |
| `EdgeActivityStatusView` | SwiftUI status row for active inference or tool work. |
| `EdgeActivityPulseView` | Compact pulse indicator. |
| `EdgeActivityMetaLabel` | Small metadata label. |
| `EdgeActivityShimmer` | Optional activity shimmer modifier. |
| `EdgeAgentTranscriptRow` | Generic transcript row with app-provided actions, trace content, and body content. |
| `EdgeAgentWorkbench` | Generic workbench composition surface. |

## Classification UI

| Type | Description |
| --- | --- |
| `ClassificationListView(namespace:)` | Generic EdgeData classification inbox grouped by status. |
| `ClassificationCorrectionSheet(fact:onComplete:)` | Metadata-driven correction sheet for an EdgeData `Fact`. |

These components render from `EdgeData` schema metadata. They must not contain app-specific categories, fields, prompts, or business rules.

## Diagnostics UI

| Type | Description |
| --- | --- |
| `EdgeDiagnostics.shared` | Observable diagnostics toggle state. |
| `setDetailedMetricsEnabled(_:)` | Sets whether detailed metrics are visible. |
| `toggleDetailedMetrics()` | Toggles detailed metrics and returns the new value. |
| `EdgeDiagnosticTapModifier` | Hidden tap gesture for developer diagnostics. |

## Safety boundaries

- Keep product-specific copy and information architecture in the app.
- Do not use `EdgeUI` to encode DogFood behavior, domain defaults, or app-specific data schemas.
- Use these views as preview references until your app has validated accessibility, localization, and device layout.
