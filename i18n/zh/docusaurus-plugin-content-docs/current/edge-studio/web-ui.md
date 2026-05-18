---
sidebar_position: 2
title: Web UI 总览
---

# Edge Studio web interface

Edge Studio web interface 是一个本地工作台，用于加载、检查、优化、测试和导出模型。

:::info 开发者预览
Web interface 目前处于**开发者预览**阶段。发布前请在目标设备上验证每个优化或导出的模型。
:::

## 如何启动

使用 Edge Studio 仓库中的项目 launcher：

```bash
./run-web.sh
```

launcher 会在端口 `18842` 启动本地服务，并在端口 `5173` 启动 Vite frontend。打开：

```text
http://localhost:5173
```

开发期间也可以分别启动两个进程：

| 进程 | 命令 |
| --- | --- |
| 本地服务 | `python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 18842 --reload --reload-dir backend` |
| Frontend | `cd frontend && npx vite --host` |

## 模式

| 模式 | Route | 用途 |
| --- | --- | --- |
| 简单模式 | `/simple` | 面向首次用户的引导式向导。从设备检测一路走到模型设置和 app 导出。 |
| Pro mode | `/dashboard` | 完整工作台，包含分析、优化、benchmark、聊天、导出、训练和设备工具。 |

## 导航

简单模式是线性的。每一步收集一个决策，然后前进到下一个 route。Simple shell 会在整个向导中显示进度、设备状态和紧凑 assistant panel。

Pro mode 使用侧边栏。先加载模型，然后打开任何可用工具。某些工具需要 activation profile、trace、comparison model，或支持所选工作流的模型类别。

## 要求

| 要求 | 说明 |
| --- | --- |
| Python | Python 3.11 或更新。 |
| Node.js | Node.js 18 或更新。 |
| 硬件 | 推荐使用 Apple Silicon Mac 进行本地 GPU 推理和导出验证。 |
| 模型 | 支持格式的本地模型文件，包括基于 `safetensors` 的目录。 |

## 覆盖的 Routes

| 区域 | Routes |
| --- | --- |
| Simple wizard | `/simple`, `/simple/focus`, `/simple/tier`, `/simple/setup`, `/simple/done`, `/simple/export/device`, `/simple/export/generate` |
| Legacy wizard | `/simple/v1`, `/simple/v1/device`, `/simple/v1/pick-model`, `/simple/v1/optimize`, `/simple/v1/test`, `/simple/v1/export` |
| Pro dashboard | `/dashboard` |
| Analysis | `/architecture`, `/weights`, `/activation`, `/attention`, `/kv-cache`, `/moe`, `/inference`, `/comparison` |
| Optimization | `/optimization`, `/auto-optimizer`, `/pipeline`, `/pruning`, `/mixed-precision`, `/quality`, `/distill`, `/merge`, `/auto-tune` |
| Testing | `/chat`, `/duplex` |
| Batch and benchmark | `/benchmark-dashboard`, `/batch` |
| Training and devices | `/personal-training`, `/devices` |
