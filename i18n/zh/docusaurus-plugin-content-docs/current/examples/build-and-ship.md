---
sidebar_position: 5
title: 构建可学习 iOS App
---

# 构建可学习 iOS App

这篇指南展示公开开发者路径：安装 Edge Studio，用 CLI 证明本地学习，再导出 Edge
Scaffold 项目，最后在真机上验证。

场景是一个私有理财助手。用户说：

```text
我不喜欢高风险推荐，我更关注现金流和稳健收益。
```

你的 App 应该把这个偏好留在设备上，把它恢复进兼容的模型 session，并保持基础模型包不变。

## 你会构建什么

你会创建一个 iOS App，包含：

- 通过 Edge Kit 和 Edge Engine 加载的本地 LLM；
- Edge Scaffold 提供的理财样例数据和只读 demo tools；
- Edge Halo binary package 集成，用于 Neural Imprint 恢复 hooks；
- App 自有的学习状态和删除设置界面；
- 不依赖模拟器运行时的真机构建。

Edge Scaffold 是模板，不是运行时依赖。Edge Studio 会解析公开
`edge-scaffold` 模板，把它复制到新的 App 目录，重写 App 名称和模型配置，运行
XcodeGen，然后给你一个 ZIP。

## 1. 安装 Edge Studio

创建 Python 3.11 环境并安装公开软件包：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

Edge Studio 仍以 release candidate 发布时，需要保留 `--pre`。如果
`edge doctor` 报告环境或模型路径问题，请先修复，再导出 App。

## 2. 下载演示模型

CLI 证明和导出的 App 使用同一个模型：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge models where qwen3.5-9b-4bit --json
```

模型约 5 GB。第一次加载模型可能需要几十秒，MLX 会初始化并映射模型文件。

## 3. 先在本地证明学习

构建 iOS App 前，先运行 CLI 学习演示：

```bash
edge demo learn run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --include-text
```

内置样本是合成数据，可以安全查看。它证明的是机制：纠错写入隔离的本地状态，
生成 Neural Imprint 产物，回执记录学习前/学习后的回答，以及用于恢复的产物路径。

需要比较行为时，直接把回执传给 chat：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive \
  --with-imprint "/path/to/learn_receipt.json"
```

在理财 App 中，同样的生命周期会映射到用户自有的理财偏好和本地分类事实。
App 决定记录什么、用户如何查看、以及用户如何删除。

## 4. 启动 Edge Studio

启动本地工作台：

```bash
edge studio
```

打开：

```text
http://127.0.0.1:18842
```

加载你下载的模型，然后打开 **Export**，选择 **Edge iOS App**。App name 可以使用
`CashFlowCoach`。除非你在测试另一个领域的 model-matched A-library，否则保留默认
finance direction set。

导出使用公开 Edge Scaffold 模板。如果本机没有 `edge-scaffold` checkout，Edge
Studio 会下载一个固定的公开模板 archive 并缓存。高级本地测试可以用
`EDGE_SCAFFOLD_DIR=/path/to/edge-scaffold` 指向本地模板。

## 5. 检查导出的 App

下载并解压 ZIP 后，结构应该类似这样：

```text
CashFlowCoach/
+-- CashFlowCoach.xcodeproj/
+-- project.yml
+-- CashFlowCoach_model_config
+-- README.md
+-- Resources/
+-- CashFlowCoach/
    +-- App/
    |   +-- ScaffoldConfig.swift
    +-- AI/
    +-- Chat/
    +-- Settings/
    +-- Business/
```

这里重复出现 App 名称是预期结构。第一个 `CashFlowCoach/` 是 App 项目根目录，
第二个 `CashFlowCoach/` 是 Xcode target 的 Swift 源码目录。

先读生成的 `README.md`。它是针对这一次导出生成的实例文档，会指向需要修改的具体文件。

## 6. 先构建应用壳

在 Xcode 中打开项目，选择开发者团队，设置唯一 bundle identifier，并选择真实
iPhone 或 iPad。

不复制模型权重时，可以先运行命令行构建检查：

```bash
xcodebuild -project CashFlowCoach.xcodeproj \
  -scheme CashFlowCoach \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  SKIP_MODEL_COPY=1 \
  build
```

这会验证签名、Swift Package Manager 解析、XcodeGen 输出和应用壳。它不验证模型加载或学习质量。

如果 Swift Package Manager cache 状态看起来不对，清理本地构建状态后重新 resolve：

```bash
rm -rf .build
rm -rf ~/Library/Developer/Xcode/DerivedData
xcodebuild -resolvePackageDependencies -project CashFlowCoach.xcodeproj
```

## 7. 加入模型并在真机运行

打开 `CashFlowCoach_model_config`，确认模型文件夹：

```bash
MODEL_NAME=Qwen3.5-9B-4bit
MODELS_SOURCE_DIR=$HOME/Documents/mlx-community
MODEL_COPY="true"
```

然后去掉 `SKIP_MODEL_COPY=1` 再构建。对于较大模型，请启用 Increased Memory
Limit entitlement，并在计划支持的最低设备类别上验证 Release 构建。

在设备上验证：

| 区域 | 检查内容 |
| --- | --- |
| 首次启动 | App 可以打开，不引用开发者本地路径。 |
| 模型加载 | 模型能从本地、bundle、ODR 或缓存路径加载。 |
| 流式输出 | 回复可以流式输出并完成。 |
| 本地数据 | 理财样例事实和 App 自有工具 schema 能在 App 界面中看到。 |
| Neural Imprint | metadata 不匹配时，恢复保持 fail-closed。 |
| 删除能力 | 用户可以清理本地模型缓存和学习状态。 |

## 8. 定制理财助手

从这些文件开始：

| 文件 | 用途 |
| --- | --- |
| `CashFlowCoach/App/ScaffoldConfig.swift` | App 名称、system prompt、model ID、生成默认值、finance sample domain、Neural Imprint runtime settings。 |
| `CashFlowCoach/AI/AIManager.swift` | 模型加载、生成和 Edge Kit session 集成。 |
| `CashFlowCoach/AI/EdgeDataBootstrap.swift` | App 自有 schema、facts 和 tool registration。 |
| `CashFlowCoach/AI/PersonalizationManager.swift` | 学习状态界面和 Neural Imprint 恢复接线。 |
| `CashFlowCoach/Chat/DemoChatView+LLM.swift` | 流式聊天行为和用户交互。 |
| `Resources/SampleData/` | 参考 App 使用的合成理财数据。请替换成你的 App 自有本地事实。 |

对于理财场景，增加让用户查看或修改偏好的产品界面，例如风险承受度、现金流周期和收益稳定性。
不要把用户 transcript、账户细节或偏好产物上传到 analytics 或远程支持系统。

## 9. 生产检查清单

- 固定 Edge Kit、Edge Engine 和 Edge Halo binary package 版本。
- 在计划支持的真实设备类别上测试。
- 模拟器只用于 UI 迭代，不用于 MLX runtime 验证。
- Neural Imprint 恢复失败时，基础模型路径仍然可用。
- 学习状态要足够可检查，便于建立用户信任，并可从 App 设置中删除。
- 用 App 自有的理财 schema 和只读工具策略替换 scaffold 样例工具和数据。
- App Store 隐私回答必须与 App 实际存储、传输和删除的内容一致。

## 下一步

- 如果还没有比较学习前/学习后的回答，先运行 [CLI 学习演示](/docs/get-started/minute-demo)。
- 阅读 [Edge Scaffold 配置](/docs/optimize-and-ship/scaffold)，了解 Edge Studio 导出时会重写哪些模板字段。
- 选择本地学习产物还是模型 adapter release 时，阅读 [Neural Imprint vs LoRA](/docs/guides/neural-imprint-vs-lora)。
