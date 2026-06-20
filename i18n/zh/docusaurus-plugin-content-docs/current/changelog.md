---
sidebar_position: 100
title: 更新日志
---

# 更新日志

每个开发者预览版本的破坏性变更、新功能和迁移说明。

:::info 提示
Edge 产品处于**开发者预览**阶段。版本之间可能出现破坏性变更。请固定包版本，并在每次升级后验证。
:::

## 版本策略

开发者预览阶段，Swift 包使用 `1.0.0-rcN` 标签发布。Edge Studio 的 Python 包当前使用 PyPI 版本 `0.0.1rc8` 和 GitHub tag `v0.0.1rc8`。破坏性变更会在这里记录迁移步骤。正式可用后会遵循语义化版本。

## 如何升级

1. 更新 `Package.swift` 中固定的版本。
2. 阅读更新日志中的破坏性变更。
3. 构建并修复编译错误。
4. 在真实设备上运行测试套件。
5. 验证首次启动、多轮对话和内存行为。

## 开发者预览边界

开发者预览是受限预览通道。更新日志会明确哪些能力已经发布、哪些仓库已经公开、哪些能力当前刻意不启用。

### 访问矩阵

| 产品表面 | 当前访问方式 | 说明 |
|---|---|---|
| Edge Studio | Python 软件包 `edge-studio==0.0.1rc8`，GitHub tag `v0.0.1rc8` | 安装后只暴露一个 `edge` 命令。用 `edge studio` 启动本地 Studio UI。 |
| Swift SDK 文档 | Edge Kit `1.0.0-rc98` | 文档使用精确固定版本。升级前必须重新验证。 |
| Edge Engine 依赖 | Edge Engine `1.0.0-rc138` | 公开 GitHub 仓库位于 `AtomGradient/edge-engine`；包解析不应再需要 SSH 访问权限。 |
| Edge Halo binary 依赖 | Edge Halo binary `1.0.0-rc24` | 公开二进制 SwiftPM 包位于 `AtomGradient/edge-halo-binary`；源码仍保持私有。 |
| Edge Scaffold | 固定依赖 Edge Kit `1.0.0-rc98` 与 Edge Halo binary `1.0.0-rc24` | 生成的应用仍需要签名、设备 provisioning 和真机验证。 |

### 兼容矩阵

| 组件 | 兼容预览版本 |
|---|---|
| Edge Studio | `v0.0.1rc8` |
| Edge Kit | `1.0.0-rc98`，依赖 Edge Engine `1.0.0-rc138` |
| Edge Halo binary | `1.0.0-rc24` |
| Edge Scaffold | 当前预览版固定依赖 Edge Kit `1.0.0-rc98` 与 Edge Halo binary `1.0.0-rc24` |

通用构建和模拟器检查不足以支撑运行时结论。任何预览 tag 变化后，都需要重新完成真机验证。

### 已知限制

下面列出的 B2/B4/B5/B6/B7 CLI 命令已在当前 preview 发布；这些限制描述的是它们的安全边界。

- `edge studio` 默认在 localhost 启动本地 Studio UI 和 API server。它是本地开发工作台入口，不是托管服务。
- `edge doctor` 是只读环境检查。不下载模型、不加载模型、不启动后端，也不运行 Neural Imprint 工作流。
- `edge models list`、`edge models where` 与 `edge models doctor` 是只读模型就绪检查。不下载模型、不写回执，也不做网络探测。
- `edge models fetch` 是显式模型准备命令，支持 `--dry-run`、来源选择、本地回执，不会被演示静默触发。
- `edge demo chat` 是基础模型对话命令。使用显式准备好的本地模型，默认写仅哈希的 `edge.demo.chat.receipt.v1` 回执。
- `edge demo receipt` 与 `edge demo local-only` 是回执检查工具。只验证 `edge.demo.receipt.v1` 的仅本地约束，不生成 Neural Imprint 产物，也不调用模型运行时。
- `edge demo imprint run --dry-run` 是预检计划命令。只输出包含仅哈希样本、问题元数据和本地模型前置条件状态的 `edge.demo.imprint.plan.v1`。
- 不带 `--dry-run` 的 `edge demo imprint run` 是 Neural Imprint 演示。生成并恢复本地产物，写入对比回执。
- `edge demo imprint compare` 是仅回执对比检查命令。读取已完成的 `edge.demo.receipt.v1` 回执并输出 `edge.demo.imprint.compare.v1`，不加载模型、不恢复产物、不生成回答，也不触网。
- `edge demo learn run --dry-run` 是纠错学习预检计划命令。输出只含仅哈希合成纠错元数据和隔离状态路径的 `edge.demo.learn.plan.v1`；不写纠错 ledger、不触发重新生成、不加载模型，也不写学习回执。
- 不带 `--dry-run` 的 `edge demo learn run` 是纠错学习演示。在演示运行状态下写合成 Persona/RPP 输入与纠错 ledger，触发纠错重新生成，恢复重新生成的本地 Neural Imprint 产物，对比恢复前后的回答哈希，并写入 `edge.demo.learn.receipt.v1`。
- `edge demo learn run --prepare-model` 在一条命令中同时完成模型准备和学习演示。可能先显式准备兼容本地模型，然后把模型准备阶段的网络使用以 `network_used_during_model_prepare` 与本地学习演示分开记录。
- `edge demo reuse` 是产物复用冒烟检查。读取已完成的回执，并为每个合成应用写 `edge.demo.reuse.receipt.v1` manifest；不复制产物、不同步设备、不恢复产物、不加载模型，也不触网。
- 产品默认的配对设备路径没有被这份预览文档或更新日志启用。宽泛实时路由仍需要单独的显式策略、显式选择和真机证据。
- 后台自动化调度器尚未发布。当前有界自动化 API 仍是显式调用、默认 dry-run，并且失败即关闭。
- 通用 capsule apply-status UI 参考已在 Edge Scaffold 与 dogfood validation App 中发布；产品级位置、布局或文案不属于本次预览基线。
- model push 和产品默认 Neural Imprint 重新生成执行在没有单独显式策略/设计前仍不支持；已发布的 `edge demo learn run` 路径是显式本地合成演示。
- `edge demo reuse` 是产物复用冒烟检查，不是跨设备同步。
- 后台调度器尚未发布。
- EdgeMesh capsule auto-restore SDK 编排已经通过 Edge Kit `1.0.0-rc94` 中的 `HaloCapsuleAutoRestoreCoordinator` 发布；它不是当前限制。

---

## edge-studio

### v0.0.1rc8

- PyPI release candidate 版本：`0.0.1rc8`。确定性安装：`python -m pip install edge-studio==0.0.1rc8`。
- 修复包内版本一致性，Python package metadata 与 `edgestudio_core.__version__` 现在都会报告 `0.0.1rc8`。

### v0.0.1rc7

- PyPI release candidate 版本：`0.0.1rc7`。确定性安装：`python -m pip install edge-studio==0.0.1rc7`。
- 新增 `finance_conservative_cashflow_v1` 作为默认学习 demo 样本。样本是合成的、可检查的、理财场景化的，用于设备 Agent 快速开始。
- 公开首跑路径已围绕原始本地信号检查、基础模型对话、RPP 自学习、Neural Imprint 生成、base model + Neural Imprint 对话，以及 Edge Studio 载体导出重写。

### v0.0.1rc6

- PyPI release candidate 版本：`0.0.1rc6`。确定性安装：`python -m pip install edge-studio==0.0.1rc6`。
- 改进 Edge Scaffold 导出文档。生成的 app 现在会得到面向该 app 实例的 README，包含 app 名称、模型名称、模型路径、ODR tag、关键文件、模型加载说明和排查建议。
- 保持导出 app 结构扁平：`MyApp/MyApp/App/ScaffoldConfig.swift`，不再出现三层嵌套 app 路径。

### v0.0.1rc5

- 当前公开 Python 软件包 distribution name：`edge-studio`。
- PyPI release candidate 版本：`0.0.1rc5`。确定性安装：`python -m pip install edge-studio==0.0.1rc5`。
- `edge demo chat` 在 interactive 模式下流式输出 token，并支持通过 `--with-imprint <learn_receipt.json>` 恢复 Neural Imprint。
- `edge demo learn run --include-text` 会打印完成的学习回执，并输出可直接执行的 `next:` 命令用于学习后的对话。
- `edge studio` 遇到已经运行的 EdgeMesh 服务时，会给出可行动的 warning，同时保持 Studio UI 可用。

### v0.0.1rc1

- 公开 Python 软件包 distribution name：`edge-studio`。
- PyPI release candidate 版本：`0.0.1rc1`。确定性安装：`python -m pip install edge-studio==0.0.1rc1`。
- 安装后的命令面刻意统一为单一 `edge` 入口。
- `edge studio` 默认在 `http://127.0.0.1:18842` 启动本地 Studio UI/API server。
- `edge demo chat`、`edge demo learn`、模型就绪检查、显式模型下载、回执检查和源码安装文档已对齐公开软件包路径。
- 仓库公开发布前，历史已压缩为单个 root commit，并打上 `v0.0.1rc1` 标签。

## edge-kit

### Edge Kit 当前预览

- Edge Kit 当前开发者预览版。
- 模块：EdgeInference、EdgeModelKit、EdgeVoice、EdgeMesh、EdgeData、EdgeDataMeshBridge、EdgeUI、EdgeSession。
- 支持 LLM、VLM、TTS、STT engine。
- 面向长上下文多轮会话的 DSR Attention。
- 自动 KV cache 内存策略。
- Neural Imprint 运行时恢复 primitives 与 EdgeMesh capsule auto-restore coordinator APIs。
- 生产应用构建可以嵌入通用 `EdgeBuildCommit` 元数据，用于 snapshot traceability。
- 依赖 Edge Engine `1.0.0-rc138`。

### 1.0.0-rc98

- 当前 SDK release gate。
- package、测试和公开元数据对齐 Edge Engine `1.0.0-rc138`。
- RPP 编排和 activation steering 实现不进入公开 SDK 源码；这些内部能力由 Edge Halo 承载。

### 1.0.0-rc94

- 新增 EdgeMesh capsule auto-restore coordinator APIs。
- 依赖 Edge Engine `1.0.0-rc137`。

## edge-halo

### Edge Halo 当前预览

- Edge Halo 当前开发者预览版。
- Edge Halo lifecycle：本地 profile jobs 与 Neural Imprint capsule compatibility。
- 面向模型、tokenizer、运行时和工具 schema identity 的失败即关闭验证。
- `HaloTextGenerator` 和 `HaloEngineSession` 协议。
- `EdgeHaloRuntime` public actor。
- RPP A-library provenance 验证与 profile 产物生命周期 helpers。
- 依赖版本元数据已对齐当前预览 tag。
- 公开 app 通过二进制 package `edge-halo-binary` `1.0.0-rc24` 接入；源码仓库保持私有。

## edge-engine

### Edge Engine 当前依赖 tag

- Edge Kit 与 Edge Halo 当前依赖的 Edge Engine tag。
- 原生 Metal 推理运行时。
- DSR Attention 实现。
- `main` 上未发布的 commit 不属于当前 开发者预览 tag；发布新的 `1.0.0-rcN` 后再进入文档口径。
- 当前依赖 tag：`1.0.0-rc138`。

## edge-scaffold

### 当前预览依赖

- Edge Scaffold 初始开发者预览版。
- 从 Edge Studio 导出生成 iOS 应用模板。
- 基于 ScaffoldConfig 的自定义。
- 四层模型分发（Cache → Bundle → ODR → HuggingFace）。
- 固定依赖 Edge Kit `1.0.0-rc98` 与 Edge Halo binary `1.0.0-rc24`。
