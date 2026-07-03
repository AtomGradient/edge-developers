---
sidebar_position: 4
title: Host-Model 提取
slug: /knowledge-tools/host-model-extraction
---

# Host-Model 提取

需要 edge-studio `0.0.1rc22` 或更高版本。

确定性 URL 导入器把页面存成一条事实，或按 HTML 表格行拆分。对两者都不够用
的长篇正文页面，可以让更强的本地 Mac 模型阅读抓取到的材料并提出离散事实。
模型只负责提出——每条候选都要经 Edge 按 `edge.demo.facts.v1` 校验，通过后
才写入库。

## 运行

```bash
edge demo facts import-url "https://example.org/service-reference" \
  --store service_docs_v1 \
  --topic "service reference" \
  --tags service,docs \
  --extractor host-model \
  --extractor-model qwen3.5-27b-4bit \
  --json
```

- 提取模式是显式的：不加 `--extractor host-model`，导入保持确定性。不存在
  静默的模型兜底。
- `--extractor-model` 指定本地模型，默认 `qwen3.5-27b-4bit`。模型本地不存在
  时命令失败即关闭并给出拉取指引——绝不上网找模型。
- Host-model 提取只作用于单 URL 导入。`crawl-url` 不接受它。

## 校验层保证什么

模型输出只被视为候选事实：

1. 模型收到抓取材料和一份严格输出契约。
2. Edge 解析响应，只归一化顶层候选包装。
3. 每条候选行都过与文件导入相同的确定性 `edge.demo.facts.v1` 校验器——必需
   字段、类型、数量。
4. 无效输出在任何库写入之前失败即关闭。模型无法重定向目标库。

## 读回执

回执把这条路径标记为非确定性，并对每个阶段做指纹：

| 字段 | 含义 |
|---|---|
| `extractor.mode` | `host-model` |
| `extractor.extractor_model_ref`、`model_path`、`model_sha256` | 实际运行的本地模型，带目录 manifest 哈希 |
| `prompt_sha256`、`schema_sha256` | 精确的指令与输出契约 |
| `input_sha256`、`model_input_sha256` | 交给模型的材料 |
| `output_sha256`、`validated_payload_sha256` | 模型原始输出与校验后 payload |
| `source_chars`、`model_input_chars`、`input_truncated` | 模型是否看到了整页：长页面按 `--max-chars` 裁剪，回执如实说明 |
| `validation_status` | `passed`——否则什么都没写入 |
| `non_deterministic_extraction` | `true` |

同一页面两次运行可能产生不同的事实拆分——这是你为提取质量主动换取的
trade-off。如果回执报告 `input_truncated: true`，调大 `--max-chars` 或分段
导入页面。

## 什么材料用哪个提取器

| 材料 | 用法 |
|---|---|
| 带 HTML 表格的索引页 | 确定性 `--split html-table-rows` |
| 短页面、单一主题 | 确定性单页导入 |
| 含大量离散事实的长篇正文 | `--extractor host-model` |
| 若干链接页面 | [`crawl-url`](/docs/knowledge-tools/import-from-url)（仅确定性） |
