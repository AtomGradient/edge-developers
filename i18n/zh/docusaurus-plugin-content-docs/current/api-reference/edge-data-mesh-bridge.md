---
sidebar_position: 9
title: EdgeDataMeshBridge
---

# EdgeDataMeshBridge API 参考

`EdgeDataMeshBridge` 是连接 `EdgeData` 与 `EdgeMesh` 的小型可选 bridge target。它让 app 可以把通用 EdgeData training events 写入 EdgeMesh `DataCollector`，同时避免让 `EdgeMesh` 直接依赖 `EdgeData`。

:::info 开发者预览 边界
这个模块只是 通用胶水层。App 专属事件 schema、correction text、privacy policy 和业务规则仍由 app 自己拥有。
:::

## EdgeMeshTrainingSink

```swift
@available(iOS 17.0, macOS 14.0, *)
public final class EdgeMeshTrainingSink: EdgeTrainingDataSink
```

基于 `EdgeMesh` `DataCollector` 的 training sink 实现。

| API | 说明 |
| --- | --- |
| `init(storeURL:)` | 在指定 URL 创建 `EventStore`，并连接 `DataCollector`。 |
| `init(store:)` | 使用 App 提供 `EventStore`。 |
| `collectTrainingSample(appId:eventType:payload:tags:)` | 向 mesh event store 追加 通用 training event。 |
| `eventStoreCount()` | 可用时返回当前 event 数量。 |

## Usage shape

```swift
import EdgeData
import EdgeDataMeshBridge

let sink = try EdgeMeshTrainingSink()
try Edge.bootstrap(dbQueue: dbQueue, trainingDataSink: sink)
```

只传入 app 已经判定为适合目标 sink 的 payload。遵守 `Sensitivity`，不要在 log、协作消息 或 exported 回执 中写入 原始纠错文本。

## 安全边界

- 不要把 App 业务字段 或 domain-specific 解释 放进这个 bridge。
- 数据保留、同意和脱敏策略 留在 app 内。
- 把这个 bridge 当作本地基础设施；它本身不是跨设备同步。
