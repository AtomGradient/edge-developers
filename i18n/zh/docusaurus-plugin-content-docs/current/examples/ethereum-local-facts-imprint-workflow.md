---
title: 以太坊开发者工作流：本地事实库 + Neural Imprint
sidebar_label: 以太坊本地事实工作流
---

# 以太坊开发者工作流：本地事实库 + Neural Imprint

这份说明给正在接入 Edge Developer Preview 的以太坊应用开发者使用。

核心原则只有一句：**不要把所有业务知识训练进模型。**

把数据拆成两条路径：

| 你手里的内容 | 应该放哪里 | 为什么 |
|---|---|---|
| EIP 摘要、协议规则、审计结论、合约接口说明、安全清单 | `edge demo facts` 本地事实库 | 这些是可更新知识，更新文件后重新 import 即可，不需要重新学习 |
| 风险姿态、交互边界、回答风格、确认流程 | `edge demo learn` 或 `edge demo imprint` | 这些是 Agent 的行为偏好，适合进入 Neural Imprint |

以太坊只是示例。Edge 里的命令、schema、tool 名都是通用的：

- facts store：任意 store 名，例如 `ethereum_research_v1`
- tool：固定为 `local_facts_lookup`
- chat 激活：`edge demo chat --facts-store <store>`
- 行为学习：`edge demo learn run --sample-file ...`

## 0. 前置条件

安装 Edge Studio Developer Preview，并准备本地模型：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio

edge doctor
edge models where qwen3.5-9b-4bit
```

如果模型不存在：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

后续所有命令都默认在同一个 Python 环境中运行。

## 1. 先拆业务：知识 vs 行为

让开发者先把业务材料分成两类。

### 放进 facts 的内容

适合放入 facts 的内容是“可查的事实”：

- EIP 的关键规则
- 合约函数、参数、事件说明
- 安全审计报告中的明确结论
- 风险规则清单
- 交易构造前需要检查的字段
- 链 ID、合约地址、协议版本、限制条件
- 项目自己的业务规则，例如“某类操作必须二次确认”

这些内容可以随时更新。更新后只需要重新 import facts，不需要重新生成 Neural Imprint。

### 放进 learn/imprint 的内容

适合放入 learn/imprint 的内容是“Agent 应该如何表现”：

- 不自动签名
- 不自动广播交易
- 先展示风险，再展示交易结构
- 缺少链 ID、合约地址、ABI、金额、spender 时必须追问
- 不声称“安全”
- 不承诺收益
- 不把本地事实之外的内容说成确定事实
- 用户确认前只输出草案，不输出可直接执行的交易

这些是行为边界。它们应该通过 `edge demo learn` 或 `edge demo imprint` 进入 Neural Imprint。

## 2. 创建以太坊 facts 文件

先创建一个本地事实文件，例如 `eth-facts-v1.json`：

```json
{
  "schema_version": "edge.demo.facts.v1",
  "store": "ethereum_research_v1",
  "facts": [
    {
      "fact_id": "eip-1559-base-fee",
      "topic": "EIP-1559 base fee",
      "text": "EIP-1559 introduces a protocol-defined base fee that is burned and changes per block based on gas demand.",
      "tags": ["ethereum", "eip", "gas"],
      "source_label": "developer-notes"
    },
    {
      "fact_id": "erc20-approve-risk",
      "topic": "ERC-20 approve risk",
      "text": "An ERC-20 approve call can grant a spender permission to transfer tokens up to the approved allowance. Large or unlimited approvals should be highlighted as a risk before the user confirms.",
      "tags": ["ethereum", "erc20", "risk", "approval"],
      "source_label": "security-notes"
    },
    {
      "fact_id": "transaction-no-auto-sign",
      "topic": "transaction signing boundary",
      "text": "The assistant must not sign or broadcast a transaction. It may explain a transaction plan and ask the user for explicit confirmation.",
      "tags": ["ethereum", "transaction", "boundary"],
      "source_label": "app-policy"
    }
  ]
}
```

字段说明：

| 字段 | 说明 |
|---|---|
| `schema_version` | 固定为 `edge.demo.facts.v1` |
| `store` | 本地事实库名。建议用业务版本，例如 `ethereum_research_v1` |
| `fact_id` | 稳定 ID。后续 re-import 同一个 `fact_id` 会覆盖旧内容 |
| `topic` | 查询主题。模型常会根据 topic 发起 lookup |
| `text` | 事实原文 |
| `tags` | 关键词数组 |
| `source_label` | 来源标签，例如 `eip-notes`、`audit-report`、`app-policy` |

导入：

```bash
edge demo facts import ./eth-facts-v1.json \
  --store ethereum_research_v1 \
  --json
```

查看 facts：

```bash
edge demo facts list \
  --store ethereum_research_v1 \
  --json
```

查看单条 fact：

```bash
edge demo facts inspect erc20-approve-risk \
  --store ethereum_research_v1 \
  --include-text \
  --json
```

默认情况下，输出和 receipt 是 hash-only，不回显 fact 原文。只有显式加 `--include-text` 才显示原文。

## 3. 让 chat 使用本地 facts

使用 `--facts-store` 显式启用本地事实查询 tool：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --prompt "What risk should I check before an ERC-20 approve call? Check local facts." \
  --facts-store ethereum_research_v1 \
  --include-text \
  --json
```

你要让开发者重点看 JSON 里的这些字段：

```json
{
  "facts_store": "ethereum_research_v1",
  "tool_loop_status": "completed",
  "tool_instruction_mode": "system",
  "tool_instruction_sha256": "sha256:...",
  "tool_calls": [
    {
      "name": "local_facts_lookup",
      "status": "matched",
      "rows": 1,
      "args_sha256": "sha256:...",
      "result_sha256": "sha256:...",
      "network_used": false
    }
  ],
  "network_used": false
}
```

验收点：

| 字段 | 应该看到什么 |
|---|---|
| `tool_calls[].name` | `local_facts_lookup` |
| `tool_calls[].rows` | 大于 0 表示查到了本地事实 |
| `tool_calls[].result_sha256` | 事实查询结果的哈希 |
| `network_used` | `false` |
| `tool_instruction_sha256` | 模型可见 tool 指令的哈希，不泄露指令原文 |

如果没有 `--facts-store`，chat 不注册 tool，行为保持普通 base chat。

## 4. Edge Learn：把业务边界学成可恢复行为状态

facts 解决“知道什么”。行为 sample 解决“怎么做”。

这一节是 Edge 的核心能力。

`edge demo facts` 解决的是“模型该查什么知识”。`edge demo learn` 解决的是“Agent 应该怎样行动”。对以太坊应用来说，真正有价值的不是让模型背更多 EIP，而是让它稳定遵守你的业务边界：

- 总是先讲风险，再讲交易结构
- 缺字段必须追问
- 不自动签名
- 不自动广播
- 不编造安全结论
- 不承诺收益
- 必须用本地 facts 支撑协议和风险判断

Edge Learn 的结果不是改 base model 权重，也不是把一大段 prompt 每次塞进去。它会生成一个可恢复、可移除、可审计的 Neural Imprint artifact。后续 chat 通过 `--with-imprint` 恢复这个学习状态。

### 4.1 Learn / Imprint / Facts 的分工

| 路径 | 什么时候用 | 输入 | 输出 |
|---|---|---|---|
| `edge demo learn` | 有明确 correction，希望表达“原来这样答不对，应该这样改” | records + corrections + tool policy | learn receipt + Neural Imprint artifact |
| `edge demo imprint` | 只有行为记录和偏好，没有 correction | records + questions | imprint receipt + Neural Imprint artifact |
| `edge demo facts` | 只是事实知识，可能频繁更新 | fact rows | SQLite local facts store |

以太坊开发者通常会同时用两条线：

1. EIP/合约/审计知识走 facts。
2. 交易安全边界和回答姿态走 learn。

### 4.2 Learn sample 由哪些部分组成

一个 learn sample 有 5 个关键部分：

| 字段 | 作用 | 以太坊例子 |
|---|---|---|
| `records` | 用户或业务偏好、边界、上下文 | “永不自动签名”，“先风险后结构” |
| `corrections` | 明确纠正模型应该怎样调整 | “如果缺 spender/amount，必须追问” |
| `tool_schema_export` | 告诉模型可用工具和工具参数 | `local_facts_lookup` |
| `expected_tool_policy` | 期望它什么时候用工具、什么时候不用 | “协议规则和风险判断先查本地 facts” |
| `questions` | 验收问题集 | “Assess this approval transaction.” |

这里的“学习”不是把 facts 塞进 profile。学习的是**使用事实的策略、风险边界、回答顺序和拒绝越权的习惯**。

### 4.3 创建 learn sample

先生成一个模板：

```bash
edge demo learn sample init --interactive --output ./eth-risk-sample.json
```

如果是手写，可以使用下面的形状：

```json
{
  "schema_version": "edge.demo.learn.sample.v1",
  "sample_id": "ethereum_risk_boundary_v1",
  "peer_id": "ethereum-demo-peer",
  "app_id": "com.example.ethereum-agent",
  "base_model_id": "qwen3.5-9b-4bit",
  "question": "Help me assess this token approval transaction.",
  "questions": [
    "Help me assess this token approval transaction.",
    "Can you build a transaction plan if the spender and amount are missing?"
  ],
  "records": [
    {
      "record_id": "eth-boundary-001",
      "kind": "trust_boundary",
      "text": "The assistant must never sign or broadcast transactions. It may only explain a transaction plan and ask for explicit user confirmation.",
      "tags": ["ethereum", "transaction", "boundary"]
    },
    {
      "record_id": "eth-risk-001",
      "kind": "answer_style",
      "text": "The assistant should explain risks before transaction structure and should call out missing chain ID, contract address, ABI, spender, recipient, amount, and value.",
      "tags": ["ethereum", "risk", "style"]
    },
    {
      "record_id": "eth-claim-001",
      "kind": "trust_boundary",
      "text": "The assistant must not claim a contract, token, or transaction is safe unless that conclusion is present in local facts.",
      "tags": ["ethereum", "safety", "boundary"]
    }
  ],
  "corrections": [
    {
      "peer_id": "ethereum-demo-peer",
      "app_id": "com.example.ethereum-agent",
      "correction_type": "profile_correction",
      "target": {"profile_field": "ethereum_transaction_guidance"},
      "correction": {
        "profile_overlay": {
          "priority": "risk first, transaction structure second",
          "boundary": "never sign or broadcast; require explicit confirmation",
          "missing_information_policy": "ask follow-up questions for chain ID, contract address, ABI, spender, amount, recipient, and value"
        }
      },
      "status": "recorded"
    }
  ],
  "tool_schema_export": {
    "schema_version": "edgestudio.tool_schema_export.v1",
    "tools": [
      {
        "name": "local_facts_lookup",
        "description": "Read-only lookup for imported local facts.",
        "permissions": ["read_facts"],
        "intentTags": ["exact_fact"],
        "parameters": {
          "type": "object",
          "properties": {
            "query": {"type": "string"},
            "topic": {"type": "string"},
            "limit": {"type": "integer"}
          }
        }
      }
    ]
  },
  "expected_tool_policy": {
    "description": "Use local facts for protocol rules, risk checks, and app policies before giving transaction guidance.",
    "tools_available": [
      {
        "name": "local_facts_lookup",
        "when": "The user asks about protocol rules, EIP behavior, transaction risk, token approval, or app policy.",
        "args_constraint": "Use a short query or topic; do not include private keys or secrets."
      }
    ],
    "negative_policy": [
      "Do not call network tools.",
      "Do not sign or broadcast transactions.",
      "Do not invent safety claims.",
      "Do not claim returns or security guarantees."
    ]
  }
}
```

关键点：`tool_schema_export.tools[0].name` 要写成 `local_facts_lookup`。

原因是 chat 运行时真正注册的内置 tool 名就是 `local_facts_lookup`。如果 sample 里写了其他名字，模型可能在 Neural Imprint prefix 里记住旧工具名，运行时会变成 `unknown_tool`。

### 4.4 验证 sample

先验证 sample 结构：

```bash
edge demo learn sample validate ./eth-risk-sample.json --json
```

看这些字段：

```json
{
  "ok": true,
  "status": "valid",
  "sample_id": "ethereum_risk_boundary_v1",
  "sample": {
    "sample_id": "ethereum_risk_boundary_v1",
    "record_count": 3,
    "correction_count": 1,
    "question_count": 2,
    "sample_sha256": "sha256:...",
    "tool_schema_sha256": "sha256:..."
  }
}
```

如果 `peer_id` 不一致、字段缺失、tool schema 不是 object，都会 fail closed，不会进入模型加载。

### 4.5 先 dry-run：审计学习输入

正式运行前先 dry-run：

```bash
edge demo learn run \
  --dry-run \
  --sample-file ./eth-risk-sample.json \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

dry-run 的目的：

- 确认 records/corrections 是你想让 Agent 学的行为边界
- 确认 tool schema 是 `local_facts_lookup`
- 确认 `expected_tool_policy` 没有授权联网、签名或广播
- 确认问题集覆盖主要业务场景
- 不加载模型，不写学习状态，不生成 artifact

### 4.6 正式运行 Edge Learn

确认 dry-run 没问题后，运行 learn：

```bash
edge demo learn run \
  --sample-file ./eth-risk-sample.json \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

成功后，保存输出里的 `receipt_path`。后续 chat 用它作为 `--with-imprint` 输入。
stdout report 会把 sample 元数据放在 `sample` 下，把生成路径放在 `generation`
下；完整恢复产物详情也会记录在 `receipt_path` 指向的 `learn_receipt.json` 文件里。

输出里重点看这些字段：

```json
{
  "status": "completed",
  "receipt_path": ".../learn_receipt.json",
  "network_used_during_demo": false,
  "question_count": 2,
  "sample": {
    "sample_id": "ethereum_risk_boundary_v1",
    "record_count": 3,
    "correction_count": 1
  },
  "generation": {
    "artifact_path": ".../neural_imprint.safetensors",
    "metadata_path": ".../neural_imprint_metadata.json"
  }
}
```

验收点：

| 字段 | 说明 |
|---|---|
| `sample.sample_id` | 当前学习样本 ID |
| `generation.artifact_path` | 生成的 Neural Imprint artifact |
| `generation.metadata_path` | artifact sidecar metadata |
| `receipt_path` | 后续 `edge demo chat --with-imprint` 的输入 |
| `network_used_during_demo` | 应为 `false` |
| `questions[]` | 每个问题都有 before/after hash 和差异记录 |

### 4.7 用 learn receipt 恢复学习状态

把 learn 的输出 receipt 交给 chat：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --with-imprint ./learn_receipt.json \
  --prompt "Help me assess this token approval transaction." \
  --include-text \
  --json
```

这一步只验证学习状态是否能恢复，不一定查 facts。你应该看到：

```json
{
  "neural_imprint": {
    "active": true,
    "artifact_id": "...",
    "artifact_path": "...",
    "metadata_path": "..."
  }
}
```

如果恢复失败，chat 应该 fail closed 或返回明确错误，而不是假装学习生效。

### 4.8 Learn 成功后应该改变什么

以太坊场景里，learn 后的回答应该更稳定地体现这些行为：

| 用户问题 | 期望变化 |
|---|---|
| “Can you approve this spender?” | 先讲 approval 风险，不直接生成执行动作 |
| “Can you sign this?” | 明确拒绝签名/广播，只能解释步骤 |
| “Is this token safe?” | 不声称安全，除非 local facts 有明确结论 |
| “Build a transaction plan.” | 先检查 chain ID、contract、ABI、spender、amount、recipient、value 是否齐全 |
| “What does this EIP imply?” | 先查 facts，再回答 |

如果这些行为没有出现，优先检查 learn sample：

- records 是否写成了事实长文，而不是行为边界
- corrections 是否具体
- `expected_tool_policy` 是否明确要求查 `local_facts_lookup`
- `tool_schema_export.tools[].name` 是否就是 `local_facts_lookup`

### 4.9 不要把 Edge Learn 当成什么

Edge Learn 不是：

- 不是联网 RAG
- 不是把 EIP 全文训练进权重
- 不是自动签名工具
- 不是让模型“保证安全”
- 不是每次 prompt stuffing

Edge Learn 是：

- 把本地行为信号变成可恢复的 Neural Imprint
- 让模型学会边界、偏好和工具使用策略
- 让 App 可以更新 facts，而不重新学习行为
- 让 receipt 记录 model、artifact、tool call、hash 和本地执行证据

## 5. 组合运行：facts + Neural Imprint

组合命令：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --with-imprint ./learn_receipt.json \
  --facts-store ethereum_research_v1 \
  --prompt "Assess this ERC-20 approval plan. Check local facts first. Spender is 0xabc..., amount is unlimited." \
  --include-text \
  --json
```

组合模式下，receipt 里应该看到：

```json
{
  "neural_imprint": {
    "active": true,
    "artifact_id": "..."
  },
  "facts_store": "ethereum_research_v1",
  "tool_instruction_mode": "hidden_turns",
  "tool_instruction_sha256": "sha256:...",
  "tool_calls": [
    {
      "name": "local_facts_lookup",
      "status": "matched",
      "rows": 1
    }
  ]
}
```

`tool_instruction_mode` 的含义：

| mode | 什么时候出现 | 说明 |
|---|---|---|
| `system` | 只启用 facts store，不启用 imprint | tool 指令作为 system message 注入 |
| `hidden_turns` | 同时启用 `--with-imprint` 和 `--facts-store` | tool 指令作为隐藏 user/assistant 前置回合注入，避免 imprint continuation 过滤 system |

开发者可以这样判断组合是否成功：

1. `neural_imprint.active == true`
2. `tool_instruction_mode == "hidden_turns"`
3. `tool_calls[].name == "local_facts_lookup"`
4. `tool_calls[].rows > 0`
5. `network_used == false`

## 6. 验证“知识更新不需要重新学习”

这是给以太坊开发者看的最重要能力。

先准备 v1 facts：

```json
{
  "schema_version": "edge.demo.facts.v1",
  "store": "ethereum_research_v1",
  "facts": [
    {
      "fact_id": "app-policy-max-approval",
      "topic": "approval review policy",
      "text": "For unlimited ERC-20 approvals, the assistant should warn that the spender may transfer tokens up to the approved allowance until approval is changed.",
      "tags": ["ethereum", "erc20", "approval", "risk"],
      "source_label": "app-policy-v1"
    }
  ]
}
```

导入 v1：

```bash
edge demo facts import ./eth-facts-v1.json \
  --store ethereum_research_v1 \
  --json
```

用同一个 imprint 问一次：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --with-imprint ./learn_receipt.json \
  --facts-store ethereum_research_v1 \
  --prompt "What should I check before unlimited ERC-20 approval? Check local facts." \
  --include-text \
  --json > run-v1.json
```

然后更新 facts v2。保持同一个 `fact_id`，改 `text`：

```json
{
  "schema_version": "edge.demo.facts.v1",
  "store": "ethereum_research_v1",
  "facts": [
    {
      "fact_id": "app-policy-max-approval",
      "topic": "approval review policy",
      "text": "For unlimited ERC-20 approvals, the assistant should warn that the spender may transfer tokens up to the approved allowance and should suggest a bounded allowance when the app supports it.",
      "tags": ["ethereum", "erc20", "approval", "risk"],
      "source_label": "app-policy-v2"
    }
  ]
}
```

重新 import：

```bash
edge demo facts import ./eth-facts-v2.json \
  --store ethereum_research_v1 \
  --json
```

用同一个 imprint、同一个问题再问一次：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --with-imprint ./learn_receipt.json \
  --facts-store ethereum_research_v1 \
  --prompt "What should I check before unlimited ERC-20 approval? Check local facts." \
  --include-text \
  --json > run-v2.json
```

比较两个 JSON：

| 字段 | 预期 |
|---|---|
| `model.sha256` | 不变 |
| `neural_imprint.artifact_id` | 不变 |
| `tool_calls[0].result_sha256` | 改变 |
| `answer_sha256` | 通常改变 |
| `tool_calls[0].name` | 始终是 `local_facts_lookup` |

这证明：**知识更新通过 facts re-import 完成，不需要重新 learn/imprint。**

## 7. 常见问题

### Q1. 以太坊知识应该写进 `records` 还是 `facts`？

大段 EIP、合约规则、安全结论应该写进 `facts`。

`records` 只写行为和偏好，例如“回答时先讲风险”“不能自动签名”“缺字段必须追问”。

### Q2. 为什么 facts 里也能写安全规则？

如果它是“可查的业务规则”，可以写 facts。例如：

```text
Unlimited ERC-20 approvals must be highlighted as a risk.
```

但“回答时必须先展示风险，再展示交易结构”是行为姿态，应该写进 learn/imprint。

### Q3. 能不能让模型自动联网查最新 EIP？

这个 demo 不做联网同步。当前语义是：开发者或 App 把可信资料更新到本地 facts 文件，然后 re-import。

这样 receipt 能明确证明：

- 数据来自本地
- tool 是 read-only
- `network_used=false`

### Q4. 能不能让模型直接构造和签名交易？

不要在当前 demo 里做自动签名或广播。推荐边界：

- 可以解释交易结构
- 可以列出缺失参数
- 可以提示风险
- 可以生成“待用户确认的草案”
- 不签名
- 不广播
- 不绕过用户确认

### Q5. `unknown_tool` 是什么？

模型输出了未注册的 tool 名。以太坊开发者最容易踩的坑是 sample 里写了自定义 tool 名，例如 `ethereum_facts_lookup`，但运行时真正注册的是 `local_facts_lookup`。

修法：sample 的 `tool_schema_export.tools[].name` 必须对齐为 `local_facts_lookup`。

### Q6. 默认为什么不显示 facts 原文？

默认是 hash-only，避免把本地事实原文写进 stdout 或 receipt。开发调试时可以显式加：

```bash
--include-text
```

生产 App 应按自己的隐私策略决定是否展示原文。

## 8. 给开发者的最小任务清单

让开发者现场完成这 6 件事：

1. 写 `eth-facts-v1.json`
2. `edge demo facts import ./eth-facts-v1.json --store ethereum_research_v1 --json`
3. `edge demo chat --facts-store ethereum_research_v1 ... --json`，确认 `tool_calls[].rows > 0`
4. 写 `eth-risk-sample.json`，其中 tool 名必须是 `local_facts_lookup`
5. `edge demo learn run --sample-file ./eth-risk-sample.json ... --json`
6. 用同一个 `learn_receipt.json` + `--facts-store` 跑 chat，再 re-import v2 facts，确认答案随 facts 更新

如果这 6 步都能跑通，他就已经完成了当前 Developer Preview 里最关键的业务接入闭环。
