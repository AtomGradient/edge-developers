---
sidebar_position: 7
title: 回执与 Local-Only 契约
slug: /knowledge-tools/receipts-and-local-contract
---

# 回执与 Local-Only 契约

每次学习、导入和聊天运行都会写一份本地回执。回执是两个承诺的审计凭证：
**发生了什么被如实记录**，以及**私有数据留在了本地**。本页覆盖回执的读法、
仅哈希默认值和 local-only 验证命令。

## 默认仅哈希

默认情况下，回执只存哈希化标识，不存原始用户文本：

```json
{
  "raw_text_included": false,
  "network_used_during_demo": false,
  "network_used_during_model_prepare": false,
  "question_sha256": "sha256:...",
  "before_answer_sha256": "sha256:...",
  "after_answer_sha256": "sha256:...",
  "expected_tool_policy_sha256": "sha256:..."
}
```

`--include-text` 会打印并存储原始文本。只对本来就该被阅读的合成样本使用它。
不要对真实用户输入或你不希望打印在终端、存进本地回执文件的私人记录使用。

## Learn 回执证明什么

一次完成的学习运行做了四件本地的事，回执逐一记录：

1. 把合成 records 写入隔离的演示状态。
2. 记录 correction。
3. 生成并恢复本地 Neural Imprint 产物。
4. 对比恢复前后的回答。

回执同时是交接对象：`--with-imprint` 接受 `learn_receipt.json` 路径，读取
其中记录的产物与元数据，校验通过才使用，不匹配则失败即关闭。你永远不需要
手工传原始产物路径。

## 不重新加载模型即可检查回执

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

local-only 检查验证演示期间没有发生非 localhost 的网络访问。模型准备（拉取
你没有的模型）单独记录为 `network_used_during_model_prepare`，所以一次正当的
下载不会模糊演示本身的 local-only 声明。

会联网的命令对此毫不含糊：URL 导入记录 `network_used=true`，回执保持
hash-first。见[从 URL 导入](/docs/knowledge-tools/import-from-url)。

## 把契约带进你的 App

同样的原则适用于生产载体：

- 私有信号默认留在本地；文本暴露必须是显式、慎重的选择。
- 学习状态保持可移除——删除产物必须让 App 回到基础模型路径。
- 恢复对模型、tokenizer/template、运行时和工具 schema identity 失败即关闭。
- 把发生的事如实记录在你的 App（和你的用户）可检查的本地审计轨迹里。

## 可选的更底层冒烟检查

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

这些命令用于产物复用和实现检查，不是快速开始路径的必需部分。
