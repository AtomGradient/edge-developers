---
sidebar_position: 3
title: 简单模式
---

# 简单模式：引导式向导

简单模式是一个七步引导式向导，用于在不使用完整 Pro 工作台的情况下设置端侧 AI 体验。

:::info 开发者预览
简单模式是默认入门流程。旧版 v1 向导仍保留用于兼容，但 v2 是当前流程。
:::

## 总览

Route: `/simple`

简单模式有两个阶段：

| 阶段 | 步骤 | 目标 |
| --- | --- | --- |
| Phase 1 | Device profile -> focus -> tier -> setup -> complete | 检测 Mac，选择模型要做什么，下载并加载模型，然后测试。 |
| Phase 2 | Export device -> export generate | 选择 iOS 目标并准备 app 导出流程。 |

当你希望 Edge Studio 基于少量选择来完成主要设置决策时，使用简单模式。

## Step 0: Device AI Profile

Route: `/simple`

Device AI Profile 页面检测当前 Mac，并估算它可以处理的模型层级。

关键功能：

- 检测芯片、内存和 GPU 信息。
- 显示 AI 能力评分。
- 推荐起始层级。
- 允许用户无需手动选择硬件即可继续。

用此步骤在选择模型类别前建立硬件基线。

## Step 1: Focus Selection

Route: `/simple/focus`

Focus Selection 页面询问 AI 应该做什么。

选项：

| Focus | 用途 |
| --- | --- |
| Chat | 文本输入、文本输出的对话。 |
| Coding | 面向代码的聊天和生成。 |
| Vision | 图像加文本输入。 |
| ASR | 语音转文字转写。 |
| TTS | 文字转语音生成。 |
| Voice Duplex | 使用 ASR、LLM 和 TTS 模型的语音对话循环。 |

选择一张卡片继续。该选择控制后续出现的模型包和测试面板。

## Step 2: Tier Selection

Route: `/simple/tier`

Tier Selection 页面会基于检测到的设备和所选 focus 显示模型包卡片。

关键功能：

- 在支持时显示 Standard、Pro、Max、Ultra 等可用层级。
- 标记当前 Mac 的推荐层级。
- 设置前显示 package-level 模型信息。
- 在当前构建启用时支持自定义模型输入。

用此步骤在下载或加载模型前选择质量和资源级别。

## Step 3: Setup

Route: `/simple/setup`

Setup 页面下载并加载所选模型包，然后提供即时测试体验。

关键功能：

- 显示下载和加载进度。
- 在可能时恢复进行中的设置。
- 为单模型 focus 加载一个模型。
- 为 Voice Duplex 加载多个模型。
- 模型就绪后打开相关测试面板。

嵌入面板：

| 面板 | 出现场景 | 测试内容 |
| --- | --- | --- |
| Chat panel | Chat、Coding、Vision | Prompt 输入、流式文本输出，以及视觉模型的可选图像输入。 |
| ASR panel | ASR | 音频输入和转写。 |
| TTS panel | TTS | 文本输入、可用时的说话人选择，以及生成音频。 |
| Duplex panel | Voice Duplex | 单一流程中的语音输入、模型响应和语音输出。 |

用此步骤确认所选 package 在进入导出前确实可以运行。

## Step 4: Complete

Route: `/simple/done`

Complete 页面确认设置成功。

关键功能：

- 显示 "AI Ready" 状态。
- 提供进入 Phase 2 导出的路径。
- 允许更改 focus 或升级所选 package。
- 保持已加载模型可用于进一步测试。

将此步骤作为模型设置和 app 打包之间的检查点。

## Phase 2 Step 1: Export Device

Route: `/simple/export/device`

Export Device 页面选择 iOS 目标。

关键功能：

- 提供 iPhone 和 iPad 目标卡片。
- 记录目标设备选择，用于导出检查。
- 单击即可前进。

用此步骤为你计划首先测试的设备家族确定生成 app 的尺寸。

## Phase 2 Step 2: Export Generate

Route: `/simple/export/generate`

Export Generate 页面根据目标设备检查所选模型，并准备 app 导出流程。

关键功能：

- 运行设备适配检查。
- 需要时建议降级、改变 focus 或改变目标设备。
- 接受 app 名称。
- 当当前构建启用 app 生成时显示导出进度。
- 为生成的 ZIP 提供导出后指引。

在模型已加载且目标设备已选择后使用此步骤。

## Legacy v1 wizard

Route prefix: `/simple/v1`

保留 v1 向导用于兼容：

| Route | Page |
| --- | --- |
| `/simple/v1` | Welcome |
| `/simple/v1/device` | Device assessment |
| `/simple/v1/pick-model` | Model picker |
| `/simple/v1/optimize` | One-click optimization |
| `/simple/v1/test` | Test chat |
| `/simple/v1/export` | Simple export |

新工作请使用 v2。只有在验证旧流程或复现早期构建行为时才使用 v1。
