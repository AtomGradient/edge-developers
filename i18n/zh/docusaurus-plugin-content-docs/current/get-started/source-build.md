---
sidebar_position: 2
title: 从源码安装 Edge Studio
---

# 从源码安装 Edge Studio CLI 和 Web UI

在开发者预览阶段，可运行的安装路径是从 `edge-studio` 仓库源码安装。正式公开发布时，预期安装命令是 `python -m pip install edgestudio`，但当前软件包尚未发布到 PyPI。

:::info 预览访问权限
在开发者预览仍未公开的阶段，该仓库可能需要 AtomGradient 预览访问权限。请先确认你的 GitHub 账号已经开通访问权限，再运行下面的命令。
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

使用 `edge` 检查模型就绪状态、写入模型下载回执，并运行本地学习演示：

```bash
edge models where qwen3.5-9b-4bit --json
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive
```

`edge models fetch --source auto` 可以在 ModelScope、Hugging Face 或 HF 镜像中选择当前可用的预览下载路径。下载行为是显式的，并会写入下载回执。

看到 `[chat:ready]` 后，可以连续问几个普通问题，并用 `/exit` 退出。第一次加载 9B 模型可能需要几十秒。

基础对话跑通后，继续看 [CLI 学习演示](/docs/get-started/minute-demo)，检查合成纠错样本，并对比基础回答和 Neural Imprint 恢复后的回答哈希。

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

服务默认只运行在本机地址。用 `Ctrl+C` 停止。

## 本地构建 wheel

需要验证未来 pip 软件包形态时，运行发布打包脚本：

```bash
./scripts/build_wheel.sh
```

该脚本会构建前端、打包后端资源，并把 wheel 写入 `dist/`。
