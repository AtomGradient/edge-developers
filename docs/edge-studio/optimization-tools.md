---
sidebar_position: 6
title: Optimization Tools
---

# Optimization tools

{/* CODEX: Write guide for ALL optimization tools. Each gets its own h2 section:

  ## Optimization Advisor (/optimization)
  OptimizationAdvisor.tsx — AI-powered optimization recommendations.
  Shows: suggested optimization strategy based on model analysis and target device.
  Use case: get a starting point for optimization before manual tuning.

  ## Auto Optimizer (/auto-optimizer)
  AutoOptimizer.tsx — Automated optimization with quality monitoring.
  Runs optimization steps automatically, monitoring quality metrics at each step.
  Shows: progress, quality scores, before/after comparison.
  Use case: one-click optimization for common scenarios.

  ## Optimization Pipeline (/pipeline)
  OptimizationPipeline.tsx — Step-by-step manual optimization pipeline.
  Shows: ordered list of optimization stages, current progress, results per stage.
  User controls: which stages to run, stage parameters.
  Use case: fine-grained control over the optimization process.

  ## Pruning Simulator (/pruning)
  PruningSimulator.tsx — Simulate the effect of reducing model size.
  Shows: projected size reduction, quality impact estimation, protected layers.
  Interactive: adjust parameters, select which layers to protect.
  Use case: preview optimization impact before committing.

  ## Mixed Precision Panel (/mixed-precision)
  MixedPrecisionPanel.tsx — Per-layer quantization bit-width selection.
  Shows: table of all layers with current and target precision.
  Interactive: set individual layer quantization (2/4/8/16 bit).
  Use case: fine-tune quantization for optimal quality/size balance.

  ## Quality Validator (/quality)
  QualityValidator.tsx — Validate model quality after optimization.
  Shows: perplexity scores, benchmark results, comparison with baseline.
  Use case: confirm optimization didn't degrade quality below acceptable threshold.

  ## Knowledge Distillation (/distill)
  DistillPage.tsx — Train a smaller student model from a larger teacher.
  Shows: teacher/student selection, training progress, quality comparison.
  Use case: create a compact model that preserves knowledge from a larger one.

  ## Model Merge (/merge)
  MergePage.tsx — Merge multiple models or adapters.
  Shows: source model selection, merge strategy, result preview.
  Use case: combine strengths of different models or adapters.

  ## Auto Tune (/auto-tune)
  AutoTunePage.tsx — Automated hyperparameter tuning.
  Shows: parameter search progress, best configuration found.
  Use case: find optimal inference parameters for a specific model + device combination.

  DO NOT expose: pruning algorithms, optimization heuristics, quality scoring formulas, distillation implementation, merge strategies.
  Keep descriptions at "what it does for the user" level, not "how it works" level.
*/}
