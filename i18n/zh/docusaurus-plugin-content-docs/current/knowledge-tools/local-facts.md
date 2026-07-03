---
sidebar_position: 2
title: 本地事实库
slug: /knowledge-tools/local-facts
---

# 本地事实库

本地事实是可刷新的知识路径：助手应该去查、而不是去记的材料。事实存在本地
SQLite 库里，从文件或 URL 导入，聊天时通过只读工具查询。它们永远不进入
Neural Imprint 的 profile body——知识变化时更新事实文件重新导入即可，不需要
学习运行。

## 创建事实文件

事实文件是 schema 为 `edge.demo.facts.v1` 的 JSON 文档：

```json
{
  "schema_version": "edge.demo.facts.v1",
  "store": "protocol_docs_v1",
  "facts": [
    {
      "fact_id": "rate-limit-policy",
      "topic": "API rate limits",
      "text": "The public API allows 60 requests per minute per key. Batch endpoints are excluded.",
      "tags": ["api", "limits"],
      "source_label": "developer-notes"
    },
    {
      "fact_id": "retention-window",
      "topic": "data retention",
      "text": "Exported reports are retained for 30 days and then deleted automatically.",
      "tags": ["policy", "retention"],
      "source_label": "app-policy"
    }
  ]
}
```

| 字段 | 说明 |
|---|---|
| `schema_version` | 固定为 `edge.demo.facts.v1` |
| `store` | 本地库名。建议带上材料版本，例如 `protocol_docs_v1` |
| `fact_id` | 稳定 ID。重新导入同一个 `fact_id` 会覆盖旧内容 |
| `topic` | 查询主题。模型常从 topic 发起查询 |
| `text` | 事实原文 |
| `tags` | 关键词数组 |
| `source_label` | 来源标签，例如 `developer-notes`、`audit-report`、`app-policy` |

## 导入、列出、检查

```bash
edge demo facts import ./facts.json --store protocol_docs_v1 --json

edge demo facts list --store protocol_docs_v1 --json

edge demo facts inspect rate-limit-policy \
  --store protocol_docs_v1 \
  --include-text \
  --json
```

默认情况下，命令输出和回执只含哈希。只有显式加 `--include-text` 才显示
事实原文。

要导入网页上的材料而不是本地文件，见
[从 URL 导入](/docs/knowledge-tools/import-from-url)。

## 在聊天中使用事实：快捷路径

`--facts-store` 为一个库注册内置只读工具 `local_facts_lookup`：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --facts-store protocol_docs_v1 \
  --prompt "What is the API rate limit? Check local facts." \
  --json
```

没有 `--facts-store` 或 `--tools-manifest` 时，chat 不注册本地事实工具，
保持普通基础模型聊天。

## 给工具一个开发者拥有的名字

快捷路径适合快速验证。接入 App 时，更推荐使用载体自己拥有的稳定工具名。
tools manifest 做的是命名并绑定内置只读事实查询 executor——不是注册开发者
自己实现的代码：

```json
{
  "schema_version": "edge.demo.tools.manifest.v1",
  "tools": [
    {
      "name": "protocol_docs_lookup",
      "kind": "local_facts_lookup",
      "store": "protocol_docs_v1",
      "description": "Read-only lookup for imported protocol documentation."
    }
  ]
}
```

校验并使用：

```bash
edge demo tools validate ./tools.json --json

edge demo chat \
  --model qwen3.5-9b-4bit \
  --tools-manifest ./tools.json \
  --prompt "Check local protocol docs before answering." \
  --json
```

manifest 路径唯一可执行的 kind 是 `local_facts_lookup`。executor、parser、
dispatcher 和回执都由 Edge 负责。manifest 不授权联网、执行进程、写文件或
开发者自实现工具代码。要用普通 Python 函数实现你自己的工具逻辑，用
[自定义 Python 工具](/docs/knowledge-tools/custom-python-tools)。

## 在聊天回执里检查什么

| 字段 | 预期结果 |
|---|---|
| `tool_calls[].name` | 你的工具名（`protocol_docs_lookup`） |
| `tool_calls[].rows` | 查到本地事实时大于 `0` |
| `tool_calls[].result_sha256` | 本地查询结果的哈希 |
| `network_used` | `false` |
| `tool_instruction_sha256` | 模型可见工具指令的哈希 |

## 保持学习名与运行时名对齐

如果 learn 样本教的是 `tool_schema_export.tools[].name =
"protocol_docs_lookup"`，运行时 chat 就应该通过 `--tools-manifest` 注册同名
工具。如果用 `--facts-store` 快捷路径，样本就应该用内置的
`local_facts_lookup` 名。

运行前审计对齐：

```bash
edge demo tools validate ./tools.json \
  --learn-sample ./sample-that-declares-protocol_docs_lookup.json \
  --json
```

校验器对名字不匹配只警告不拦截；把警告当作信号——Neural Imprint prefix 和
运行时工具注册可能在教不同的名字。改样本的 `tool_schema_export` 名或 manifest
工具名，让两边一致。工具 schema 如何进入 Neural Imprint 见
[工具学习](/docs/knowledge-tools/tool-learning)。
