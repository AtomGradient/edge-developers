---
sidebar_position: 5
title: Studio UI Reference
---

# Studio UI reference

A quick reference for every route in the Edge Studio web interface. For the main workflow, see [Studio overview](/docs/studio/studio-overview) and [Optimize and benchmark](/docs/studio/optimize-and-benchmark).

## Simple mode

| Route | Page | What it does |
|-------|------|-------------|
| `/simple` | Device profile | Auto-detect hardware, show AI capability rating |
| `/simple/focus` | Focus selection | Choose: Chat, Coding, Vision, ASR, TTS, or Voice Duplex |
| `/simple/tier` | Tier selection | Pick model size: Standard / Pro / Max / Ultra |
| `/simple/setup` | Setup | Download model, load, test with embedded panel |
| `/simple/done` | Complete | Success state, path to export |
| `/simple/export/device` | Export device | Choose iPhone or iPad target |
| `/simple/export/generate` | Export generate | Device-fit check, app generation |

## Pro mode — Dashboard

| Route | Page | What it does |
|-------|------|-------------|
| `/dashboard` | Pro dashboard | Stage-aware cockpit: loaded → profiled → optimized → exported |

## Pro mode — Analysis

| Route | Page | What it does |
|-------|------|-------------|
| `/architecture` | Architecture browser | Layer tree, parameter counts, 3D view |
| `/weights` | Weight analysis | Tensor sizes, distributions, outliers |
| `/activation` | Activation heatmap | Per-layer activation magnitudes |
| `/attention` | Attention patterns | Head importance, matrix views |
| `/kv-cache` | KV cache analysis | Memory projections, device-fit table |
| `/moe` | MoE analyzer | Expert routing and load balance |
| `/inference` | Inference tracer | Token probabilities, step-by-step |
| `/comparison` | Model comparison | Side-by-side A vs B |

## Pro mode — Optimization

| Route | Page | What it does |
|-------|------|-------------|
| `/optimization` | Advisor | Recommended optimization plan |
| `/auto-optimizer` | Auto optimizer | Automated candidate search |
| `/pipeline` | Pipeline | Manual step-by-step optimization |
| `/pruning` | Pruning simulator | Preview size reduction |
| `/mixed-precision` | Mixed precision | Per-layer bit-width control |
| `/quality` | Quality validator | Perplexity, benchmark, custom prompts |
| `/distill` | Distillation | Student model from teacher |
| `/merge` | Merge | Combine compatible model sources |
| `/auto-tune` | Auto tune | Search inference parameters |

## Pro mode — Testing

| Route | Page | What it does |
|-------|------|-------------|
| `/chat` | Chat | Multi-modal: LLM / VLM / STT / TTS |
| `/duplex` | Duplex chat | Voice conversation: ASR → LLM → TTS |

## Pro mode — Batch

| Route | Page | What it does |
|-------|------|-------------|
| `/benchmark-dashboard` | Benchmark dashboard | Multi-model benchmark, Plotly charts, CSV export |
| `/batch` | Batch operations | Queue multiple models for optimization |

## Pro mode — Other

| Route | Page | What it does |
|-------|------|-------------|
| `/neural-imprint-chat` | Neural Imprint Chat | Preview a generated Neural Imprint artifact with a Mac-side base model |
| `/devices` | Devices | EdgeMesh device management and pairing |
| `/export` | Export | Wizard-style export flow |
