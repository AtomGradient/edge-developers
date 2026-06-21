# EDGE_AGENT_GUIDE.md

> **这个文件是给你的 Code Agent 读的，不是给你读的。**
> 把这个文件丢给你的 AI 编程助手（Claude Code / Cursor / Copilot / Windsurf），
> 它会引导你完成从安装到真机部署的全部流程。
>
> **This file is for your Code Agent, not for you to read.**
> Drop it into your AI coding assistant. It will guide you through
> everything — from install to running a learning agent on your iPhone.

---

## For the Code Agent: What You Are Helping Build

你正在帮助开发者构建一个**设备端 AI Agent**。

核心概念：
- **设备是 Agent，App 是载体。** 模型在用户设备上运行和学习，不依赖云端。
- **Edge** 是构建这种 Agent 的全栈工具：推理引擎 + Swift SDK + 学习生命周期 + App 模板 + 优化工作台。
- **Neural Imprint (NI)** 是设备端学习产物：本地生成、兼容性校验后恢复、可移除、不修改基础模型权重。
- **RPP** 是自学习算法：从本地信号（用户偏好、纠错、事实）生成 NI。
- 数据**从不离开设备**。没有云端 profile 服务，没有上传。

## Task 1: 安装 Edge Studio

### 环境要求

| 要求 | 版本 |
|------|------|
| macOS | 14+ |
| 硬件 | Apple Silicon (M1/M2/M3/M4) |
| Python | 3.11 |

### 执行

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

### 验证

```bash
edge --version
# 期望输出: edge-studio 0.0.1rc9 或更高
edge doctor
# 所有检查应该 PASS
```

### 如果失败

- `edge: command not found` → 确认 venv 已激活：`which python` 应该指向 `.venv/bin/python`
- `edge doctor` 报错 → 按提示修复，通常是 Python 版本或缺少依赖

## Task 2: 下载模型

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

### 验证

```bash
edge models where qwen3.5-9b-4bit
# 应该显示本地路径，status: complete
```

首次下载约 5GB，需要网络。下载完成后后续操作不再需要网络。

## Task 3: 体验 Base Model 对话

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

问这个问题：

```
I have $800 left after bills this month. What should I do with it?
```

**记住这个回答。** 它应该是通用的理财建议（储蓄、投资、还债等）。这是 base model 的状态——模型不了解用户偏好。

退出：输入 `/exit`

## Task 4: 查看学习信号

在运行学习之前，先检查 Agent 将要学习的内容：

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text --json
```

### 你会看到

```json
{
  "sample_id": "finance_conservative_cashflow_v1",
  "question": "I have $800 left after bills this month. What should I do with it?",
  "sample_text": {
    "records": [
      {"kind": "explicit_preference", "text": "用户偏好保守、稳健、关注现金流"},
      {"kind": "cashflow_context", "text": "用户已付完账单，剩余 $800"},
      {"kind": "trust_boundary", "text": "用户不要未经证实的收益承诺"}
    ]
  },
  "tool_learning": {
    "expected_tool_policy": {
      "tools_available": [
        {"name": "sample_finance_facts_lookup", "when": "查询风险偏好或边界"},
        {"name": "sample_finance_cashflow_summary", "when": "查询现金流或余额"}
      ],
      "negative_policy": [
        "不调用外部市场数据工具",
        "不调用需要联网的工具",
        "不编造收益数字"
      ]
    },
    "policy_kind": "deterministic_preview",
    "actual_tool_calls": false
  }
}
```

**向开发者解释：**
- 这是合成数据，不是真实财务信息
- `records` 是用户给 Agent 的偏好信号
- `expected_tool_policy` 是 Agent 将学会的工具使用策略
- `dry-run` 不加载模型、不联网、不写任何状态

## Task 5: 对比现有方案

**向开发者解释为什么 Edge 的方法不同：**

| 方案 | 做法 | 问题 |
|------|------|------|
| LoRA / 微调 | 为每个用户训练一个适配器 | 算力成本高、需要发版、无法扩展到每用户 |
| Prompt 填充 | 把用户偏好塞进每次请求 | 隐私暴露、context 越来越大、难以治理 |
| 云端个性化 | 上传用户行为到服务器 | 数据离端、合规负担、依赖网络 |
| **Edge RPP + NI** | 本地信号 → 本地学习 → 本地产物 → 兼容性恢复 | 不改权重、不离端、可移除 |

## Task 6: 运行学习

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

### 期望输出

```
status: completed
sample: finance_conservative_cashflow_v1
artifact: .../neural_imprint.safetensors
metadata: .../neural_imprint_metadata.json
answers_differ: True
receipt: .../learn_receipt.json
next: edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
```

**关键字段：**
- `answers_differ: True` → 学习前后回答不同
- `receipt` → 后续 `--with-imprint` 用的交接文件
- `next` → 直接复制这个命令运行下一步

## Task 7: 体验学习后的对话

复制上面输出的 `next:` 命令运行：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive --max-tokens 160 \
  --with-imprint ".../learn_receipt.json"
```

问同一个问题：

```
I have $800 left after bills this month. What should I do with it?
```

**对比 Task 3 的回答。** 现在应该更保守、关注现金流、避免高风险建议。

**向开发者解释：**
- 同一个模型，同一个问题
- Neural Imprint 恢复了用户的偏好学习状态
- 基础模型权重没有被修改
- 这不是 prompt stuffing——偏好没有被塞进 prompt

## Task 8: 导出到 iPhone

### 8a. 启动 Edge Studio

```bash
edge studio
```

打开浏览器：`http://127.0.0.1:18842`

### 8b. 导出 Agent 载体

在 Web UI 中：
1. 加载模型 `qwen3.5-9b-4bit`
2. 点击 Export → Edge Scaffold
3. 输入 App 名称（如 `FinanceAgent`）
4. 下载 ZIP

### 8c. 部署到真机

```bash
cd FinanceAgent/FinanceAgent
xcodegen generate
open FinanceAgent.xcodeproj
```

在 Xcode 中：
1. 选 Development Team
2. **选真机（iPhone/iPad）— 不要选 Simulator**
3. Build & Run

### 8d. 在 iPhone 上体验

App 启动后：

1. **Onboarding** → 设备评估 → 模型选择 → 下载模型
2. **Chat** → 问 "这个月账单付完还剩 800 块，我该怎么用？" → 看到通用回答
3. **Settings → Personalization** → 选择 domain（如 finance）→ 加载合成数据
4. 等待本地学习完成 → Neural Imprint 状态变为 Active
5. **再次 Chat** → 同一个问题 → 回答变保守了
6. **飞行模式** → 再问一次 → 仍然正常（离线验证）
7. **Clear data** → NI 变回 Not active → 回答恢复通用（可移除验证）

### 可用的 8 个 Domain

| Domain | 场景 |
|--------|------|
| finance | 个人理财 |
| health | 健身健康 |
| cooking | 厨房烹饪 |
| reading | 阅读学习 |
| journal | 日记反思 |
| travel | 旅行探索 |
| music | 音乐娱乐 |
| work | 工作效率 |

每个 domain 有独立的合成数据集，学习循环相同。

## Task 9: 定制你的 Agent

导出的项目中，关键文件：

| 文件 | 作用 | 改什么 |
|------|------|--------|
| `App/ScaffoldConfig.swift` | 全局配置 | App 名称、模型、system prompt、RPP 参数 |
| `AI/AIManager.swift` | 模型加载 + 推理 | 加载策略、引擎类型 |
| `AI/ScaffoldHaloRuntimeAdapter.swift` | Edge Halo 桥接 | 学习触发、NI restore 逻辑 |
| `Chat/DemoChatView*.swift` | 聊天界面 | UI 样式、交互流程 |
| `Business/HomeView.swift` | 主页 | 产品业务逻辑 |
| `Settings/PersonalizationView.swift` | 个性化面板 | 学习状态展示、数据管理 |
| `Resources/SampleData/` | 合成数据 | 替换为你的业务数据 schema |
| `Resources/RPP/` | RPP A-library | 模型/层/领域匹配基准 |
| `project.yml` | XcodeGen 配置 | 依赖、build 设置 |

### 常见定制

**改 App 名称和描述：**
→ 改 `ScaffoldConfig.swift` 的 `appName` 和 `appDescription`

**改系统提示词：**
→ 改 `ScaffoldConfig.swift` 的 `defaultSystemPrompt`

**换模型：**
→ 改 `ScaffoldConfig.swift` 的 `modelID` 和 `modelDisplayName`

**改聊天界面：**
→ 改 `Chat/DemoChatView*.swift`

**加新 Tab：**
→ 改 `Business/HomeView.swift` 的 TabView

**换 domain 数据：**
→ 替换 `Resources/SampleData/` 中的 JSON，保持 schema 兼容

## 产品架构速查

```
┌─────────────────────────────────────┐
│          你的 Agent 载体 App         │
│  UI · 权限 · 数据策略 · 用户控制     │
├─────────────────────────────────────┤
│ Edge Kit       Edge Halo    EdgeMesh│
│ 推理 SDK       学习生命周期  设备网格 │
├─────────────────────────────────────┤
│         Edge Engine 推理运行时       │
└─────────────────────────────────────┘

开发时工具：
  Edge Studio → Edge Scaffold → Xcode → App
```

| 组件 | 职责 |
|------|------|
| **Edge Engine** | Metal 推理运行时 |
| **Edge Kit** | Swift SDK（推理、模型管理、语音、视觉、Mesh） |
| **Edge Halo** | 学习生命周期（profile job、NI 校验、restore、fail-closed）|
| **Edge Studio** | 优化工作台 + CLI（分析、benchmark、导出） |
| **Edge Scaffold** | iOS Agent 载体模板 |

## 依赖版本

| 包 | 当前版本 | 安装 |
|----|---------|------|
| edge-studio | 0.0.1rc9 | `pip install --pre edge-studio` |
| edge-kit | 1.0.0-rc98 | SPM: `github.com/AtomGradient/edge-kit` |
| edge-engine | 1.0.0-rc138 | SPM: `github.com/AtomGradient/edge-engine` |
| edge-halo-binary | 1.0.0-rc24 | SPM: `github.com/AtomGradient/edge-halo-binary` |

## 详细文档

需要深入了解时，查阅：

| 主题 | 链接 |
|------|------|
| CLI 学习 demo 完整教程 | https://atomgradient.github.io/edge-developers/docs/get-started/minute-demo |
| 设备端学习体验 | https://atomgradient.github.io/edge-developers/docs/get-started/device-agent-learning |
| Neural Imprint vs LoRA/SFT | https://atomgradient.github.io/edge-developers/docs/guides/neural-imprint-vs-lora |
| 架构与产品边界 | https://atomgradient.github.io/edge-developers/docs/guides/architecture |
| Edge Kit API | https://atomgradient.github.io/edge-developers/docs/api-reference/edge-inference |
| 内存管理 | https://atomgradient.github.io/edge-developers/docs/guides/memory-management |
| 支持的模型列表 | https://atomgradient.github.io/edge-developers/docs/guides/supported-models |

## 重要约束

1. **不要用 Simulator** — Metal 推理、内存行为、NI restore 只在真机上有效
2. **不要上传用户数据** — 不要把对话、纠错、学习产物发到任何远程服务
3. **`--pre` 是必须的** — 当前是 Developer Preview，`pip install` 需要 `--pre` 标志
4. **合成数据不是理财建议** — finance sample 是教学演示，不提供投资建议
5. **NI 不修改模型权重** — 基础模型包保持不变，NI 是可移除的运行时状态

---

*AtomGradient Edge · [atomgradient.com](https://atomgradient.com) · [GitHub](https://github.com/AtomGradient)*
