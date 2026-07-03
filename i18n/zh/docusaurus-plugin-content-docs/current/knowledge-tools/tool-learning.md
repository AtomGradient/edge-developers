---
sidebar_position: 6
title: 工具学习
slug: /knowledge-tools/tool-learning
---

# 工具学习

Agent 学到的不只是用户是谁。它还学习载体暴露哪些本地工具、什么时候适用，
以及哪些工具或说法在边界之外。本页覆盖工具 schema 和工具策略如何进入学习
环——以及什么被刻意**不**学。

## 模型学的是 schema，永远不是实现

模型学习工具*契约*：名字、描述、输入 schema 和使用策略。它永远不会看到或
学习工具的实现代码。这个边界让恢复门控停在 schema 层：你可以自由重写工具的
函数体，只要 schema 不变，烘焙过的 Neural Imprint 依然有效。

## Learn 样本里的预期工具策略

learn 样本可以声明载体的工具面（`tool_schema_export`）和预期使用策略。
learn dry-run 会报告一份确定性预览：

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
        }
      ],
      "negative_policy": [
        "Do not call tools that require network access",
        "Do not invent financial return numbers without user-provided facts"
      ]
    }
  }
}
```

这是确定性预览，不是真实工具调用轨迹。`negative_policy` 与工具清单同等
重要：它教会哪些动作留在边界之外。

## 保持学习名与运行时名对齐

如果样本的 `tool_schema_export.tools[].name` 是 `protocol_docs_lookup`，
运行时 chat 必须注册同名工具（经 tools manifest 或 Python 工具）。运行前
审计：

```bash
edge demo tools validate ./tools.json \
  --learn-sample ./sample.json \
  --json
```

校验器对名字不匹配只警告不拦截；不匹配意味着 Neural Imprint prefix 和运行时
工具注册在教不同的名字。改一边让两边一致。

## 把 Python 工具 schema 烘进 Imprint

需要 edge-studio `0.0.1rc21` 或更高版本。

配合[自定义 Python 工具](/docs/knowledge-tools/custom-python-tools)，学习
运行可以冻结你被装饰函数生成的 schema，并把工具契约烘进 Neural Imprint：

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --tools ./tools.py \
  --max-tokens 160
```

产物元数据随后绑定活跃工具集：schema 生成器版本、逐工具 schema 哈希和
活跃集哈希。恢复时，chat 用 `--with-imprint` 加 `--tools`，只有 schema 仍然
匹配才会通过。

## Schema 级恢复门控

恢复对工具契约失败即关闭，判定停在 schema 层而不是文件字节层：

| 恢复场景 | 结果 |
|---|---|
| 同一工具文件，未改动 | 恢复 |
| 仅实现改动（函数体、注释） | 恢复——schema 未变 |
| 签名/类型/名字变化（schema 变化） | 失败即关闭：`imprint_tool_schema_mismatch` |
| 活跃工具集不同 | 失败即关闭：`imprint_tool_active_set_mismatch` |
| Imprint 带工具烘焙、chat 未带 `--tools` | 失败即关闭：`imprint_requires_tools` |

门控失败时，用当前工具文件重新学习，或不带 imprint 运行。基础模型路径永远
可用。

## 之后是什么

今天的工具学习把契约烘进 Neural Imprint prefix。从真实轨迹学习更好的工具
*使用*是另一条经评估门控的路线——不属于当前预览。
