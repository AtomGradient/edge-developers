---
sidebar_position: 100
title: 更新日志
---

# 更新日志

每个开发者预览版本的破坏性变更、新功能和迁移说明。

:::info
Edge 产品处于**开发者预览**阶段。版本之间可能出现破坏性变更。请固定 package 版本，并在每次升级后验证。
:::

## 版本策略

开发者预览阶段使用 `1.0.0-rcN` 标签发布。破坏性变更会在这里记录迁移步骤。正式可用后会遵循语义化版本。

## 如何升级

1. 更新 `Package.swift` 中固定的版本。
2. 阅读更新日志中的破坏性变更。
3. 构建并修复编译错误。
4. 在真实设备上运行测试套件。
5. 验证首次启动、多轮对话和内存行为。

## 开发者预览边界

Developer Preview 是内部预览通道。更新日志会明确哪些能力已经发布、哪些依赖需要 preview access、哪些能力当前刻意不启用。

### Access matrix

| Surface | 当前 access | 说明 |
|---|---|---|
| Swift SDK docs | Edge Kit `1.0.0-rc94` | 文档使用 exact version pin。升级前必须重新验证。 |
| Edge Engine dependency | Edge Engine `1.0.0-rc136` | 当前部分 preview 仓库或依赖可能需要 AtomGradient internal preview access 或 SSH access。这里是公开 surface，不把它当作当前内部 preview blocker。 |
| Edge Halo dependency | Edge Halo `1.0.0-rc17` | Edge Halo 依赖 Edge Engine `1.0.0-rc136`；请在自己的环境里验证 package resolution。 |
| Edge Scaffold | 固定依赖 Edge Kit `1.0.0-rc94` 与 Edge Halo `1.0.0-rc17` | 生成的 app 仍需要签名、设备 provisioning 和真机验证。 |

### Compatibility matrix

| Component | 兼容 preview |
|---|---|
| Edge Kit | `1.0.0-rc94`，依赖 Edge Engine `1.0.0-rc136` |
| Edge Halo | `1.0.0-rc17`，依赖 Edge Engine `1.0.0-rc136` |
| Edge Scaffold | 当前 preview 固定依赖 Edge Kit `1.0.0-rc94` 与 Edge Halo `1.0.0-rc17` |

generic build 和 simulator check 不足以支撑 runtime claim。任何 preview tag 变化后，都需要重新完成真机验证。

### Known limitations

- `edge doctor` 已在当前 preview 发布，作为只读的 B1 环境检查。它不会下载模型、加载模型、启动 backend，也不会运行 Neural Imprint workflows。
- 计划中的 demo CLI 命令还没有在当前 preview 发布：`edge models fetch`、`edge demo imprint run` 和 `edge demo receipt` 由 Developer Preview DX roadmap 的 B2/B4/B6 跟踪。
- 产品默认的 paired-device route 没有被这份 preview 文档或 changelog 启用。Broad live routing 仍需要单独的显式 policy、opt-in 和真机证据。
- background automation scheduler 尚未发布。当前 bounded automation API 仍是 explicit、默认 dry-run，并且 fail-closed。
- model push 和 Neural Imprint regen execution 在没有单独显式 policy/design 前仍不支持。
- `edge demo reuse` 是 artifact reuse smoke，不是 C2 跨设备同步。
- A5.8 后续项仍包括：background scheduler、apply-status UI reference、可选 production embedded build stamp。
- EdgeMesh capsule auto-restore SDK 编排已经通过 Edge Kit `1.0.0-rc94` 中的 `HaloCapsuleAutoRestoreCoordinator` 发布；它不是当前 limitation。

---

## edge-kit

### 1.0.0-rc94 (当前)

- Edge Kit 当前开发者预览版。
- 模块：EdgeInference、EdgeModelKit、EdgeVoice、EdgeMesh、EdgeData、EdgeUI。
- 支持 LLM、VLM、TTS、STT engine。
- 面向长上下文多轮会话的 DSR Attention。
- 自动 KV cache 内存策略。
- Neural Imprint runtime restore primitives 与 EdgeMesh capsule auto-restore coordinator APIs。
- 依赖 Edge Engine `1.0.0-rc136`。

## edge-halo

### 1.0.0-rc17 (当前)

- Edge Halo 当前开发者预览版。
- Edge Halo lifecycle：本地 profile jobs 与 Neural Imprint capsule compatibility。
- 面向模型、tokenizer、runtime 和 tool-schema identity 的 fail-closed validation。
- `HaloTextGenerator` 和 `HaloEngineSession` 协议。
- RPP A-library provenance validation 与 profile artifact lifecycle helpers。
- dependency version metadata 已对齐当前 preview tag。
- 依赖 Edge Engine `1.0.0-rc136`。

## edge-engine

### 1.0.0-rc136（当前依赖 tag）

- Edge Kit 与 Edge Halo 当前依赖的 Edge Engine tag。
- 原生 Metal 推理运行时。
- DSR Attention 实现。
- `main` 上未发布的 commit 不属于当前 Developer Preview tag；发布新的 `1.0.0-rcN` 后再进入文档口径。

## edge-scaffold

### 当前预览依赖

- Edge Scaffold 初始开发者预览版。
- 从 Edge Studio 导出生成 iOS app 模板。
- 基于 ScaffoldConfig 的自定义。
- 四层模型分发（Cache → Bundle → ODR → HuggingFace）。
- 固定依赖 Edge Kit `1.0.0-rc94` 与 Edge Halo `1.0.0-rc17`。
