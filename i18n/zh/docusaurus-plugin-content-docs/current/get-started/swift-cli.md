---
sidebar_position: 3
title: Swift CLI 验证
---

# Swift CLI 验证

当你想在接入 Edge Kit 和 Edge Halo 到 App 前，先跑一条可重复的 SDK 验证路径时，使用本页。

这里有两条独立流程：

1. **在 App 中接入 SDK。** 在 App 的 `Package.swift` 添加已发布的 Swift 包。
2. **运行验证 CLI。** 从 EdgeStudio 的 `tests/smoke_test` 构建并运行 `edge-swift` 冒烟检查 CLI。

`edge-swift` 是验证工具，不是要加入 App 的 SDK product。它保留在 EdgeStudio，避免把验证 CLI 下沉到基础 SDK 仓库。

## 在 App 中接入 Edge 包

开发者预览包必须精确固定版本：

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc97"),
    .package(url: "https://github.com/AtomGradient/edge-halo.git", exact: "1.0.0-rc22")
]
```

然后添加需要的 products：

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeInference", package: "edge-kit"),
        .product(name: "EdgeMesh", package: "edge-kit"),
        .product(name: "EdgeHalo", package: "edge-halo")
    ]
)
```

当前预览版中，Edge Kit `1.0.0-rc97` 与 Edge Halo `1.0.0-rc22` 都使用 Edge Engine `1.0.0-rc137`。部分预览包解析路径可能需要 AtomGradient 预览访问权限或 SSH 访问权限。

## 运行 EdgeStudio 验证 CLI

克隆 EdgeStudio，并把 SDK 仓库放到 `tests/smoke_test/Package.swift` 期望的本地路径：

```bash
git clone https://github.com/AtomGradient/EdgeStudio.git
cd EdgeStudio

git clone https://github.com/AtomGradient/edge-kit.git edge-kit
git -C edge-kit checkout 1.0.0-rc97

git clone https://github.com/AtomGradient/edge-halo.git edge-halo
git -C edge-halo checkout 1.0.0-rc22
```

从冒烟检查 package 目录运行：

```bash
cd tests/smoke_test
swift package resolve
swift run edge-swift --help
```

如果在 EdgeStudio 根目录运行，等价命令是：

```bash
swift run --package-path tests/smoke_test edge-swift --help
```

## 不加载模型的 SDK 检查

这些命令验证 SDK contracts，不加载模型：

```bash
swift run edge-swift halo-bridge-check --json
swift run edge-swift imprint validate --fixture --json
swift run edge-swift imprint restore --fixture --json
```

fixture 恢复命令是 **仅回执冒烟检查**。它验证 restore coordinator 与 apply-status 回执路径，但不会把产物注入到 engine。

验证失败即关闭回执路径：

```bash
set +e
swift run edge-swift imprint restore --fixture --simulate-failure --json
status=$?
set -e
test "$status" -eq 1
```

## 模型冒烟检查

准备好本地模型后，运行分类冒烟检查：

```bash
swift run edge-swift smoke llm /path/to/qwen-model --level all
swift run edge-swift smoke vlm /path/to/vlm-model --image /path/to/image.jpg
swift run edge-swift smoke asr /path/to/asr-model --audio /path/to/audio.mp3
swift run edge-swift smoke tts /path/to/tts-model --output ./tts-output
```

这些命令只加载你显式传入的模型路径，不会 silent fetch models。

## 安全边界

- `halo-bridge-check`、`imprint validate --fixture` 和 `imprint restore --fixture` 不加载模型。
- `imprint restore --fixture` 是仅回执冒烟检查，不是生产产物恢复。
- fixture 命令使用合成 descriptors 和仅哈希 reports；不包含原始用户文本或文件内容。
- Swift Package Manager 解析依赖完成后，fixture 命令本身不使用网络。
- App 业务数据留在 App 层，不进入 Edge Kit、Edge Halo 或验证 CLI。

## CI 示例

这个示例只作为 C3 文档片段。请按你的预览访问权限环境调整路径和 token。

```yaml
name: Edge Swift CLI smoke

on:
  pull_request:
  workflow_dispatch:

jobs:
  edge-swift:
    runs-on: macos-14
    steps:
      - name: Checkout EdgeStudio
        uses: actions/checkout@v4
        with:
          repository: AtomGradient/EdgeStudio
          path: EdgeStudio

      - name: Checkout Edge Kit
        uses: actions/checkout@v4
        with:
          repository: AtomGradient/edge-kit
          ref: 1.0.0-rc97
          path: EdgeStudio/edge-kit

      - name: Checkout Edge Halo
        uses: actions/checkout@v4
        with:
          repository: AtomGradient/edge-halo
          ref: 1.0.0-rc22
          path: EdgeStudio/edge-halo

      - name: Run zero-model Swift CLI checks
        run: |
          cd EdgeStudio/tests/smoke_test
          swift package resolve
          swift run edge-swift halo-bridge-check --json
          swift run edge-swift imprint validate --fixture --json
          swift run edge-swift imprint restore --fixture --json

          set +e
          swift run edge-swift imprint restore --fixture --simulate-failure --json
          status=$?
          set -e
          test "$status" -eq 1
```
