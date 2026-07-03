---
sidebar_position: 3
title: 最小 iOS 应用
---

# 最小 iOS 应用

当前预览版中最快的 iOS 路径，是用 Edge Scaffold 做无模型构建。它先验证应用壳、签名、Swift 包接线和真机构建路径，然后再加入模型。

:::info 公开包
Edge Scaffold、Edge Kit、Edge Engine 和 Edge Halo binary package 都通过公开 GitHub 和 Swift Package Manager URL 解析。Edge Halo 源码保持私有。应用路径仍然需要 Xcode 签名、设备 provisioning、精确版本固定和真机验证。
:::

## 构建最小应用壳

```bash
git clone https://github.com/AtomGradient/edge-scaffold.git
cd edge-scaffold
xcodegen generate
xcodebuild -project EdgeScaffold.xcodeproj \
  -scheme EdgeScaffold \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  SKIP_MODEL_COPY=1 \
  build
```

`SKIP_MODEL_COPY=1` 让第一次构建保持快速，并避免把大模型打进 bundle。这个构建不证明模型质量、学习质量或 App Store 就绪；它只证明 iOS 应用壳和 SDK 集成可以编译。

## 在真机运行

打开生成的项目：

```bash
open EdgeScaffold.xcodeproj
```

然后：

1. 选择你的开发者团队。
2. 设置唯一的 bundle identifier。
3. 选择真实 iPhone 或 iPad。
4. 首次启动用 `SKIP_MODEL_COPY=1` 构建运行。

模拟器不是模型执行的目标运行时。模型加载、Neural Imprint 恢复、内存行为和性能验证都应该在真机上完成。

## 加入基准本地模型

应用壳跑起来后，在 `edgescaffolding_model_config` 中配置基准模型路径：

```bash
MODEL_COPY=true
MODEL_NAME=Qwen3.5-9B-4bit
MODELS_SOURCE_DIR=$HOME/Documents/mlx-community
```

然后去掉 `SKIP_MODEL_COPY=1` 再构建。对于更大的模型，请启用 Increased Memory Limit entitlement，并在计划支持的真实设备类别上验证 Release 构建。

## 这个应用展示什么

- 使用 Edge Kit 和二进制 Edge Halo package 的 SwiftUI 参考应用。
- 本地、缓存、bundle、ODR、远程等模型加载路径。
- Neural Imprint 恢复与纠错学习参考界面。
- 应用拥有的工具注册和 schema snapshot 模式。

Edge Scaffold 不是 dogfood 业务逻辑。把它视为当前最小参考应用，然后把示例数据、示例工具、文案、签名和模型交付替换成你的应用自己的策略。

## 下一步

应用壳构建通过后，继续看 [构建 Agent 载体](/docs/quickstart/build-agent-carrier)。那篇指南会加入理财场景、Edge Studio 导出流程、模型配置、Neural Imprint 恢复检查和真机验证。
