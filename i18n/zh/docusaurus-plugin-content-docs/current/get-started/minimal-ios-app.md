---
sidebar_position: 3
title: 最小 iOS App
---

# 最小 iOS App

当前 preview 中最快的 iOS 路径，是用 Edge Scaffold 做 no-model build。它先验证 app shell、签名、Swift package wiring 和真机构建路径，然后再加入模型。

:::info Preview access
当前 preview 的 package resolution 可能需要 AtomGradient preview access。如果 Swift Package Manager 无法解析 `edge-kit`、`edge-halo` 或传递依赖 Edge Engine，请先完成 preview onboarding，再把 app 路径视为已集成。
:::

## 构建最小 app shell

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

`SKIP_MODEL_COPY=1` 让第一次构建保持快速，并避免把大模型打进 bundle。这个 build 不证明模型质量、学习质量或 App Store 就绪；它只证明 iOS app shell 和 SDK 集成可以编译。

## 在真机运行

打开生成的项目：

```bash
open EdgeScaffold.xcodeproj
```

然后：

1. 选择你的 development team。
2. 设置唯一的 bundle identifier。
3. 选择真实 iPhone 或 iPad。
4. 首次启动用 `SKIP_MODEL_COPY=1` 构建运行。

模拟器不是模型执行的目标 runtime。模型加载、Neural Imprint restore、内存行为和性能验证都应该在真机上完成。

## 加入小型本地模型

shell 跑起来后，在 `edgescaffolding_model_config` 中配置小模型路径：

```bash
MODEL_COPY=true
MODEL_NAME=Qwen3.5-0.8B-MLX-4bit
MODELS_SOURCE_DIR=$HOME/Documents/mlx-community
```

然后去掉 `SKIP_MODEL_COPY=1` 再构建。对于更大的模型，请启用 Increased Memory Limit entitlement，并在计划支持的真实设备类别上验证 Release build。

## 这个 app 展示什么

- 使用 Edge Kit 和 Edge Halo 的 SwiftUI 参考 app。
- local、cached、bundled、ODR、remote 等模型加载路径。
- Neural Imprint restore 与 correction-learning 参考界面。
- app-owned tool registration 和 schema snapshot 模式。

Edge Scaffold 不是 dogfood 业务逻辑。把它视为当前最小参考 app，然后把 sample data、sample tools、copy、签名和模型交付替换成你的 app 自己的策略。

