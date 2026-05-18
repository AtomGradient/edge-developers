---
sidebar_position: 5
title: Analysis Tools
---

# Analysis tools

{/* CODEX: Write guide for ALL analysis tools. Each gets its own h2 section:

  ## Architecture Browser (/architecture)
  ArchitectureBrowser.tsx — "Model X-ray" for on-device optimization.
  Shows: layer tree structure, parameter counts per layer, layer types.
  Interactive: expand/collapse layers, search, filter by type.
  Use case: understand model structure before optimization.

  ## Weight Analysis (/weights)
  WeightAnalysis.tsx — "Weight X-ray" for the loaded model.
  Shows: weight distribution histograms, outlier detection, per-layer statistics.
  Interactive: select layers, zoom into distributions.
  Use case: identify layers with unusual weight patterns.

  ## Activation Heatmap (/activation)
  ActivationHeatmap.tsx — Visualizes activation patterns across layers.
  Shows: heatmap of activation magnitudes, per-layer activation statistics.
  Use case: identify layers with high/low activation for optimization decisions.

  ## Attention Patterns (/attention)
  AttentionPatterns.tsx — Visualizes attention head behavior.
  Shows: attention weight matrices, head importance scores.
  Interactive: select specific heads, zoom into patterns.
  Use case: understand which attention heads are most active.

  ## KV Cache Analysis (/kv-cache)
  KVCacheAnalysis.tsx — "KV Cache X-ray."
  Shows: cache size estimation per conversation length, memory projections.
  Use case: understand memory requirements for multi-turn conversations on target devices.

  ## MoE Analyzer (/moe)
  MOEAnalyzer.tsx — Mixture-of-Experts analysis.
  Shows: expert routing patterns, expert utilization, load balance.
  Use case: understand MoE models before deployment.

  ## Inference Tracer (/inference)
  InferenceTracer.tsx — Token-level inference visualization.
  Shows: token probabilities, top-k candidates at each step.
  Interactive: step through generation, view probability distributions.
  Use case: debug generation quality, understand model confidence.

  ## Model Comparison (/comparison)
  ModelComparison.tsx — A vs B comparison X-ray.
  Shows: side-by-side comparison of two model variants (original vs optimized).
  Compares: size, parameter counts, layer structures, benchmark results.
  Use case: validate optimization didn't degrade model quality.

  DO NOT expose: analysis algorithm implementations, internal scoring methods, specific heuristics.
*/}
