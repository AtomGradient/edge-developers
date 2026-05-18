---
sidebar_position: 5
title: Analysis Tools
---

# Analysis tools

Analysis tools inspect a loaded model before optimization, validation, or export.

## Tool summary

| Tool | Route | Best for |
| --- | --- | --- |
| Architecture Browser | `/architecture` | Understanding model structure and layer organization. |
| Weight Analysis | `/weights` | Inspecting tensor sizes, data types, and distribution summaries. |
| Activation Heatmap | `/activation` | Reviewing activation summaries after a profile is available. |
| Attention Patterns | `/attention` | Inspecting attention traces when trace data is available. |
| KV Cache Analysis | `/kv-cache` | Estimating memory use for long and multi-turn sessions. |
| MoE Analyzer | `/moe` | Reviewing expert usage for Mixture-of-Experts models. |
| Inference Tracer | `/inference` | Stepping through generated tokens and confidence signals. |
| Model Comparison | `/comparison` | Comparing two loaded model variants side by side. |

## Architecture Browser

Route: `/architecture`

Architecture Browser shows the loaded model as a navigable structure.

Key features:

- Model overview with size, layer count, parameter count, and quantization summary.
- Tree, treemap, and 3D visualization modes.
- Expandable layer hierarchy.
- Detail panel with structured configuration and tensor metadata.
- Search and visual filtering for model components.

Use it before optimization to understand what kind of model you loaded and where the largest components are.

## Weight Analysis

Route: `/weights`

Weight Analysis summarizes model weights and tensor-level storage characteristics.

Key features:

- Module-class breakdown.
- Tensor table with size and data-type information.
- Distribution views for selected tensors.
- Top-size components and outlier indicators.
- Shortcuts to continue into optimization or chat testing.

Use it to identify which parts of a model dominate disk and memory use before choosing optimization settings.

## Activation Heatmap

Route: `/activation`

Activation Heatmap visualizes layer-level activation summaries after a profile is available.

Key features:

- 2D heatmap, 3D surface, and 3D scatter views.
- Layer selection.
- Metric selector for maximum or mean activation summaries.
- Threshold comparison cards.
- Profile-required empty state when activation data is not available.

Use it to understand where the model is most active for a representative workload.

## Attention Patterns

Route: `/attention`

Attention Patterns visualizes attention trace summaries for the loaded model.

Key features:

- Attention pattern counts.
- Head-level and layer-level visualizations.
- Matrix views for selected attention data.
- Trace-required empty state with guidance when no trace is available.

Use it to inspect attention behavior after capturing a trace for the prompts you care about.

## KV Cache Analysis

Route: `/kv-cache`

KV Cache Analysis estimates conversation memory use for the loaded model.

Key features:

- Context-length cards.
- Device-fit table for selected Apple devices.
- Memory breakdown chart.
- Sequence-length growth chart when trace data is available.
- Device selector for comparing target hardware.

Use it when planning chat, coding, or assistant workflows that need long context or many turns.

## MoE Analyzer

Route: `/moe`

MoE Analyzer summarizes expert usage for Mixture-of-Experts models.

Key features:

- Expert count and selected-expert summary.
- Utilization and load-balance cards.
- Expert activity charts.
- Dense-model and no-trace empty states.

Use it before deploying an MoE model to confirm that trace data exists and that expert usage is understandable for your workload.

## Inference Tracer

Route: `/inference`

Inference Tracer records and visualizes a single generation run.

Key features:

- Prompt input for a trace run.
- Token-by-token stepper.
- Chosen-token probability and top-candidate views.
- Timing cards for prefill, decode, and total generation.
- Layer-contribution and hidden-state norm views when available.

Use it to debug generation quality, inspect confidence, and understand where time is spent during a sample run.

## Model Comparison

Route: `/comparison`

Model Comparison compares the current model with a second loaded model.

Key features:

- Side-by-side model identity cards.
- Size, timing, and quality metrics.
- Architecture and layer comparison views.
- Benchmark comparison charts.

Use it after optimization or export validation to compare a candidate against the original model.
