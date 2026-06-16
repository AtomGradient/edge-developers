---
sidebar_position: 2
title: 安装
---

# 安装 Edge Kit

使用 Swift Package Manager 安装 Edge Kit。

## 要求

| 要求 | 版本 |
| --- | --- |
| iOS | 17.0 或更高 |
| macOS | 14.0 或更高 |
| Xcode | 15 或更高 |
| Swift | 5.9 或更高 |
| 硬件 | Apple Silicon |

对于运行较大模型的 iOS 应用，请启用 Increased Memory Limit entitlement。

## 包

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc95")
]
```

开发者预览版本应精确固定版本。升级到新的 `1.0.0-rcN` tag 前，请重新完成真机验证。

> **预览访问权限**
>
> 公开文档中的 Swift package URL 使用 HTTPS。当前预览版中，部分传递依赖路径仍可能需要 AtomGradient 预览访问权限或 SSH 访问权限，尤其是 Edge Engine 仍作为固定依赖时。请先确认包解析，再把某个 tag 当作已完成集成。

## 添加总入口 product

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeKit", package: "edge-kit")
    ]
)
```

然后导入总入口模块：

```swift
import EdgeKit
```

## 添加单独模块

当你希望依赖面更窄时，可以使用单独的 product。

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeInference", package: "edge-kit"),
        .product(name: "EdgeModelKit", package: "edge-kit")
    ]
)
```

常见导入：

```swift
import EdgeInference
import EdgeModelKit
import EdgeVoice
import EdgeMesh
import EdgeData
```

## 验证安装

```swift
import EdgeInference

let engine = LLMEngine()
print(engine.state)
```

## iOS entitlement

对于大于小型预览模型的模型，请在应用 target 中添加 Increased Memory Limit entitlement。否则，即使物理内存尚未耗尽，iOS 也可能提前终止进程。
