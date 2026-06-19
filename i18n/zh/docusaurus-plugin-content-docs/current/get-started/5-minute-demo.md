---
sidebar_position: 1
title: CLI 学习演示
---

# CLI 学习演示

:::tip 当前预览版可运行
本教程使用已发布的 CLI 命令。只运行合成样本，可以显式准备兼容的本地模型，并默认写入仅哈希的本地回执。
:::

本页使用已经发布的 B2/B4/B5/B6/B7 CLI 命令。回执使用哈希标识符，默认不保存原始用户文本，并且只描述“恢复本地 Neural Imprint 产物后行为发生变化”。

本教程覆盖完整的本地学习路径：

1. 下载模型。
2. 和基础模型对话。
3. 查看合成学习样本。
4. 运行本地纠错学习流程。
5. 对比基础回答哈希和 Neural Imprint 恢复后的回答哈希。

Neural Imprint 是本地产物和恢复流程。恢复兼容的本地 Neural Imprint 产物可以在兼容性闸门下改变生成行为，不改模型权重。这个演示验证的是本地产物路径和回执路径；它不声称模型质量整体变好。

## 安装预览版 CLI

预览阶段，从 `edge-studio` 源码目录安装 `edge` 命令：

```bash
git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
edge doctor
```

正式公开发布时，`python -m pip install edgestudio` 是预期安装命令。当前预览阶段软件包尚未发布到 PyPI，因此上面的源码安装路径才是可运行路径。

Web UI 设置见 [从源码安装 Edge Studio](/docs/get-started/source-build)。

## 命令

在 `edge-studio` 源码目录里运行：

### 1. 下载基准模型

预览演示使用 `qwen3.5-9b-4bit` 作为基准模型：

```bash
edge models list --json
```

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

这个命令是显式下载。演示不会静默下载模型。如果模型已经存在，下载器复用本地匹配项，并报告缓存路径。

检查模型是否就绪：

```bash
edge models where qwen3.5-9b-4bit --json
edge models doctor qwen3.5-9b-4bit --json
```

### 2. 和基础模型对话

先跑一个普通本地聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive
```

第一次加载 9B 模型可能需要几十秒。看到 `[chat:ready]` 后，可以连续问几个普通问题，并用 `/exit` 退出。

交互式聊天只加载一次模型，在多轮对话中复用 session KV cache，打印每轮回答，并为每轮写一个本地聊天回执。默认情况下，每个回执只保存哈希和路径，不保存原始 prompt 或原始回答。

脚本或 CI 冒烟检查也可以使用一次性命令形式：

```bash
edge demo chat --model qwen3.5-9b-4bit --prompt "What is edge AI?" --max-tokens 64
```

### 3. 查看合成学习样本

在写入任何演示状态之前，先查看合成纠错学习计划：

```bash
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --include-text --json
```

这里可以使用 `--include-text`，因为这是演示自带的合成 fixture。不要把真实用户隐私文本写入回执或支持日志。不加 `--include-text` 时，计划仍保持仅哈希。

这个 dry-run 不加载模型、不写纠错 ledger、不触发重新生成、不恢复 Neural Imprint，也不触网。

### 4. 运行本地学习和 Neural Imprint 恢复

运行本地纠错学习流程：

```bash
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --max-tokens 64 --json
```

这个命令会：

1. 在隔离的演示状态下写入合成 Persona/RPP 输入。
2. 在隔离的纠错 ledger 下写入合成纠错条目。
3. 重新生成本地 Neural Imprint 产物。
4. 在兼容性闸门下恢复该产物。
5. 生成恢复前回答和恢复后回答。
6. 写入 `edge.demo.learn.receipt.v1` 回执。

### 5. 读取对比结果

在 JSON 输出里查看：

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

回执会把同样的对比字段作为顶层回执字段保存。

`answers_differ=true` 表示这个合成演示在恢复本地 Neural Imprint 产物后，生成结果发生了变化。这不是"模型整体变好"的泛化结论。

不重新加载模型也可以检查回执：

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

也可以直接检查更底层的 Neural Imprint 样本和对比路径：

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
```

产物复用冒烟检查是本地、仅清单的检查：

```bash
edge demo reuse --run <run_id> --json
```

它不复制产物，也不是跨设备同步。

### 进阶快捷方式

理解分步流程后，可以用一条命令完成模型准备和学习演示：

```bash
edge demo learn run --prepare-model --model qwen3.5-9b-4bit --source auto --max-tokens 64 --json
```

`--prepare-model` 是显式开关。如果模型缺失，模型准备阶段可能联网并写入模型下载回执。学习演示本身仍保持仅本地，并记录 `network_used_during_demo=false`；报告会把模型准备阶段单独记为 `network_used_during_model_prepare`。

## 回执隐私约定

回执默认是本地的，并且默认只记录哈希：

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

默认回执只包含哈希标识、本地路径、schema 版本和状态，不包含原始用户文本。未来若提供显式 include-text 模式，必须由用户主动选择，并在回执中可见。

## 离线与 fail-closed 要求

演示必须：

- 将模型下载与演示执行分离。
- 只有显式传入 `--prepare-model` 时，一条命令学习演示才可以准备模型。
- 如果缺少必须的本地模型或产物，必须 fail closed。
- 演示运行期间避免静默联网。
- 离线模式下禁止非本机地址网络访问。
- 在本地回执里记录错误状态，而不是静默继续。
