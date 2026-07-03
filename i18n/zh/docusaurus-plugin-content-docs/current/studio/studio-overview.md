---
sidebar_position: 1
title: Edge Studio 概览
---

# Edge Studio

Edge Studio 是本地 Web 工作台，用于模型优化、验证、导出和设备协同。它接收源模型，并产出可部署产物：Edge Kit bundle、GGUF/CoreML 导出、Neural Imprint 产物，或完整 Edge Scaffold 项目。

:::info 开发者预览
发布前请在目标设备上验证每个导出模型。仅构建成功还不够。
:::

## 它的位置

```text
Source model → Edge Studio → Optimized bundle → Edge Kit (inference) → Your agent
                             Neural Imprint 产物 → Edge Halo restore flow
                             Edge Scaffold project → Xcode → Your agent
```

Edge Studio 是本地工作台。Edge Kit 和二进制 Edge Halo package 是运行时包。它们相互独立，你发布的 agent 不依赖 Edge Studio。

## 如何启动

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install edge-studio
edge studio
```

打开 `http://127.0.0.1:18842`。如需用 Vite 做前端开发，见
[安装 Edge Studio](/docs/quickstart/install#启动-web-ui)。

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
| 个性化 | Neural Imprint 生成、profile artifact inspection、model-matched profile resources、device backflow |
| 设备 | EdgeMesh 配对、可信 peer 状态、capsule push/receive、apply-状态回执s |

## 开发者工作流

1. 加载或选择源模型。
2. 检查模型结构和设备适配情况。
3. 面向目标设备优化并基准测试。
4. 导出 Edge Kit bundle 或 Edge Scaffold 项目。
5. 当需要个性化或设备 receipt 时，用 EdgeMesh 配对测试设备。
6. 在本地生成或检查 Neural Imprint 产物。
7. 发布前在真实设备上验证。

Edge Studio 负责准备和审计 artifact。发布后的 agent 通过 Edge Kit 和 Edge Halo 消费这些 artifact。

## 要求

- Python 3.11+，Node.js 18+
- 推荐：拥有足够内存处理源模型的 Mac

## 下一步

- [优化与基准测试](/docs/studio/optimize-and-benchmark)
- [导出模型](/docs/studio/export)
