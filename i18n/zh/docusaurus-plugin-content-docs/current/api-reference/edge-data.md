---
sidebar_position: 6
title: EdgeData
---

# EdgeData API 参考

`EdgeData` 为 Edge App 提供本地数据收集和分类 primitive。

它是支撑基础设施。App 专属 业务规则应留在 app 内。

## Edge

```swift
public enum Edge
```

本地数据操作的静态 API。

| 方法 | 描述 |
| --- | --- |
| `bootstrap(dbQueue:trainingDataSink:)` | 使用本地 GRDB queue 和可选训练 sink 初始化 EdgeData。 |
| `registerSchema(_:)` | 在启动时注册 App 数据形状。 |
| `schema(_:)` | 查找已注册的数据形状。 |
| `registeredSchemaNames()` | 列出已注册名称。 |
| `recordRaw(fact:customFactId:)` | 记录未分类的本地数据。 |
| `record(fact:)` | 记录已经分类的本地数据。 |
| `recordEvent(...)` | 记录 AI 交互事件。 |
| `countFeedbackEvents(namespace:)` | 统计带 feedback 的事件。 |
| `queryFacts(namespace:schema:status:limit:)` | 查询本地 fact。 |
| `countFacts(namespace:schema:status:)` | 统计本地 fact。 |
| `correctClassification(...)` | 将用户 correction 应用到分类结果。 |
| `onClassified(_:)` | 注册分类成功回调。 |
| `onClassificationFailed(_:)` | 注册分类失败回调。 |
| `fetchFact(id:)` | 按 ID 获取单个 fact。 |
| `reclassifyAsync(...)` | 请求重新分类。 |

## 核心类型

| 类型 | 描述 |
| --- | --- |
| `Sensitivity` | `.localOnly`、`.meshOk`、`.trainingOk`。 |
| `FactStatus` | 本地分类生命周期状态。 |
| `FieldType` | App 数据形状支持的字段种类。 |
| `FieldDef` | 字段声明。 |
| `SemanticLabels` | 主时间戳、值和实体字段的标签。 |
| `SchemaDef` | App 数据形状声明。 |
| `RawFact` | 等待分类的原始本地 payload。 |
| `Fact` | 已分类的本地 payload。 |
| `QueryStatus` | 针对已分类、待处理、失败或全部 fact 的查询过滤器。 |

## ClassificationDaemon

```swift
public actor ClassificationDaemon
```

原始本地数据的后台分类器。

| API | 描述 |
| --- | --- |
| `ClassificationDaemon.shared` | 共享 daemon。 |
| `start(namespace:candidateSchemas:llmClient:toolNames:promptBuilder:)` | 为某个 namespace 启动分类。 |
| `stop()` | 停止 daemon。 |
| `wake()` | 从 idle sleep 中唤醒 daemon。 |

## EdgeClassificationLLMClient

```swift
public protocol EdgeClassificationLLMClient: Sendable
```

app 实现此协议，以提供本地 LLM 分类。

| 要求 | 描述 |
| --- | --- |
| `isBusy` | 本地 LLM 是否正忙于面向用户的工作。 |
| `generate(messages:)` | 生成分类响应。 |
| `generate(messages:toolNames:)` | 可选的 工具感知 生成路径。 |

## ClassificationParser

```swift
public enum ClassificationParser
```

解析本地 LLM 分类输出。

| 方法 | 描述 |
| --- | --- |
| `parse(llmOutput:candidateSchemas:)` | 解析并验证分类响应。 |
| `stripMarkdownCodeFence(_:)` | 移除 Markdown code fence wrapper。 |
| `extractJSONObject(_:)` | 从文本中提取第一个 JSON object。 |

## 隐私指南

使用 `Sensitivity` 将 仅本地 数据留在本地。不要在日志、分析或协作消息中包含原始用户 correction 文本。
