---
sidebar_position: 11
title: 设备
---

# 设备

Devices 是面向可信本地设备的 EdgeMesh 设备管理页面。

## Route

`/devices`

## 它做什么

Devices 页面显示本地 Mac、已配对设备、配对请求，以及 EdgeMesh 工作流中的设备就绪状态。

关键功能：

- 显示本地主机身份和 mesh 状态。
- 列出可信 iPhone、iPad 和 Mac。
- 在可用时显示设备能力摘要，例如芯片、内存和 GPU 信息。
- 显示可用、忙碌或离线等设备状态。
- 为新设备启动配对。
- 撤销或删除可信设备。
- 显示近期 mesh 活动的事件摘要卡片。
- 帮助评估设备是否可以运行所选模型或接收个性化适配器。

## 页面区块

| 区块 | 目的 |
| --- | --- |
| Local identity | 确认当前 Mac 和本地 mesh service 状态。 |
| Trusted devices | 列出已配对设备及其可用性。 |
| Pairing | 启动新的设备配对流程。 |
| Pending requests | 显示等待批准的设备。 |
| Activity summary | 汇总近期本地 mesh 事件。 |
| Training distribution | 显示何时可以将个性化适配器发送到可信设备。 |

## 何时使用

当你需要将 iPhone、iPad 或另一台 Mac 连接到本地 Edge Studio host 时，使用 Devices。当某台设备不应再参与时，也在这里撤销访问。

## 验证检查清单

- 确认本地 Mac 显示为可用。
- 配对目标设备并确认它出现在可信列表中。
- 开始长时间工作流前检查设备状态。
- 移除不再可信的设备。
- 切换模型候选后重新检查兼容性。
