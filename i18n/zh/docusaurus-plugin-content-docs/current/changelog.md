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

### 1.0.0-rc13 (当前)

- Edge Kit 初始开发者预览版。
- 模块：EdgeInference、EdgeModelKit、EdgeVoice、EdgeMesh、EdgeData、EdgeUI。
- 支持 LLM、VLM、TTS、STT engine。
- 面向长上下文多轮会话的 DSR Attention。
- 自动 KV cache 内存策略。
- LoRA 适配器加载。

## edge-halo

### 1.0.0-rc1 (当前)

- Edge Halo 初始开发者预览版。
- 面向端侧模型进化的 HALO 算法系统。
- 用户画像分析、适配器生命周期、activation steering。
- `HaloTextGenerator` 和 `HaloEngineSession` 协议。

## edge-engine

### 1.0.0-rc96 (当前)

- Edge Engine 初始开发者预览版。
- 原生 Metal 推理运行时。
- DSR Attention 实现。

## edge-scaffold

### 当前

- Edge Scaffold 初始开发者预览版。
- 从 Edge Studio 导出生成 iOS app 模板。
- 基于 ScaffoldConfig 的自定义。
- 四层模型分发（Cache → Bundle → ODR → HuggingFace）。
