---
title: 领域知识工作流：本地事实库 + Neural Imprint
sidebar_label: 领域知识工作流
slug: /knowledge-tools/domain-knowledge-workflow
---

# 领域知识工作流：本地事实库 + Neural Imprint

本页把一个领域从头到尾走一遍：把你的材料拆成可刷新的知识和学习到的行为，
把两者接进聊天，并证明知识更新不需要重新学习。

本页的示例领域是一个面向以太坊开发者的交易助手 App。以太坊只是示例数据集：
这里的每个 Edge 命令、schema 和工具机制都是通用的，Edge runtime 里没有任何
领域专用路径。把示例事实和边界换成你自己的领域，工作流完全不变。

核心原则：**不要把所有业务知识训练进模型。**

## 拆分知识与行为

先把你的材料分成两类。

| 材料 | 放到哪里 | 为什么 |
|---|---|---|
| 协议摘要、规范规则、审计结论、接口说明、安全清单 | `edge demo facts` 本地事实库 | 这些知识会变。变化时重新导入文件即可，不需要学习运行。 |
| 风险姿态、回答顺序、确认边界、缺字段策略 | `edge demo learn` 或 `edge demo imprint` | 这些是行为偏好，应该成为可恢复的 Neural Imprint 状态。 |

两条线的工具名必须对齐。如果 learn 样本教的是
`tool_schema_export.tools[].name = "ethereum_facts_lookup"`，运行时 chat 就
应该通过 `--tools-manifest` 注册同名工具。如果用 `--facts-store` 快捷路径，
样本就应该用内置的 `local_facts_lookup` 名。

## 前置条件

安装 Edge Studio Developer Preview 并准备本地模型：

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

## 创建领域事实文件

创建 `eth-facts-v1.json`——形状是通用的
[`edge.demo.facts.v1`](/docs/knowledge-tools/local-facts)，只有内容是领域
示例数据：

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

导入并检查：

```bash
edge demo facts import ./eth-facts-v1.json --store ethereum_research_v1 --json
edge demo facts list --store ethereum_research_v1 --json
edge demo facts inspect erc20-approve-risk --store ethereum_research_v1 --include-text --json
```

默认输出和回执只含哈希；`--include-text` 显示事实原文。字段参考与库机制见
[本地事实库](/docs/knowledge-tools/local-facts)。

### 从 URL 导入材料

如果材料在文档页面上，直接导入。对带 HTML 表格的索引页：

```bash
edge demo facts import-url "https://eips.ethereum.org/all" \
  --store ethereum_research_v1 \
  --topic "EIP index" \
  --tags ethereum,eip,index \
  --split html-table-rows \
  --fact-id-prefix eip-index \
  --json
```

`import-url` 是单 URL 导入，不是爬虫。三条相关路径各有专页：

| 材料 | 命令 | 详情 |
|---|---|---|
| 单页或索引表格 | `import-url` | [从 URL 导入](/docs/knowledge-tools/import-from-url) |
| 长篇正文页面（rc22+） | `import-url --extractor host-model` | [Host-Model 提取](/docs/knowledge-tools/host-model-extraction) |
| 少量同源链接页面（rc22+） | 带显式边界的 `crawl-url` | [从 URL 导入](/docs/knowledge-tools/import-from-url#抓取小规模同源文档集) |

它们都是显式本地导入路径、hash-first 回执——不是后台爬虫，也不是云端 RAG。

## 注册开发者命名的只读工具

接入 App 时，给查询工具一个载体拥有的稳定名字。创建 `tools.json`：

```json
{
  "schema_version": "edge.demo.tools.manifest.v1",
  "tools": [
    {
      "name": "ethereum_facts_lookup",
      "kind": "local_facts_lookup",
      "store": "ethereum_research_v1",
      "description": "Read-only lookup for imported Ethereum facts and app policies."
    }
  ]
}
```

校验：

```bash
edge demo tools validate ./tools.json --json
```

manifest 做的是命名并绑定内置只读事实查询 executor；它不授权联网、执行
进程、签名、广播、写文件或开发者自实现代码。manifest 机制见
[本地事实库](/docs/knowledge-tools/local-facts)。要用普通 Python 函数实现你
自己的工具逻辑，用[自定义 Python 工具](/docs/knowledge-tools/custom-python-tools)。

## 让 chat 使用本地 facts

显式启用 manifest：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --prompt "What risk should I check before an ERC-20 approve call? Check local facts." \
  --tools-manifest ./tools.json \
  --include-text \
  --json
```

在 JSON 回执里检查这些字段：

| 字段 | 预期结果 |
|---|---|
| `tool_calls[].name` | `ethereum_facts_lookup` |
| `tool_calls[].rows` | 查到本地事实时大于 `0` |
| `tool_calls[].result_sha256` | 本地查询结果的哈希 |
| `network_used` | `false` |
| `tool_instruction_sha256` | 模型可见工具指令的哈希 |

没有 `--tools-manifest` 或 `--facts-store` 时，chat 不注册本地事实工具，
保持普通基础模型聊天。

## 学习领域行为边界

facts 回答"模型该查什么"。learn 样本回答"Agent 该怎么行动"。

对本页示例这类交易助手领域，有价值的行为边界包括：

- 先讲风险，再讲交易结构
- 缺链 ID、合约地址、ABI、spender、金额、接收方或 value 时必须追问
- 永不签名交易
- 永不广播交易
- 除非结论存在于本地事实中，否则不声称某个 token、合约或交易是安全的
- 协议与风险结论必须用本地事实支撑

Edge Learn 不改基础模型权重，也不把一大段 prompt 塞进每次请求。它生成一个
可恢复、可移除、可审计的 Neural Imprint 产物。之后的 chat 命令用
`--with-imprint` 恢复它。

### Learn、Imprint 与 Facts

| 路径 | 使用场景 | 输入 | 输出 |
|---|---|---|---|
| `edge demo learn` | 有明确纠正，想表达"原来那样不对，应该这样" | records + corrections + tool policy | learn 回执 + Neural Imprint 产物 |
| `edge demo imprint` | 只有行为记录和偏好，没有纠正 | records + questions | imprint 回执 + Neural Imprint 产物 |
| `edge demo facts` | 是可能频繁变化的事实知识 | fact rows | 本地 SQLite 事实库 |

大多数应用同时用两条线：领域知识进 facts，安全姿态和回答风格进 learn。

### 创建 Learn 样本

从引导模板开始：

```bash
edge demo learn sample init --interactive --output ./eth-risk-sample.json
```

手写时保持这个形状（样本编写参考：
[编写学习样本](/docs/knowledge-tools/learning-samples)）：

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
        "name": "ethereum_facts_lookup",
        "description": "Read-only lookup for imported Ethereum facts and app policies.",
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
        "name": "ethereum_facts_lookup",
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

工具名必须与运行时注册一致。这个例子用 `ethereum_facts_lookup`，chat 就必须
带注册 `ethereum_facts_lookup` 的 `tools.json` manifest 运行。如果选
`--facts-store` 快捷路径，样本里就用内置的 `local_facts_lookup` 名。

### 校验与 Dry Run

```bash
edge demo learn sample validate ./eth-risk-sample.json --json

edge demo tools validate ./tools.json \
  --learn-sample ./eth-risk-sample.json \
  --json
```

报告应该是 `warning_count: 0`。出现 `tool_schema_export_name_mismatch` 警告
意味着 Neural Imprint prefix 和运行时注册在教不同的工具名。

然后在不加载模型、不写演示状态的前提下审计学习计划：

```bash
edge demo learn run \
  --dry-run \
  --sample-file ./eth-risk-sample.json \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

### 运行 Edge Learn

```bash
edge demo learn run \
  --sample-file ./eth-risk-sample.json \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

保存返回的 `receipt_path`。之后的 chat 调用把它传给 `--with-imprint`。
关键字段：

```json
{
  "status": "completed",
  "receipt_path": ".../learn_receipt.json",
  "network_used_during_demo": false,
  "question_count": 2,
  "sample": {
    "sample_id": "ethereum_risk_boundary_v1",
    "record_count": 2,
    "correction_count": 1
  },
  "generation": {
    "artifact_path": ".../neural_imprint.safetensors",
    "metadata_path": ".../neural_imprint_metadata.json"
  }
}
```

## 组合运行：facts + Neural Imprint

同时带本地事实和学习到的行为状态运行 chat：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --with-imprint ./learn_receipt.json \
  --tools-manifest ./tools.json \
  --prompt "Assess this ERC-20 approval plan. Check local facts first. Spender is 0xabc..., amount is unlimited." \
  --include-text \
  --json
```

组合模式下应看到：

```json
{
  "neural_imprint": {
    "active": true,
    "artifact_id": "..."
  },
  "tools_manifest_sha256": "sha256:...",
  "tool_instruction_mode": "hidden_turns",
  "tool_instruction_sha256": "sha256:...",
  "tool_calls": [
    {
      "name": "ethereum_facts_lookup",
      "status": "matched",
      "rows": 1
    }
  ]
}
```

验收点：

1. `neural_imprint.active == true`
2. `tool_instruction_mode == "hidden_turns"`
3. `tool_calls[].name == "ethereum_facts_lookup"`
4. `tool_calls[].rows > 0`
5. `network_used == false`

## 更新知识而不重新学习

这是本工作流的关键产品行为：facts 可以变化而不重跑 learn。

导入 v1 策略：

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

带同一份 `learn_receipt.json` 跑 chat，然后用同一个 `fact_id`、改动 `text`
重新导入 v2：

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

对比重导入前后的回执：

| 字段 | 预期结果 |
|---|---|
| `model.sha256` | 不变 |
| `neural_imprint.artifact_id` | 不变 |
| `tool_calls[0].result_sha256` | 变化 |
| `answer_sha256` | 通常变化 |
| `tool_calls[0].name` | 该 manifest 路径下恒为 `ethereum_facts_lookup` |

这证明：知识刷新通过 facts 重导入完成，不需要另一次学习运行。

## 常见坑

| 坑 | 修法 |
|---|---|
| 大段协议文本被放进 `records` | 领域知识进 facts；records 只留行为。 |
| 模型输出 `unknown_tool` | 确认 `tool_schema_export.tools[].name` 与运行时工具名一致。配这个 manifest 用 `ethereum_facts_lookup`，配 `--facts-store` 用 `local_facts_lookup`。 |
| 助手给出没有依据的安全结论 | 在 learn 里教这条边界，并要求安全结论必须有 facts 支撑。 |
| stdout 意外出现 facts 原文 | 去掉 `--include-text`；默认回执只含哈希。 |
| 知识变了但行为不该变 | 重新导入 facts；除非行为要变，不要重跑 learn。 |

## 最小清单

在你自己的领域完成这 6 件事，闭合整条链路：

1. 创建你的领域事实文件（本页示例：`eth-facts-v1.json`）。
2. 运行 `edge demo facts import ./eth-facts-v1.json --store ethereum_research_v1 --json`。
3. 创建 `tools.json`，运行 `edge demo tools validate ./tools.json --json`，然后运行 `edge demo chat --tools-manifest ./tools.json ... --json` 并确认 `tool_calls[].rows > 0`。
4. 用 manifest 里的工具名创建你的行为样本（本页示例：`eth-risk-sample.json`），运行 `edge demo tools validate ./tools.json --learn-sample ./eth-risk-sample.json --json`。
5. 运行 `edge demo learn run --sample-file ./eth-risk-sample.json ... --json`。
6. 带同一份 `learn_receipt.json` 加 `--tools-manifest` 跑 chat，然后重新导入 v2 facts，确认回答跟随更新后的本地事实。

6 项全过，你就完成了当前 Developer Preview 的完整接入闭环：变化的知识走
本地事实库，学习到的行为走 Neural Imprint，两者留在本地由回执作证。
