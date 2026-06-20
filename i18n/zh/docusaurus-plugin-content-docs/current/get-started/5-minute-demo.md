---
sidebar_position: 1
title: 5 分钟看懂本地学习
slug: /get-started/minute-demo
---

# 5 分钟看懂本地学习

当前预览版可运行。

这个教程只看一个可见结果：你先和本地模型对话，运行一次合成学习步骤，然后加载本地 Neural Imprint 产物，再和模型对话一次。

这个演示使用内置合成样本。它不会使用你的私人数据，不会修改模型权重，整个流程都在本机完成。这个演示要展示的是 Neural Imprint 的核心契约：本地模型可以保持基础模型包不变，同时在运行时恢复用户特定的学习产物。

## 它适合哪些端侧 AI 场景

Neural Imprint 面向的是端侧 AI 产品：模型在本地运行，但产品又需要用户特定行为，同时不上传私人状态、不修改基础模型权重，也不把私有 profile 文本塞进每一次 prompt。

这是 Neural Imprint 在端侧 AI 里的核心优势。Fine-tuning 和 LoRA 会把个性化变成训练和模型发布问题；prompt stuffing 会把个性化变成每次请求里反复拼接私有文本的问题。Neural Imprint 把个性化保持为围绕兼容基础模型的本地、可删除运行时状态。

典型场景包括：

- 本地助手适应用户的回答风格、信任边界或工作流偏好。
- app 自有 copilot 把产品内记忆留在设备上，而不是发送到远端服务。
- 隐私敏感、离线、合规或企业场景中，用户状态需要保持本地并可删除。
- 设备或 app 恢复个性化状态时，必须先通过 compatibility gates，才能激活。
- 开发者在构建产品 UI、删除控制和任务级质量评估前，先在本地验证学习闭环。

这个教程使用合成 CLI 样本，是为了让行为可见。生产 app 仍然需要明确的用户授权、app 自有存储策略、删除 UX、兼容性检查和针对具体任务的评估。

## 你会看到什么

内置样本要教给模型的是：

- 偏好简洁的技术回答。
- 工作流说明要短、直接。
- 没有具体证据时，不要做质量提升类声明。

演示会问这个问题：

```text
How should this assistant respond to technical workflow questions?
```

学习前，模型可能会给出泛化的长框架。加载合成纠错样本后，回答应该更接近：

```text
Provide short, direct summaries of the workflow steps. Avoid making quality
claims unless you have specific evidence to support them.
```

不同模型版本和采样结果会让具体文字略有变化，但这个终端流程会让你用同一个问题，对比学习前和学习后的对话。

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

`--pre` 会安装当前开发者预览版 release candidate。在第一个 stable package 发布前，请保留这个参数。`edge doctor` 会检查 Python 环境、模型路径和系统兼容性；继续之前请先修复失败项。

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
`qwen3.5-9b-4bit` 下载大小约 5 GB，耗时取决于你的网络。

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

## 4. 学习前先聊天

先启动基础模型的交互式聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive
```

输入演示问题：

```text
[chat:load] loading model=Qwen3.5-9B-4bit (first load can take 30-90s)
[chat:ready] type a message, /exit to quit
you> How should this assistant respond to technical workflow questions?
assistant> A good assistant should first understand the user's goal, identify
the relevant workflow constraints, break the problem into steps, and explain
tradeoffs clearly...
you> /exit
```

这是基础模型的回答。此时还没有加载合成学习产物。

## 5. 运行学习演示

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
artifact: .../neural_imprint_full_cache.safetensors
metadata: .../neural_imprint_metadata.json
answers_differ: true
receipt: .../learn_receipt.json
next: edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
raw_text_in_receipt: true

[Before]
To respond effectively to technical workflow questions, an assistant should
adopt a structured, user-centric, and context-aware approach...

[After]
Provide short, direct summaries of the workflow steps. Avoid making quality
claims unless you have specific evidence to support them.
```

重点不是每个字完全一致。重点是：学习后的回答反映了第 3 步里你亲眼看到的合成纠错内容。

`next:` 这一行就是下一步命令的交接点。它会把 `learn_receipt.json` 传给
`--with-imprint`。你不需要自己去找或传底层 artifact 文件；CLI 会读取这个回执，并恢复回执里记录的 Neural Imprint 产物。

## 6. 学习后再聊天

复制第 5 步输出里的 `next:` 整行并运行。它看起来像这样：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
```

继续问同一个问题：

```text
[chat:load] loading model=Qwen3.5-9B-4bit (first load can take 30-90s)
[chat:imprint] restoring artifact=.../neural_imprint_full_cache.safetensors
[chat:ready] type a message, /exit to quit
you> How should this assistant respond to technical workflow questions?
assistant> Provide short, direct summaries of the workflow steps. Avoid making
quality claims unless you have specific evidence to support them.
you> /exit
```

第二次聊天仍然完全在本地完成。`--with-imprint` 会读取已完成的学习回执，恢复生成出来的 Neural Imprint 产物；如果回执或产物不存在，命令会直接失败，而不是静默退回基础模型聊天。

## 7. 理解结果

这条命令在本地做了四件事：

1. 把合成记录写入隔离的演示状态。
2. 记录合成纠错。
3. 生成并恢复本地 Neural Imprint 产物。
4. 对比恢复前和恢复后的回答。

`answers_differ: true` 表示：对这个合成样本，恢复本地 Neural Imprint 产物后，回答发生了变化。

默认情况下，回执是本地的，并且只记录哈希。本教程使用 `--include-text`，只是因为样本是合成的，本来就用于阅读和演示。

不使用 `--include-text` 时，回执保留的是哈希标识符，不保存原始用户文本：

```json
{
  "raw_text_included": false,
  "network_used_during_demo": false,
  "network_used_during_model_prepare": false,
  "question_sha256": "sha256:...",
  "before_answer_sha256": "sha256:...",
  "after_answer_sha256": "sha256:..."
}
```

local-only 检查会在产物或 metadata 缺失时失败即关闭，并检查非本机地址网络访问。你要观察的结果很直接：恢复本地 Neural Imprint 产物后行为发生变化。

## 常见问题

### 这是 fine-tuning 吗？

不是。Fine-tuning 和 LoRA 会产生新的权重或 adapter 产物。这需要训练基础设施、足够算力、发布打包、回滚方案和回归测试，因为适配后的模型可能改变基础行为。

Neural Imprint 使用的是另一种契约。基础模型包保持不变，用户特定学习以本地产物形式存在，并且只在兼容性检查通过后恢复。这样产品可以保持稳定的基础模型路径，同时让用户拥有的学习状态在端侧持续演进。

如果想了解 Neural Imprint、LoRA/SFT 和 prompt stuffing 的部署差异，请看 [Neural Imprint vs LoRA](/docs/guides/neural-imprint-vs-lora)。

### 模型到底学习了什么？

在这个演示里，唯一的学习输入就是第 3 步你已经检查过的合成样本。它教的是一个受控的回答风格偏好：技术工作流回答要短、直接，并且避免没有证据的质量声明。

如果你想在真正运行前看到将被使用的完整记录和纠错，可以先跑 dry run：

```bash
edge demo learn run --dry-run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

### 为什么 `--with-imprint` 接收 receipt，而不是 artifact 路径？

receipt 是交接对象。它指向生成出来的 artifact，同时记录恢复所需的 metadata、hash、schema version 和 local-only 状态。把 receipt 传给 CLI，可以让 CLI 做校验，并在 artifact 或 metadata 缺失时直接失败。

打印出来的 artifact 路径适合检查。真正建议执行的下一步，是输出里的 `next:` 那一行，也就是把 `learn_receipt.json` 传给 `--with-imprint`。

### `answers_differ: true` 能证明生产质量吗？

它证明：在这个受控合成样本里，恢复后的 Neural Imprint 产物已经生效，并且回答在本地学习产物恢复后发生了移动。

如果要声明生产质量，仍然需要针对具体任务做评估。这里已经能看到关键产品契约：个性化可以在本地激活，而不需要替换基础模型发布版本。

### 这是 prompt stuffing 吗？

不是。Prompt stuffing 会把 profile summary 或 instruction 反复塞进每一次请求。它占用 context budget，重复暴露私有状态，并且随着用户历史增长越来越难治理。

学习后的聊天恢复的是本地 Neural Imprint 产物，然后继续用正常的 generation path 处理当前用户消息。私有学习状态不会被重新粘贴进每一次 prompt。

### 本地状态在哪里？

命令会打印 demo state 路径、artifact 路径、metadata 路径和 receipt 路径。这些文件都在本机 Edge Studio application data 里，属于这次 demo run。这个演示不会上传它们。

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

这些是实现层检查，其中包括产物复用冒烟命令，不是 5 分钟演示必须执行的步骤。
