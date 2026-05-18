---
sidebar_position: 4
title: Pro Dashboard
---

# Pro Dashboard

The Pro Dashboard is the model cockpit for expert mode.

## Route

`/dashboard`

## What it shows

The dashboard adapts to the current workflow stage:

| Stage | Dashboard focus | Suggested next action |
| --- | --- | --- |
| Just loaded | Model identity, size, architecture summary, and basic metrics. | Inspect architecture or start analysis. |
| Profiled | Profile summary and analysis status. | Open optimization tools. |
| Optimized | Before/after summary and export readiness. | Export the candidate or run benchmarks. |

## Components

| Component | Description |
| --- | --- |
| Metrics row | Shows model size, parameter count, quantization level, and layer information. |
| Quick actions | Links to analysis tools, chat, pipeline, benchmark, and export. |
| Progress timeline | Tracks the path from load to analyze, optimize, and export. |
| Model info card | Summarizes the loaded model and its current readiness. |
| Recommended paths | Highlights the next useful tool based on current progress. |

## How to use

1. Load a model from the welcome page or the sidebar model selector.
2. Open `/dashboard`.
3. Review the metrics row and recommended path.
4. Follow the suggested action or jump to a tool from the sidebar.
5. Return to the dashboard after analysis, optimization, benchmark, or export to see updated progress.

## When to use it

Use the dashboard as the starting point for Pro mode. It is the fastest way to understand what has already been done with the current model and what should happen next.
