---
sidebar_position: 3
title: 平台要求
---

# 平台要求

Edge 产品面向 Apple Silicon 设备。

## 最低版本

| 组件 | 要求 |
| --- | --- |
| iOS | 17.0 或更高 |
| macOS | 14.0 或更高 |
| Xcode | Edge Kit 和 Edge Scaffold 需要 15 或更高 |
| Swift | Edge Kit 需要 5.9 或更高 |
| 硬件 | Apple Silicon |

Edge Engine 和 Edge Halo 预览包在某些构建中使用更新的 Swift toolchain。在固定 release 前，请检查每个包的 `Package.swift`。

## 推荐硬件

| 工作负载 | 推荐设备 |
| --- | --- |
| 0.8B 文本模型 | 任意 Apple Silicon 设备 |
| 4B 文本或 VLM 模型 | 8 GB 或更多统一内存 |
| 9B 模型 | 16 GB 或更多统一内存，或已验证的高内存 iOS 设备 |
| 优化和导出 | 有足够磁盘空间存放源模型和导出模型的 Mac |
| 适配器训练 | 用户自有 Mac |

## iOS entitlements

对于较大模型，请在 iOS target 中启用 Increased Memory Limit entitlement。

如果 app 使用 Edge Mesh，也请添加本地网络权限：

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app discovers your nearby devices for private on-device AI.</string>
```

## Build 设置

使用 Release build 进行性能验证。Debug build 适合开发，但不能代表吞吐或延迟。

## 验证矩阵

发布前测试：

- 冷加载和卸载。
- 首 token 延迟。
- 长对话内存行为。
- iOS 上的后台/前台切换。
- 如果启用 Edge Mesh，测试本地网络发现。
