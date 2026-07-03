---
sidebar_position: 1
title: 从这里开始
---

# 从这里开始

在 Edge 里，设备就是 Agent。App 是载体。

App 仍然重要：它负责 UI、权限、本地产品策略、设置、用户控制和 App Store 边界。但长期存在的智能不是云端 profile，也不是为每个 App 分叉出来的模型。它是用户设备上的本地 Agent runtime：本地推理、App 批准的本地信号、RPP 自学习、Neural Imprint 恢复，以及用户可控删除。

先看一个具体理财助手场景。用户说：

```text
我不喜欢高风险推荐，我更关注现金流和稳健收益。
```

之后，同一个用户问：

```text
这个月扣掉账单后我还剩 800 美元，应该怎么处理？
```

基础模型可以给出通用建议。设备 Agent 应该带着本地偏好回答：先保护现金流，先解释保守选项，再讨论收益空间，并避免没有依据的收益承诺。这就是 Edge 要交付的产品变化：每个用户的设备都能持续学习用户，同时基础模型包保持稳定。

Edge 把这种本地学习产物叫做 **Neural Imprint**。它只在兼容性检查通过后恢复，是可删除的本地数据，也不需要把私有 profile 文本塞进每一次 prompt。

:::info 开发者预览
当前预览版可运行。Edge Studio、Edge Kit、Edge Engine、Edge Scaffold 和 Edge Halo binary package 都是公开发布面。Edge Halo 源码保持私有。API 可能在 release candidate 之间变化，因此请固定版本，并在每次升级后用真机验证。
:::

## Edge 解决什么问题

| 开发者问题 | Edge 的做法 |
| --- | --- |
| 用户级偏好不应该变成一次模型发布工程 | 保持基础模型包稳定，在运行时恢复本地学习产物。 |
| 敏感本地状态不应该被塞进每次请求 | 把学习状态作为 App 管理的本地数据，而不是重复 prompt 文本。 |
| 用户必须可以移除学习状态 | 载体 App 可以删除本地产物，并保持基础模型路径可用。 |
| 恢复必须安全 | 激活前检查模型 identity、tokenizer/template、runtime version、工具 schema 和 artifact metadata。 |
| 产品策略属于 App | 用户数据、工具、权限、删除 UX 和评估规则留在载体层。 |

## 第一条路径

| 目标 | 指南 | 预期结果 |
| --- | --- | --- |
| 安装 Edge Studio | [安装 Edge Studio](/docs/quickstart/install) | 从公开的 `edge-studio` Python 软件包安装 `edge` CLI。 |
| 构建第一个设备 Agent | [设备 Agent 演示](/docs/quickstart/first-agent) | 合成理财信号生成本地 Neural Imprint；同一个基础模型在恢复后给出不同回答。 |
| 导出载体 | [构建 Agent 载体](/docs/quickstart/build-agent-carrier) | Edge Studio 导出 Edge Scaffold 项目，并在真实 iPhone 或 iPad 上验证。 |
| 启动本地工作台 | [启动 Web UI](/docs/quickstart/install#启动-web-ui) | `edge studio` 在 `http://127.0.0.1:18842` 运行 Edge Studio。 |
| 只构建 iOS 应用壳 | [最小 iOS app](/docs/edge-kit/minimal-ios-app) | Edge Scaffold 使用公开 Swift package 依赖和本地签名编译通过。 |

## 第一组命令

创建环境，安装 Edge Studio，并运行本地 doctor 检查：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

然后准备演示模型，并运行理财学习路径：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

样本是合成数据，所以你可以安全查看学习信号。这次运行会写入本地回执，里面包含生成出来的 Neural Imprint 产物路径，以及可以直接复制的 `edge demo chat --with-imprint ".../learn_receipt.json"` 命令。

## 产品栈

| 产品 | 开发者用它做什么 |
| --- | --- |
| **Edge Studio** | 本地工作台与 CLI：模型就绪检查、模型下载回执、本地学习演示、Neural Imprint 生成、设备管理、基准测试与导出。 |
| **Edge Kit** | Swift SDK：LLM、VLM、语音、模型管理、EdgeData、EdgeMesh、EdgeDataMeshBridge、EdgeSession 和 EdgeUI。 |
| **Edge Engine** | 原生端侧推理运行时。由 Edge Kit 打包使用，App 通常不直接 import。 |
| **Edge Halo** | 个性化生命周期层：profile jobs、Neural Imprint capsule 校验、恢复编排和兼容性检查。App 使用公开二进制包接入。 |
| **Edge Scaffold** | Edge Studio 导出的 iOS 集成参考载体模板。 |

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
| **设备 Agent** | 私有端侧 runtime，负责本地推理、App 批准的学习信号、Neural Imprint 恢复和删除。 |
| **载体 App** | App 表面，负责 UI、权限、工具、设置、本地策略和用户控制。 |
| **Neural Imprint** | Edge 的本地学习产物：可移除、受兼容性检查保护，恢复时不替换基础模型包。 |
| **App 自有工具** | App 定义自己的工具 schema 和动作空间。Edge 基础设施不内嵌 App 业务规则。 |
| **EdgeMesh** | 面向用户自有设备的本地网络信任、发现与设备间传输。 |
| **Fail-closed 兼容性** | 如果产物和模型、tokenizer/template、runtime 或工具 schema 不匹配，载体保持基础模型路径 active。 |
