---
sidebar_position: 2
title: 自定义 Python 工具
slug: /knowledge-tools/custom-python-tools
---

# 自定义 Python 工具

写一个 Python 函数，端侧模型就能调用它——并且能学会它。

```python
# tools.py
from edgestudio.tools import edge_tool

@edge_tool
def hello_world() -> str:
    return "hello world"

@edge_tool(description="Compute the service fee for an amount.", intent_tags=["billing"])
def calculate_fee(amount: float) -> dict:
    return {"fee": amount * 0.003}
```

```bash
edge demo chat --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --prompt "Use the calculate_fee tool for amount 250. State the exact fee."
```

你不需要写服务器、manifest、端口或 HTTP 端点。Edge 负责发现函数、从类型注解
生成模型可见的 schema、在隔离的 runner 进程中执行你的代码、校验每一次调用，
并写入 hash 优先的 receipt。

:::info 版本要求
自定义 Python 工具需要 `edge-studio` **0.0.1rc21 或更新版本**。本页的
`output_schema`、`execution_level` 与 `commit` 显式确认能力需要
**0.0.1rc23 或更新版本**。rc20 及更早版本的 chat 只支持内置
`local_facts_lookup` 执行器——manifest 路径见
[本地事实库](/docs/knowledge-tools/local-facts#给工具一个开发者拥有的名字)，该路径自 rc20 起可用。
:::

## 一次工具调用的真实流程

模型永远不执行代码；你的代码也永远不进入 Edge CLI 或模型进程。二者之间的循环
是确定性的、fail-closed 的：

| 步骤 | 谁 | 做什么 |
| --- | --- | --- |
| 1 | Edge | 生成前从你的文件冻结**活跃工具集**，注入 JSON 工具调用契约 |
| 2 | 模型 | 输出纯文本；工具调用是一个严格 JSON 对象：`{"tool_name": "...", "arguments": {...}}` |
| 3 | Edge | 解析并校验：工具名在冻结集内、参数符合 schema、未超调用上限 |
| 4 | Runner | Edge 启动自己的固定 runner 子进程，验证工具文件与冻结态字节一致后才导入，并只执行这一个函数 |
| 5 | Edge | 使用或直接返回前校验结果（JSON 对象、大小上限，以及声明的 `output_schema`）|
| 6 | 模型 | 基于工具结果作答，或再次调用（每个 prompt 最多 4 次）|

任何异常——未知工具、非法参数、文件被改、超时、结果超限——一律 fail-closed：
不执行该工具或不使用其结果，receipt 记录原因。

## 编写工具函数

`@edge_tool` 只附加元数据，你的文件仍是普通 Python 文件。

```python
from typing import Literal, Optional
from edgestudio.tools import edge_tool

@edge_tool
def order_status(order_id: str) -> dict:
    """Look up the status of a local order record."""
    return {"order_id": order_id, "status": "shipped"}

@edge_tool(
    name="fee_quote",                 # 默认使用函数名
    description="Quote the fee for a tier.",
    intent_tags=["billing", "quote"], # 供 --tool-tag 选择使用
)
def calculate_fee(
    amount: float,
    tier: Literal["basic", "pro"] = "basic",
    note: Optional[str] = None,
) -> dict:
    return {"fee": amount * (0.003 if tier == "basic" else 0.002)}

@edge_tool(
    description="Prepare an order for review without submitting it.",
    execution_level="prepare",
    return_direct=True,
    output_schema={
        "type": "object",
        "properties": {
            "order_id": {"type": "string"},
            "status": {"type": "string", "enum": ["prepared"]},
        },
        "required": ["order_id", "status"],
        "additionalProperties": False,
    },
)
def prepare_order(order_id: str) -> dict:
    return {"order_id": order_id, "status": "prepared"}
```

规则：

- 工具名匹配 `[A-Za-z_][A-Za-z0-9_]{0,63}`，同一文件内唯一。
- 每个参数都必须有受支持的类型注解。缺失或不支持的注解直接校验失败——不会
  静默降级成 `Any`。
- 装饰器未提供 description 时，取 docstring 首行。
- `execution_level` 默认为 `read`。可逆草稿使用 `prepare`，真实副作用使用
  `commit`；执行级别属于冻结工具 schema。
- `permissions` 当前只接受 `read_local`。它不证明开发者 Python 代码在用户进程
  权限下实际做了什么。

### 支持的参数类型

| 类型注解 | JSON schema |
| --- | --- |
| `str`、`int`、`float`、`bool` | `string`、`integer`、`number`、`boolean` |
| `Literal["a", "b"]` | 单一原语类型的 enum |
| `Optional[T]` / `T \| None` | 可空 `T` |
| `list[T]` | 受支持 `T` 的数组 |

其余——`dict`、dataclass、两个非 None 类型的 union、`**kwargs`——都会被
`edge tools validate` 以明确错误拒绝。

### 返回值

- 返回 JSON 可序列化的 `dict`，可完全控制模型看到的形状。
- 标量与列表（`str`、`int`、`float`、`bool`、`list`、`None`）会被包装为
  `{"result": value}`。
- 结果上限为 64 KB 规范化 JSON，超限 fail-closed。
- `return_direct=True` 必须声明闭合的 `output_schema`。运行时在直接交付前校验
  真实结果；错类型、缺字段或多余字段都会以 `tool_result_schema_mismatch`
  失败关闭。
- 函数抛异常会 fail-closed 终止工具循环，模型回退到安全回答。"查无结果"这类
  希望模型继续推理的情况，请返回正常载荷，如 `{"matches": []}`。

### 执行级别与确认

| 级别 | 用途 | 运行时行为 |
| --- | --- | --- |
| `read` | 查询与计算 | 参数结构通过后执行 |
| `prepare` | 可逆草稿、未签名载荷 | 立即执行；必须声明 `return_direct=True` 和 `output_schema` |
| `commit` | 写入、提交、广播或其他真实副作用 | chat 只创建待确认动作；显式本地确认后才执行 |

`commit` 工具同样必须声明 `return_direct=True` 和闭合 `output_schema`。chat 不会
直接执行它；返回 JSON 会给出私有待确认文件、短期确认令牌和准确命令：

```bash
edge tools confirm '<pending_action_path>' --token '<confirmation_token>' --json
```

确认动作绑定冻结工具文件、活跃工具集、工具 schema、参数和执行级别。文件被改、
参数被换、令牌错误或过期、并发第二次确认都会失败关闭。待确认文件仅保存在本地，
权限为 `0600`，默认有效期 10 分钟。

## 校验与检视

```bash
edge tools validate ./tools.py --json
edge tools inspect  ./tools.py --json
```

`validate` 检查命名、类型注解、重名与活跃集上限。`inspect` 额外输出每个工具的
schema、per-tool `schema_sha256`、`active_set_sha256` 与 `tools_file_sha256`。

:::warning 校验会执行文件顶层代码
发现过程会导入该文件（在隔离 runner 内，绝不在 Edge CLI 进程内）。顶层代码会
运行，所以 `validate` 不是静态扫描，也不是针对不可信文件的安全检查。只把 Edge
指向你信任的工具文件。
:::

## 带工具聊天

```bash
edge demo chat --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --prompt "Quote the fee for amount 400, tier pro." \
  --json
```

选择与上限：

- 每次运行最多暴露 **8 个工具**。文件可以定义更多，但必须用 `--tool <name>`
  （可重复）或 `--tool-tag <tag>` 收窄活跃集。
- `--tools`、`--tools-manifest`、`--facts-store` 三者互斥。
- `--tool` / `--tool-tag` 必须与 `--tools` 同用。

根据这次运行需要完成的事情选择入口：

| 需求 | 选择 |
| --- | --- |
| 只需零代码查询本地事实，不需要自定义校验或动作 | `--facts-store <store>` |
| 需要自定义校验、结构化证据、参数绑定或后续动作 | `--tools ./tools.py` |

如果只是要给同一个内置只读事实查询设置稳定工具名，请改用
`--tools-manifest`；它不会执行你的 Python 代码。

值得了解的运行时行为：

- 每次工具调用都在全新 runner 进程中执行：文件顶层代码每次调用都会重新运行，
  调用之间不保留任何状态。顶层保持轻量；数据在函数内或从磁盘加载。
- 你代码里的 `print()` 输出进 stderr；runner 的 stdout 只承载 JSON 协议。
- 单次调用超时 10 秒；超时的 runner 会被终止，该调用 fail-closed。
- chat 会话运行中编辑工具文件，下一次调用会以 `tools_file_changed` fail-closed
  拒绝——而不是静默执行从未被冻结过的代码。重开会话即可生效新文件。

## 学习工具：Neural Imprint

画像学习和工具学习共用同一个 artifact。`edge demo learn` 可以把工具契约烘焙进
Neural Imprint：恢复后的 Agent 天然认识你的工具——schema 是它计算状态的一部分，
不是运行时贴进去的 prompt。

```bash
edge demo learn run \
  --sample-file ./learn_sample.json \
  --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --json
```

之后用烘焙的 artifact 与同一份工具文件聊天：

```bash
edge demo chat --model qwen3.5-9b-4bit \
  --with-imprint <artifact-or-receipt-path> \
  --tools ./tools.py \
  --prompt "Quote the fee for amount 100." \
  --json
```

chat receipt 会报告 `tool_instruction_mode: imprint`：工具契约来自恢复的前缀，
Edge 不再重复注入指令。

### 什么会让已学习的 Imprint 失效

模型学习的是工具的 **schema**，从不学习实现。因此恢复门控是 schema 级的：

| 你改了什么 | 恢复结果 |
| --- | --- |
| 函数体、注释、格式——签名不变 | ✅ 正常恢复，无需重学 |
| 参数、类型注解、工具名、描述、`output_schema`、`execution_level`、活跃集 | ❌ fail-closed——用当前文件重学 |
| Imprint 带工具学习，chat 却没传 `--tools` | ❌ fail-closed，`imprint_requires_tools` |

fail-closed 的含义就是字面意思：Edge 拒绝把过期契约与不同的运行时配对，而不是
猜。没有兼容映射——重学是唯一升级路径，这是有意设计。

## 安全与审计模型

Edge 保证的：

- 模型只能输出 JSON 调用；由 Edge 校验并分发。
- 你的代码只在 Edge 自有的 runner 子进程中执行——绝不在 Edge CLI 或模型进程
  内——且只执行冻结活跃集内的工具。
- runner 在导入前验证要执行的文件与冻结态字节一致。
- 只有显式传 `--tools` 才会加载工具。Edge 从不扫描目录、从不自动加载工具文件。
- receipt hash 优先：`tools_file_sha256`、`active_set_sha256`、
  `schema_generator_version`，以及每次调用的 `args_sha256`、`result_sha256`、
  `tool_schema_sha256`、`runner_secret_verified`，和每次调用的
  `network_used_by_edge: false`。

Edge 不声称的：

- 你的工具代码以你的用户权限运行。Edge 证明的是 **Edge** 做了什么——它不证明
  你的代码是否使用了网络、读了文件、起了进程。工具行为是你的代码、你的责任。
- 过期且从未确认的待确认文件目前不会自动清理；令牌过期后不可用，但文件中可能
  仍有敏感参数，你应删除陈旧文件。
- 已确认工具完成副作用后、收据写入前如果进程崩溃，可能留下审计空档。Edge 会
  保持该动作已被认领，不自动重试，从而维持最多执行一次。

## 排障

| 错误码 | 含义 | 处理 |
| --- | --- | --- |
| `unsupported_type_hint` / `missing_parameter_type_hint` | 参数注解不支持或缺失 | 参照上方支持类型表 |
| `duplicate_tool_name` | 两个工具解析为同名 | 改名 |
| `active_tool_limit_exceeded` | 发现超过 8 个工具 | 用 `--tool` / `--tool-tag` 选择 |
| `invalid_tool_args` | 模型发出未知/缺失/类型错误的参数 | 通常自动重试；反复出现说明 schema 有歧义——改进命名与描述 |
| `tools_file_changed` | 会话冻结后文件被编辑 | 重开 chat 会话 |
| `runner_timeout` | 单次调用超过 10 秒 | 让工具保持快速、本地 |
| `tool_result_oversized` / `unsupported_tool_result` | 结果超 64 KB 或不可 JSON 序列化 | 返回有界的 `dict` |
| `return_direct_output_schema_required` | 直接返回工具没有声明结果契约 | 增加闭合的 `output_schema` |
| `tool_result_schema_mismatch` | 真实结果不符合声明契约 | 修正工具结果；运行时不会交付该结果 |
| `tool_confirmation_required` | `commit` 工具尚未显式确认 | 使用 chat 返回的待确认动作和准确 `edge tools confirm` 命令 |
| `imprint_requires_tools` | Imprint 带工具学习，chat 未传 `--tools` | 传入匹配的工具文件 |
| `imprint_tool_active_set_mismatch` / `imprint_tool_schema_mismatch` | 工具 schema 与学习时契约不一致 | 重学，或恢复原签名 |
| `conflicting_tool_options` | `--tools` 与 `--tools-manifest` 或 `--facts-store` 同用 | 每次运行只选一个工具面 |

## 何时改用 Manifest 路径

`--tools-manifest`（见[本地事实库](/docs/knowledge-tools/local-facts#给工具一个开发者拥有的名字)）
在两种情况下仍是正确选择：只需要给内置 local facts lookup 一个稳定的开发者
自有**名字**，或者你还在 rc20。当逻辑本身是你的，就用自定义 Python 工具。
