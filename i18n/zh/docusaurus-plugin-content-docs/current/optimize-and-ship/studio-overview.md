---
sidebar_position: 1
title: Edge Studio 概览
---

# Edge Studio

Edge Studio 是用于模型优化的本地 Web 工作台。它接收源模型，并产出可部署产物：Edge Kit bundle、GGUF 文件，或完整 app 项目。

:::info Developer Preview
发布前请在目标设备上验证每个导出的模型。仅构建成功还不够。
:::

## 它的位置

```text
Source model → Edge Studio → Optimized bundle → Edge Kit (inference) → Your app
                                             → Edge Scaffold (app project)
```

Edge Studio 是离线优化工具。Edge Kit 是运行时。两者相互独立，你发布的 app 不依赖 Edge Studio。

## 如何启动

```bash
./run-web.sh
```

在 `http://localhost:5173` 打开。Backend 使用端口 `18842`。

## 两种模式

| 模式 | 适合 | 路由 |
|------|-----|-------|
| **Simple** | 首次使用者。引导式向导：检测设备 → 选择模型 → 优化 → 测试 → 导出。 | `/simple` |
| **Pro** | 完整工作台。20+ 个用于分析、优化、基准测试和导出的工具。 | `/dashboard` |

## 能力

| 领域 | 工具 |
|------|-------|
| 分析 | Architecture browser、weight analysis、activation heatmap、attention patterns、KV cache analysis、MoE analyzer、inference tracer、model comparison |
| 优化 | Advisor、auto optimizer、pipeline、pruning simulator、mixed precision、quality validator、distillation、merge、auto tune |
| 测试 | 多模态 chat（LLM/VLM/STT/TTS）、voice duplex |
| 批处理 | 多模型 benchmark dashboard、batch operations |
| 训练 | 基于本地数据的个人适配器训练 |
| 设备 | EdgeMesh 设备管理和配对 |

## 要求

- Python 3.11+，Node.js 18+
- 推荐：拥有足够内存来处理源模型的 Mac

## 下一步

- [优化与基准测试](/docs/optimize-and-ship/optimize-and-benchmark)
- [导出模型](/docs/optimize-and-ship/export)
