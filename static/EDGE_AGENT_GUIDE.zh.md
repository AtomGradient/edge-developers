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
# 期望输出: edge-studio 0.0.1rc16 或更高 (--pre 总是装最新 preview)
edge doctor
# 此阶段除两个良性 warning 外都应 OK：
#   - model.cache    → 还没下载模型（Task 2 会下）
#   - backend.health → 服务还没启动（Task 8 会启）
# 不应出现任何 `fail`。
```

### 如果失败

- `python3.11: command not found` → 先装它（`brew install python@3.11`，或你惯用的 3.11），再重做 venv 步骤
- `edge: command not found` → 确认 venv 已激活：`which python` 应该指向 `.venv/bin/python`
- `edge doctor` 出现 `fail`（不只是 `warn`）→ 按它打印的修复提示操作，通常是 Python 版本或缺少依赖

## Task 2: 下载模型

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

### 验证

```bash
edge models where qwen3.5-9b-4bit
# 显示本地缓存路径和 status: complete
# 打印的路径就是模型所在位置——可用它检查或清理下载。
```

首次下载约 5GB，需要网络。下载完成后后续操作不再需要网络。

若下载中断，`edge models where` 会报 `incomplete`（而非假的 `complete`），且 `edge models fetch` 会打印一条 `--retry` 命令——重跑它即可清空重下。

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

### 你会看到（这里只列关键字段，你的实际输出更长）

实际 `--json` 输出有 500+ 行：还包含 `schema_version`、`run_id`、`audit`、`preflight`、模型解析和各 `sha256` 字段（用于审计）。这是正常的——看下面这几个关键字段即可：

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

> **前置：** XcodeGen（`brew install xcodegen`）和 Xcode。真机 **签名** 构建还需要：签名身份、属于该 Team 的 Xcode 账户、有效的描述文件——见 8c 的"真机签名前置清单"。
>
> **获取 Team ID（Code Agent 请读这段）：** 跑 `security find-identity -v -p codesigning`——你的 *Apple Development* 身份括号里那 10 字符就是 Team ID。若返回 `0 valid identities found`（没配 Apple 账号，或你是 `$HOME` 被重定向、无钥匙串访问的沙箱 agent），**不要在沙箱里尝试签名**——光有 Team ID 签不了名，签名需要宿主 login keychain 里的私钥。把签名构建交给宿主环境或开发者，或 **向开发者索要 Team ID** 并让他先在 Xcode → Settings → Accounts 登录。目标 iPhone/iPad 还需开启 Developer Mode 并在本机信任。

### 8a. 导出 Agent app（一条命令）

```bash
edge export scaffold \
  --model qwen3.5-9b-4bit \
  --app-name FinanceAgent \
  --output ./exports
```

直接导出——不用 server、不用浏览器。它生成 `./exports/FinanceAgent.zip`（完整 Xcode 工程）并打印路径；加 `--json` 出机器可读输出（`zip_path`、`next_steps`）。模型还没下载时它会 fail-closed 并提示先跑 `edge models fetch`——绝不悄悄下几 GB 的大模型。

想一键真机运行，再带签名：`--bundle-id com.example.financeagent --team-id <你的 TEAM_ID>`。

> **想用 GUI？** `edge studio` 会在 `http://127.0.0.1:18842` 打开本地 Web UI，同样的导出在 Export → Edge Scaffold。它也会启动 EdgeMesh 节点（HTTP `18842` + mTLS `18843` + mDNS），让设备互相发现——若防火墙提示请放行。上面的 CLI 是给 Code Agent 的推荐路径。

### 8b. 打开工程

```bash
unzip ./exports/FinanceAgent.zip -d ./exports
cd ./exports/FinanceAgent          # 工程根目录 — project.yml + FinanceAgent.xcodeproj 在这
open FinanceAgent.xcodeproj
```

`.xcodeproj` 已由导出生成。App 源码在嵌套的 `FinanceAgent/` 子目录；`project.yml`、`Resources/`、`.xcodeproj` 在工程根目录。

> **之后要改 `project.yml`？** 导出已生成 `.xcodeproj`，通常你无需再跑 `xcodegen generate`。在 **rc16+** 上重新生成是安全的 —— 导出会把模型的按需资源 (ODR) 接线（`KnownAssetTags` + 模型 source 的 `resourceTags`）**和一个共享 app scheme** 一起写进 `project.yml`，所以 `xcodegen generate` 会保留它们。（rc15 保留了 ODR 但没保留 scheme，重新生成后 `xcodebuild -scheme <App>` 可能失败；rc14 及更早还会丢 ODR，请用 rc16+。）

### 8c. 构建到真机

> **不要用 Simulator。** Edge 跑端侧 Metal 推理和 Neural Imprint restore，只在真机有效。Simulator 构建会报一个看不懂的 xcframework 切片错误，因为 EdgeHalo 只发真机切片——这是设计如此，不是 bug。

> **⚠️ 先完成 Xcode 签名设置 —— 这是硬前置，不是事后排查。** 除非下面几项都在 **宿主 Mac**（不是沙箱 agent）上做好，否则签名构建在产出 `.app` **之前** 就会失败：
> 1. **Xcode → Settings → Accounts：** 登录拥有该 Team 的 Apple Developer 账户。
> 2. **签名身份** 存在于宿主 login keychain —— 光有 Team ID 签不了名。缺失 → `No Account for Team "<TEAM_ID>"`。
> 3. **有效、未过期的 *iOS App Development* 描述文件** 对应你的 bundle id —— 或在账户已登录时让 `-allowProvisioningUpdates` 自动生成。缺失/过期 → `No matching iOS App Development provisioning profile`。
> 4. **设备：** 目标 iPhone/iPad 已插上、解锁、在本机信任、并开启 Developer Mode。
>
> **预检（命令前必须通过）：**
> ```bash
> security find-identity -v -p codesigning   # → 至少 1 个 "Apple Development" 身份
> xcrun xctrace list devices                 # → 出现你的真机 UDID
> ```
> 如果你是沙箱 agent，宿主有身份但你这里报 `0 valid identities found`，说明你被重定向的 `$HOME` 钥匙串是空的 —— **请在宿主环境跑签名构建**，或交给开发者。

**Code Agent 路径（CLI）** —— 预检通过后，找到设备，再 构建 → 安装 → 启动：

```bash
# 1. 列出已连接、已信任的设备；复制你 iPhone/iPad 的 UUID
xcrun devicectl list devices

# 2. 对该设备做签名构建（在 project root 跑 —— 8b 里打开的 FinanceAgent/ 目录）。
#    替换 <DEVICE_ID> 和 <TEAM_ID>。
xcodebuild -project FinanceAgent.xcodeproj -scheme FinanceAgent \
  -configuration Release \
  -destination 'platform=iOS,id=<DEVICE_ID>' \
  -derivedDataPath ./build \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=<TEAM_ID> CODE_SIGN_STYLE=Automatic \
  build

# 3. 安装 + 启动构建出的 .app（bundle id 须与 8a 的 --bundle-id 一致）
xcrun devicectl device install app --device <DEVICE_ID> \
  ./build/Build/Products/Release-iphoneos/FinanceAgent.app
xcrun devicectl device process launch --device <DEVICE_ID> com.example.financeagent
```

**Xcode 路径（GUI）** —— 打开工程，在 Signing & Capabilities 选 Development Team，选真机（不要 Simulator），Build & Run。

> **用 Release 构建，别用 Debug —— Debug 下端侧 token 生成慢 2–10×。** 上面的 CLI 序列已带 `-configuration Release`。Xcode 的 **Run** 默认是 Debug，需手动切：**Product → Scheme → Edit Scheme → Run → Build Configuration → Release**，再 Build & Run。（Debug 是 `-Onone`；MLX/Metal 推理必须用优化过的 Release 才能跑出真实 token 速度。）

> **首次构建会从 GitHub 拉 Swift 包**（edge-kit、edge-engine、edge-halo-binary……），需要联网。受限网络下，先配 HTTPS 代理再构建。

### 8c.1 让 Release 构建保持快速（模型交付）

默认导出会把模型打进 app（`<App>_model_config` 里 `MODEL_COPY="true"`）。这会让每次 Release 构建都很慢——要拷贝整个模型（数 GB），`.app` 也很大。它**不影响推理速度**：交付位置只影响构建时间和 app 体积，绝不影响 tokens/秒。模型进内存后，bundle、Documents、ODR 三条路径推理速度完全一样。

要在真机上快速迭代，跳过 bundle 拷贝，把模型推进 app 的 `Documents/` 容器。App 的 loader 先查 `Documents/<modelID>`，所以会从那里加载。文件夹名必须与 app 的 model id 一致（这里是 `Qwen3.5-9B-4bit`）：

```bash
DEVICE_ID=...        # xcrun devicectl list devices
BUNDLE_ID=...        # project.yml → PRODUCT_BUNDLE_IDENTIFIER
MODEL_DIR=~/Documents/mlx-community/Qwen3.5-9B-4bit
MODEL_NAME=Qwen3.5-9B-4bit

# 1. 不打包模型的 Release 构建（快、app 小）
xcodebuild -project FinanceAgent.xcodeproj -scheme FinanceAgent -configuration Release \
  -destination "platform=iOS,id=$DEVICE_ID" -derivedDataPath ./build \
  -allowProvisioningUpdates SKIP_MODEL_COPY=1 \
  DEVELOPMENT_TEAM=<TEAM_ID> CODE_SIGN_STYLE=Automatic build

# 2. 安装
xcrun devicectl device install app --device "$DEVICE_ID" \
  ./build/Build/Products/Release-iphoneos/FinanceAgent.app

# 3. 把模型推进 app 的 Documents 容器
for f in "$MODEL_DIR"/*.json "$MODEL_DIR"/*.txt "$MODEL_DIR"/*.jinja "$MODEL_DIR"/*.safetensors; do
  [ -f "$f" ] && xcrun devicectl device copy to --device "$DEVICE_ID" \
    --source "$f" --destination "Documents/$MODEL_NAME/$(basename "$f")" \
    --domain-type appDataContainer --domain-identifier "$BUNDLE_ID"
done

# 4. 启动 —— app 从 Documents 加载模型
xcrun devicectl device process launch --device "$DEVICE_ID" "$BUNDLE_ID"
```

模型会在 `Documents/` 里跨 app 重建保留，所以后续迭代只重建小 app、跳过数 GB 的推送。（这正是 Edge Studio 自己 `tests/device_test` 真机 Release 跑测用的模式。）

**三种交付模式** —— 推理速度相同；只在构建时间、app 体积、模型如何到达设备上不同：

| 模式 | 用途 | 取舍 |
|------|------|------|
| Documents-push（上面）| 快速开发迭代 | 构建快、app 小；用 `devicectl` 推一次模型 |
| Bundle（`MODEL_COPY="true"`）| 离线 / 独立 | 构建慢、app 大；模型在 `.app` 内 |
| ODR | App Store 分发 | 从 Apple CDN 按需下载；App-thinning |

在 **rc100+** 脚手架上，**Settings** 显示模型实际从哪加载（`Source: Bundle` / `Source: Documents` / `Source: ODR`），且仅在真正加载失败（或模型文件被误放到 Documents 根目录）时才提示 `Documents` 安装路径问题。更早的脚手架即使 bundle/ODR 成功加载也会显示 “Local model not found in Documents/&lt;model&gt;”——那是诊断残留，不是错误。

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

导出的项目有两层：**工程根目录**（`FinanceAgent/`）放 `project.yml`、`Resources/`、`.xcodeproj`；**App 源码**在嵌套的 `FinanceAgent/FinanceAgent/` 子目录（`App/`、`AI/`、`Chat/` 等）。下表路径相对于各文件所在的那一层——Swift 源码在源码子目录，`Resources/` 和 `project.yml` 在根目录。（`DemoChatView*.swift` 是主视图 + 各模态扩展：`+LLM`/`+VLM`/`+TTS`/`+STT`。）

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

| 包 | 已验证版本 | 安装 |
|----|---------|------|
| edge-studio | 0.0.1rc16 | `pip install --pre edge-studio` |
| edge-kit | 1.0.0-rc100 | SPM: `github.com/AtomGradient/edge-kit` |
| edge-engine | 1.0.0-rc141 | SPM: `github.com/AtomGradient/edge-engine` |
| edge-halo-binary | 1.0.0-rc24 | SPM: `github.com/AtomGradient/edge-halo-binary` |

> 这是本次 guide 修订所验证的版本。`--pre`（pip）和 SPM 解析可能拉到更新的兼容 preview —— 取最新版并在升级后在真机上重新验证。

> **VLM 文本速度（edge-kit rc100+）。** 如果你的模型是视觉语言模型（如 Qwen3.5），纯文本聊天现在默认满速运行——和纯文本 LLM 走同一条 Metal 采样解码路径。你**无需**为了文本速度把模型类别切成 `.llm`。（更早的构建在 VLM 模型上对采样文本会跌回慢的参考解码器；edge-kit rc100 修复了。iPhone Air + `Qwen3.5-9B-4bit` 实测：0.5 → 11.2 tok/s，默认温度。）

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
