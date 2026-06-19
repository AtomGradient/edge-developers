---
sidebar_position: 1
title: Edge Studio Overview
---

# Edge Studio

Edge Studio is a local web workbench for model optimization, validation, export, and device coordination. It takes a source model and produces deployment-ready artifacts: Edge Kit bundles, GGUF/CoreML exports, Neural Imprint artifacts, or a complete Edge Scaffold project.

:::info Developer Preview
Validate every exported model on the target device before shipping. Build success alone is not sufficient.
:::

## Where it fits

```text
Source model → Edge Studio → Optimized bundle → Edge Kit (inference) → Your agent
                             Neural Imprint artifact → Edge Halo restore flow
                             Edge Scaffold project → Xcode → Your agent
```

Edge Studio is the local workbench. Edge Kit and Edge Halo are the runtime packages. They are separate — your shipping agent does not depend on Edge Studio.

## How to launch

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install edge-studio
edge studio
```

Open `http://127.0.0.1:18842`. For frontend development with Vite, see
[Install Edge Studio](/docs/get-started/source-build#launch-the-web-ui).

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
| Personalization | Neural Imprint generation, profile artifact inspection, model-matched profile resources, device backflow |
| Devices | EdgeMesh pairing, trusted peer state, capsule push/receive, apply-status receipts |

## Developer workflow

1. Load or select a source model.
2. Inspect model architecture and device fit.
3. Optimize and benchmark with the target device in mind.
4. Export an Edge Kit bundle or Edge Scaffold project.
5. Pair a test device with EdgeMesh when personalization or device receipts are needed.
6. Generate or inspect Neural Imprint artifacts locally.
7. Validate on a real device before shipping.

Edge Studio prepares and audits artifacts. Your shipping agent consumes those artifacts through Edge Kit and Edge Halo.

## Requirements

- Python 3.11+, Node.js 18+
- Recommended: Mac with sufficient memory for the source model

## Next steps

- [Optimize and benchmark](/docs/optimize-and-ship/optimize-and-benchmark)
- [Export models](/docs/optimize-and-ship/export)
