---
sidebar_position: 1
slug: /
title: 从这里开始
---

# 从这里开始

AtomGradient Edge 是一个本地优先的开发者平台，用来构建运行在用户自有设备上的私有 AI agent，让模型在端侧运行、学习并跨设备协同。

Developer Preview 先面向 Apple 平台发布。Android、Linux、HarmonyOS、Windows、机器人、汽车与工业设备共享同一个长期技术内核：本地模型、本地学习 artifact、app 自有工具，以及显式兼容性闸门。

:::info 开发者预览
所有 Edge 产品都处于 **Developer Preview**。API 可能在版本间变化。部分仓库和 Swift package 依赖仍可能需要 AtomGradient preview access。请固定包版本，并在每次升级后用真机重新验证。
:::

## 先试这个

从能最快证明价值的路径开始：

| 目标 | 从这里开始 | 它证明什么 |
| --- | --- | --- |
| 先看到学习闭环 | [CLI 学习 demo](/docs/get-started/minute-demo) | 本地 correction 可以生成 Neural Imprint artifact，在兼容性闸门下恢复，并写入 hash-only receipt。 |
| 安装预览 package | [从源码安装 Edge Studio](/docs/get-started/source-build) | `edge` CLI 和本地 Web UI 可以从未来 pip package 的源码结构运行。 |
| 启动本地工作台 | [从源码启动 Web UI](/docs/get-started/source-build#启动-web-ui) | Edge Studio 可以作为 localhost 工作台运行在 `http://127.0.0.1:18842`。 |
| 构建 iOS shell | [最小 iOS app](/docs/get-started/minimal-ios-app) | Edge Scaffold 可以作为当前最小 iOS 参考 app 编译。该路径需要 preview access。 |
| 集成 Swift SDK | [Swift SDK 设置](/docs/get-started/quickstart) | Edge Kit 可以加入 Apple 平台 app，并加载本地模型。 |

## 五分钟命令

预览 demo 推荐使用 `qwen3.5-9b-4bit` 作为基准模型：

```bash
edge demo learn run --prepare-model --model qwen3.5-9b-4bit --source auto --max-tokens 8 --json
```

`--prepare-model` 是显式开关。如果模型缺失，该命令可能通过配置好的预览下载路径准备模型，并把模型准备阶段和本地学习 demo 分开记录。

## 产品栈

| 产品 | 开发者用它做什么 |
| --- | --- |
| **Edge Studio** | 本地工作台与 CLI：模型就绪检查、模型下载 receipt、本地学习 demo、Neural Imprint 生成、设备管理、benchmark 与导出。 |
| **Edge Kit** | Swift SDK：LLM、VLM、语音、模型管理、EdgeData、EdgeMesh、EdgeDataMeshBridge、EdgeSession 和 EdgeUI。 |
| **Edge Engine** | 原生端侧推理运行时。通常由 Edge Kit 打包使用，app 不直接 import。 |
| **Edge Halo** | 个性化生命周期层：画像任务、Neural Imprint capsule 校验、恢复编排与兼容性闸门。 |
| **Edge Scaffold** | 参考 app 和导出模板，展示推荐的 iOS 集成方式。 |

## 隐私模型

Edge 围绕用户自有计算设计：

- 推理在本地运行。
- 训练输入、纠错和对话历史由 app 本地管理。
- EdgeMesh 传输是本地网络并受信任关系约束。
- Neural Imprint artifacts 在恢复前做兼容性校验，也应由 app 提供删除路径。

不要把用户 transcript、correction 或 profile artifact 上传到分析、崩溃日志或远程支持系统。

## 核心概念

| 概念 | 面向开发者的含义 |
| --- | --- |
| **本地优先推理** | 模型、prompt、用户数据和个性化 artifact 默认留在用户自有设备上。 |
| **Neural Imprint** | 本地个性化 artifact，让兼容 base model 恢复用户相关状态，而不改模型权重。 |
| **App 自有工具** | App 定义自己的 tool schema 和动作空间。Edge 基础设施不应内嵌 app 业务规则。 |
| **EdgeMesh** | 面向用户自有设备的本地网络信任、发现与设备间传输。 |
| **Fail-closed compatibility** | 个性化和模型 artifacts 必须匹配模型、tokenizer/template、runtime 和 tool schema 后才能恢复。 |
