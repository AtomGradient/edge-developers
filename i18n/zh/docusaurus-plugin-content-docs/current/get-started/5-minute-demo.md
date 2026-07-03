---
sidebar_position: 1
title: 构建第一个设备 Agent
sidebar_label: 2. 首个设备 Agent (CLI)
slug: /get-started/minute-demo
---

# 构建第一个设备 Agent

当前预览版可运行。

在 Edge 里，设备就是 Agent。App 是载体。

这页是 Developer Preview 最短的完整路径：安装 Edge Studio，检查本地理财信号，对比基础模型，生成 Neural Imprint，检查学到的工具策略，然后把同一条 Agent 路径导出到 iPhone 载体。

你会看到三个时刻：

| 时刻 | 你会证明什么 |
| --- | --- |
| Aha #1 | 同一个基础模型在恢复本地 Neural Imprint 后，回答发生变化。 |
| Aha #2 | Agent 学会了有哪些本地工具、什么时候使用、什么时候不该使用。 |
| Aha #3 | Mac 上证明过的机制，进入具备端侧学习挂钩的载体 App。 |

理财样本是合成的、可检查的。它不是理财建议。

## 1. 为什么需要这条路

个性化通常很重：

| 方案 | 真实产品里会发生什么 |
| --- | --- |
| LoRA / 微调 | 一条用户偏好变成训练、打包、发布、回滚和回归测试。 |
| Prompt 填充 | 私有 profile 文本被重复塞进每次请求，并消耗上下文。 |
| 云端个性化 | 敏感本地状态离开设备，并带来信任、延迟、联网和合规负担。 |

Edge 走另一条路。本地信号会变成可移除的运行时学习状态。基础模型包保持稳定。恢复前会做兼容性检查，失败则回到基础模型路径。

## 2. 安装 Edge Studio

创建 Python 3.11 环境，并安装公开包：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

`--pre` 会安装当前 release candidate。在第一个 stable package 发布前请保留它。

<details>
<summary>使用 uv</summary>

```bash
uv venv --python 3.11 .venv
source .venv/bin/activate
uv pip install --upgrade --pre edge-studio
edge doctor
```

</details>

`edge doctor` 会检查 Python 环境、模型路径和系统兼容性。源码安装见 [安装 Edge Studio](/docs/get-started/source-build)，但这条路径不需要源码安装。

## 3. 场景

想象一个私有理财助手。用户说：

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

之后用户问：

```text
I have $800 left after bills this month. What should I do with it?
```

Agent 不应该变成荐股工具。它应该尊重用户的本地风险边界，先解释现金流影响，只使用载体暴露的本地工具，并避免没有依据的收益承诺。

## 4. 准备模型

demo 使用 `qwen3.5-9b-4bit`。

```bash
edge models where qwen3.5-9b-4bit
```

如果模型不存在，显式下载：

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

demo 不会静默下载模型。如果模型已经存在，Edge 会复用本地匹配项并报告缓存路径。

在内存足够的 Mac 开发机上，也可以在同一条流程里显式使用更大的本地模型：

```bash
edge models where qwen3.5-27b-4bit
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-27b-4bit \
  --json
```

模型选择仍然是显式的。Edge 不会静默切到 27B；请按机器能力和验证预算选择能稳定运行的最大本地模型。

## 5. 检查本地学习信号

在任何模型加载之前，先检查 Agent 到底会学习什么：

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

在输出里找到 records 和 correction：

```json
{
  "sample_id": "finance_conservative_cashflow_v1",
  "question": "I have $800 left after bills this month. What should I do with it?",
  "sample_text": {
    "records": [
      {
        "kind": "explicit_preference",
        "text": "The synthetic user avoids high-risk recommendations and prefers stable, cash-flow-aware guidance."
      },
      {
        "kind": "cashflow_context",
        "text": "The synthetic user's rent and fixed subscriptions are already covered; they have $800 left after bills this month."
      },
      {
        "kind": "trust_boundary",
        "text": "The synthetic user wants cash-flow impact explained before any recommendation and does not want unsupported return claims."
      }
    ],
    "corrections": [
      {
        "correction_type": "profile_correction",
        "target": {"profile_field": "financial_guidance_style"}
      }
    ]
  }
}
```

这个 dry run 不加载模型、不写 demo state、不恢复产物，也不联网。它先让你审查本地学习信号。

### 自定义学习样本

`finance_conservative_cashflow_v1` 是 CLI 内置样本，映射到包内
`edgestudio/cli/demo_samples.py` 里的 fixture。如果要使用你自己的本地数据，把同样结构保存成
JSON，然后通过 `--sample-file` 传入。
每条 `corrections[].peer_id` 必须等于顶层 `peer_id`；不一致会在模型加载前
fail closed。

Mac CLI 学习链路不消费 `Resources/RPP/` A-library。任意领域形态的本地样本都可以
通过 `--sample-file` 运行；A-library 是后续设备端 Edge Halo profile analysis
路径才需要的输入。

按数据用途选择样本路径：

| 你手里的数据 | 使用路径 | 输出 artifact |
|---|---|---|
| 行为风格、边界或偏好，并且有明确 corrections | Learn | `edge.demo.learn.sample.v1` |
| 行为风格、边界或偏好，但没有 corrections | Imprint | `edge.demo.imprint.sample.v1` |
| 需要查询或后续刷新的一组事实 | Local facts | `edge.demo.facts.v1` 导入骨架，或 URL 导入 |

先从已校验的模板开始：

```bash
edge demo learn sample init --output ./my-budget-sample.json
edge demo learn sample validate ./my-budget-sample.json
```

也可以使用最小交互向导：

```bash
edge demo learn sample init --interactive --output ./my-sample.json
```

交互命令会先问你的数据是在教"如何回应"，还是在提供"事实答案"。回应类数据
会继续询问是否有 corrections；事实答案类数据会生成 facts 导入骨架，而不是
profile 样本。

生成后的 artifact 用对应命令消费：

| Artifact | 校验或消费命令 |
|---|---|
| `edge.demo.learn.sample.v1` | `edge demo learn sample validate ./sample.json`，然后 `edge demo learn run --sample-file ./sample.json ...` |
| `edge.demo.imprint.sample.v1` | `edge demo imprint run --dry-run --sample-file ./sample.json --model qwen3.5-9b-4bit --json` |
| `edge.demo.facts.v1` | `edge demo facts import ./facts.json --store <name>` 或 `edge demo facts import-url <url> ...` |

`sample validate` 目前只校验 learn 样本。imprint 样本请用
`imprint run --dry-run` 作为校验步骤；facts import 和 URL import 是可刷新的本地知识路径。

`validate` 复用 learn sample 的 `--sample-file` loader。默认输出只包含哈希和计数；
加 `--json` 可以得到机器可读报告。非交互 learn 模板形态如下：

```json
{
  "schema_version": "edge.demo.learn.sample.v1",
  "sample_id": "my_budget_sample_v1",
  "peer_id": "my-demo-peer",
  "app_id": "com.example.myapp",
  "base_model_id": "qwen3.5-9b-4bit",
  "question": "How should I plan my remaining budget this month?",
  "records": [
    {
      "record_id": "budget-001",
      "kind": "explicit_preference",
      "text": "The user wants fixed expenses and emergency cash protected before discretionary spending.",
      "tags": ["budget", "cashflow"]
    },
    {
      "record_id": "budget-002",
      "kind": "cashflow_context",
      "text": "The user has $800 left after rent, utilities, and subscriptions this month.",
      "tags": ["budget", "cashflow"]
    },
    {
      "record_id": "budget-003",
      "kind": "trust_boundary",
      "text": "The user does not want unsupported return claims or speculative investment recommendations.",
      "tags": ["budget", "trust_boundary"]
    }
  ],
  "corrections": [
    {
      "peer_id": "my-demo-peer",
      "app_id": "com.example.myapp",
      "correction_type": "profile_correction",
      "target": {"profile_field": "budget_guidance_style"},
      "correction": {
        "profile_overlay": {
          "priority": "fixed expenses and emergency cash first",
          "boundary": "no unsupported return claims"
        }
      },
      "status": "recorded"
    }
  ],
  "tool_schema_export": {
    "schema_version": "edgestudio.tool_schema_export.v1",
    "tools": [
      {
        "name": "my_budget_facts_lookup",
        "description": "Read-only lookup for local budget facts.",
        "permissions": ["read_facts"],
        "intentTags": ["exact_fact", "budget"],
        "parameters": {
          "type": "object",
          "properties": {"topic": {"type": "string"}}
        }
      }
    ]
  },
  "expected_tool_policy": {
    "description": "Deterministic tool-use policy learned from this sample",
    "tools_available": [
      {
        "name": "my_budget_facts_lookup",
        "when": "User asks about budget priorities",
        "args_constraint": "topic must reference this budget sample"
      }
    ],
    "negative_policy": ["Do not call network tools", "Do not invent return claims"]
  }
}
```

#### 把 App 业务数据翻译成 canonical records

不要把 `transactions`、`merchants`、`categories` 这类 App 专有表放在 sample 文件顶层。
Edge Studio 接受上面的 canonical sample 字段；遇到未知顶层字段会 fail closed。
业务数据到 canonical `records` / `corrections` 的翻译由你的 App 负责。

把 `records[].kind` 当作稳定、有语义的 `snake_case` 词汇表使用。它是自由字符串，
但不只是展示文案：profile body 会按 `(kind, record_id)` 排序，并按 kind 渲染成
一个个 `[kind]` 分组。

每条 record 保持为一条可以独立复述的事实、偏好或边界。内置 finance 样本使用
`explicit_preference`、`cashflow_context` 和 `trust_boundary`，就是为了表达这个粒度。

按变化类型选择 `correction_type`：

| 类型 | 适用场景 | 必需结构 |
|---|---|---|
| `eval_feedback` | 用户评价某次回答 | `correction.rating` 为 `positive`、`negative` 或 `neutral` |
| `fact_correction` | 具体事实需要修正 | `target.fact_id` 加修正后的结构化字段 |
| `profile_correction` | 行为风格或边界需要变化 | `target.profile_field` 或 `target.direction_id` 加结构化修正字段 |

fact 类纠正需要至少两次独立支持才会进入编译后的 overlay。单次 fact 纠正会被视为不稳定并跳过；
一次性的风格或边界变化应使用 `profile_correction`。

#### 不要把事实知识塞进 profile body

`records` 用来表达回应姿态：偏好、风格、边界，以及应该进入 Neural Imprint
profile 的紧凑上下文。不要把 profile records 当作大型或频繁更新的知识库。
事实路径会生成 `edge.demo.facts.v1`，目标是本地 lookup store，不会进入
`profile_body`。

这个拆分是刻意设计：更新本地 facts 文件不应该要求重建模型或重新生成 Neural
Imprint artifact。只有当助手的行为风格或边界发生变化时，才应该修改 profile。

#### 从 URL 导入材料

如果资料已经在文档页面上，可以把一个有界 HTTP(S) URL 导入本地 facts store：

```bash
edge demo facts import-url "https://example.org/materials" \
  --store protocol_docs_v1 \
  --topic "Protocol documentation" \
  --tags protocol,docs \
  --json
```

对于带 HTML 表格的索引页，可以把表格行拆成多条 facts：

```bash
edge demo facts import-url "https://example.org/all" \
  --store protocol_docs_v1 \
  --topic "Protocol index" \
  --tags protocol,index \
  --split html-table-rows \
  --fact-id-prefix protocol-index \
  --json
```

`import-url` 不是爬虫。它只抓取一个 URL，执行大小和内容类型限制，记录
`network_used=true`，并默认写仅哈希回执。`html-table-rows` 模式会把每行里的
链接绝对化后作为 fact 文本保存；Edge 不会跟随这些链接。

#### 注册开发者命名的只读工具

`--facts-store` 是快捷路径：它为一个 store 注册内置 `local_facts_lookup` 工具。
在 rc20 中，tools manifest 做的是给这个内置只读 executor 一个稳定的开发者自有名称，
并把它绑定到 facts store；它还不是注册开发者自己实现的代码。

如果你的载体 App 需要稳定的开发者自定义 tool 名，可以创建 tools manifest：

```json
{
  "schema_version": "edge.demo.tools.manifest.v1",
  "tools": [
    {
      "name": "protocol_docs_lookup",
      "kind": "local_facts_lookup",
      "store": "protocol_docs_v1",
      "description": "Read-only lookup for imported protocol documentation."
    }
  ]
}
```

先校验：

```bash
edge demo tools validate ./tools.json --json
```

rc20 唯一可执行的 kind 是 `local_facts_lookup`。executor、parser、dispatcher
和 receipt 都由 Edge 负责。从 `0.0.1rc21` 起，你也可以把工具实现为普通 Python
函数，通过 `edge demo chat --tools ./tools.py` 运行——见
[自定义 Python 工具](/docs/guides/custom-python-tools)。

再在 chat 中启用：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --tools-manifest ./tools.json \
  --prompt "Check local protocol docs before answering." \
  --json
```

如果要让 learn 学会工具使用习惯，工具名必须对齐。如果 learn sample 的
`tool_schema_export.tools[].name` 是 `protocol_docs_lookup`，运行时就应该用
注册了 `protocol_docs_lookup` 的 manifest。若使用 `--facts-store` 快捷路径，
sample 里的工具名仍应是 `local_facts_lookup`。

运行前可以审计这个对齐关系：

```bash
edge demo tools validate ./tools.json \
  --learn-sample ./sample-that-declares-protocol_docs_lookup.json \
  --json
```

如果工具名不一致，validator 会给出非阻塞 warning；请把它视为 Neural Imprint
prefix 和运行时工具注册名可能分裂的信号。修法是修改 sample 的
`tool_schema_export` 工具名或 manifest 工具名，让两边一致。

然后检查或运行这个样本：

```bash
edge demo learn run --dry-run \
  --sample-file ./my-budget-sample.json \
  --model qwen3.5-9b-4bit \
  --json
```

不传 `--include-text` 时，JSON 报告不会把原始样本文本打印到终端，只返回哈希标识符。

## 6. 先问基础模型

启动基础模型聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

输入：

```text
you> I have $800 left after bills this month. What should I do with it?
```

回答通常有用但比较通用：储蓄、还债、投资，以及根据目标和风险承受度规划。这就是学习前状态：模型还没有恢复用户本地理财偏好。

退出：

```text
you> /exit
```

## 7. 运行 RPP 自学习

运行本地学习流程：

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

这里可以用 `--include-text`，因为样本是合成的。不要把它用于你不希望打印到终端或写入本地 receipt 的真实用户 prompt 或私人财务记录。

你会看到类似输出：

```text
Edge demo learn (edge.demo.learn.run.v1)
status: completed
model: qwen3.5-9b-4bit
model_prepare: skipped_existing
sample: finance_conservative_cashflow_v1
state: .../demo_runs/edge-learn-.../learn_state
generation_job: neural_imprint_gen_...
artifact: .../neural_imprint.safetensors
metadata: .../neural_imprint_metadata.json
answers_differ: True
receipt: .../learn_receipt.json
next: edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
raw_text_in_receipt: true
```

`receipt` 路径就是交接对象。你不需要自己传底层 artifact 路径。`--with-imprint` 可以接收 `learn_receipt.json`，读取里面记录的 artifact 和 metadata，完成校验，并在不匹配时失败即关闭。

## 8. 用 Neural Imprint 再问一次

复制 learn 输出里的 `next:` 命令：

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive \
  --max-tokens 160 \
  --with-imprint ".../learn_receipt.json"
```

问同一个问题：

```text
you> I have $800 left after bills this month. What should I do with it?
```

回答应该转向保守、现金流优先。在一次本地验证中，恢复后的 session 输出过这种行为形态：

```text
Based on your current cash flow of $800 and your preference for stability, here
is the best way to handle that money:

Priority 1: Preserve Your Cash Flow Stability
...
Emergency Fund Top-up
...
Pay Down High-Interest Debt
```

**Aha #1：** 同一个基础模型包，同一个问题，本地学习状态从 receipt 恢复。

具体文字会随模型构建和生成设置变化。重要契约是：恢复本地 Neural Imprint 产物后行为发生变化，并且这个变化对应你检查过的合成信号。

## 9. 检查工具策略

同一个 dry-run JSON 现在包含 `expected_tool_policy`：

```json
{
  "tool_learning": {
    "policy_kind": "deterministic_preview",
    "actual_tool_calls": false,
    "expected_tool_policy": {
      "description": "Deterministic tool-use policy learned from this sample",
      "tools_available": [
        {
          "name": "sample_finance_facts_lookup",
          "when": "User asks about specific financial preferences or risk boundaries",
          "args_constraint": "topic must be one of: risk_boundary, cashflow, trust_boundary"
        },
        {
          "name": "sample_finance_cashflow_summary",
          "when": "User asks about current cash flow, bills, or available balance",
          "args_constraint": "scope must be a recognized finance scope"
        }
      ],
      "negative_policy": [
        "Do not call external market data tools",
        "Do not call tools that require network access",
        "Do not invent financial return numbers without user-provided facts"
      ]
    }
  }
}
```

**Aha #2：** Agent 不只是学习“用户是谁”。它也在学习载体暴露了哪些本地工具、什么时候适合用、哪些工具或说法越界。

这是确定性预览，不是实时 tool-call trace。这些工具是合成只读工具，不是真实金融服务。
从 `0.0.1rc21` 起，live chat tool runner 也能通过 Edge 托管的 runner 执行开发者自己
实现的 Python 工具——包括把工具 schema 烘焙进 Neural Imprint（见
[自定义 Python 工具](/docs/guides/custom-python-tools)）。外部 provider 进程仍是后续
独立契约。

## 10. 检查 receipt 和 local-only 契约

这次学习运行在本地做了四件事：

1. 把合成 records 写入隔离的 demo state。
2. 记录合成 correction。
3. 生成并恢复本地 Neural Imprint 产物。
4. 对比恢复前和恢复后的回答。

默认情况下，receipt 是本地且只记录哈希。本教程使用 `--include-text`，只是因为样本是合成的，本来就用于阅读。不使用 `--include-text` 时，receipt 保留哈希标识符，不保存原始用户文本：

```json
{
  "raw_text_included": false,
  "network_used_during_demo": false,
  "network_used_during_model_prepare": false,
  "question_sha256": "sha256:...",
  "before_answer_sha256": "sha256:...",
  "after_answer_sha256": "sha256:...",
  "expected_tool_policy_sha256": "sha256:..."
}
```

不重新加载模型也可以检查 receipt：

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

local-only 检查用于确认 demo 期间没有发生非本机地址网络访问。把同样原则带进你的载体：私有信号默认留在本地，学习状态可移除，恢复失败即关闭。

可选的底层 Neural Imprint 冒烟检查：

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

这些命令用于产物复用和实现层检查，不是 5 分钟演示必须执行的步骤。

## 11. 把 Agent 载体导出到 iPhone

打开本地工作台：

```bash
edge studio
```

打开 `http://127.0.0.1:18842`。

在 Edge Studio 里：

1. 加载同一个模型。
2. 打开 **Export**。
3. 选择 **Edge Scaffold**。
4. 导出 Agent 载体并下载项目。

导出的 App 不是静态壳，但它也不是已经预先学会了 Mac demo 的 App。当前预览版不会把第 7 步的 `learn_receipt.json` 自动塞进 ZIP。Mac 上的 receipt 用来证明学习机制，并让你检查本地产物。导出的载体给 iPhone App 带去端侧学习所需的运行时接线。

ZIP 里包含：

| 部分 | 作用 |
| --- | --- |
| App 源码和 `ScaffoldConfig.swift` | 载体表面、模型设置、样本领域和运行时开关。 |
| Edge Kit / Edge Engine 依赖 | 端侧模型加载、流式生成和 hidden-state capture 支持。 |
| Edge Halo binary 依赖 | Neural Imprint 生命周期：profile job、产物 capture、兼容性校验和 restore。 |
| `Resources/SampleData/` | 首次 smoke check 用的合成 facts 和 sample domains。 |
| `Resources/RPP/` | 可选的模型匹配 RPP A-library 资源。如果为空，RPP 行为会 fail closed，而不是假装已经学习。 |

RPP A-library 不是学到的用户状态。它是和模型、层、领域匹配的基准方向资源，让 Edge Halo 可以在本地 records 上运行 profile analysis。Neural Imprint 产物是在之后由设备上的本地 facts、corrections、tool schema 和模型 session 生成的。

打开生成的项目：

```bash
cd FinanceAgent/FinanceAgent
xcodegen generate
open FinanceAgent.xcodeproj
```

然后选择 signing team，选择真实 iPhone 或 iPad，build。不要用 Simulator 验证这条路径。

在设备上分开验证两件事。

先验证载体：

```text
I have $800 left after bills this month. What should I do with it?
```

- model/session 状态是本地的。
- App 加载了预期模型和聊天路径。
- 开启飞行模式后，App 仍然走预期路径。

然后，在导出包包含所需 RPP 资源、并且你启用了 App 侧触发入口时，验证设备端学习：

1. App 通过自己的数据层记录本地、经 App 批准的信号：设置、facts、明确纠错和本地 tool schema。
2. 模型加载完成并且 eligible facts 足够后，由 App 代码或用户可见控件启动 Edge Halo profile job。它不应该是用户无感知的隐藏后台动作。
3. Edge Halo 在设备上使用 `Resources/RPP/` 里的 A-library 运行 RPP profile analysis，capture Neural Imprint 产物，并写入本地 capsule。
4. capsule 只有在模型、tokenizer/runtime、cache backend 和 tool schema 兼容性检查通过后才会 restore。
5. 手机上的新偏好，比如 “I want to be more aggressive now”，会成为新的本地 correction。载体可以触发之后的新一轮 profile job，并且只有通过同样的校验闸门后才替换 active capsule。

当前预览版边界：上面的 CLI 路径是学习和 restore 的确定性证明。导出的 scaffold 提供端侧运行时接线、fail-closed 的 RPP 行为和 smoke surfaces。产品级触发策略、用户同意 UI、删除 UX 和任务评估仍然是 App 侧工作，完成前不要写进生产 claim。

**Aha #3：** Mac demo 证明机制；载体 App 才是同一条学习循环在设备上落地的位置。App 是载体，设备是 Agent。

## 12. 刚才发生了什么

- Agent 从本地合成理财信号学习。
- RPP 自学习产生本地学习表征。
- Neural Imprint 把学习状态恢复进兼容模型 session。
- 恢复经过模型、tokenizer、runtime 和 tool schema 兼容性检查。
- 工具策略展示了哪些本地工具适合使用，哪些动作越界。
- 导出的载体把 Mac proof artifact 和设备端学习循环分开。
- 如果兼容性失败，产品保留基础模型路径。

这不是 LoRA、SFT、prompt stuffing，也不是云端个性化。

## 13. 常见问题

### 这是 LoRA 或 SFT 吗？

不是。LoRA 和 SFT 适合你明确想交付训练后的模型或 adapter release 的场景。那需要算力、数据整理、发布打包、回滚和回归评估。Neural Imprint 是另一种面向用户级端侧学习的契约：基础模型包保持稳定，本地学习状态只在兼容性检查通过后恢复。

### 这是 prompt stuffing 吗？

不是。Prompt stuffing 会把 profile 文本或 instruction 反复塞进每一次请求。它占用 context budget，并重复暴露私有状态。学习后的聊天是从 Neural Imprint receipt 恢复本地 runtime state，然后继续用正常 generation path 处理当前消息。

### Agent 到底学习了什么？

只学习你检查过的合成信号：风险边界、现金流上下文、信任边界，以及预期本地工具策略。在真实理财产品里，这些信号会来自 App 批准的本地设置、明确用户偏好和用户可见纠错。载体 App 拥有这套策略。

### 导出的 App 已经包含 Mac 上学到的结果吗？

默认不包含。当前 export 不会自动把第 7 步的 `learn_receipt.json` 或 Neural Imprint 产物打包进 App。这是刻意的：用户学习状态应该属于设备和载体的生命周期，而不是被静默烘焙进一个模板 ZIP。Mac demo 用来检查和证明机制；导出的 App 用来在真机上接入同一套生命周期。

### 手机上的新偏好如何触发学习？

载体先在本地记录经用户批准的信号，例如设置、纠错或 classified fact。当 App 判断这个信号符合学习条件时，它启动设备端 Edge Halo job。这个 job 使用本地模型 session、本地 tool schema 和打包的 RPP A-library 生成新的 Neural Imprint capsule。restore 会经过兼容性检查，并且 fail closed。手机不需要为了每个新偏好回到 Mac，也不需要重新导出 App。

### `answers_differ: True` 能证明生产就绪吗？

不能。它证明的是：在这个受控合成样本里，恢复后的 Neural Imprint 产物已经生效，并且回答在恢复后发生了变化。生产就绪仍然需要任务级评估、UI 控制、删除 UX 和真机验证。

## 14. 继续深入

- 开发者文档：[atomgradient.github.io/edge-developers](https://atomgradient.github.io/edge-developers/)
- GitHub：[github.com/AtomGradient](https://github.com/AtomGradient)
- 源码安装参考：[安装 Edge Studio](/docs/get-started/source-build)
