---
sidebar_position: 5
title: Studio UI 速查
---

# Studio UI 速查

Edge Studio Web 界面每个路由的速查。主工作流见 [Studio 概览](/docs/studio/studio-overview) 和 [优化与基准测试](/docs/studio/optimize-and-benchmark)。

## Simple mode

| Route | Page | 作用 |
|-------|------|-------------|
| `/simple` | Device profile | 自动检测硬件，显示 AI 能力评级 |
| `/simple/focus` | Focus selection | 选择 Chat、Coding、Vision、ASR、TTS 或 Voice Duplex |
| `/simple/tier` | Tier selection | 选择模型尺寸：Standard / Pro / Max / Ultra |
| `/simple/setup` | Setup | 下载模型、加载，并用内嵌面板测试 |
| `/simple/done` | Complete | 成功状态，进入导出路径 |
| `/simple/export/device` | Export device | 选择 iPhone 或 iPad 目标 |
| `/simple/export/generate` | Export generate | 设备适配检查，生成 app |

## Pro mode — Dashboard

| Route | Page | 作用 |
|-------|------|-------------|
| `/dashboard` | Pro dashboard | 阶段感知 cockpit：loaded → profiled → optimized → exported |

## Pro mode — Analysis

| Route | Page | 作用 |
|-------|------|-------------|
| `/architecture` | Architecture browser | Layer tree、参数数量、3D 视图 |
| `/weights` | Weight analysis | Tensor 尺寸、分布、异常值 |
| `/activation` | Activation heatmap | 按 layer 显示 activation magnitude |
| `/attention` | Attention patterns | Head 重要性、matrix 视图 |
| `/kv-cache` | KV cache analysis | 内存预测、设备适配表 |
| `/moe` | MoE analyzer | Expert routing 和负载均衡 |
| `/inference` | Inference tracer | Token 概率、逐步追踪 |
| `/comparison` | Model comparison | A/B 并排对比 |

## Pro mode — Optimization

| Route | Page | 作用 |
|-------|------|-------------|
| `/optimization` | Advisor | 推荐优化计划 |
| `/auto-optimizer` | Auto optimizer | 自动搜索候选 |
| `/pipeline` | Pipeline | 手动分步骤优化 |
| `/pruning` | Pruning simulator | 预览尺寸缩减 |
| `/mixed-precision` | Mixed precision | 按 layer 控制 bit-width |
| `/quality` | Quality validator | Perplexity、benchmark、自定义 prompts |
| `/distill` | Distillation | 从 teacher 训练 student 模型 |
| `/merge` | Merge | 合并兼容模型来源 |
| `/auto-tune` | Auto tune | 搜索推理参数 |

## Pro mode — Testing

| Route | Page | 作用 |
|-------|------|-------------|
| `/chat` | Chat | 多模态：LLM / VLM / STT / TTS |
| `/duplex` | Duplex chat | 语音对话：ASR → LLM → TTS |

## Pro mode — Batch

| Route | Page | 作用 |
|-------|------|-------------|
| `/benchmark-dashboard` | Benchmark dashboard | 多模型 benchmark、Plotly 图表、CSV 导出 |
| `/batch` | Batch operations | 将多个模型排队优化 |

## Pro mode — Other

| Route | Page | 作用 |
|-------|------|-------------|
| `/neural-imprint-chat` | Neural Imprint Chat | 使用 Mac 端 base model 预览已生成的 Neural Imprint 产物 |
| `/devices` | Devices | EdgeMesh 设备管理和配对 |
| `/export` | Export | 向导式导出流程 |
