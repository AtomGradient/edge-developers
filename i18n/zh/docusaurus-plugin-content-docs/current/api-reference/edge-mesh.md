---
sidebar_position: 4
title: EdgeMesh
---

# EdgeMesh API 参考

`EdgeMesh` 提供本地网络设备发现、拓扑、信任状态和路由 helper。

## MeshEngine

```swift
@MainActor
public final class MeshEngine: ObservableObject
```

中心 mesh 协调器。

| 属性或方法 | 描述 |
| --- | --- |
| `peers` | 已发现的 peer。 |
| `topology` | 当前 mesh 拓扑。 |
| `isDiscovering` | 发现状态。 |
| `startDiscovery(as:)` | 启动本地发现。 |
| `stopDiscovery()` | 停止发现。 |
| `connect(to:)` | 连接到可信 peer。 |
| `setupSecurity(peerId:displayName:trustStoreURL:)` | 初始化本地身份和信任存储。 |
| `installSecurity(identity:trustStore:)` | 注入预构建安全状态。 |
| `completePairing(with:localPeerId:localDisplayName:)` | 从 pairing payload 完成配对。 |
| `listTrustedPeers()` | 返回可信 peer。 |
| `revoke(peerId:)` | 撤销某个 peer 的信任。 |
| `deletePeer(peerId:)` | 从信任存储和内存中删除 peer。 |
| `bestNode(for:strategy:)` | 从当前拓扑中选择一个节点。 |
| `routingPlan(for:)` | 构建 routing plan。 |

## MeshNode

```swift
public struct MeshNode: Identifiable, Sendable, Hashable
```

表示 mesh 中的一台设备。

| 属性 | 类型 |
| --- | --- |
| `id` | `String` |
| `displayName` | `String` |
| `capability` | `MeshNode.Capability` |
| `deviceProfile` | `MeshNode.MeshDeviceSnapshot` |
| `endpoint` | `MeshNode.Endpoint` |
| `trustStatus` | `MeshNode.TrustStatus` |

### Capability

| Case | 描述 |
| --- | --- |
| `.inference` | 可以运行推理。 |
| `.data` | 数据采集节点。 |
| `.both` | 同时承担推理和数据角色。 |

## MeshTopology

```swift
public struct MeshTopology: Sendable
```

| API | 描述 |
| --- | --- |
| `tier0`, `tier1`, `tier2` | 按角色分组的节点。 |
| `allNodes` | 所有已知节点。 |
| `count` | 节点总数。 |
| `addNode(_:)` | 添加或更新节点。 |
| `removeNode(id:)` | 移除节点。 |
| `findNode(id:)` | 按 ID 查找节点。 |

## MeshRouter

```swift
public struct MeshRouter: Sendable
```

| API | 描述 |
| --- | --- |
| `bestNode(for:in:strategy:)` | 为模型大小选择节点。 |
| `routingPlan(for:in:)` | 返回 `RoutingPlan`。 |

### Strategy

| Case | 描述 |
| --- | --- |
| `.bestFit` | 均衡默认策略。 |
| `.leastLoaded` | 更偏好可用内存。 |
| `.fastest` | 更偏好带宽。 |

## RoutingPlan

```swift
public struct RoutingPlan: Sendable
```

| 属性 | 类型 |
| --- | --- |
| `mode` | `RoutingPlan.Mode` |
| `primaryNode` | `MeshNode?` |
| `auxiliaryNodes` | `[MeshNode]` |
| `estimatedLatencyMs` | `Double` |
