---
sidebar_position: 1
title: 5 分钟看懂本地学习
slug: /get-started/minute-demo
---

# 5 分钟看懂本地学习

想象一个本地理财助手。用户告诉它：

```text
我不喜欢高风险推荐，我更关注现金流和稳健收益。
```

在普通 App 里，这件事很快会变麻烦。你可以把这个偏好塞进每次 prompt，可以发给云端 profile 服务，也可以重新训练 adapter。Edge 走另一条路：把偏好留成本地学习状态，恢复前先验证，并且让基础模型包保持不变。

这个教程用当前 CLI demo 证明这套机制。内置样本是合成的，并且刻意保持简单：它教的是简洁、受证据约束的回答风格。放到理财助手场景里，这就是接触真实财务数据前最先需要的行为：建议更短，不做没有证据的承诺，并能证明私有状态留在本地。

Edge 把这种本地学习产物叫做 **Neural Imprint**。

## 你会证明什么

完成后，你会看到：

- 安装公开的 `edge-studio` 包；
- 显式准备预览模型；
- 在运行前检查合成学习输入；
- 生成本地 Neural Imprint 产物；
- 通过 receipt 恢复它；
- 对比学习前和学习后的回答；
- 基础模型包保持不变。

不会使用私人数据。不会修改模型权重。整个 demo 在你的 Mac 本地运行。

## 1. 安装 Edge Studio

创建 Python 3.11 环境，并安装 Developer Preview 包：

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

`--pre` 会安装当前 release candidate。在第一个 stable package 发布前请保留它。`edge doctor` 会检查 Python 环境、模型路径和系统兼容性。

源码安装和本地 UI 开发见 [安装 Edge Studio](/docs/get-started/source-build)。

## 2. 准备演示模型

demo 使用 `qwen3.5-9b-4bit`。

```bash
edge models where qwen3.5-9b-4bit
```

如果模型不存在，显式下载：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

demo 不会静默下载模型。如果模型已经存在，下载命令会复用本地匹配项，并报告缓存路径。

## 3. 查看将要学习什么

运行学习步骤前，先检查合成样本：

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

这不是理财建议，也不包含财务数据。它是理财产品偏好的安全替身：建议要短，承诺要谨慎，并且要证明私有状态留在本地。

这个 dry run 不加载模型、不写演示状态、不恢复产物，也不联网。

## 4. 学习前先问一次

启动基础模型聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive
```

输入 demo 使用的同一个探针问题：

```text
[chat:load] loading model=Qwen3.5-9B-4bit (first load can take 30-90s)
[chat:ready] type a message, /exit to quit
you> How should this assistant respond to technical workflow questions?
assistant> A good assistant should first understand the user's goal, identify
the relevant workflow constraints, break the problem into steps, and explain
tradeoffs clearly...
you> /exit
```

这是基础模型路径。此时还没有加载本地学习产物。

## 5. 运行学习 demo

现在运行本地学习流程，并打印学习前/学习后的文本：

```bash
edge demo learn run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 64 \
  --include-text
```

这里可以用 `--include-text`，因为样本是合成的。不要把它用于你不希望打印到终端或写入本地回执的真实用户 prompt 或私人财务数据。

你会看到类似输出：

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

具体文字可能不同。重点是学习后的回答反映了你检查过的偏好：更短、更直接、更谨慎地处理声明。放在理财助手里，这就是用户说自己更偏好现金流和低风险建议后，你希望看到的同类变化。

`next:` 这一行就是交接命令。它会把 `learn_receipt.json` 传给 `--with-imprint`。你不需要自己找底层 artifact 路径；CLI 会读取 receipt，并恢复里面记录的产物。

## 6. 学习后再问一次

复制第 5 步输出的 `next:` 并运行：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
```

问同一个问题：

```text
[chat:load] loading model=Qwen3.5-9B-4bit (first load can take 30-90s)
[chat:imprint] restoring artifact=.../neural_imprint_full_cache.safetensors
[chat:ready] type a message, /exit to quit
you> How should this assistant respond to technical workflow questions?
assistant> Provide short, direct summaries of the workflow steps. Avoid making
quality claims unless you have specific evidence to support them.
you> /exit
```

第二次聊天仍然在本地完成。`--with-imprint` 会读取已完成的学习回执，恢复生成出来的 Neural Imprint 产物；如果 receipt 或 artifact 缺失，命令会失败即关闭。

## 7. 阅读 receipt

这次运行在本地做了四件事：

1. 把合成记录写入隔离的 demo state。
2. 记录合成纠错。
3. 生成并恢复本地 Neural Imprint 产物。
4. 对比恢复前和恢复后的回答。

`answers_differ: true` 表示：对这个受控样本，恢复本地产物后回答发生了变化。

默认情况下，receipt 是本地且只记录哈希。本教程使用 `--include-text`，只是因为样本是合成的，本来就用于阅读。不使用 `--include-text` 时，receipt 保留哈希标识符，不保存原始用户文本：

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

这就是你带进 App 的契约：在本地证明行为变化，让学习状态保持可移除，并避免上传私人用户数据。

## 下一步：构建 App

CLI 证明跑通后，把这个理财助手形态构建成 iOS app：

- [构建可学习 iOS App](/docs/examples/build-and-ship)
- [最小 iOS 应用壳](/docs/get-started/minimal-ios-app)

App 路径使用公开 Swift package、Edge Scaffold、Edge Kit 和 Edge Halo binary package。把集成视为完成前，请先在真机上验证。

## 常见问题

### 这是 fine-tuning 吗？

不是。Fine-tuning 和 LoRA 会产生新的权重或 adapter 产物。这需要训练基础设施、足够算力、发布打包、回滚方案和回归测试，因为适配后的模型可能改变基础行为。

Neural Imprint 使用另一种契约。基础模型包保持不变，用户特定学习只在兼容性检查通过后作为本地产物恢复。产品可以保持稳定基础模型路径，同时让用户拥有的学习状态在端侧演进。

如需了解 Neural Imprint、LoRA/SFT 和 prompt stuffing 的部署差异，请看 [Neural Imprint vs LoRA](/docs/guides/neural-imprint-vs-lora)。

### 模型到底学习了什么？

在这个 demo 里，唯一学习输入就是第 3 步你检查过的合成样本。它教的是一个受控回答风格偏好：回答要短、直接，并受证据约束。

在真实理财 App 里，输入会来自 App 批准的本地用户信号，例如明确偏好、设置或纠错。这个策略由 App 拥有。

### 为什么 `--with-imprint` 接收 receipt，而不是 artifact 路径？

receipt 是交接对象。它指向生成出来的 artifact，同时记录恢复所需的 metadata、hash、schema version 和 local-only 状态。把 receipt 传给 CLI，可以让 CLI 做校验，并在 artifact 或 metadata 缺失时失败即关闭。

### `answers_differ: true` 能证明生产质量吗？

不能。它证明的是：在这个受控合成样本里，恢复后的 Neural Imprint 产物已经生效，并且回答在本地学习产物恢复后发生了变化。

如果要声明生产质量，仍然需要针对具体任务做评估。这里已经能看到关键产品契约：个性化可以在本地激活，而不需要替换基础模型发布版本。

### 这是 prompt stuffing 吗？

不是。Prompt stuffing 会把 profile summary 或 instruction 反复塞进每一次请求。它占用 context budget，重复暴露私有状态，并且随着用户历史增长越来越难治理。

学习后的聊天恢复的是本地 Neural Imprint 产物，然后继续用正常 generation path 处理当前用户消息。私有学习状态不会被重新粘贴进每一次 prompt。

### 本地状态在哪里？

命令会打印 demo state 路径、artifact 路径、metadata 路径和 receipt 路径。这些文件都留在本机 Edge Studio application data 里，只属于这次 demo run。

## 进阶检查

不重新加载模型也可以检查 receipt：

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

更底层的 Neural Imprint 冒烟检查：

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

这些是实现层检查，不是 5 分钟路径必须执行的步骤。
