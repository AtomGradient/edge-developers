---
sidebar_position: 1
title: 从这里开始
---

# 从这里开始

你希望自己的 App 越用越懂每个用户。

但这件事通常很快会变重。LoRA 和 SFT 会把每一次重要偏好更新变成训练、打包、发布和回归测试。Prompt stuffing 会把私有 profile 文本反复塞进每一次请求。云端个性化则会把最敏感的用户状态送离设备。

Edge 面向的是这个问题的端侧版本。一个理财助手可以学习用户的一句话：

```text
我不喜欢高风险推荐，我更关注现金流和稳健收益。
```

学习之后，助手回答时应该记住这个偏好。这个偏好留在本地，可以由 App 移除，也可以之后恢复进兼容的模型 session。基础模型包不会被替换，也不会被重新训练。

Edge 把这种本地学习产物叫做 **Neural Imprint**。你不需要先理解完整生命周期才能上手。先跑 CLI demo，再把同一个思路带进一个生成的 iOS app。

:::info 开发者预览
所有 Edge 产品都处于**开发者预览**阶段。API 可能在版本间变化。Edge Studio、Edge Kit、Edge Engine、Edge Scaffold 和 Edge Halo binary package 都是公开发布面；Edge Halo 源码保持私有。请固定包版本，并在每次升级后用真机重新验证。
:::

## Edge 解决什么问题

| 开发者问题 | Edge 的做法 |
| --- | --- |
| 用户级学习不应该变成一次模型发布 | 保持基础模型包稳定，在运行时恢复本地学习产物。 |
| 私有偏好不应该被粘贴进每次 prompt | 把学习状态作为 App 管理的本地数据，而不是重复请求文本。 |
| 学习状态必须可回退 | App 可以移除本地产物，并继续走基础模型路径。 |
| 恢复必须安全 | 激活前检查模型 identity、tokenizer/template、runtime version 和工具 schema。 |
| 产品策略属于 App | 用户数据、工具、删除 UX 和评估规则留在 App 层。 |

## 第一条路径

| 目标 | 指南 | 预期结果 |
| --- | --- | --- |
| 安装 Edge Studio | [安装 Edge Studio](/docs/get-started/source-build) | 从公开的 `edge-studio` Python 软件包安装 `edge` CLI。 |
| 看见本地学习 | [CLI 学习演示](/docs/get-started/minute-demo) | 合成纠错改变运行时行为；指南会把同一套生命周期映射到理财偏好。 |
| 构建可学习 iOS App | [构建可学习 iOS App](/docs/examples/build-and-ship) | Edge Studio 导出 Edge Scaffold 项目，并在真机上验证。 |
| 启动本地工作台 | [启动 Web UI](/docs/get-started/source-build#启动-web-ui) | `edge studio` 在 `http://127.0.0.1:18842` 运行 Edge Studio。 |
| 只构建 iOS 应用壳 | [最小 iOS app](/docs/get-started/minimal-ios-app) | Edge Scaffold 使用公开 Swift package 依赖和本地签名编译通过。 |

## 第一组命令

创建环境，安装 Edge Studio，并运行本地 doctor 检查：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

然后准备演示模型，并运行学习演示：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge demo learn run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --include-text
```

这个 demo 使用合成数据，所以你可以安全查看文本。它会写入一个本地回执，展示学习前/学习后的回答，以及用于恢复的本地产物。之后继续看 [构建可学习 iOS App](/docs/examples/build-and-ship)。

## 产品栈

| 产品 | 开发者用它做什么 |
| --- | --- |
| **Edge Studio** | 本地工作台与 CLI：模型就绪检查、模型下载回执、本地学习演示、Neural Imprint 生成、设备管理、基准测试与导出。 |
| **Edge Kit** | Swift SDK：LLM、VLM、语音、模型管理、EdgeData、EdgeMesh、EdgeDataMeshBridge、EdgeSession 和 EdgeUI。 |
| **Edge Engine** | 原生端侧推理运行时。由 Edge Kit 打包使用，app 通常不直接 import。 |
| **Edge Halo** | 个性化生命周期层：profile jobs、Neural Imprint capsule 校验、恢复编排和兼容性检查。App 使用公开二进制包接入。 |
| **Edge Scaffold** | 参考 app 和导出模板，展示推荐的 iOS 集成方式。 |

## 隐私模型

Edge 围绕用户自有计算设计：

- 推理在本地运行。
- 纠错、偏好和对话历史由 App 在本地管理。
- 学习产物留在本地、可移除，并在恢复前做兼容性校验。
- App 启用 EdgeMesh 时，传输也是本地网络并受信任关系约束。

不要把用户 transcript、纠错内容、财务细节或画像产物上传到分析、崩溃日志或远程支持系统。

## 核心概念

| 概念 | 面向开发者的含义 |
| --- | --- |
| **本地优先推理** | 模型、prompt、用户数据和个性化产物默认留在用户自有设备上，除非用户明确启用可信传输。 |
| **Neural Imprint** | Edge 对本地学习产物的名称：可移除、受兼容性检查保护，恢复时不替换基础模型包。 |
| **App 自有工具** | App 定义自己的工具 schema 和动作空间。Edge 基础设施不应内嵌 app 业务规则。 |
| **EdgeMesh** | 面向用户自有设备的本地网络信任、发现与设备间传输。 |
| **Fail-closed 兼容性** | 如果产物和模型、tokenizer/template、runtime 或工具 schema 不匹配，App 保持基础模型路径 active。 |
