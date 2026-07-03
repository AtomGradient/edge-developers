---
sidebar_position: 1
title: 首个设备 Agent (CLI)
sidebar_label: 首个 Agent (CLI)
slug: /quickstart/first-agent
---

# 构建第一个设备 Agent

当前预览版可运行。

在 Edge 里，设备就是 Agent，App 是载体。

本页是学习环最短的完整证明：检查一个本地理财信号、先问基础模型、运行本地
学习、再问一次、检查回执。全程在你的 Mac 上运行，数据不离开这台机器。

你会在本页看到两个时刻，第三个在下一步：

| 时刻 | 你证明了什么 |
| --- | --- |
| Aha #1 | 同一个基础模型在本地 Neural Imprint 恢复后给出不同回答。 |
| Aha #2 | Agent 学会了哪些本地工具可用、什么时候用、什么时候不该用。 |
| Aha #3 | Mac 上的证明变成一个载体 App——见[下一个快速开始步骤](/docs/quickstart/build-agent-carrier)。 |

理财样本是合成且可检查的，不构成理财建议。至于为什么走这条路而不是
LoRA、prompt 塞入或云端画像，见[为什么是设备 Agent](/docs/concepts/why-device-agent)。

## 1. 开始之前

你需要已安装 Edge Studio——那是[上一步](/docs/quickstart/install)。验证环境并
准备演示模型：

```bash
edge doctor
edge models where qwen3.5-9b-4bit
```

如果模型不存在，显式拉取：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

演示不会静默下载模型。模型已存在时，Edge 复用本地版本并报告缓存路径。内存
充足的机器可以在下面任何命令里改用更大的本地模型（如 `qwen3.5-27b-4bit`）——
模型永远显式指定，绝不静默切换。

## 2. 场景

想象一个私人理财助手。用户说：

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

之后用户问：

```text
I have $800 left after bills this month. What should I do with it?
```

Agent 不应该变成一个荐股工具。它应该尊重用户的本地风险边界、先解释现金流
影响、只使用载体暴露的本地工具，并避免没有依据的收益承诺。

## 3. 检查本地学习信号

在加载任何模型之前，先检查 Agent 将要学习的内容：

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

关注 records 和 correction：

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

dry-run 不加载模型、不写演示状态、不恢复产物、不使用网络。它让你先审计
本地学习信号。

`finance_conservative_cashflow_v1` 是内置合成样本。要用你自己的本地数据教
Agent，编写样本文件并通过 `--sample-file` 传入——见
[编写学习样本](/docs/knowledge-tools/learning-samples)。

## 4. 先问基础模型

启动基础模型对话：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

问：

```text
you> I have $800 left after bills this month. What should I do with it?
```

回答通常有用但泛泛：储蓄、还债、投资、按目标和风险偏好规划。这是学习前的
状态——模型还没有恢复这个用户的本地理财偏好。

退出：

```text
you> /exit
```

## 5. 运行 RPP 自学习

运行本地学习流程：

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

这里用 `--include-text` 是安全的，因为样本是合成的。不要对真实用户输入或
你不希望打印在终端、存进本地回执的私人财务记录使用它。

你应该看到形如下面的输出：

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

`receipt` 路径是交接对象。你不需要手工传原始产物路径。`--with-imprint` 接受
`learn_receipt.json`，读取其中记录的产物与元数据，校验通过才使用，不匹配则
失败即关闭。

## 6. 带 Neural Imprint 再问一次

复制学习输出里的 `next:` 命令：

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

回答应该转向保守、现金流优先的建议。在一次经过验证的本地运行中，恢复后的
会话给出了这样的行为形态：

```text
Based on your current cash flow of $800 and your preference for stability, here
is the best way to handle that money:

Priority 1: Preserve Your Cash Flow Stability
...
Emergency Fund Top-up
...
Pay Down High-Interest Debt
```

**Aha #1：** 同一个基础模型包、同一个问题，本地学习状态从回执恢复。

具体措辞会随模型构建与生成设置变化。契约是：在恢复被检查过的合成信号对应的
本地 Neural Imprint 产物后，行为发生了变化。

## 7. 检查工具策略

同一份 dry-run JSON 还包含 `expected_tool_policy`——载体暴露哪些本地工具、
何时适用，以及一组越界动作的负面策略：

```json
{
  "tool_learning": {
    "policy_kind": "deterministic_preview",
    "actual_tool_calls": false,
    "expected_tool_policy": {
      "tools_available": [
        {
          "name": "sample_finance_facts_lookup",
          "when": "User asks about specific financial preferences or risk boundaries"
        }
      ],
      "negative_policy": [
        "Do not call tools that require network access",
        "Do not invent financial return numbers without user-provided facts"
      ]
    }
  }
}
```

**Aha #2：** Agent 学到的不只是用户是谁。它还学会了载体暴露哪些本地工具、
什么时候合适，以及哪些工具或说法在边界之外。

这是使用合成只读工具的确定性预览，不是真实工具调用轨迹。工具 schema 如何
进入学习环——包括把你自己的 Python 工具烘进 imprint——见
[工具学习](/docs/knowledge-tools/tool-learning)。

## 8. 查看回执

学习运行写了一份本地回执，记录它做过的一切。不用重新加载模型即可检查：

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

local-only 检查验证演示期间没有发生非 localhost 的网络访问。除非你显式选择
`--include-text`，回执只含哈希。完整回执契约——以及如何把它带进你自己的
App——见[回执与 Local-Only 契约](/docs/knowledge-tools/receipts-and-local-contract)。

## 9. 你证明了什么，下一步去哪

同一个基础模型包；一个本地、可检查的信号；一个可移除的 Neural Imprint 产物；
经兼容性检查的恢复带来的行为变化；一份带显式负面边界的学习工具策略。

| 下一步 | 位置 |
| --- | --- |
| 把这条 Agent 路径导出为 iPhone 载体 App | [构建 Agent 载体](/docs/quickstart/build-agent-carrier) |
| 在真实 iPhone 上看设备端学习 | [设备学习 (iPhone)](/docs/labs/device-learning-iphone) |
| 用你自己的数据教 Agent | [编写学习样本](/docs/knowledge-tools/learning-samples) |
| 给 Agent 可刷新的知识 | [本地事实库](/docs/knowledge-tools/local-facts) |
| 实现你自己的工具 | [自定义 Python 工具](/docs/knowledge-tools/custom-python-tools) |
| 理解为什么这不是 LoRA 或 prompt 塞入 | [为什么是设备 Agent](/docs/concepts/why-device-agent) |
