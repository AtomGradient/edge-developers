---
sidebar_position: 2
title: 安装 Edge Studio
sidebar_label: 1. 安装 Edge Studio
---

# 安装 Edge Studio

常规本地开发先创建并激活 Python 3.11 环境，再从 Python 软件包安装 Edge Studio：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

如果你使用 `uv`：

```bash
uv venv --python 3.11 .venv
source .venv/bin/activate
uv pip install --upgrade --pre edge-studio
edge doctor
```

`--pre` 会安装当前开发者预览版 release candidate。在第一个 stable package 发布前，请保留这个参数。`edge doctor` 会检查 Python 环境、模型路径和系统兼容性；继续之前请先修复失败项。

## 要求

| 要求 | 版本 |
| --- | --- |
| macOS | 14 或更高 |
| 硬件 | Apple Silicon |
| Python | 推荐 3.11 |
| Node.js | 安装后的 Studio UI 不需要 |

使用 `edge` 检查模型就绪状态、写入模型下载回执，并运行本地学习演示：

```bash
edge models where qwen3.5-9b-4bit --json
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive
```

`edge models fetch --source auto` 可以在 ModelScope、Hugging Face 或 HF 镜像中选择当前可用的预览下载路径。下载行为是显式的，并会写入下载回执。
`qwen3.5-9b-4bit` 下载大小约 5 GB，耗时取决于你的网络。

看到 `[chat:ready]` 后，可以连续问几个普通问题，并用 `/exit` 退出。第一次加载 9B 模型可能需要几十秒。

基础对话跑通后，继续看 [构建第一个设备 Agent](/docs/get-started/minute-demo)，检查合成理财信号，并看到用户特定学习在不创建新模型 release 的情况下被恢复。然后把同一套生命周期导出进一个 [Agent 载体](/docs/examples/build-and-ship)。

## 启动 Web UI

安装后的软件包只暴露一个 `edge` 命令。用下面的命令启动本地 Studio UI 和 API server：

```bash
edge studio
```

打开：

```text
http://127.0.0.1:18842
```

服务默认只运行在本机地址。用 `Ctrl+C` 停止。
