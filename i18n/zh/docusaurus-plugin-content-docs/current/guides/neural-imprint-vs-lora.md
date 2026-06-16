---
sidebar_position: 7
title: Neural Imprint vs LoRA
---

# 为什么 Neural Imprint 是 artifact，而不是 LoRA 或 prompt stuffing

Neural Imprint 是本地 artifact 和 restore flow。它面向需要用户特定状态的 app，同时保持 base model weights 不变、可删除，并且由 runtime compatibility checks 保护。

本页只在公开产品层面对比三种有效的个性化模式：

- Neural Imprint 产物 restore
- LoRA 或 SFT weight adaptation
- Prompt stuffing

它们是面向不同部署契约的 different tradeoffs。Neural Imprint、LoRA 与 SFT 服务不同 use cases。

## 摘要

| Pattern | 改变什么 | 发生时机 | 隐私与更新契约 |
|---|---|---|---|
| Neural Imprint 产物 restore | 将本地 runtime artifact 恢复进兼容 base model session | Runtime，且 compatibility gates 通过后 | Base weights 不变；artifact 是本地、可删除用户数据 |
| LoRA / SFT | 训练并发布 model weights 或 adapter weights | Training 或 fine-tuning 阶段 | 产生新的 model 或 adapter release，需要分发和验证 |
| Prompt stuffing | 每次请求都插入额外 profile 或 instruction text | Request time | 在 prompt context 中重复私有 profile text，并占用 context budget |

## Neural Imprint 产物 restore

Neural Imprint 保持 base model 不变。你的 app 或本地 workflow 创建 Neural Imprint 产物，把它作为本地用户数据存储，并且只在 compatibility gates 通过后 restore。

关键属性：

- **Base weights unchanged。** Base model package 保持不变。
- **Local artifact。** 个性化状态作为本地 artifact 存储，并可删除。
- **Compatibility gates。** Restore 前必须校验 model identity、runtime version、tokenizer identity、工具 schema hash 和 artifact 元数据。
- **No profile text replay。** Restore 后 chat 仍走同一条 generation path；app 不应把 profile text 粘贴进每次 system prompt。
- **Fail closed。** 如果 validation 失败，保持 base model active，并提供 重新生成erate、re-export 或 load matching model 等恢复路径。

这段解释刻意停留在公开 API 与 workflow 层级。它不描述私有 artifact 构造、模型个性化算法、训练内部机制、runtime 内部机制或实现公式。

## LoRA 与 SFT weight adaptation

LoRA 和 SFT 是合法的 training-time adaptation 技术。当你想训练一个模型或 adapter，并把适配后的 artifact 作为新 release 发布时，它们很有用。

它们的部署契约不同：

- 适配后的 model 或 adapter 会成为需要分发的版本化 artifact。
- Release 需要像任何模型更新一样被验证。
- Rollback 和 removability 属于 model 或 adapter management。
- 它不是简单的 per-user local runtime restore。

对于需要集中式模型发布、经过策划的 domain behavior 或离线批量训练的产品，LoRA 或 SFT 可以是合适工具。Neural Imprint 面向不同契约：围绕不变且兼容的 base model 做本地、用户特定 runtime state。

## Prompt stuffing

Prompt stuffing 指把 profile text、summary 或长 instruction 插入每次请求。它可用于简单 prototype，但隐私和 runtime 形态不同：

- Profile text 会在 request context 中重复出现。
- Context budget 会花在重放状态上。
- App 必须决定哪些私有文本可以安全进入每次 prompt。
- Prompt content 可能偏离本地 artifact lifecycle 与 compatibility gates。

Neural Imprint 避免 request-time profile replay。恢复后的 artifact 在 compatibility gates 下改变 runtime state，而 prompt 仍聚焦当前用户请求和 tool context。

## 如何选择

当你需要以下能力时，使用 Neural Imprint 产物 restore：

- 本地用户特定状态；
- 不改变 base weights；
- 失败即关闭 compatibility validation；
- 用户可删除的个性化数据；
- 不做 request-time profile text replay。

当你需要以下能力时，使用 LoRA 或 SFT：

- 训练后的 model 或 adapter release；
- 集中式评估和分发；
- 不是 per-user local state 的 domain adaptation；
- 独立于用户自有 artifact 的模型更新生命周期。

当你需要以下能力时，使用 prompt stuffing：

- 轻量 prototype；
- 显式 request-time instructions；
- 不需要 artifact lifecycle；
- 少量、非私密、可以安全重复进 prompt 的上下文。

## 非主张

本页不对 Neural Imprint、LoRA、SFT 或 prompt stuffing 排名。它不做 evaluation claims。它描述的是部署边界和数据归属。

它也不描述私有实现细节，例如 artifact 构造、训练方法、runtime 公式或资源规划内部机制。

## 相关指南

- [架构与产品边界](architecture.md)
- [使用 Edge Halo 做模型进化](/docs/build/model-evolution)
- [Neural Imprint 生命周期示例](/docs/examples/personalized-model)
