---
sidebar_position: 1
title: 构建第一个设备 Agent
slug: /get-started/minute-demo
---

# 构建第一个设备 Agent

当前预览版可运行。

在 Edge 里，设备就是 Agent。App 是载体。

这页是 Developer Preview 最短的完整路径：安装 Edge Studio，检查本地理财信号，对比基础模型，生成 Neural Imprint，检查学到的工具策略，然后把同一条 Agent 路径导出到 iPhone 载体。

你会看到三个时刻：

| 时刻 | 你会证明什么 |
| --- | --- |
| Aha #1 | 同一个基础模型在恢复本地 Neural Imprint 后，回答发生变化。 |
| Aha #2 | Agent 学会了有哪些本地工具、什么时候使用、什么时候不该使用。 |
| Aha #3 | 你在 Mac 上证明过的路径，可以被带进 iPhone App 表面。 |

理财样本是合成的、可检查的。它不是理财建议。

## 1. 为什么需要这条路

个性化通常很重：

| 方案 | 真实产品里会发生什么 |
| --- | --- |
| LoRA / 微调 | 一条用户偏好变成训练、打包、发布、回滚和回归测试。 |
| Prompt 填充 | 私有 profile 文本被重复塞进每次请求，并消耗上下文。 |
| 云端个性化 | 敏感本地状态离开设备，并带来信任、延迟、联网和合规负担。 |

Edge 走另一条路。本地信号会变成可移除的运行时学习状态。基础模型包保持稳定。恢复前会做兼容性检查，失败则回到基础模型路径。

## 2. 安装 Edge Studio

创建 Python 3.11 环境，并安装公开包：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

`--pre` 会安装当前 release candidate。在第一个 stable package 发布前请保留它。

<details>
<summary>使用 uv</summary>

```bash
uv venv --python 3.11 .venv
source .venv/bin/activate
uv pip install --upgrade --pre edge-studio
edge doctor
```

</details>

`edge doctor` 会检查 Python 环境、模型路径和系统兼容性。源码安装见 [安装 Edge Studio](/docs/get-started/source-build)，但这条路径不需要源码安装。

## 3. 场景

想象一个私有理财助手。用户说：

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

之后用户问：

```text
I have $800 left after bills this month. What should I do with it?
```

Agent 不应该变成荐股工具。它应该尊重用户的本地风险边界，先解释现金流影响，只使用载体暴露的本地工具，并避免没有依据的收益承诺。

## 4. 准备模型

demo 使用 `qwen3.5-9b-4bit`。

```bash
edge models where qwen3.5-9b-4bit
```

如果模型不存在，显式下载：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

demo 不会静默下载模型。如果模型已经存在，Edge 会复用本地匹配项并报告缓存路径。

## 5. 检查本地学习信号

在任何模型加载之前，先检查 Agent 到底会学习什么：

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

在输出里找到 records 和 correction：

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

这个 dry run 不加载模型、不写 demo state、不恢复产物，也不联网。它先让你审查本地学习信号。

## 6. 先问基础模型

启动基础模型聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

输入：

```text
you> I have $800 left after bills this month. What should I do with it?
```

回答通常有用但比较通用：储蓄、还债、投资，以及根据目标和风险承受度规划。这就是学习前状态：模型还没有恢复用户本地理财偏好。

退出：

```text
you> /exit
```

## 7. 运行 RPP 自学习

运行本地学习流程：

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

## 8. 用 Neural Imprint 再问一次

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

回答应该转向保守、现金流优先。在一次本地验证中，恢复后的 session 输出过这种行为形态：

```text
Based on your current cash flow of $800 and your preference for stability, here
is the best way to handle that money:

Priority 1: Preserve Your Cash Flow Stability
...
Emergency Fund Top-up
...
Pay Down High-Interest Debt
```

**Aha #1：**同一个基础模型包，同一个问题，本地学习状态从 receipt 恢复。

具体文字会随模型构建和生成设置变化。重要契约是：恢复本地 Neural Imprint 产物后行为发生变化，并且这个变化对应你检查过的合成信号。

## 9. 检查工具策略

同一个 dry-run JSON 现在包含 `expected_tool_policy`：

```json
{
  "tool_learning": {
    "policy_kind": "deterministic_preview",
    "actual_tool_calls": false,
    "expected_tool_policy": {
      "description": "Deterministic tool-use policy learned from this sample",
      "tools_available": [
        {
          "name": "sample_finance_facts_lookup",
          "when": "User asks about specific financial preferences or risk boundaries",
          "args_constraint": "topic must be one of: risk_boundary, cashflow, trust_boundary"
        },
        {
          "name": "sample_finance_cashflow_summary",
          "when": "User asks about current cash flow, bills, or available balance",
          "args_constraint": "scope must be a recognized finance scope"
        }
      ],
      "negative_policy": [
        "Do not call external market data tools",
        "Do not call tools that require network access",
        "Do not invent financial return numbers without user-provided facts"
      ]
    }
  }
}
```

**Aha #2：**Agent 不只是学习“用户是谁”。它也在学习载体暴露了哪些本地工具、什么时候适合用、哪些工具或说法越界。

这是确定性预览，不是实时 tool-call trace。这些工具是合成只读工具，不是真实金融服务。当 live tool runner 进入这条路径时，会使用独立的 trace 字段。

## 10. 检查 receipt 和 local-only 契约

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
  "after_answer_sha256": "sha256:...",
  "expected_tool_policy_sha256": "sha256:..."
}
```

不重新加载模型也可以检查 receipt：

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

local-only 检查用于确认 demo 期间没有发生非本机地址网络访问。把同样原则带进你的载体：私有信号默认留在本地，学习状态可移除，恢复失败即关闭。

可选的底层 Neural Imprint 冒烟检查：

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

这些命令用于产物复用和实现层检查，不是 5 分钟演示必须执行的步骤。

## 11. 把 Agent 载体导出到 iPhone

打开本地工作台：

```bash
edge studio
```

打开 `http://127.0.0.1:18842`。

在 Edge Studio 里：

1. 加载同一个模型。
2. 打开 **Export**。
3. 选择 **Edge Scaffold**。
4. 导出 Agent 载体并下载项目。

打开生成的项目：

```bash
cd FinanceAgent/FinanceAgent
xcodegen generate
open FinanceAgent.xcodeproj
```

然后选择 signing team，选择真实 iPhone 或 iPad，build。不要用 Simulator 验证这条路径。

在设备上问同一个问题：

```text
I have $800 left after bills this month. What should I do with it?
```

在写进产品 claim 前，先验证设备路径：

- model/session 状态是本地的。
- Neural Imprint 状态已恢复。
- 回答反映了你检查过的低风险、现金流优先偏好。
- 开启飞行模式后，App 仍然走预期路径。

**Aha #3：**你在 Mac 上证明过的 Agent 路径，现在被 iPhone App 表面承载。App 是载体，设备是 Agent。

## 12. 刚才发生了什么

- Agent 从本地合成理财信号学习。
- RPP 自学习产生本地学习表征。
- Neural Imprint 把学习状态恢复进兼容模型 session。
- 恢复经过模型、tokenizer、runtime 和 tool schema 兼容性检查。
- 工具策略展示了哪些本地工具适合使用，哪些动作越界。
- 如果兼容性失败，产品保留基础模型路径。

这不是 LoRA、SFT、prompt stuffing，也不是云端个性化。

## 13. 常见问题

### 这是 LoRA 或 SFT 吗？

不是。LoRA 和 SFT 适合你明确想交付训练后的模型或 adapter release 的场景。那需要算力、数据整理、发布打包、回滚和回归评估。Neural Imprint 是另一种面向用户级端侧学习的契约：基础模型包保持稳定，本地学习状态只在兼容性检查通过后恢复。

### 这是 prompt stuffing 吗？

不是。Prompt stuffing 会把 profile 文本或 instruction 反复塞进每一次请求。它占用 context budget，并重复暴露私有状态。学习后的聊天是从 Neural Imprint receipt 恢复本地 runtime state，然后继续用正常 generation path 处理当前消息。

### Agent 到底学习了什么？

只学习你检查过的合成信号：风险边界、现金流上下文、信任边界，以及预期本地工具策略。在真实理财产品里，这些信号会来自 App 批准的本地设置、明确用户偏好和用户可见纠错。载体 App 拥有这套策略。

### `answers_differ: True` 能证明生产就绪吗？

不能。它证明的是：在这个受控合成样本里，恢复后的 Neural Imprint 产物已经生效，并且回答在恢复后发生了变化。生产就绪仍然需要任务级评估、UI 控制、删除 UX 和真机验证。

## 14. 继续深入

- 开发者文档：[atomgradient.github.io/edge-developers](https://atomgradient.github.io/edge-developers/)
- GitHub：[github.com/AtomGradient](https://github.com/AtomGradient)
- 源码安装参考：[安装 Edge Studio](/docs/get-started/source-build)
