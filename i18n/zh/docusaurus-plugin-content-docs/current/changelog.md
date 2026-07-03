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

开发者预览阶段，Swift 包使用 `1.0.0-rcN` 标签发布，Edge Studio Python 包以 `0.0.1rcN` 发布到 PyPI。每个发布面的当前固定版本集中在[当前版本](/docs/versions)。破坏性变更会在这里记录迁移步骤。正式可用后会遵循语义化版本。

PyPI 保留说明：Edge Studio 的 `0.0.1rc19` 之前预览 wheel 已从 PyPI 删除。`v0.0.1rc19` 之前的 changelog 条目仅保留为发布历史，不再表示这些包版本当前仍可安装。

## 如何升级

1. 更新 `Package.swift` 中固定的版本。
2. 阅读更新日志中的破坏性变更。
3. 构建并修复编译错误。
4. 在真实设备上运行测试套件。
5. 验证首次启动、多轮对话和内存行为。

## 开发者预览边界

开发者预览是受限预览通道。更新日志会明确哪些能力已经发布、哪些仓库已经公开、哪些能力当前刻意不启用。

### 当前版本

当前版本固定与兼容矩阵集中在一页：[当前版本](/docs/versions)。本更新日志记录发布历史与逐版本说明，不作为"今天该装什么"的权威来源。

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
- `edge demo facts import-url` 是有界单 URL 材料导入路径。它只接受 HTTP(S) 文本内容，记录 `network_used=true`，默认写仅哈希回执，不会爬取链接页面。rc22 起，可选的 `host-model` extractor 能用本地 Mac 模型从单页材料中提出候选 facts；Edge 会先确定性校验结构化输出，再写入本地 facts store。
- `edge demo facts crawl-url` 是面向小型同源静态文档集的有界 HTTP(S) 材料导入路径。它要求显式设置 depth、URL、单页字节、总字节和 timeout 边界；不执行 JavaScript，不使用浏览器，不查询 `robots.txt`，也不离开同源范围。
- `edge demo tools validate` 当前预览版只接受本地只读 facts lookup manifest。不执行进程、不联网、不写 demo state。
- `edge tools validate` / `edge tools inspect <tools.py>`（rc21 起）会在隔离的 Edge 自有 runner 子进程内导入工具文件——顶层代码会执行。它不在 Edge CLI 进程内运行，也不是针对不可信文件的静态安全扫描。
- `edge demo chat --tools <tools.py>`（rc21 起）启用 Edge 托管的自定义 Python 工具；与 `--tools-manifest`、`--facts-store` 两两互斥。工具代码只在 runner 子进程执行，模型只能发出 JSON 调用。
- `edge demo chat --tools-manifest <tools.json>` 会启用开发者命名的只读工具，工具背后绑定本地 facts store。它与 `--facts-store` 快捷入口互斥。
- `edge demo reuse` 是产物复用冒烟检查。读取已完成的回执，并为每个合成应用写 `edge.demo.reuse.receipt.v1` manifest；不复制产物、不同步设备、不恢复产物、不加载模型，也不触网。
- 产品默认的配对设备路径没有被这份预览文档或更新日志启用。宽泛实时路由仍需要单独的显式策略、显式选择和真机证据。
- 后台自动化调度器尚未发布。当前有界自动化 API 仍是显式调用、默认 dry-run，并且失败即关闭。
- 通用 capsule apply-status UI 参考已在 Edge Scaffold 与 dogfood validation App 中发布；产品级位置、布局或文案不属于本次预览基线。
- model push 和产品默认 Neural Imprint 重新生成执行在没有单独显式策略/设计前仍不支持；已发布的 `edge demo learn run` 路径是显式本地合成演示。
- EdgeMesh capsule auto-restore SDK 编排已经通过 Edge Kit `1.0.0-rc94` 中的 `HaloCapsuleAutoRestoreCoordinator` 发布；它不是当前限制。

---

## edge-studio

### v0.0.1rc22

- PyPI release candidate 版本：`0.0.1rc22`。确定性安装：`python -m pip install edge-studio==0.0.1rc22`。
- 新增 `edge demo facts import-url --extractor host-model --extractor-model <model>`，支持用本地 Mac host model 做事实抽取。模型输出只被视为候选 facts；Edge 会在写入本地 facts store 前校验结构化 payload。回执包含 model、prompt、schema、model input、原始模型输出和校验后 payload 的哈希，以及截断元数据和 `non_deterministic_extraction=true`。
- 新增 `edge demo facts crawl-url <url>`，支持有界的静态同源材料导入。必须显式设置 `--max-depth`、`--max-urls`、`--max-bytes`、`--max-bytes-total` 和 `--timeout`；回执记录 redirect-chain 哈希、逐页 status、总字节数、同源策略决策和 `network_used=true`。
- 爬取能力刻意保持收窄：不使用浏览器、不执行 JavaScript、不跨源，也不抓取 `robots.txt`。开发者仍需自行确认材料来源可被其使用。
- 更新 Ethereum 示例，使其成为通用领域材料工作流示例：URL 导入、可选本地 host-model 抽取、有界 crawl、自定义 Python 工具和 Neural Imprint 学习。Ethereum 只是示例领域，不是 Edge runtime 的特殊路径。
- 保持 rc21 自定义 Python 工具路径不变：`@edge_tool`、`edge tools validate`、`edge tools inspect`、`edge demo chat --tools` 和 `edge demo learn run --tools`。

### v0.0.1rc21

- PyPI release candidate 版本：`0.0.1rc21`。确定性安装：`python -m pip install edge-studio==0.0.1rc21`。
- 新增自定义 Python 工具。用 `@edge_tool` 标记普通函数（`from edgestudio.tools import edge_tool`），然后运行 `edge tools validate <tools.py>`、`edge tools inspect <tools.py>` 与 `edge demo chat --tools <tools.py>`。每次运行最多 8 个活跃工具；用可重复的 `--tool <name>` 或 `--tool-tag <tag>` 选择。详见[自定义 Python 工具指南](/docs/knowledge-tools/custom-python-tools)。
- 开发者工具代码永不在 Edge CLI 或模型进程中运行。发现与每次调用都在 Edge 自有的固定 runner 子进程中执行；runner 在导入前验证工具文件与冻结活跃集字节一致（不一致以 `tools_file_changed` fail-closed 拒绝）。单次调用超时会终止 runner；结果上限为 64 KB 规范化 JSON。
- 工具 schema 由类型注解确定性生成（`edge.tools.schema_gen.v1`）。支持 `str`、`int`、`float`、`bool`、`Literal`、`Optional`、`list[T]`；不支持的注解直接校验失败，不会静默降级为 `Any`。
- Python 工具运行的回执为 hash 优先且带 runner 信息：`tools_file_sha256`、`active_set_sha256`、`schema_generator_version`，以及每次调用的 `args_sha256`、`result_sha256`、`tool_schema_sha256`、`runner_secret_verified`、`tools_file_sha256_verified` 与 `network_used_by_edge: false`。
- 新增 `edge demo learn run --tools <tools.py>`：把 Python 工具契约烘焙进 Neural Imprint，恢复后的 Agent 天然携带工具 schema。`edge demo chat --with-imprint --tools` 的恢复门控是 schema 级：只改实现不影响 artifact 有效性；schema 或活跃集变更 fail-closed 并要求重学（`imprint_requires_tools`、`imprint_tool_active_set_mismatch`、`imprint_tool_schema_mismatch`）。
- `--tools`、`--tools-manifest`、`--facts-store` 每次运行两两互斥；`--tool` / `--tool-tag` 必须与 `--tools` 同用。

### v0.0.1rc20

- PyPI release candidate 版本：`0.0.1rc20`。确定性安装：`python -m pip install edge-studio==0.0.1rc20`。
- 新增 `edge demo facts import-url <url>`，支持把有界 HTTP(S) 材料导入本地 facts store。导入器支持 `--split page` 与 `--split html-table-rows`，记录 source/final URL 哈希、content type、status、raw/extracted 哈希、截断状态和 `network_used=true`。
- `html-table-rows` 会把每行里的链接作为数据捕获，并按 final URL 绝对化相对 `href`。这些链接写入 fact 文本，但不会被跟随或爬取。
- 新增 `edge demo tools validate <tools.json>`，支持 `edge.demo.tools.manifest.v1`。rc20 运行时只支持开发者命名的只读工具，工具 `kind` 必须是 `"local_facts_lookup"`。
- 新增 `edge demo chat --tools-manifest <tools.json>`。chat 现在可以使用开发者命名的只读本地 facts 工具；回执会记录 `tools_manifest_sha256`、工具摘要、tool calls 和 `network_used=false`。
- 新增 `edge demo tools validate --learn-sample <sample.json>` mismatch warning：当 learn sample 的 `tool_schema_export.tools[].name` 与运行时 tools manifest 的工具名不一致时给出非阻塞警告，方便开发者在运行前审计 sample/runtime 漂移。
- 保留 `edge demo chat --facts-store <store>` 作为内置 `local_facts_lookup` 工具的快捷入口。如果载体需要稳定的开发者自定义 tool 名，请使用 `--tools-manifest`。
- 更新本地 Mac 工作站的模型 catalog 就绪状态，使 `qwen3.5-27b-4bit` 可作为 LLM 能力路径用于 learn/chat 工作流。Edge 会尊重开发者选择的本地模型；27B 不是硬依赖。

### v0.0.1rc19

- PyPI release candidate 版本：`0.0.1rc19`。确定性安装：`python -m pip install edge-studio==0.0.1rc19`。
- 新增本地事实工作流：`edge demo facts import`、`list`、`inspect`。事实库只在本地使用，检查输出默认只暴露哈希。
- 新增 `edge demo chat --facts-store <store>`，通过只读 `local_facts_lookup` 工具查询本地事实。tool loop 失败即关闭，并记录 `network_used=false`。
- 支持 `--with-imprint` 与 `--facts-store` 组合，让 Neural Imprint 行为偏好和本地事实查询进入同一条 chat 路径。
- chat receipt 新增 `tool_calls[]`、`tool_instruction_mode`、`tool_instruction_sha256`，用于审计本地工具行为。
- Neural Imprint prefix renderer 升级到 v2 JSON tool-call 契约，保证烘焙和运行时工具指令同源。
- 开发者可以通过重新导入 facts 刷新本地知识，不需要重新运行 learn 流程。
- 已安装 Python 包命名空间从 `backend` 改为 `edgestudio`。公开 CLI 仍然是 `edge`；包内源码引用现在使用 `edgestudio/cli/demo_samples.py` 这类路径。
- 本地 `edge.demo.learn.sample.v1` JSON 学习样本的自定义入口仍然是 `--sample-file`。
- 发布元数据已对齐 AtomGradient Proprietary License。公开 `AtomGradient/edge-studio` 仓库是 issue/support 壳，不是开源源码分发。

### v0.0.1rc18

- 历史 PyPI release candidate 版本：`0.0.1rc18`（已从 PyPI 删除，仅保留为发布历史）。
- 为 `edge demo learn run` 新增 `--sample-file`，支持本地 `edge.demo.learn.sample.v1` JSON 样本。文件路径会覆盖内置 `--sample` fixture，并在 dry-run 或执行前完成校验。

### v0.0.1rc9

- 历史 PyPI release candidate 版本：`0.0.1rc9`（已从 PyPI 删除，仅保留为发布历史）。
- 在理财学习 demo 的 dry-run、receipt 和 text preview 中加入 `expected_tool_policy`。这个字段是确定性预览，不是实时 tool-call trace。
- 将开发者首跑路径更新为一页式设备 Agent 流程：偏好学习、工具策略检查，以及 Edge Studio 载体导出。

### v0.0.1rc8

- 历史 PyPI release candidate 版本：`0.0.1rc8`（已从 PyPI 删除，仅保留为发布历史）。
- 修复包内版本一致性，Python package metadata 与 `edgestudio_core.__version__` 现在都会报告 `0.0.1rc8`。

### v0.0.1rc7

- 历史 PyPI release candidate 版本：`0.0.1rc7`（已从 PyPI 删除，仅保留为发布历史）。
- 新增 `finance_conservative_cashflow_v1` 作为默认学习 demo 样本。样本是合成的、可检查的、理财场景化的，用于设备 Agent 快速开始。
- 公开首跑路径已围绕原始本地信号检查、基础模型对话、RPP 自学习、Neural Imprint 生成、base model + Neural Imprint 对话，以及 Edge Studio 载体导出重写。

### v0.0.1rc6

- 历史 PyPI release candidate 版本：`0.0.1rc6`（已从 PyPI 删除，仅保留为发布历史）。
- 改进 Edge Scaffold 导出文档。生成的 app 现在会得到面向该 app 实例的 README，包含 app 名称、模型名称、模型路径、ODR tag、关键文件、模型加载说明和排查建议。
- 保持导出 app 结构扁平：`MyApp/MyApp/App/ScaffoldConfig.swift`，不再出现三层嵌套 app 路径。

### v0.0.1rc5

- 当前公开 Python 软件包 distribution name：`edge-studio`。
- 历史 PyPI release candidate 版本：`0.0.1rc5`（已从 PyPI 删除，仅保留为发布历史）。
- `edge demo chat` 在 interactive 模式下流式输出 token，并支持通过 `--with-imprint <learn_receipt.json>` 恢复 Neural Imprint。
- `edge demo learn run --include-text` 会打印完成的学习回执，并输出可直接执行的 `next:` 命令用于学习后的对话。
- `edge studio` 遇到已经运行的 EdgeMesh 服务时，会给出可行动的 warning，同时保持 Studio UI 可用。

### v0.0.1rc1

- 公开 Python 软件包 distribution name：`edge-studio`。
- 历史 PyPI release candidate 版本：`0.0.1rc1`（已从 PyPI 删除，仅保留为发布历史）。
- 安装后的命令面刻意统一为单一 `edge` 入口。
- `edge studio` 默认在 `http://127.0.0.1:18842` 启动本地 Studio UI/API server。
- `edge demo chat`、`edge demo learn`、模型就绪检查、显式模型下载、回执检查和源码安装文档已对齐公开软件包路径。
- 仓库公开发布前，历史已压缩为单个 root commit，并打上 `v0.0.1rc1` 标签。

## edge-kit

Edge Kit 的当前固定版本见[当前版本](/docs/versions)。预览能力概要：模块
EdgeInference、EdgeModelKit、EdgeVoice、EdgeMesh、EdgeData、EdgeDataMeshBridge、
EdgeUI、EdgeSession；支持 LLM、VLM、TTS、STT engine；面向长上下文多轮会话的
DSR Attention；自动 KV cache 内存策略；Neural Imprint 运行时恢复 primitives 与
EdgeMesh capsule auto-restore coordinator APIs；生产应用构建可以嵌入通用
`EdgeBuildCommit` 元数据，用于 snapshot traceability。

### 1.0.0-rc103

- 当前 SDK release gate。
- 将 `EdgeKitRuntime.version`、`edge-kit/.dependency_versions`、`Package.swift` 和公开 SPM 元数据对齐到 Edge Engine `1.0.0-rc143`。
- 公开 package graph 继续使用 `edge-engine`、`swift-transformers` 与 `GRDB`；历史 `mlx-swift` / `mlx-swift-lm` 包仍不进入默认依赖图。

### 1.0.0-rc98

- 历史 SDK release gate。
- package、测试和公开元数据对齐 Edge Engine `1.0.0-rc138`。
- RPP 编排和 activation steering 实现不进入公开 SDK 源码；这些内部能力由 Edge Halo 承载。

### 1.0.0-rc94

- 新增 EdgeMesh capsule auto-restore coordinator APIs。
- 依赖 Edge Engine `1.0.0-rc137`。

## edge-halo

Edge Halo binary 的当前固定版本见[当前版本](/docs/versions)。预览能力概要：
lifecycle 覆盖本地 profile jobs 与 Neural Imprint capsule compatibility；面向
模型、tokenizer、运行时和工具 schema identity 的失败即关闭验证；
`HaloTextGenerator` 和 `HaloEngineSession` 协议；`EdgeHaloRuntime` public
actor；RPP A-library provenance 验证与 profile 产物生命周期 helpers。公开 app
通过二进制 package `edge-halo-binary` 接入；源码仓库保持私有。

## edge-engine

Edge Engine 的当前依赖 tag 见[当前版本](/docs/versions)；它由 Edge Kit 解析，
App 不直接 import。预览能力概要：原生 Metal 推理运行时；DSR Attention 实现。
`main` 上未发布的 commit 不属于当前开发者预览；发布新的 `1.0.0-rcN` 后再进入
文档口径。

## edge-scaffold

Edge Scaffold 的当前固定版本见[当前版本](/docs/versions)。预览能力概要：从
Edge Studio 导出生成 iOS 应用模板；基于 ScaffoldConfig 的自定义；四层模型分发
（Cache → Bundle → ODR → HuggingFace）。
