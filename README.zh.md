# AtomGradient Edge 开发者预览

AtomGradient Edge 是面向 Apple 平台的本地 AI stack，用来构建能在用户自有设备上运行、学习并恢复用户特定状态的 agent。

当前 preview 由四层组成：

| 层 | 职责 |
|---|---|
| Edge Studio | Mac 本地工作台，负责模型优化、benchmark、导出、设备协调和 Neural Imprint artifact 管理。 |
| Edge Kit | Swift SDK surface，负责加载优化后的模型、EdgeMesh transport、EdgeData 与 app runtime 接入。 |
| Edge Halo | 个性化生命周期层，负责本地 profile jobs、Neural Imprint capsule compatibility、restore orchestration 与 fail-closed gates。 |
| Edge Scaffold | 开发者参考 iOS app 模板，展示推荐的 Edge Kit + Edge Halo 接入方式。 |

Neural Imprint 是本地 artifact 和 restore flow。兼容的 base model 可以恢复本地 Neural Imprint artifact，并在 compatibility gates 下改变行为，不改模型权重。

## 当前入口

当前 preview 可用入口：

- 阅读文档：`docs/overview.md`
- 使用固定 preview 版本安装 Swift SDK：

  ```swift
  .package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc95")
  ```

  当前 preview 中，部分 package resolution 路径仍可能因为 Edge Engine 等传递依赖需要 AtomGradient preview access 或 SSH access。请把 access setup 视为 preview onboarding 的一部分。

- 跟随 Swift quickstart：`docs/get-started/quickstart.md`
- 用 EdgeStudio CLI 验证 Swift SDK 路径：`docs/get-started/swift-cli.md`
- 查看模型进化与 Neural Imprint 生命周期：`docs/build/model-evolution.md`
- 用 Edge Studio + Edge Scaffold 生成参考 app：`docs/optimize-and-ship/scaffold.md`

## 当前 Preview 版本

| 组件 | 当前 preview |
|---|---|
| edge-kit | `1.0.0-rc95` |
| edge-halo | `1.0.0-rc17` |
| edge-engine dependency tag | `1.0.0-rc136` |
| edge-scaffold | 固定依赖 edge-kit `1.0.0-rc95` 和 edge-halo `1.0.0-rc17` |

## 文档开发

本仓库是 Docusaurus 文档站。

```bash
npm ci
npm run start
npm run build
```

build 会产出英文和中文文档。

## CLI

从 EdgeStudio package 安装 preview CLI：

```bash
python -m pip install edgestudio
edge doctor
```

如果使用源码 checkout，请在 EdgeStudio 仓库根目录运行 `python -m pip install -e .`。`edge` 命令是 `edgestudio` package 的 entry point。

当前 preview 已发布：

```bash
edge doctor
edge doctor --json
edge models list
edge models where qwen3.5-0.8b
edge models doctor qwen3.5-0.8b
edge models fetch qwen3.5-0.8b --dry-run
edge models fetch qwen3.5-0.8b --source auto
edge demo chat --model qwen3.5-0.8b --prompt "What is edge AI?" --max-tokens 32
edge demo receipt --schema
edge demo receipt --path ./receipt.json
edge demo local-only --path ./receipt.json
edge demo imprint run --dry-run --question "Summarize this synthetic profile."
edge demo imprint run --question "Summarize this synthetic profile." --model qwen3.5-0.8b
edge demo imprint compare --path ./receipt.json
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model auto
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-0.8b --max-tokens 8
edge demo reuse --run edge-run-example --apps notes,finance --json
```

`edge doctor` 是只读的 B1 环境检查。它不会下载模型、加载模型、启动 backend，也不会运行 Neural Imprint workflows。
`edge models list`、`edge models where` 与 `edge models doctor` 是只读的 B2a 模型就绪检查。它们只解析 catalog entry 和本地模型路径，不下载模型、不写 receipt，也不做网络 probe。
`edge models fetch` 是显式的 B2b 模型准备命令。demo 命令不会 silent 触发它；真实 fetch 会写本地 `edge.models.fetch.receipt.v1` receipt。
`edge demo chat` 是 B3 base-model sanity check。它加载显式准备好的本地模型，生成一个本地 answer，并默认写 hash-only `edge.demo.chat.receipt.v1` receipt。
`edge demo receipt` 与 `edge demo local-only` 是 B6a receipt 检查命令。它们只验证 `edge.demo.receipt.v1` 的 local-only invariants，不生成 Neural Imprint artifact，也不调用模型 runtime。
`edge demo imprint run --dry-run` 是 B4a pre-flight planner。它只输出包含 hash 和本地前置条件状态的 `edge.demo.imprint.plan.v1`，不生成 artifact、不 restore Neural Imprint，也不写 demo receipt。
`edge demo imprint run`（不带 `--dry-run`）是 B4b 真实 Neural Imprint demo。它加载本地模型，从合成样本 capture Neural Imprint artifact，对比 base vs personalized answer hash，并写 `edge.demo.receipt.v1` local-only receipt。
`edge demo imprint compare` 是 B4 receipt-only 检查命令。它读取已完成的 `edge.demo.receipt.v1` receipt 并输出 `edge.demo.imprint.compare.v1`；不加载模型、不 restore artifact、不生成 answer，也不触网。
`edge demo learn run --dry-run` 是 B5a correction-learning pre-flight planner。它输出只含 hash-only synthetic correction metadata 和 isolated-state paths 的 `edge.demo.learn.plan.v1`；不写 correction ledger、不调用 regen、不加载模型，也不写 learn receipt。
`edge demo learn run`（不带 `--dry-run`）是 B5b 真实 isolated correction-learning demo。它只在 demo run state 下写 synthetic Persona/RPP input 与 correction ledger，触发 correction regen，恢复重新生成的本地 Neural Imprint artifact，对比 before/after answer hash，并写 `edge.demo.learn.receipt.v1`。
`edge demo reuse` 是 B7 artifact reuse smoke。它读取已完成的本地 B4 receipt，并在 demo run 下为每个 synthetic app 写 `edge.demo.reuse.receipt.v1` manifest；不复制 artifact、不同步设备、不 restore artifact、不加载模型，也不触网。

## Phase 2 SDK Proof

B 组 Python first-wow CLI 已发布。Phase 2 SDK proof 现在包含 `tests/smoke_test` `edge-swift` product，可用于 Swift smoke validation、halo bridge checks、本地 package validation，以及 receipt-only restore coordinator smoke。

面向开发者的 Swift CLI 文档位于：

```bash
docs/get-started/swift-cli.md
```

## 信任边界

- 用户数据与 Neural Imprint artifacts 默认留在本地，只有在用户显式启用时才传到受信任的自有设备。
- README 与文档不在缺少评估证据时声称质量变好。
- Edge Scaffold 是开发者参考 app，不承载 dogfood 业务逻辑。
- Roadmap 项在实现和测试落地前必须标注为 planned。
