---
sidebar_position: 2
title: 5 分钟 Neural Imprint demo
---

# 5 分钟 Neural Imprint demo

:::warning Not shipped in current preview
这是由 Developer Preview DX roadmap 的 B4 跟踪的 planned first-wow flow。完整 flow 在 `edge demo imprint run` 发布前不应视为可运行。`edge doctor`、只读的 `edge models list/where/doctor`、显式的 `edge models fetch` 与 B6a `edge demo receipt/local-only` 检查命令已经发布。
:::

本页先固定 demo contract，等 CLI 落地后再变成可运行入口。目标是用同一个兼容模型展示 base answer 与 restored Neural Imprint answer 的行为差异，同时产出 local receipt，证明发生了什么，但不保存 raw private text。

## 计划中的流程

计划中的流程是：

1. 检查本地环境与 preview package access。
2. 在 demo run 之外解析或下载受支持的本地模型。
3. 加载 synthetic 或 redacted sample pack。
4. 生成本地 Neural Imprint artifact。
5. 在 compatibility gates 下恢复该 artifact。
6. 对比 base answer 与 restored-artifact answer。
7. 写入只包含 path、hash、schema version 与 status 的 local receipt。

Neural Imprint 是本地 artifact 和 restore flow。恢复兼容的本地 Neural Imprint artifact 可以在 compatibility gates 下改变行为，不改模型权重。

## Receipt privacy contract

Receipt 默认必须是 local，并且默认只记录 hash：

```json
{
  "schema_version": "edge.demo.receipt.v1",
  "run_id": "edge-run-example",
  "model_path": "~/Documents/mlx-community/Qwen3.5-4B-4bit",
  "model_sha256": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "sample_id": "synthetic_finance_v1",
  "sample_sha256": "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "artifact_id": "ni-example",
  "artifact_sha256": "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "metadata_sha256": "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
  "raw_text_included": false,
  "network_used_during_demo": false,
  "status": "planned_contract"
}
```

默认 receipt 应只包含 hashed identifiers、local paths、schema versions 和 status，不应包含 raw user text。未来若提供 explicit include-text mode，必须 opt-in，并在 receipt 中可见。

## Offline 与 fail-closed 要求

计划中的 demo 必须：

- 将 model download 与 demo execution 分离。
- 如果缺少必须的本地模型或 artifact，fail closed。
- demo run 期间避免 silent network access。
- offline mode 下禁止 non-localhost network access。
- 在 local receipt 里记录 error status，而不是静默继续。

## 计划中的命令

计划中的 flow 会组合已发布的环境/模型/receipt 命令和计划中的 demo orchestration：

```bash
edge doctor
edge models list
edge models where qwen3.5-0.8b
edge models doctor qwen3.5-0.8b
edge models fetch qwen3.5-0.8b
edge demo imprint run --sample synthetic-finance --model auto --question "Summarize this synthetic finance profile."
edge demo receipt --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json
edge demo local-only --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json
```

当前 preview 已发布 `edge doctor`、`edge models list/where/doctor/fetch`、`edge demo receipt` 与 `edge demo local-only`。`edge demo imprint run` 仍等待 B4，所以完整 first-wow flow 还不能视为可运行。

## 可接受措辞

可以使用：

- "behavior changed after restoring local Neural Imprint artifact"
- "restore local Neural Imprint artifact can change behavior under compatibility gates"
- "receipt contains hashed identifiers and no raw user text by default"

没有评估证据时，不写质量变好这类 claim。
