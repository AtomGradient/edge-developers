---
sidebar_position: 2
title: 5 分钟 Neural Imprint demo
---

# 5 分钟 Neural Imprint 学习 demo

:::tip Runnable in current preview
这个 flow 使用已经发布的 B2/B4/B5/B6/B7 CLI 命令。它只跑 synthetic sample，可以显式准备兼容的本地模型，并默认写入 hash-only local receipts/manifests。
:::

first-wow 目标是展示一个最小本地学习闭环：把 synthetic correction 写入隔离的 demo state，生成新的 Neural Imprint artifact，在 compatibility gates 下恢复该 artifact，并对比 before/after answer hash；默认不保存 raw private text。Neural Imprint 是本地 artifact 和 restore flow。恢复兼容的本地 Neural Imprint artifact 可以在 compatibility gates 下改变行为，不改模型权重。

## Flow

一条命令路径是：

```bash
edge demo learn run --prepare-model --model qwen3.5-0.8b --source auto --max-tokens 8 --json
```

`--prepare-model` 是显式开关。如果模型已经存在，命令会跳过下载。如果模型缺失，模型准备阶段可能联网并写入 model-fetch receipt。学习 demo 本身仍保持 local-only，并记录 `network_used_during_demo=false`；报告会把模型准备阶段单独记为 `network_used_during_model_prepare`。

展开后的可审计 flow 是：

1. 检查本地环境与 preview package access。
2. 解析或显式下载受支持的本地模型。
3. 对 synthetic learning sample plan 做 dry-run。
4. 在隔离 demo state 下写入 synthetic Persona/RPP input 和 correction entries。
5. 触发 correction-based Neural Imprint regeneration。
6. 在 compatibility gates 下恢复重新生成的 artifact。
7. 对比 before/after answer hash。
8. 从 local receipt 检查已完成 run，不加载模型。
9. 写入并验证只包含 path、hash、schema version 与 status 的 local receipt。
10. 可选：写入 per-app reuse manifests，作为 artifact reuse smoke；它不是跨设备同步。

## 安装 preview CLI

preview 阶段，从 EdgeStudio 源码 checkout 安装 `edge` 命令：

```bash
python -m pip install -e ./edgestudio-core
python -m pip install -e .
edge doctor
```

正式公开发布时，`python -m pip install edgestudio` 是预期安装命令。当前 preview 阶段 package 尚未发布到 PyPI，因此上面的源码 checkout 路径才是可运行路径。

## Commands

在 EdgeStudio checkout 里运行：

```bash
edge doctor
edge models list
edge models where qwen3.5-0.8b
edge models doctor qwen3.5-0.8b
edge models fetch qwen3.5-0.8b --source auto
edge demo learn run --prepare-model --model qwen3.5-0.8b --source auto --max-tokens 8 --json
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model auto
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-0.8b --max-tokens 8 --json
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model auto --question "Summarize this synthetic profile."
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-0.8b --question "Summarize this synthetic profile." --max-tokens 8 --json
edge demo imprint compare --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json --json
edge demo receipt --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json
edge demo local-only --path ~/Library/Application\ Support/edgestudio/demo_runs/edge-run-example/receipt.json --json
edge demo reuse --run edge-run-example --apps notes,finance --json
```

`edge models fetch` 是显式命令，并且与普通 demo run 分离。如果 `edge models where qwen3.5-0.8b` 已经报告本地模型完整，可以跳过 fetch。普通 demo 命令不会 silent download models，demo path does not silently download models。这里唯一可能准备模型的一条命令路径是 `edge demo learn run --prepare-model`，该 flag 让行为保持显式。

real run 会打印 `receipt_path`。后续 receipt inspection 命令使用这个实际路径；上面的 `edge-run-example` 只是 placeholder。compare 命令只读取 receipt：不加载模型、不 restore artifact、不生成 answer，也不触网。

`edge demo reuse` 读取已完成的 B4 receipt，并在同一个 demo run 下写入 per-app reuse manifests。它只是 artifact reuse smoke：不复制 artifact、不同步设备、不 restore artifact、不加载模型，也不触网。

## Receipt privacy contract

Receipt 默认必须是 local，并且默认只记录 hash：

```json
{
  "schema_version": "edge.demo.learn.receipt.v1",
  "run_id": "edge-run-example",
  "model_path": "~/Documents/mlx-community/mlx-community_Qwen3.5-0.8B-MLX-4bit",
  "model_sha256": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "sample_id": "synthetic_profile_correction_v1",
  "sample_sha256": "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "correction_pack_sha256": "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "artifact_id": "learn-edge-run-example",
  "artifact_path": "~/Library/Application Support/edgestudio/demo_runs/edge-run-example/learn_state/neural_imprint_artifacts/neural_imprint.safetensors",
  "artifact_sha256": "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "metadata_sha256": "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
  "before_answer_sha256": "sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "before_answer_tokens": 8,
  "after_answer_sha256": "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "after_answer_tokens": 8,
  "answers_differ": true,
  "model_prepare": {
    "requested": true,
    "status": "skipped_existing",
    "network_used": false
  },
  "network_used_during_model_prepare": false,
  "raw_text_included": false,
  "network_used_during_demo": false,
  "status": "completed"
}
```

默认 receipt 应只包含 hashed identifiers、local paths、schema versions 和 status，不应包含 raw user text。未来若提供 explicit include-text mode，必须 opt-in，并在 receipt 中可见。

## Offline 与 fail-closed 要求

demo 必须：

- 将 model download 与 demo execution 分离。
- 只有显式传入 `--prepare-model` 时，一条命令学习 demo 才能准备模型。
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
