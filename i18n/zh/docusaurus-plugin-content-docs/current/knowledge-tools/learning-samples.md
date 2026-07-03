---
sidebar_position: 1
title: 编写学习样本
slug: /knowledge-tools/learning-samples
---

# 编写学习样本

快速开始用的是 CLI 内置的合成样本 `finance_conservative_cashflow_v1`。要用你
自己的本地数据教 Agent，按相同形状保存一个样本文件，通过 `--sample-file`
传入。本页覆盖样本编写、校验，以及"你的数据属于哪条学习路径"这个决策。

Mac CLI 学习路径不消费 `Resources/RPP/` A-library。任何领域形状的本地样本都
可以走 `--sample-file`；A-library 是之后设备端 Edge Halo profile 分析路径才
需要的。

## 按数据的用途选路径

| 你手里的数据 | 用这条路径 | 输出产物 |
|---|---|---|
| 行为风格、边界或偏好，带显式纠正 | Learn | `edge.demo.learn.sample.v1` |
| 行为风格、边界或偏好，无纠正 | Imprint | `edge.demo.imprint.sample.v1` |
| 助手应该查询、且会随时间更新的事实 | Local facts | `edge.demo.facts.v1` 导入骨架，或 URL 导入 |

事实属于[本地事实库](/docs/knowledge-tools/local-facts)，不属于 profile。见
[把事实性知识挡在 profile body 之外](#把事实性知识挡在-profile-body-之外)。

## 从经过校验的模板开始

```bash
edge demo learn sample init --output ./my-budget-sample.json
edge demo learn sample validate ./my-budget-sample.json
```

也可以用最小引导流程：

```bash
edge demo learn sample init --interactive --output ./my-sample.json
```

交互式命令会问你的数据教的是"怎么回应"还是"事实性答案"。回应类数据继续问
是否有纠正；事实类数据则输出一个 facts 导入骨架而不是 profile 样本。

用匹配的命令消费生成的产物：

| 产物 | 校验或消费方式 |
|---|---|
| `edge.demo.learn.sample.v1` | `edge demo learn sample validate ./sample.json`，然后 `edge demo learn run --sample-file ./sample.json ...` |
| `edge.demo.imprint.sample.v1` | `edge demo imprint run --dry-run --sample-file ./sample.json --model qwen3.5-9b-4bit --json` |
| `edge.demo.facts.v1` | `edge demo facts import ./facts.json --store <name>` 或 `edge demo facts import-url <url> ...` |

`sample validate` 当前只校验 learn 样本。imprint 样本用
`imprint run --dry-run` 作为校验步骤。

`validate` 复用与 `--sample-file` 相同的 learn 样本加载器。默认只打印哈希和
计数；加 `--json` 得到机器可读报告。

## Learn 样本的形状

非交互式 learn 模板长这样：

```json
{
  "schema_version": "edge.demo.learn.sample.v1",
  "sample_id": "my_budget_sample_v1",
  "peer_id": "my-demo-peer",
  "app_id": "com.example.myapp",
  "base_model_id": "qwen3.5-9b-4bit",
  "question": "How should I plan my remaining budget this month?",
  "records": [
    {
      "record_id": "budget-001",
      "kind": "explicit_preference",
      "text": "The user wants fixed expenses and emergency cash protected before discretionary spending.",
      "tags": ["budget", "cashflow"]
    },
    {
      "record_id": "budget-002",
      "kind": "cashflow_context",
      "text": "The user has $800 left after rent, utilities, and subscriptions this month.",
      "tags": ["budget", "cashflow"]
    },
    {
      "record_id": "budget-003",
      "kind": "trust_boundary",
      "text": "The user does not want unsupported return claims or speculative investment recommendations.",
      "tags": ["budget", "trust_boundary"]
    }
  ],
  "corrections": [
    {
      "peer_id": "my-demo-peer",
      "app_id": "com.example.myapp",
      "correction_type": "profile_correction",
      "target": {"profile_field": "budget_guidance_style"},
      "correction": {
        "profile_overlay": {
          "priority": "fixed expenses and emergency cash first",
          "boundary": "no unsupported return claims"
        }
      },
      "status": "recorded"
    }
  ],
  "tool_schema_export": {
    "schema_version": "edgestudio.tool_schema_export.v1",
    "tools": [
      {
        "name": "my_budget_facts_lookup",
        "description": "Read-only lookup for local budget facts.",
        "permissions": ["read_facts"],
        "intentTags": ["exact_fact", "budget"],
        "parameters": {
          "type": "object",
          "properties": {"topic": {"type": "string"}}
        }
      }
    ]
  },
  "expected_tool_policy": {
    "description": "Deterministic tool-use policy learned from this sample",
    "tools_available": [
      {
        "name": "my_budget_facts_lookup",
        "when": "User asks about budget priorities",
        "args_constraint": "topic must reference this budget sample"
      }
    ],
    "negative_policy": ["Do not call network tools", "Do not invent return claims"]
  }
}
```

每个 `corrections[].peer_id` 必须与顶层 `peer_id` 一致；不匹配会在模型加载前
失败即关闭。

## 把 App 数据翻译成规范 records

不要把 `transactions`、`merchants`、`categories` 这类 App 专有表放到样本文件
顶层。Edge Studio 只接受上面的规范样本字段，遇到未知顶层字段会失败即关闭。
把业务数据翻译成规范 `records` 与 `corrections` 是你的 App 的职责。

把 `records[].kind` 当作稳定、语义化的 `snake_case` 词汇表来用。它是自由
字符串，但不是装饰：profile body 会按 `(kind, record_id)` 排序记录，并按组
渲染一个 `[kind]` 块。

每条 record 保持为一个可独立复述的事实、偏好或边界。内置理财样本用
`explicit_preference`、`cashflow_context`、`trust_boundary` 就是这个原因。

## 选择纠正类型

| 类型 | 使用场景 | 必需形状 |
|---|---|---|
| `eval_feedback` | 用户对某个具体回答打了分 | `correction.rating` 为 `positive`、`negative` 或 `neutral` |
| `fact_correction` | 某个具体事实错了 | `target.fact_id` 加上纠正后的结构化字段 |
| `profile_correction` | 行为风格或边界需要变化 | `target.profile_field` 或 `target.direction_id` 加上结构化纠正字段 |

fact correction 需要至少两条独立支持的纠正才会进入编译后的 overlay。单条
fact correction 被视为不稳定并跳过，所以一次性的风格或护栏变化请用
`profile_correction`。

## 把事实性知识挡在 profile body 之外

`records` 用于回应姿态：偏好、风格、边界，以及应该成为 Neural Imprint
profile 的紧凑上下文。不要把 profile records 当成大体量或频繁变化事实的
知识库。facts 路径产出 `edge.demo.facts.v1`，它面向本地查询库，不进入
`profile_body`。

这个拆分是有意的：更新本地事实文件不应该要求重建模型或重新生成 Neural
Imprint 产物。只有当助手的行为或边界变化时才改 profile。

## 检查或运行你的样本

```bash
edge demo learn run --dry-run \
  --sample-file ./my-budget-sample.json \
  --model qwen3.5-9b-4bit \
  --json
```

不加 `--include-text` 时，JSON 报告把原始样本文本挡在终端输出之外，只返回
哈希化标识。

## 下一步

- 把查询型知识放进[本地事实库](/docs/knowledge-tools/local-facts)
- 教 Agent 你的工具面：[工具学习](/docs/knowledge-tools/tool-learning)
- 理解回执证明了什么：[回执与 Local-Only 契约](/docs/knowledge-tools/receipts-and-local-contract)
