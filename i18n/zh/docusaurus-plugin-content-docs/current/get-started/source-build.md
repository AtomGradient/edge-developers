---
sidebar_position: 2
title: 从源码安装 Edge Studio
---

# 从源码安装 Edge Studio CLI 和 Web UI

在 Developer Preview 阶段，可运行的 package 路径是 `edge-studio` 仓库的源码 checkout。正式公开发布时，预期安装命令是 `python -m pip install edgestudio`，但当前 package 尚未发布到 PyPI。

:::info Preview access
在 Developer Preview 仍为 private 的阶段，该仓库可能需要 AtomGradient preview access。请先确认你的 GitHub 账号已经开通访问权限，再运行下面的命令。
:::

## 要求

| 要求 | 版本 |
| --- | --- |
| macOS | 14 或更高 |
| 硬件 | Apple Silicon |
| Python | 推荐 3.11 |
| Node.js | 只有构建或开发 Web UI 时需要 |

## 安装 CLI

```bash
git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
edge doctor
```

使用 `edge` 检查模型就绪状态、写入模型下载 receipt，并运行本地学习 demo：

```bash
edge models where qwen3.5-9b-4bit --json
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --prompt "What is edge AI?" --max-tokens 64
```

`edge models fetch --source auto` 可以在 ModelScope、Hugging Face 或 HF mirror 中选择当前可用的预览下载路径。下载行为是显式的，并会写入 receipt。

base chat 跑通后，继续看 [CLI 学习 demo](/docs/get-started/minute-demo)，检查 synthetic correction sample，并对比 base answer 和 Neural Imprint restore 后的 answer hash。

## 启动 Web UI

Web UI 路径需要先构建一次前端资源，然后启动本地服务：

```bash
npm --prefix frontend ci
npm --prefix frontend run build
edgestudio
```

打开：

```text
http://127.0.0.1:18842
```

服务默认运行在 localhost。用 `Ctrl+C` 停止。

## 本地构建 wheel

需要验证未来 pip package 形态时，运行 release packaging 脚本：

```bash
./scripts/build_wheel.sh
```

该脚本会构建前端、打包后端资源，并把 wheel 写入 `dist/`。
