---
sidebar_position: 6
title: 架构
---

# 架构与产品边界

本页说明 Edge 开发者产品如何连接，以及你的 agent 应该集成在哪一层。

## 层级图

```text
┌─────────────────────────────────────────────┐
│                 Your Agent                  │
│  UI · app policy · local user data · tools  │
├─────────────────────────────────────────────┤
│ Edge Kit        Edge Halo        Edge Mesh  │
│ inference SDK   personalization  local mesh │
├─────────────────────────────────────────────┤
│              Edge Engine runtime            │
└─────────────────────────────────────────────┘

开发期工具：
  Edge Studio  →  Edge Scaffold  →  Xcode project
```

## 产品职责

| 产品 | 职责 | 不负责 |
| --- | --- | --- |
| **Edge Engine** | 原生模型执行、运行时调度和底层 cache primitives。 | App UI、tool policy、用户数据或 app 存储。 |
| **Edge Kit** | 公开 Swift SDK：推理、模型管理、EdgeData、EdgeMesh、EdgeSession、EdgeUI 和语音。 | 产品业务逻辑或私有用户数据策略。 |
| **Edge Halo** | 个性化生命周期：画像任务、Neural Imprint capsule 校验、恢复编排和 fail-closed 兼容性检查。 | 模型 forward、mesh 传输或 app-specific 数据导入。 |
| **Edge Studio** | 本地工作台：优化、benchmark、导出、artifact 生成和设备协调。 | 已发布 agent 内的 runtime 行为。 |
| **Edge Scaffold** | 参考 iOS agent 模板，展示推荐集成方式。 | 生产 app 的共享 runtime 依赖。请 fork/export 后由你的 app 自己拥有。 |

你的 agent 是组合点。它决定哪些用户数据可以进入个性化、哪些工具可用、何时运行个性化，以及用户如何查看或关闭它。

## Runtime 流程

```text
1. 用 Edge Kit 加载 base model。
2. 在 agent 中注册工具和本地数据 surface。
3. 可选：用本地 app-approved 输入运行 Edge Halo profile job。
4. 生成或接收 Neural Imprint artifact。
5. 恢复前做兼容性校验。
6. 用已恢复状态运行 chat，不在请求时重复拼接 profile text。
```

关键边界：Neural Imprint 是本地 artifact 和 restore 流程。它不是请求时 prompt stuffing，也不是远程 profile 服务。

## 开发流程

```text
Source model
  → Edge Studio analysis / optimization / benchmark
  → export model + runtime config
  → Edge Scaffold reference project
  → your agent integrates Edge Kit + Edge Halo
  → real-device validation
```

开发期使用 Edge Studio。发布 app 中使用 Edge Kit 和 Edge Halo。Edge Scaffold 是参考实现，不是隐藏依赖。

## 数据边界

| 数据 | Owner | 是否离开当前设备 |
| --- | --- | --- |
| Model weights | App bundle、本地 cache 或用户下载 | 默认不离开 |
| Prompt 与对话历史 | 你的 agent | 默认不离开 |
| Tool results 与 app facts | 你的 agent / EdgeData | 默认不离开 |
| Profile inputs | 你的 agent | 默认不离开 |
| Neural Imprint artifact | 你的 agent / Edge Halo 生命周期 | 仅在用户启用后传给受信任的自有设备 |
| 设备状态与 receipts | EdgeMesh / Edge Studio pairing | 仅本地 mesh |

不要把原始 transcript、correction 或私有 facts 放进远程日志。如果支持流程需要诊断信息，导出 hash、schema version、status receipt 和本地文件名，而不是用户内容。

## 兼容性闸门

个性化 artifact 在 runtime identity 变化时必须 fail closed。至少校验：

- Base model identity 和 family。
- Model shape 和 layer count。
- Tokenizer 与 chat template identity。
- Runtime version。
- Tool schema hash。
- Neural Imprint artifact hash 与 prefix metadata。

如果闸门失败，保持 base model active，并展示清晰恢复路径：重新生成、重新导出或加载匹配模型。

## 公开抽象层级

开发者文档只描述概念、API 和工作流。不会描述私有个性化算法、内部训练目标、kernel 实现细节或内存预算实现细节。

使用这些文档集成产品；使用 Edge Scaffold 和 API reference 查具体代码路径。

如需了解 Neural Imprint artifact restore、LoRA/SFT 与 prompt stuffing 的部署取舍，请阅读 [Neural Imprint vs LoRA](neural-imprint-vs-lora.md)。
