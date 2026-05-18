---
sidebar_position: 2
title: Web UI Overview
---

# Edge Studio web interface

The Edge Studio web interface is a local workbench for loading, inspecting, optimizing, testing, and exporting models.

:::info Developer Preview
The web interface is in **Developer Preview**. Validate every optimized or exported model on the target device before shipping.
:::

## How to launch

Use the project launcher from the Edge Studio repository:

```bash
./run-web.sh
```

The launcher starts the local service on port `18842` and the Vite frontend on port `5173`. Open:

```text
http://localhost:5173
```

You can also start the two processes separately during development:

| Process | Command |
| --- | --- |
| Local service | `python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 18842 --reload --reload-dir backend` |
| Frontend | `cd frontend && npx vite --host` |

## Modes

| Mode | Route | Use it for |
| --- | --- | --- |
| Simple mode | `/simple` | A guided wizard for first-time users. It walks from device detection to model setup and app export. |
| Pro mode | `/dashboard` | A full workbench with analysis, optimization, benchmark, chat, export, training, and device tools. |

## Navigation

Simple mode is linear. Each step collects one decision, then advances to the next route. The Simple shell shows progress, device status, and a compact assistant panel across the wizard.

Pro mode uses the sidebar. Load a model first, then open any available tool. Some tools require an activation profile, a trace, a comparison model, or a model category that supports the selected workflow.

## Requirements

| Requirement | Notes |
| --- | --- |
| Python | Python 3.11 or newer. |
| Node.js | Node.js 18 or newer. |
| Hardware | Apple Silicon Mac is recommended for local GPU inference and export validation. |
| Models | Local model files in a supported format, including `safetensors`-based directories. |

## Routes covered

| Area | Routes |
| --- | --- |
| Simple wizard | `/simple`, `/simple/focus`, `/simple/tier`, `/simple/setup`, `/simple/done`, `/simple/export/device`, `/simple/export/generate` |
| Legacy wizard | `/simple/v1`, `/simple/v1/device`, `/simple/v1/pick-model`, `/simple/v1/optimize`, `/simple/v1/test`, `/simple/v1/export` |
| Pro dashboard | `/dashboard` |
| Analysis | `/architecture`, `/weights`, `/activation`, `/attention`, `/kv-cache`, `/moe`, `/inference`, `/comparison` |
| Optimization | `/optimization`, `/auto-optimizer`, `/pipeline`, `/pruning`, `/mixed-precision`, `/quality`, `/distill`, `/merge`, `/auto-tune` |
| Testing | `/chat`, `/duplex` |
| Batch and benchmark | `/benchmark-dashboard`, `/batch` |
| Training and devices | `/personal-training`, `/devices` |
