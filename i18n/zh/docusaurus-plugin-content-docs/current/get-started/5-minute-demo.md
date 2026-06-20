---
sidebar_position: 1
title: 构建第一个设备 Agent
slug: /get-started/minute-demo
---

# 构建第一个设备 Agent

当前预览版可运行。

在 Edge 里，设备就是 Agent。App 是载体。

这个教程不再从玩具式回答风格样本开始，而是从真实产品形态开始：一个私有理财助手。用户有一条简单的本地偏好：

```text
我不喜欢高风险推荐，我更关注现金流和稳健收益。
```

之后用户问：

```text
这个月扣掉账单后我还剩 800 美元，应该怎么处理？
```

这不是理财建议。样本是合成的、可检查的，用来展示 Edge 的学习契约：本地信号、RPP 自学习、本地 Neural Imprint 产物，以及同一个基础模型在恢复本地学习状态后的回答变化。

## 你会证明什么

你会跑完整的 Agent 路径：

1. 安装公开的 `edge-studio` 包。
2. 准备本地预览模型。
3. 检查原始本地学习信号。
4. 对比常见个性化方案。
5. 先问基础模型。
6. 运行 RPP 自学习并生成 Neural Imprint。
7. 用 base model + Neural Imprint 再问一次。
8. 检查 receipt 和 local-only 契约。
9. 从 Edge Studio 导出第一个 Agent 载体。

不会使用私人数据。基础模型包保持不变。学习产物留在本地、可移除，并且只在兼容性检查通过后恢复。

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

demo 不会静默下载模型。下载命令是显式行为，并会写入模型 receipt。如果模型已经存在，Edge 会复用本地匹配项并报告缓存路径。

## 3. 检查本地学习信号

在任何模型加载之前，先检查 Agent 到底会学习什么：

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

在输出里找到 sample block：

```json
{
  "sample_id": "finance_conservative_cashflow_v1",
  "question": "I have $800 left after bills this month. What should I do with it?",
  "sample_text": {
    "records": [
      {
        "kind": "explicit_preference",
        "text": "The synthetic user avoids high-risk recommendations and prefers stable, cash-flow-aware guidance."
      },
      {
        "kind": "cashflow_context",
        "text": "The synthetic user's rent and fixed subscriptions are already covered; they have $800 left after bills this month."
      },
      {
        "kind": "trust_boundary",
        "text": "The synthetic user wants cash-flow impact explained before any recommendation and does not want unsupported return claims."
      }
    ],
    "corrections": [
      {
        "correction_type": "profile_correction",
        "target": {"profile_field": "financial_guidance_style"}
      }
    ]
  }
}
```

这个 dry run 不加载模型、不写 demo state、不恢复产物，也不联网。它先展示本地学习信号，让你在任何生成发生之前，就能判断设备 Agent 被允许学习什么。

## 4. 对比常见方案

对于这条理财偏好，常见个性化方案的代价不同：

| 方案 | 在这里会怎么做 | 为什么 Edge 使用不同基础设施 |
| --- | --- | --- |
| LoRA / SFT | 围绕用户偏好训练 adapter 或模型 | 一次用户级状态变化就需要算力、数据整理、打包、发布、回滚和回归。 |
| Prompt stuffing | 把“低风险、现金流优先”塞进每一次请求 | 重放私有 profile 文本，占用 context budget，并且随着历史增长越来越难检查。 |
| 云端个性化 | 把理财偏好上传到服务端 profile | 把敏感本地状态送离设备，并增加信任、延迟、联网和合规负担。 |
| Edge RPP + Neural Imprint | 把本地信号转换成可移除产物，并恢复进兼容 session | 基础模型包保持稳定；学习状态留在本地；恢复受兼容性闸门保护且可删除。 |

Neural Imprint 不是所有模型训练的通用替代品。它适合的产品契约是：用户级状态在设备上持续学习，同时基础模型路径保持稳定。

## 5. 先问基础模型

启动基础模型聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

输入：

```text
you> I have $800 left after bills this month. What should I do with it?
```

基础模型通常能给出有用但比较通用的回答，可能会提到储蓄、还债、投资或根据目标和风险承受度规划。这就是学习前状态：模型还没有恢复用户本地理财偏好。

退出：

```text
you> /exit
```

## 6. 运行 RPP 自学习并生成 Neural Imprint

现在运行本地学习流程：

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

这里可以用 `--include-text`，因为样本是合成的。不要把它用于你不希望打印到终端或写入本地 receipt 的真实用户 prompt 或私人财务记录。

你会看到类似输出：

```text
Edge demo learn (edge.demo.learn.run.v1)
status: completed
model: qwen3.5-9b-4bit
model_prepare: skipped_existing
sample: finance_conservative_cashflow_v1
state: .../demo_runs/edge-learn-.../learn_state
generation_job: neural_imprint_gen_...
artifact: .../neural_imprint.safetensors
metadata: .../neural_imprint_metadata.json
answers_differ: True
receipt: .../learn_receipt.json
next: edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
raw_text_in_receipt: true
```

`receipt` 路径就是交接对象。你不需要自己传底层 artifact 路径。`--with-imprint` 可以接收 `learn_receipt.json`，读取里面记录的 artifact 和 metadata，完成校验，并在不匹配时失败即关闭。

对于这个样本，学习后的回答会转向现金流稳定：

```text
Based on your current cash flow and preference for stability, the best move is
to cover your upcoming rent or fixed subscriptions first. Since you mentioned
those are already covered, prioritize an emergency fund, high-interest debt,
and conservative savings before considering upside.
```

具体文字会随模型构建和生成设置变化。重要契约是：恢复本地 Neural Imprint 产物后行为发生变化，并且这个变化对应第 3 步你检查过的合成信号。

## 7. 用 base model + Neural Imprint 再问一次

复制 learn 输出里的 `next:` 命令：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive \
  --max-tokens 160 \
  --with-imprint ".../learn_receipt.json"
```

问同一个问题：

```text
you> I have $800 left after bills this month. What should I do with it?
```

此时你应该看到保守、现金流优先的回答。在一次本地验证中，恢复后的 session 输出过：

```text
Based on your current cash flow of $800 and your preference for stability, here
is the best way to handle that money:

Priority 1: Preserve Your Cash Flow Stability
...
Emergency Fund Top-up
...
Pay Down High-Interest Debt
```

这就是 “base model + Neural Imprint” 的时刻。同一个基础模型包，同一个问题，本地学习状态从 receipt 恢复。

## 8. 检查 receipt 和 local-only 契约

这次学习运行在本地做了四件事：

1. 把合成 records 写入隔离的 demo state。
2. 记录合成 correction。
3. 生成并恢复本地 Neural Imprint 产物。
4. 对比恢复前和恢复后的回答。

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

不重新加载模型也可以检查 receipt：

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

local-only 检查用于确认 demo 期间没有发生非本机地址网络访问。把同样原则带进你的 App：私有信号默认留在本地，学习状态可移除，恢复失败即关闭。

更底层的 Neural Imprint 冒烟检查：

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

这些命令用于产物复用和实现层检查，不是 5 分钟演示必须执行的步骤。

## 9. 导出第一个 Agent 载体

CLI 证明跑通后，打开本地工作台：

```bash
edge studio
```

然后：

1. 打开 `http://127.0.0.1:18842`。
2. 加载同一个模型。
3. 导出 Edge Scaffold 载体。
4. 打开生成的 Xcode 项目。
5. 在真实 iPhone 或 iPad 上验证。

Edge Studio 是工作台。Edge Scaffold 是载体模板。iOS App 是设备 Agent 的用户表面，不是学习原语本身。

继续阅读 [构建 Agent 载体](/docs/examples/build-and-ship)。

## 常见问题

### 这是 LoRA 或 SFT 吗？

不是。LoRA 和 SFT 适合你明确想交付训练后的模型或 adapter release 的场景。那需要算力、数据整理、发布打包、回滚和回归评估。Neural Imprint 是另一种面向用户级端侧学习的契约：基础模型包保持稳定，本地学习状态只在兼容性检查通过后恢复。

### 这是 prompt stuffing 吗？

不是。Prompt stuffing 会把 profile 文本或 instruction 反复塞进每一次请求。它占用 context budget，并重复暴露私有状态。学习后的聊天是从 Neural Imprint receipt 恢复本地 runtime state，然后继续用正常 generation path 处理当前消息。

### Agent 到底学习了什么？

只学习第 3 步你检查过的合成信号：风险边界、现金流上下文和信任边界。在真实理财产品里，这些信号会来自 App 批准的本地设置、明确用户偏好和用户可见纠错。载体 App 拥有这套策略。

### `answers_differ: True` 能证明生产就绪吗？

不能。它证明的是：在这个受控合成样本里，恢复后的 Neural Imprint 产物已经生效，并且回答在恢复后发生了变化。生产就绪仍然需要任务级评估、UI 控制、删除 UX 和真机验证。
