---
sidebar_position: 1
title: CLI 学习 demo
---

# CLI 学习 demo

:::tip Runnable in current preview
这个 flow 使用已经发布的 B2/B4/B5/B6/B7 CLI 命令。它只跑 synthetic sample，可以显式准备兼容的本地模型，并默认写入 hash-only local receipts/manifests。
:::

first-wow 路径应该先符合开发者熟悉的心智，再引入个性化：

1. 下载模型。
2. 和 base model 对话。
3. 查看 synthetic learning sample。
4. 运行本地 correction-learning flow。
5. 对比 base answer hash 和 Neural Imprint restore 后的 answer hash。

Neural Imprint 是本地 artifact 和 restore flow。恢复兼容的本地 Neural Imprint artifact 可以在 compatibility gates 下改变生成行为，不改模型权重。这个 demo 证明的是本地 artifact 路径和 receipt 路径；它不声称模型质量整体变好。

## 安装 preview CLI

preview 阶段，从 `edge-studio` 源码 checkout 安装 `edge` 命令：

```bash
git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
edge doctor
```

正式公开发布时，`python -m pip install edgestudio` 是预期安装命令。当前 preview 阶段 package 尚未发布到 PyPI，因此上面的源码 checkout 路径才是可运行路径。

Web UI 设置见 [从源码安装 Edge Studio](/docs/get-started/source-build)。

## Commands

在 `edge-studio` checkout 里运行：

### 1. 下载基准模型

preview demo 使用 `qwen3.5-9b-4bit` 作为基准模型：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

这个命令是显式下载。如果模型已经存在，下载器可以复用本地 match，并报告 cached path。

检查模型是否就绪：

```bash
edge models where qwen3.5-9b-4bit --json
edge models doctor qwen3.5-9b-4bit --json
```

### 2. 和 base model 对话

先跑一个普通本地聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit --prompt "What is edge AI?" --max-tokens 64
```

第一次加载 9B 模型可能需要几十秒。命令会打印 answer，并写入本地 chat receipt。默认情况下，receipt 只保存 hash 和 path，不保存 raw prompt 或 raw answer。

### 3. 查看 synthetic learning sample

在写入任何 demo state 之前，先查看 synthetic correction-learning plan：

```bash
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --include-text --json
```

这里可以使用 `--include-text`，因为这是 demo 自带的 synthetic fixture。不要把真实用户隐私文本写入 receipt 或 support log。不加 `--include-text` 时，plan 仍保持 hash-only。

这个 dry-run 不加载模型、不写 correction ledger、不触发 regen、不 restore Neural Imprint，也不触网。

### 4. 运行本地学习和 Neural Imprint restore

现在运行本地 correction-learning flow：

```bash
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --max-tokens 64 --json
```

这个命令会：

1. 在隔离 demo state 下写入 synthetic Persona/RPP input。
2. 在隔离 correction ledger 下写入 synthetic correction entries。
3. 重新生成本地 Neural Imprint artifact。
4. 在 compatibility gates 下恢复该 artifact。
5. 生成 before answer 和 after-restored answer。
6. 写入 `edge.demo.learn.receipt.v1` receipt。

### 5. 读取对比结果

在 JSON output 里查看：

```json
{
  "generation": {
    "artifact_path": ".../neural_imprint.safetensors"
  },
  "comparison": {
    "before_answer_sha256": "sha256:...",
    "after_answer_sha256": "sha256:...",
    "answers_differ": true
  },
  "receipt_path": "..."
}
```

receipt 会把同样的 comparison fields 作为顶层 receipt 字段保存。

`answers_differ=true` 表示这个 synthetic demo 在恢复本地 Neural Imprint artifact 后，生成结果发生了变化。这不是“模型整体变好”的泛化结论。

不重新加载模型也可以检查 receipt：

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

### Advanced shortcut

理解分步流程后，可以用一条命令完成模型准备和学习 demo：

```bash
edge demo learn run --prepare-model --model qwen3.5-9b-4bit --source auto --max-tokens 64 --json
```

`--prepare-model` 是显式开关。如果模型缺失，模型准备阶段可能联网并写入 model-fetch receipt。学习 demo 本身仍保持 local-only，并记录 `network_used_during_demo=false`；报告会把模型准备阶段单独记为 `network_used_during_model_prepare`。

### 后续 UX

当前 preview 通过 `edge demo learn run --dry-run --include-text --json` 暴露 sample inspection。后续 CLI 应加入更小白的 `edge demo learn sample show/list` 命令，以及直接的 base-vs-Neural-Imprint chat replay 命令。

## Receipt privacy contract

Receipt 默认必须是 local，并且默认只记录 hash：

```json
{
  "schema_version": "edge.demo.learn.receipt.v1",
  "run_id": "edge-run-example",
  "model_path": "~/Documents/mlx-community/mlx-community_Qwen3.5-9B-4bit",
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
