# AtomGradient Edge 开发者预览

面向 Apple 平台的本地优先 AI 开发平台。构建在用户自有设备上运行、学习并协调的应用。

## 快速开始

先创建并激活 Python 3.11 环境，再安装 Edge Studio：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install edge-studio
edge doctor
```

如果你使用 `uv`：

```bash
uv venv --python 3.11 .venv
source .venv/bin/activate
uv pip install edge-studio
edge doctor
```

下载模型并启动本地对话：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive
```

对话跑通后，继续 [第一个设备 Agent 快速开始](docs/quickstart/first-agent.md)：生成本地 Neural Imprint 产物，对比 before/after 回答哈希。用 `edge studio` 启动本地 Studio UI。

## 组件

| 组件 | 说明 |
|---|---|
| Edge Studio | Mac 工作台和 CLI，负责模型优化、benchmark、导出、设备协调和 Neural Imprint 管理。 |
| Edge Kit | Swift SDK，负责加载优化后的模型、EdgeMesh transport、EdgeData 和 app runtime 接入。 |
| Edge Halo | 个性化生命周期层：本地 profile jobs、Neural Imprint capsule 兼容性校验、restore 编排和 fail-closed 闸门。 |
| Edge Engine | 原生端侧推理运行时，由 Edge Kit 打包使用。 |
| Edge Scaffold | 参考 iOS app 模板，展示推荐的 Edge Kit + 二进制 Edge Halo 接入方式。 |

Neural Imprint 是本地产物和恢复流程。兼容的基础模型可以恢复 Neural Imprint 产物，并在兼容性闸门下改变行为，不改模型权重。

## 版本固定

| 组件 | 版本 |
|---|---|
| edge-studio | `v0.0.1rc22` |
| edge-kit | `1.0.0-rc103` |
| edge-halo-binary | `1.0.0-rc25` |
| edge-engine | `1.0.0-rc143` |
| edge-scaffold | 固定依赖 edge-kit `1.0.0-rc103` 和 edge-halo-binary `1.0.0-rc25` |

## 文档

| 主题 | 路径 |
|---|---|
| 概览与入门 | `docs/overview.md` |
| CLI 学习演示 | `docs/quickstart/first-agent.md` |
| 最小 iOS app | `docs/edge-kit/minimal-ios-app.md` |
| Swift SDK 快速开始 | `docs/edge-kit/first-llm.md` |
| Swift CLI 验证 | `docs/edge-kit/validation-cli.md` |
| 模型进化与 Neural Imprint 生命周期 | `docs/concepts/model-evolution.md` |
| 用 Edge Studio 生成 iOS app | `docs/studio/scaffold.md` |

安装 Swift SDK：

```swift
.package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc103")
```

Edge Kit、Edge Engine、Edge Scaffold 和 Edge Halo 二进制包都是公开 GitHub 仓库。Edge Halo 源码保持私有；App 通过公开的 `edge-halo-binary` 包接入。

## CLI 参考

Phase 2 SDK Proof 命令通过 `edge-swift` 提供 halo bridge 检查和 receipt-only restore coordinator 冒烟测试。

### 环境检查

```bash
edge doctor                 # 检查环境就绪状态（只读）
edge doctor --json
```

### 模型管理

模型准备命令只在显式调用时下载模型。
一条命令学习流程会把 `network_used_during_model_prepare` 与演示执行分开记录。

```bash
edge models list                                  # 列出 catalog 条目（只读）
edge models where qwen3.5-9b-4bit                 # 查看本地路径（只读）
edge models doctor qwen3.5-9b-4bit                # 检查模型就绪状态（只读）
edge models fetch qwen3.5-9b-4bit --dry-run       # 预览下载
edge models fetch qwen3.5-9b-4bit --source auto   # 下载模型，写入 fetch 回执
```

### 对话

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive          # 多轮本地对话
edge demo chat --model qwen3.5-9b-4bit --prompt "..." --max-tokens 64  # 脚本用单次模式
```

交互模式只加载一次模型，在多轮对话中复用 session KV cache，并默认每轮写一个仅哈希的聊天回执。输入 `/exit` 或 `/quit` 退出。

### 回执检查

```bash
edge demo receipt --schema                      # 查看回执 schema
edge demo receipt --path ./receipt.json          # 检查回执
edge demo local-only --path ./receipt.json       # 验证 local-only 不变量
```

### Neural Imprint 演示

```bash
edge demo imprint run --dry-run --question "Summarize this synthetic profile."   # 仅计划，不生成产物
edge demo imprint run --question "Summarize this synthetic profile." --model qwen3.5-9b-4bit  # 生成并对比
edge demo imprint compare --path ./receipt.json  # 从已有回执对比（只读）
```

### 纠错学习演示

不带 `--dry-run` 的 `edge demo learn run` 是已发布的本地纠错学习演示。

```bash
edge demo learn run --dry-run --sample synthetic_profile_correction_v1 --model auto     # 仅计划
edge demo learn run --sample synthetic_profile_correction_v1 --model qwen3.5-9b-4bit --max-tokens 8  # 运行学习流程
edge demo learn run --prepare-model --model qwen3.5-9b-4bit --source auto --max-tokens 8 --json      # 准备模型 + 运行
```

### 产物复用

```bash
edge demo reuse --run edge-run-example --apps notes,finance --json  # 仅清单冒烟检查（只读，不复制产物）
```

## Swift 验证 CLI

`tests/smoke_test` 目录包含 `edge-swift` Swift CLI，用于 SDK 验证、halo bridge 检查和 receipt-only restore coordinator 冒烟测试。详见 `docs/edge-kit/validation-cli.md`。

## 文档开发

```bash
npm ci
npm run start
npm run build
```

构建英文和中文文档。

## 信任边界

- 用户数据与 Neural Imprint 产物默认留在本地，只有用户显式启用时才传到受信任的自有设备。
- 文档不在缺少评估证据时声称质量变好。
- Edge Scaffold 是开发者参考 app，不承载 dogfood 业务逻辑。
- Roadmap 项在实现和测试落地前必须标注为 planned。
