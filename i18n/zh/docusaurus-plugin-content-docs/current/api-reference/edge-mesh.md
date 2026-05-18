---
sidebar_position: 4
title: EdgeMesh
---

# EdgeMesh API reference

`EdgeMesh` provides local-network device discovery, topology, trust state, and routing helpers.

## MeshEngine

```swift
@MainActor
public final class MeshEngine: ObservableObject
```

Central mesh coordinator.

| Property or method | Description |
| --- | --- |
| `peers` | Discovered peers. |
| `topology` | Current mesh topology. |
| `isDiscovering` | Discovery state. |
| `startDiscovery(as:)` | Starts local discovery. |
| `stopDiscovery()` | Stops discovery. |
| `connect(to:)` | Connects to a trusted peer. |
| `setupSecurity(peerId:displayName:trustStoreURL:)` | Initializes local identity and trust storage. |
| `installSecurity(identity:trustStore:)` | Injects prebuilt security state. |
| `completePairing(with:localPeerId:localDisplayName:)` | Completes pairing from a pairing payload. |
| `listTrustedPeers()` | Returns trusted peers. |
| `revoke(peerId:)` | Revokes trust for a peer. |
| `deletePeer(peerId:)` | Deletes a peer from trust storage and memory. |
| `bestNode(for:strategy:)` | Selects a node from the current topology. |
| `routingPlan(for:)` | Builds a routing plan. |

## MeshNode

```swift
public struct MeshNode: Identifiable, Sendable, Hashable
```

Represents a device in the mesh.

| Property | Type |
| --- | --- |
| `id` | `String` |
| `displayName` | `String` |
| `capability` | `MeshNode.Capability` |
| `deviceProfile` | `MeshNode.MeshDeviceSnapshot` |
| `endpoint` | `MeshNode.Endpoint` |
| `trustStatus` | `MeshNode.TrustStatus` |

### Capability

| Case | Description |
| --- | --- |
| `.inference` | Can run inference. |
| `.data` | Data collection node. |
| `.both` | Both inference and data roles. |

## MeshTopology

```swift
public struct MeshTopology: Sendable
```

| API | Description |
| --- | --- |
| `tier0`, `tier1`, `tier2` | Nodes grouped by role. |
| `allNodes` | All known nodes. |
| `count` | Total node count. |
| `addNode(_:)` | Adds or updates a node. |
| `removeNode(id:)` | Removes a node. |
| `findNode(id:)` | Finds a node by ID. |

## MeshRouter

```swift
public struct MeshRouter: Sendable
```

| API | Description |
| --- | --- |
| `bestNode(for:in:strategy:)` | Selects a node for a model size. |
| `routingPlan(for:in:)` | Returns a `RoutingPlan`. |

### Strategy

| Case | Description |
| --- | --- |
| `.bestFit` | Balanced default. |
| `.leastLoaded` | Prefer available memory. |
| `.fastest` | Prefer bandwidth. |

## RoutingPlan

```swift
public struct RoutingPlan: Sendable
```

| Property | Type |
| --- | --- |
| `mode` | `RoutingPlan.Mode` |
| `primaryNode` | `MeshNode?` |
| `auxiliaryNodes` | `[MeshNode]` |
| `estimatedLatencyMs` | `Double` |
