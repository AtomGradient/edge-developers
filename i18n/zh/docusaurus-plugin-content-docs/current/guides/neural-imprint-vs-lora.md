---
sidebar_position: 7
title: Neural Imprint vs LoRA
---

# Neural Imprint vs LoRA、SFT 与 prompt stuffing

Neural Imprint 是 Edge 的端侧学习契约。它让 app 保持稳定的基础模型包，同时把用户特定学习状态作为本地 artifact 恢复进运行时，并保持可删除。

这对真实产品很关键。用户个性化不应该把每一次偏好更新都变成重新训练、模型发布，或者把更多私有 profile 文本塞进 prompt。Neural Imprint 保持基础模型路径稳定，把个性化放进受兼容性闸门保护的本地运行时状态。

## 简短结论

| Pattern | 产品契约 | 开发者需要承担什么 |
|---|---|---|
| **Neural Imprint** | 将本地学习产物恢复进兼容的基础模型 session | 本地产物生命周期、兼容性闸门、删除 UX |
| **LoRA / SFT** | 训练并发布新的模型或 adapter 权重 | 训练算力、数据整理、发布打包、完整回归评估 |
| **Prompt stuffing** | 每次请求都插入 profile 文本或 instruction | Prompt budget 压力、私有状态重复暴露、prompt 治理 |

这些方案是 different tradeoffs。选择哪个合适工具，取决于 app 的 deployment boundaries、data ownership 模型，以及 evaluation claims。

## 为什么 Neural Imprint 更适合端侧 AI

端侧 AI 面对的约束不同于中心化模型发布。App 需要从用户本地状态中持续学习，同时保留隐私边界、可删除性、跨版本恢复能力，并避免扰动基础模型发布路径。

Neural Imprint 围绕这个契约构建：

- **基础模型包和 base weights 保持不变。** 个性化不会替换已发布模型，也不会修改模型权重，base weights 保持 unchanged。
- **学习状态是本地用户数据。** 产物可以放在 app 自有存储里，只通过受信任的用户自有通道移动，并由 app 删除。
- **恢复受兼容性闸门保护。** 这就是 compatibility gates：激活前校验模型 identity、tokenizer/template、runtime version、工具 schema 和 artifact metadata。
- **失败即关闭且可恢复。** 如果产物不匹配，app 保持基础模型路径 active，并可以重新生成、重新导出或加载匹配模型。
- **不重放 profile 文本。** 这就是 no profile text replay：用户学习状态不会被粘贴进每一次请求；generation 继续聚焦当前消息和工具上下文。

这就是核心优势：产品可以让模型持续学习用户，而不用把个性化变成新的模型发布，也不用把私有状态变成每次请求里的 prompt payload。

## LoRA 和 SFT 在用户级学习里的问题

LoRA 和 SFT 适合目标产物就是训练后的模型或 adapter release 的场景。它们不是用户级、端侧持续学习循环的默认答案。

对于要交付个性化的开发者，它们带来很重的契约：

- 训练需要足够算力、整理过的数据和可复现基础设施。
- 适配后的模型或 adapter 会成为需要版本化发布的产物。
- 每次发布都需要兼容处理、回滚方案和回归评估。
- 权重适配可能改变目标偏好或任务之外的行为，因此必须重新验证基础模型 baseline。
- 用户级 adapter 会放大存储、生命周期和支持复杂度。

LoRA 和 SFT 仍然适合中心化领域适配或策划后的模型发布。当产品目标是在基础模型包稳定的前提下，让用户特定状态在端侧持续演进时，Neural Imprint 是更强的契约。

## Prompt stuffing 的问题

Prompt stuffing 很容易做 prototype：把 profile summary、memory list 或行为 instruction 塞进每一次请求。真正把个性化变成产品状态后，它会迅速失控。

问题很直接：

- Profile text 会在 request context 中重复出现。
- Context budget 会花在状态重放上，而不是当前任务上。
- 更长的 prompt 更难治理、检查和保持稳定。
- Prompt 文本不是可删除、受兼容性闸门保护的 artifact lifecycle。
- App 必须不断决定哪些私有事实可以安全粘贴进请求。

Neural Imprint 避免这种形态。用户学习状态作为本地运行时状态，在显式兼容性闸门下恢复；prompt 可以继续聚焦当前请求。

## 如何选择

当你需要以下能力时，使用 **Neural Imprint**：

- 端侧用户级学习；
- 稳定的基础模型包；
- 本地、可删除的个性化状态；
- 受兼容性闸门保护的 restore；
- 失败时保持基础模型路径 active；
- 不做 request-time profile text replay。

这些是 Neural Imprint 的有效使用场景，不是对所有模型、任务或部署的泛化 evaluation claims。

当你明确需要以下能力时，使用 **LoRA 或 SFT**：

- 训练后的 model 或 adapter release；
- 集中式评估和分发；
- 不是 per-user local state 的 domain adaptation；
- 独立于用户自有 artifact 的模型更新生命周期；
- 有预算运行完整训练和回归评估。

当你明确需要以下能力时，才使用 **prompt stuffing**：

- 轻量 prototype 或短期 instruction layer；
- 显式 request-time instructions；
- 不需要 artifact lifecycle；
- 少量、非私密、可以安全重复进入每次 prompt 的上下文。

## 公开边界

本页描述产品和集成契约，包括部署边界、数据归属、deployment boundaries、data ownership 和 evaluation claims。它不描述私有 artifact 构造方法、训练内部机制、runtime 公式或底层实现细节。

## 相关指南

- [架构与产品边界](architecture.md)
- [使用 Edge Halo 做模型进化](/docs/build/model-evolution)
- [Neural Imprint 生命周期示例](/docs/examples/personalized-model)
