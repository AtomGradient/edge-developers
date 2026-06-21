---
sidebar_position: 4
title: 设备端 Agent 学习
sidebar_label: 3. 设备端学习 (iPhone)
slug: /get-started/device-agent-learning
---

# 在设备上体验 Agent 持续学习

上一篇教程在 Mac 终端里证明了学习机制。这一篇让你在 iPhone 上亲手体验：模型在设备上加载、学习、恢复，全程离线，数据不离端。

:::info 前置条件
完成[构建你的第一个设备 Agent](/docs/get-started/minute-demo) 中的 CLI 学习 demo。你需要已安装 Edge Studio 和本地模型。
:::

## 为什么需要这一步

CLI demo 证明的是**机制**——RPP 自学习能生成 NI 产物，restore 后行为改变。但那是在 Mac 上跑的。

Edge 的真正价值是：**同样的学习循环在用户的手机上运行。** 不依赖 Mac，不依赖云端，不需要重新导出。设备自己就是 Agent。

这一步你会亲手验证：

| 验证项 | 你会看到什么 |
|--------|-------------|
| 模型在 iPhone 上加载 | 本地推理，无需联网 |
| 选择一个生活场景 domain | 8 个内置 domain 可选 |
| 用合成数据触发学习 | 设备端 EdgeHalo profile job |
| NI 产物生成并恢复 | 行为改变，和 CLI 一致 |
| 飞行模式验证 | 关掉网络，一切照常 |
| 可移除 | 删除 NI，模型恢复原样 |

## 1. 从 Edge Studio 导出

打开 Edge Studio：

```bash
edge studio
```

在 Web UI (`http://127.0.0.1:18842`) 中：

1. 加载你在 CLI demo 中使用的模型（`qwen3.5-9b-4bit`）
2. 点击 **Export → Edge Scaffold**
3. 输入 App 名称，例如 `FinanceAgent`
4. 下载 ZIP

{/* TODO: 截图 — Edge Studio 导出界面 */}
:::note 📸 截图占位
Edge Studio Web UI 导出界面
:::

## 2. 在 Xcode 中打开并部署到真机

解压并打开导出生成的工程：

```bash
unzip FinanceAgent.zip
cd FinanceAgent          # 工程根目录 — project.yml + FinanceAgent.xcodeproj 在这
open FinanceAgent.xcodeproj
```

`.xcodeproj` 已由导出生成；App 源码在嵌套的 `FinanceAgent/` 子目录。（**不要**对它跑 `xcodegen generate` —— 模型的按需资源 (ODR) 接线在后处理过的 `.xcodeproj` 里、不在 `project.yml`，重新生成会丢掉它；需要改 `project.yml` 就从 Edge Studio 重新导出。）在 Xcode 中：

1. 选择你的 Development Team（Signing & Capabilities）
2. **选择真机**（iPhone 或 iPad）— 不要选 Simulator
3. Build & Run

:::warning 必须真机
Simulator 无法验证 Metal 推理、内存行为和 NI restore。Edge 的端侧体验只有在真机上才是真实的。
:::

{/* TODO: 截图 — Xcode 中选择真机设备 */}
:::note 📸 截图占位
Xcode 选择真机设备
:::

## 3. 首次启动：Onboarding

App 首次启动会进入 Onboarding 流程：

1. **设备评估** — 检测设备硬件（芯片、内存、存储），计算 AI IQ 分数
2. **模型选择** — 根据设备能力推荐模型 tier
3. **模型下载** — 下载模型到本地（首次需要网络，之后不需要）

{/* TODO: 截图 — Onboarding 设备评估页面 */}
:::note 📸 截图占位
Onboarding 设备评估 — AI IQ 分数
:::

{/* TODO: 截图 — 模型下载进度 */}
:::note 📸 截图占位
模型下载进度
:::

## 4. 验证基础对话

模型加载完成后，进入 Chat 页面。先问一个普通问题：

```text
这个月账单付完还剩 800 块，我该怎么用？
```

你应该看到一个**通用的回答**——储蓄、投资、还债等建议。这是 base model 的状态：模型可以聊天，但不了解你。

{/* TODO: 截图 — Chat 界面，base model 通用回答 */}
:::note 📸 截图占位
Base model 通用回答
:::

## 5. 选择 Domain 并加载合成数据

进入 **Settings → Personalization**。

你会看到一个 **Domain 选择器**，包含 8 个内置生活场景：

| Domain | 场景 | 合成数据内容 |
|--------|------|-------------|
| **finance** | 个人理财 | 消费记录、订阅、现金流 |
| health | 健身健康 | 运动记录、饮食、睡眠 |
| cooking | 厨房烹饪 | 食材、口味、过敏信息 |
| reading | 阅读学习 | 书单、笔记、学习进度 |
| journal | 日记反思 | 日常记录、情绪、反思 |
| travel | 旅行探索 | 行程、偏好、预算 |
| music | 音乐娱乐 | 播放记录、口味、场景 |
| work | 工作效率 | 任务、日程、工作习惯 |

选择 **finance**（和 CLI demo 同一个场景）。

{/* TODO: 截图 — Domain 选择器，选中 finance */}
:::note 📸 截图占位
Domain 选择器界面
:::

进入 **Sample Data** 页面，点击加载合成数据。这些是预置的合成消费记录——Spotify 订阅、7-Eleven 采购、外卖订单等。全部标记为 `synthetic: true`。

{/* TODO: 截图 — 合成消费记录列表 */}
:::note 📸 截图占位
加载后的合成消费记录
:::

## 6. 查看数据管线状态

在 **Personalization** 页面，你能看到完整的数据管线：

| 指标 | 含义 |
|------|------|
| **Classified Facts** | 被分类引擎处理过的结构化事实数 |
| **Raw Unclassified** | 等待分类的原始记录数 |
| **Chat Feedback** | 用户给过的对话反馈（👍👎） |
| **Chat Corrections** | 用户做过的纠错 |
| **Training Events** | 已产生的学习事件数 |

{/* TODO: 截图 — 数据管线状态面板 */}
:::note 📸 截图占位
Data Pipeline 状态面板
:::

## 7. 触发设备端学习

当足够的本地信号积累后，App 可以触发 Edge Halo profile job。

学习过程在设备上本地完成：

1. Edge Halo 读取 App 认可的本地信号（classified facts、corrections、tool schema）
2. 使用 `Resources/RPP/` 中的 A-library 基准资源运行 RPP profile analysis
3. 在设备上生成 Neural Imprint capsule
4. 兼容性校验（模型 / tokenizer / runtime / tool schema / cache backend）
5. 校验通过 → restore；校验失败 → fail closed，保留 base model

{/* TODO: 截图 — Neural Imprint 状态变为 Active */}
:::note 📸 截图占位
Neural Imprint 状态变为 Active
:::

在 **Personalization** 页面的 **Persona Runtime** 区域，你应该看到：

- **Neural Imprint**: Active ✅
- Artifact SHA256（前 12 位哈希）
- Cache Backend

## 8. 再次对话：看到差异

回到 Chat 页面，问同一个问题：

```text
这个月账单付完还剩 800 块，我该怎么用？
```

| 时刻 | 回答风格 |
|------|---------|
| Step 4（学习前） | 通用建议：储蓄、投资、还债… |
| Step 8（学习后） | 保守建议：先保流动性、补充应急储备、避免高风险 |

**这就是端侧学习的 aha moment。** 同一个模型，同一个问题，设备本地学习后回答变了。

{/* TODO: 截图 — 学习后回答，保守风格 */}
:::note 📸 截图占位
学习后回答（保守、现金流导向）
:::

## 9. 飞行模式验证

打开 **飞行模式**，再问一次：

```text
我想买一支基金，你有什么建议？
```

回答应该仍然正常——保守风格、不编造收益。

**模型推理 + 学习状态恢复，全程不需要网络。**

{/* TODO: 截图 — 飞行模式下正常对话 */}
:::note 📸 截图占位
飞行模式下的正常对话
:::

## 10. 可移除验证

进入 **Settings → Personalization → Data Management**：

1. 点击 **Clear Feedback and Corrections**
2. 观察 Neural Imprint 状态从 "Active" 变回 "Not active"

回到 Chat，再问同一个问题。回答应该**恢复为通用风格**。

**学习状态是可移除的。** 用户随时可以清除，模型回到出厂状态。

{/* TODO: 截图 — 清除后 NI 恢复为 Not active */}
:::note 📸 截图占位
清除后 NI 状态恢复为 Not active
:::

## 11. 尝试其他 Domain

你刚刚用 finance domain 体验了完整的设备端学习循环。回到 **Settings → Personalization**，切换到其他 domain：

- **health** — 加载健身记录，看看助手是否学会了你的运动偏好
- **cooking** — 加载口味数据，看看助手推荐菜谱是否变了
- **journal** — 加载日记数据，看看助手的写作风格是否变了

每个 domain 有独立的合成数据集，学习循环相同。

## 完整的 Edge 故事

| 路径 | 你证明了什么 |
|------|-------------|
| [CLI demo](/docs/get-started/minute-demo) | 学习机制有效 |
| **本页** | 设备端体验真实：iPhone 上加载、学习、恢复、离线、可移除 |

> **设备是 Agent，App 是载体。** 模型在设备上学习用户偏好、学习使用本地工具。学习状态本地生成、本地恢复、可随时移除。数据从不离开设备。

## 下一步

| 目标 | 去哪里 |
|------|--------|
| 了解 NI 和 LoRA/SFT 的区别 | [Neural Imprint vs LoRA](/docs/guides/neural-imprint-vs-lora) |
| 了解产品架构 | [Architecture](/docs/guides/architecture) |
| 定制你的 Agent 载体 | [Edge Scaffold](/docs/optimize-and-ship/scaffold) |
| API 参考 | [Edge Inference API](/docs/api-reference/edge-inference) |
