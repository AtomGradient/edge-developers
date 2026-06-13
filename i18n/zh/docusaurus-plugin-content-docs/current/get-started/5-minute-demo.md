---
sidebar_position: 2
title: 5 分钟 Neural Imprint demo
---

# 5 分钟 Neural Imprint demo

:::tip Runnable in current preview
这个 flow 使用已经发布的 B2/B4/B6 CLI 命令。它只跑 synthetic sample，使用显式准备好的本地模型，并默认写入 hash-only local receipt。
:::

目标是用同一个兼容模型展示 base answer 与 restored Neural Imprint answer 的行为差异，同时产出 local receipt，证明发生了什么，但不保存 raw private text。Neural Imprint 是本地 artifact 和 restore flow。恢复兼容的本地 Neural Imprint artifact 可以在 compatibility gates 下改变行为，不改模型权重。

## Flow

可运行 flow 是：

1. 检查本地环境与 preview package access。
2. 在 demo run 之外解析或显式下载受支持的本地模型。
3. 对 synthetic sample plan 做 dry-run。
4. 生成本地 Neural Imprint artifact。
5. 在 compatibility gates 下恢复该 artifact。
6. 对比 base answer 与 restored-artifact answer 的 hash。
7. 从 local receipt 检查已完成 run，不加载模型。
8. 写入并验证只包含 path、hash、schema version 与 status 的 local receipt。

## Commands

安装 preview CLI 后，在 EdgeStudio checkout 里运行：

```bash
edge doctor
edge models list
edge models where qwen3.5-0.8b
edge models doctor qwen3.5-0.8b
edge models fetch qwen3.5-0.8b --source auto
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model auto --question "Summarize this synthetic profile."
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-0.8b --question "Summarize this synthetic profile." --max-tokens 8 --json
edge demo imprint compare --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json --json
edge demo receipt --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json
edge demo local-only --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json --json
```

`edge models fetch` 是显式命令，并且与 demo run 分离。如果 `edge models where qwen3.5-0.8b` 已经报告本地模型完整，可以跳过 fetch。demo 命令不会 silent download models。

real run 会打印 `receipt_path`。后续 `edge demo imprint compare`、`edge demo receipt` 和 `edge demo local-only` 使用这个实际路径；上面的 `edge-run-example` 只是 placeholder。compare 命令只读取 receipt：不加载模型、不 restore artifact、不生成 answer，也不触网。

## Receipt privacy contract

Receipt 默认必须是 local，并且默认只记录 hash：

```json
{
  "schema_version": "edge.demo.receipt.v1",
  "run_id": "edge-run-example",
  "model_path": "~/Documents/mlx-community/mlx-community_Qwen3.5-0.8B-MLX-4bit",
  "model_sha256": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "sample_id": "synthetic_profile_v1",
  "sample_sha256": "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "artifact_id": "ni-edge-run-example",
  "artifact_path": "~/Library/Application Support/edgestudio/demo_runs/edge-run-example/persona_kv.safetensors",
  "metadata_path": "~/Library/Application Support/edgestudio/demo_runs/edge-run-example/persona_kv_metadata.json",
  "artifact_sha256": "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "metadata_sha256": "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
  "prefix_tokens": 1234,
  "base_answer_sha256": "sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "base_answer_tokens": 8,
  "personalized_answer_sha256": "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "personalized_answer_tokens": 8,
  "answers_differ": true,
  "raw_text_included": false,
  "network_used_during_demo": false,
  "status": "completed"
}
```

默认 receipt 应只包含 hashed identifiers、local paths、schema versions 和 status，不应包含 raw user text。未来若提供 explicit include-text mode，必须 opt-in，并在 receipt 中可见。

## Offline 与 fail-closed 要求

demo 必须：

- 将 model download 与 demo execution 分离。
- 如果缺少必须的本地模型或 artifact，fail closed。
- demo run 期间避免 silent network access。
- offline mode 下禁止 non-localhost network access。
- 在 local receipt 里记录 error status，而不是静默继续。

## 可接受措辞

可以使用：

- "behavior changed after restoring local Neural Imprint artifact"
- "restore local Neural Imprint artifact can change behavior under compatibility gates"
- "receipt contains hashed identifiers and no raw user text by default"

没有评估证据时，不写质量变好这类 claim。
