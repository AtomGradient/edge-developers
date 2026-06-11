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
  .package(url: "git@github.com:AtomGradient/edge-kit.git", exact: "1.0.0-rc94")
  ```

- 跟随 Swift quickstart：`docs/get-started/quickstart.md`
- 查看模型进化与 Neural Imprint 生命周期：`docs/build/model-evolution.md`
- 用 Edge Studio + Edge Scaffold 生成参考 app：`docs/optimize-and-ship/scaffold.md`

## 当前 Preview 版本

| 组件 | 当前 preview |
|---|---|
| edge-kit | `1.0.0-rc94` |
| edge-halo | `1.0.0-rc17` |
| edge-engine dependency tag | `1.0.0-rc136` |
| edge-scaffold | 固定依赖 edge-kit `1.0.0-rc94` 和 edge-halo `1.0.0-rc17` |

## 文档开发

本仓库是 Docusaurus 文档站。

```bash
npm ci
npm run start
npm run build
```

build 会产出英文和中文文档。

## CLI

当前 preview 已发布：

```bash
edge doctor
edge doctor --json
edge models list
edge models where qwen3.5-0.8b
edge models doctor qwen3.5-0.8b
edge models fetch qwen3.5-0.8b --dry-run
edge models fetch qwen3.5-0.8b --source auto
edge demo receipt --schema
edge demo receipt --path ./receipt.json
edge demo local-only --path ./receipt.json
edge demo imprint run --dry-run --question "Summarize this synthetic profile."
edge demo imprint run --question "我的消费习惯是什么？" --model auto
```

`edge doctor` 是只读的 B1 环境检查。它不会下载模型、加载模型、启动 backend，也不会运行 Neural Imprint workflows。
`edge models list`、`edge models where` 与 `edge models doctor` 是只读的 B2a 模型就绪检查。它们只解析 catalog entry 和本地模型路径，不下载模型、不写 receipt，也不做网络 probe。
`edge models fetch` 是显式的 B2b 模型准备命令。demo 命令不会 silent 触发它；真实 fetch 会写本地 `edge.models.fetch.receipt.v1` receipt。
`edge demo receipt` 与 `edge demo local-only` 是 B6a receipt 检查命令。它们只验证 `edge.demo.receipt.v1` 的 local-only invariants，不生成 Neural Imprint artifact，也不调用模型 runtime。
`edge demo imprint run --dry-run` 是 B4a pre-flight planner。它只输出包含 hash 和本地前置条件状态的 `edge.demo.imprint.plan.v1`，不生成 artifact、不 restore Neural Imprint，也不写 demo receipt。
`edge demo imprint run`（不带 `--dry-run`）是 B4b 核心 wow demo。它加载本地模型，从合成样本 capture Neural Imprint artifact，对比 base vs personalized 回答，写 `edge.demo.receipt.v1` local-only receipt。所有计算在本地完成；network_used_during_demo 为 false。Receipt 默认只含 hash；`--include-text` 显式包含原文。

## 计划中的 Demo CLI

> Not shipped in current preview。这些命令由 Developer Preview DX roadmap 跟踪。

计划中的 preview 命令包括：

- `edge demo imprint compare`：用于检查已完成 demo run 的 before/after 输出。

## 信任边界

- 用户数据与 Neural Imprint artifacts 默认留在本地，只有在用户显式启用时才传到受信任的自有设备。
- README 与文档不在缺少评估证据时声称质量变好。
- Edge Scaffold 是开发者参考 app，不承载 dogfood 业务逻辑。
- Demo CLI 命令在实现和测试落地前必须标注为 planned。
