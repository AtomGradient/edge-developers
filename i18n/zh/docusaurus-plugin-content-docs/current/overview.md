---
sidebar_position: 1
title: 从这里开始
---

# 从这里开始

AtomGradient Edge 是一个本地优先的开发者平台，用来构建运行在用户自有设备上的私有 AI 代理，让模型在端侧运行、学习并跨设备协同。

Neural Imprint 是这个技术栈里的端侧学习原语：用户特定状态会成为本地、可删除的产物，并在兼容的基础模型中恢复；它不需要替换基础模型包，也不需要把私有 profile 文本塞进每一次 prompt。

开发者预览版先面向 Apple 平台发布。Android、Linux、HarmonyOS、Windows、机器人、汽车与工业设备共享同一个长期技术内核：本地模型、本地学习产物、应用自有工具，以及显式兼容性闸门。

:::info 开发者预览
所有 Edge 产品都处于**开发者预览**阶段。API 可能在版本间变化。Edge Studio、Edge Kit、Edge Engine、Edge Scaffold 和 Edge Halo binary package 都是公开发布面；Edge Halo 源码保持私有。请固定包版本，并在每次升级后用真机重新验证。
:::

## 入门

| 目标 | 指南 | 预期结果 |
| --- | --- | --- |
| 下载模型、对话、运行学习演示 | [CLI 学习演示](/docs/get-started/minute-demo) | 本地对话正常运行，然后用合成纠错样本生成 Neural Imprint 产物；基础模型包保持不变，运行时行为可以被本地学习产物改变。 |
| 安装 Edge Studio | [安装 Edge Studio](/docs/get-started/source-build) | 从公开的 `edge-studio` Python 软件包安装 `edge` CLI。 |
| 启动本地工作台 | [启动 Web UI](/docs/get-started/source-build#启动-web-ui) | `edge studio` 在 `http://127.0.0.1:18842` 运行 Edge Studio。 |
| 构建 iOS shell | [最小 iOS app](/docs/get-started/minimal-ios-app) | Edge Scaffold 使用公开 Swift package 依赖和本地签名，作为最小 iOS 参考 app 编译通过。 |
| 集成 Swift SDK | [Swift SDK 设置](/docs/get-started/quickstart) | Edge Kit 在 Apple 平台 app 中加载本地模型。 |

## 第一组命令

下载模型并启动本地对话：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install edge-studio
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive
```

基础对话跑通后，继续看 [CLI 学习演示](/docs/get-started/minute-demo)：检查合成纠错样本，生成本地 Neural Imprint 产物，并看到用户特定学习在不创建新模型 release 的情况下被恢复。

## 产品栈

| 产品 | 开发者用它做什么 |
| --- | --- |
| **Edge Studio** | 本地工作台与 CLI：模型就绪检查、模型下载回执、本地学习演示、Neural Imprint 生成、设备管理、基准测试与导出。 |
| **Edge Kit** | Swift SDK：LLM、VLM、语音、模型管理、EdgeData、EdgeMesh、EdgeDataMeshBridge、EdgeSession 和 EdgeUI。 |
| **Edge Engine** | 原生端侧推理运行时。由 Edge Kit 打包使用，app 通常不直接 import。 |
| **Edge Halo** | 个性化生命周期层：画像任务、Neural Imprint capsule 校验、恢复编排与兼容性闸门。 |
| **Edge Scaffold** | 参考 app 和导出模板，展示推荐的 iOS 集成方式。 |
| **Edge Roadshow** | 私有内部路演 app，用于演示和产品验证。它不是公开开发者依赖。 |

## 隐私模型

Edge 围绕用户自有计算设计：

- 推理在本地运行。
- 训练输入、纠错和对话历史由 app 在本地管理。
- EdgeMesh 传输是本地网络并受信任关系约束。
- Neural Imprint 产物在恢复前做兼容性校验，也应由 app 提供删除路径。

不要把用户 transcript、纠错内容或画像产物上传到分析、崩溃日志或远程支持系统。

## 核心概念

| 概念 | 面向开发者的含义 |
| --- | --- |
| **本地优先推理** | 模型、prompt、用户数据和个性化产物默认留在用户自有设备上。 |
| **Neural Imprint** | 面向用户特定状态的端侧学习产物：本地、可删除、受兼容性闸门保护，并且恢复时不替换基础模型包。 |
| **App 自有工具** | App 定义自己的工具 schema 和动作空间。Edge 基础设施不应内嵌 app 业务规则。 |
| **EdgeMesh** | 面向用户自有设备的本地网络信任、发现与设备间传输。 |
| **Fail-closed 兼容性** | 个性化和模型产物必须匹配模型、tokenizer/template、runtime 和工具 schema 后才能恢复。 |
