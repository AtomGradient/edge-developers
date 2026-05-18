---
sidebar_position: 1
title: Edge Studio Overview
---

# Edge Studio

Edge Studio is a local web workbench for model optimization. It takes a source model and produces a deployment-ready artifact — an Edge Kit bundle, a GGUF file, or a complete app project.

:::info Developer Preview
Validate every exported model on the target device before shipping. Build success alone is not sufficient.
:::

## Where it fits

```text
Source model → Edge Studio → Optimized bundle → Edge Kit (inference) → Your app
                                             → Edge Scaffold (app project)
```

Edge Studio is the offline optimization tool. Edge Kit is the runtime. They are separate — your shipping app does not depend on Edge Studio.

## How to launch

```bash
./run-web.sh
```

Opens at `http://localhost:5173`. Backend on port `18842`.

## Two modes

| Mode | For | Route |
|------|-----|-------|
| **Simple** | First-time users. Guided wizard: detect device → pick model → optimize → test → export. | `/simple` |
| **Pro** | Full workbench. 20+ tools for analysis, optimization, benchmark, export. | `/dashboard` |

## Capabilities

| Area | Tools |
|------|-------|
| Analysis | Architecture browser, weight analysis, activation heatmap, attention patterns, KV cache analysis, MoE analyzer, inference tracer, model comparison |
| Optimization | Advisor, auto optimizer, pipeline, pruning simulator, mixed precision, quality validator, distillation, merge, auto tune |
| Testing | Multi-modal chat (LLM/VLM/STT/TTS), voice duplex |
| Batch | Multi-model benchmark dashboard, batch operations |
| Training | Personal adapter training from local data |
| Devices | EdgeMesh device management and pairing |

## Requirements

- Python 3.11+, Node.js 18+
- Recommended: Mac with sufficient memory for the source model

## Next steps

- [Optimize and benchmark](/docs/optimize-and-ship/optimize-and-benchmark)
- [Export models](/docs/optimize-and-ship/export)
