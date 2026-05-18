---
sidebar_position: 6
title: Optimization Tools
---

# Optimization tools

Optimization tools help you create smaller or better-fitting model candidates while tracking quality.

:::caution
Treat optimization output as a candidate, not a final artifact. Run validation and test on the target device before shipping.
:::

## Tool summary

| Tool | Route | Best for |
| --- | --- | --- |
| Optimization Advisor | `/optimization` | Choosing a starting plan for the loaded model. |
| Auto Optimizer | `/auto-optimizer` | Searching for a candidate with minimal manual setup. |
| Optimization Pipeline | `/pipeline` | Running a controlled multi-step optimization workflow. |
| Pruning Simulator | `/pruning` | Previewing size-reduction impact before applying changes. |
| Mixed Precision Panel | `/mixed-precision` | Assigning precision settings by layer group. |
| Quality Validator | `/quality` | Checking quality after optimization. |
| Knowledge Distillation | `/distill` | Creating a smaller student model from a teacher model. |
| Model Merge | `/merge` | Combining model or adapter sources into a new candidate. |
| Auto Tune | `/auto-tune` | Finding inference parameters for a model and device. |

## Optimization Advisor

Route: `/optimization`

Optimization Advisor recommends a starting plan for the current model and target device.

Key features:

- Shows model identity and readiness cards.
- Summarizes recommended optimization direction.
- Provides execution status when an optimization task is running.
- Links naturally into the pipeline, validation, and export flow.

Use it when you want a suggested path before manually configuring optimization steps.

## Auto Optimizer

Route: `/auto-optimizer`

Auto Optimizer searches candidate settings and presents a quality and size comparison.

Key features:

- Requires a loaded model and profile data.
- Shows candidate count and frontier summary.
- Tracks search progress.
- Presents before/after comparison metrics.
- Highlights candidates that fit the selected device class.

Use it for common optimization scenarios where you want Edge Studio to explore candidates for you.

## Optimization Pipeline

Route: `/pipeline`

Optimization Pipeline is the manual, step-by-step optimization workflow.

Key features:

- Lets you build an ordered list of optimization stages.
- Shows risk and order warnings before running.
- Displays per-step results.
- Includes validation options and benchmark follow-up.
- Provides next-step links to chat testing and export.

Use it when you need explicit control over which stages run and in what order.

## Pruning Simulator

Route: `/pruning`

Pruning Simulator previews the effect of model-size reduction before committing to an optimization run.

Key features:

- Requires profile data.
- Shows projected retained size and saved size.
- Provides adjustable simulation controls.
- Lets you protect selected layers from removal.
- Presents summary cards before applying changes elsewhere.

Use it to estimate whether a size-reduction target is realistic for the model and target device.

## Mixed Precision Panel

Route: `/mixed-precision`

Mixed Precision Panel lets you assign precision settings across layers.

Key features:

- Shows a table of layer configurations.
- Supports bulk precision updates.
- Supports per-layer overrides.
- Estimates output size from selected settings.
- Displays result status after a run.

Use it when a single global precision setting is too coarse for the quality and size tradeoff you need.

## Quality Validator

Route: `/quality`

Quality Validator checks whether a model candidate still meets your quality bar.

Key features:

- Quick perplexity mode.
- Full report mode.
- Custom prompt mode.
- Generation benchmark summaries.
- Comparison cards for results and timing.

Use it after every optimization pass. Do not export a candidate until validation is acceptable for your application.

## Knowledge Distillation

Route: `/distill`

Knowledge Distillation creates a compact student model using a larger teacher model.

Key features:

- Selects teacher and student sources.
- Selects training data.
- Shows training progress.
- Reports final candidate metrics.
- Provides export-ready output when the run succeeds.

Use it when you need a smaller model but want to preserve behavior from a larger source model.

## Model Merge

Route: `/merge`

Model Merge combines model or adapter sources into a new candidate.

Key features:

- Adds multiple source models or adapters.
- Configures merge inputs and output location.
- Shows task progress.
- Presents the resulting candidate after completion.

Use it when you want to combine compatible sources into one deployment candidate.

## Auto Tune

Route: `/auto-tune`

Auto Tune searches inference parameters for the loaded model on the current device.

Key features:

- Runs an automated benchmark for parameter choices.
- Shows the best configuration found.
- Caches results for later recall.
- Reports throughput and quality-oriented summary metrics.

Use it after the model candidate is selected, before final benchmark and export validation.
