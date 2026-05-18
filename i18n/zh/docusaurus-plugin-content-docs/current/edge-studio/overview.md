---
sidebar_position: 1
title: Overview
---

# Edge Studio

Edge Studio is a model optimization workbench for preparing models for on-device deployment.

:::info Developer Preview
Edge Studio is in **Developer Preview**. Validate every exported model with Edge Kit on the target device before shipping.
:::

## What it does

Edge Studio helps you:

- Load and inspect model architecture.
- Analyze size and device fit.
- Apply model optimization.
- Benchmark each candidate.
- Export to Edge Kit, GGUF, CoreML, or Edge Scaffold.

## Pipeline

```text
Load model -> Analyze -> Optimize -> Benchmark -> Export -> Ship
```

## Capabilities

| Capability | Description |
| --- | --- |
| Architecture support | 117+ model architectures in the analyzer. |
| Model catalog | 210+ model entries with device-oriented recommendations. |
| Quality tracking | Benchmark and quality checks after optimization steps. |
| Export | Edge Kit native bundles, GGUF, CoreML, and Edge Scaffold projects. |
| App generation | Create a ready-to-build iOS project through Edge Scaffold. |

## Typical workflow

1. Select a source model.
2. Choose the target device class.
3. Run analysis.
4. Apply optimization.
5. Benchmark the optimized model.
6. Export the model or a full Edge Scaffold app.

## Next steps

- [Model optimization](/docs/edge-studio/optimization)
- [Export](/docs/edge-studio/export)
- [Edge Scaffold overview](/docs/deployment/app-scaffold)
