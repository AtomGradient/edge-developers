---
sidebar_position: 1
title: 5 分钟看懂本地学习
---

# 5 分钟看懂本地学习

这个教程只看一个可见结果：本地模型先回答一个问题，然后运行一次合成学习步骤，恢复本地 Neural Imprint 产物后，再给出不同的回答。

这个演示使用内置合成样本。它不会使用你的私人数据，不会修改模型权重，也不声称模型整体变聪明。它只说明：在一个受控样本里，本地学习产物可以改变模型行为。

## 你会看到什么

内置样本要教给模型的是：

- 偏好简洁的技术回答。
- 工作流说明要短、直接。
- 没有具体证据时，不要做质量提升类声明。

演示会问这个问题：

```text
How should this assistant respond to technical workflow questions?
```

学习前，模型可能会给出泛化的长框架。恢复合成纠错样本后，回答应该更接近：

```text
Provide short, direct summaries of the workflow steps. Avoid making quality
claims unless you have specific evidence to support them.
```

不同模型版本和采样结果会让具体文字略有变化，但终端会直接显示学习前和学习后的回答。

## 1. 安装 Edge Studio

创建 Python 3.11 环境，并安装开发者预览包：

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

源码安装和本地 UI 开发见 [源码安装](/docs/get-started/source-build)。

## 2. 准备演示模型

预览演示使用 `qwen3.5-9b-4bit`。

```bash
edge models where qwen3.5-9b-4bit
```

如果模型不存在，显式下载：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

演示不会静默下载模型。如果模型已经存在，下载命令会复用本地匹配项，并报告缓存路径。

## 3. 查看模型会学习什么

运行学习之前，先查看内置合成样本：

```bash
edge demo learn run --dry-run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

在输出里找到 `sample_text`：

```json
{
  "question": "How should this assistant respond to technical workflow questions?",
  "records": [
    {
      "kind": "preference",
      "text": "The synthetic user prefers concise technical answers."
    },
    {
      "kind": "trust_boundary",
      "text": "The synthetic user asks for local-only receipts before trusting a workflow."
    }
  ],
  "corrections": [
    {
      "correction_type": "profile_correction",
      "target": {"profile_field": "answer_style"},
      "correction": {
        "profile_overlay": {
          "style": "short direct summaries",
          "boundary": "avoid quality claims without evidence"
        }
      }
    }
  ]
}
```

这个 dry run 不加载模型、不写演示状态、不恢复产物，也不联网。它只是让你看到这次合成学习到底会学习什么。

## 4. 运行学习演示

运行本地学习流程，并让 CLI 打印学习前和学习后的文本：

```bash
edge demo learn run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 64 \
  --include-text
```

这里可以使用 `--include-text`，因为样本是合成的。不要把这个选项用于你不希望打印到终端或写入本地回执的私人 prompt 或真实用户数据。

你会看到类似这样的输出：

```text
Edge demo learn (edge.demo.learn.run.v1)
status: completed
model: qwen3.5-9b-4bit
sample: synthetic_profile_correction_v1
answers_differ: true
receipt: .../learn_receipt.json
raw_text_in_receipt: true

[Before]
To respond effectively to technical workflow questions, an assistant should
adopt a structured, user-centric, and context-aware approach...

[After]
Provide short, direct summaries of the workflow steps. Avoid making quality
claims unless you have specific evidence to support them.
```

重点不是每个字完全一致。重点是：学习后的回答反映了第 3 步里你亲眼看到的合成纠错内容。

## 5. 理解结果

这条命令在本地做了四件事：

1. 把合成记录写入隔离的演示状态。
2. 记录合成纠错。
3. 生成并恢复本地 Neural Imprint 产物。
4. 对比恢复前和恢复后的回答。

`answers_differ: true` 表示：对这个合成样本，恢复本地 Neural Imprint 产物后，回答发生了变化。

它不表示：

- 基础模型权重被修改了。
- 模型整体变聪明了。
- 你的私人数据被使用了。
- 生产级学习流水线已经开启。

默认情况下，回执是本地的，并且只记录哈希。本教程使用 `--include-text`，只是因为样本是合成的，本来就用于阅读和演示。

## 可选：普通聊天

你也可以运行普通本地聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive
```

第一次加载模型可能需要几秒或更久，取决于你的 Mac 和磁盘缓存。看到 `[chat:ready]` 后，可以提问，并用 `/exit` 退出。

这个聊天命令适合体验模型。上面的学习演示命令才会打印受控的学习前和学习后对比。

## 进阶检查

不重新加载模型也可以检查回执：

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

理解第一个演示后，也可以再看更底层的 Neural Imprint 命令：

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

这些是实现层检查，不是 5 分钟演示必须执行的步骤。
