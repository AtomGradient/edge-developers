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
```

`edge doctor` 是只读的 B1 环境检查。它不会下载模型、加载模型、启动 backend，也不会运行 Neural Imprint workflows。
`edge models list`、`edge models where` 与 `edge models doctor` 是只读的 B2a 模型就绪检查。它们只解析 catalog entry 和本地模型路径，不下载模型、不写 receipt，也不做网络 probe。

## 计划中的 Demo CLI

> Not shipped in current preview。这些命令由 Developer Preview DX roadmap 跟踪，在 B2/B4/B6 CLI 工作落地前不应视为可运行命令。

计划中的 preview 命令包括：

- `edge models fetch`：用于显式准备模型。
- `edge demo imprint run`：用于 Neural Imprint 行为变化 demo。
- `edge demo receipt`：用于检查 local-only receipt。

## 信任边界

- 用户数据与 Neural Imprint artifacts 默认留在本地，只有在用户显式启用时才传到受信任的自有设备。
- README 与文档不在缺少评估证据时声称质量变好。
- Edge Scaffold 是开发者参考 app，不承载 dogfood 业务逻辑。
- Demo CLI 命令在实现和测试落地前必须标注为 planned。
