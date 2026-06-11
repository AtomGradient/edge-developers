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

### 1.0.0-rc16 (当前)

- Edge Halo 当前开发者预览版。
- Edge Halo lifecycle：本地 profile jobs 与 Neural Imprint capsule compatibility。
- 面向模型、tokenizer、runtime 和 tool-schema identity 的 fail-closed validation。
- `HaloTextGenerator` 和 `HaloEngineSession` 协议。
- RPP A-library provenance validation 与 profile artifact lifecycle helpers。
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
- 固定依赖 Edge Kit `1.0.0-rc94` 与 Edge Halo `1.0.0-rc16`。
