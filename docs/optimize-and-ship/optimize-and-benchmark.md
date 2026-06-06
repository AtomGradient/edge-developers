---
sidebar_position: 2
title: Optimize & Benchmark
---

# Optimize and benchmark

Edge Studio's core loop: analyze a model, apply optimization, benchmark the result, repeat until the candidate fits your target device.

## Analysis

Before optimizing, understand the model:

| Tool | What it shows | When to use |
|------|-------------|-------------|
| Architecture browser | Layer tree, parameter counts, types | First load — understand structure |
| Weight analysis | Tensor sizes, data types, distributions | Identify what dominates memory |
| Activation heatmap | Layer-level activation magnitudes | After profiling — find hotspots |
| Attention patterns | Head importance, attention traces | Debug generation quality |
| KV cache analysis | Memory projections for conversation length | Plan multi-turn memory budget |
| MoE analyzer | Expert routing and utilization | MoE models only |
| Inference tracer | Token probabilities, step timing | Debug specific outputs |
| Model comparison | Side-by-side original vs optimized | After optimization |

## Optimization

| Tool | What it does | Best for |
|------|-------------|----------|
| **Auto optimizer** | Searches candidates automatically | Quick start — let Studio decide |
| **Optimization pipeline** | Step-by-step manual control | Precise tuning of each stage |
| **Pruning simulator** | Preview size reduction before applying | Estimating if a target is realistic |
| **Mixed precision** | Per-layer quantization bit-width | Fine-grained quality/size balance |
| **Distillation** | Train a smaller student from a teacher | Creating compact models |
| **Merge** | Combine compatible model sources | Assembling from multiple sources |
| **Auto tune** | Search inference parameters | Finding optimal device config |

## Quality validation

After every optimization pass:

1. Run the **Quality validator** — perplexity check, full report, or custom prompts.
2. Compare with the original in **Model comparison**.
3. Test in **Chat** with your real use-case prompts.
4. Do not export until validation passes.

## Batch operations

**Benchmark dashboard** — Run benchmarks across multiple models. Plotly charts, CSV export, side-by-side comparison.

**Batch operations** — Queue multiple models for optimization. Progress tracking, failure post-mortem.

Use batch tools when evaluating a model catalog or running regression checks across candidates.

## Next steps

- [Export models](/docs/optimize-and-ship/export) — Output formats and validation.
- [Edge Scaffold](/docs/optimize-and-ship/scaffold) — Generate a publishable app.
