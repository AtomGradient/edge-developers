---
sidebar_position: 3
title: Task Routing
---

# Task routing

`MeshRouter` selects an inference-capable device from the current mesh topology.

Routing considers model size, device capability, available memory, and thermal state. The exact selection policy is managed by Edge Mesh.

## Select a node

```swift
import EdgeMesh

let modelSizeGB = 4.0

if let node = MeshRouter.bestNode(
    for: modelSizeGB,
    in: engine.topology
) {
    print("Selected:", node.displayName)
}
```

## Strategies

```swift
let fastest = MeshRouter.bestNode(
    for: 4.0,
    in: engine.topology,
    strategy: .fastest
)

let mostMemory = MeshRouter.bestNode(
    for: 4.0,
    in: engine.topology,
    strategy: .leastLoaded
)
```

| Strategy | Description |
| --- | --- |
| `.bestFit` | Default balanced selection. |
| `.leastLoaded` | Prefer available memory. |
| `.fastest` | Prefer bandwidth. |

## Build a routing plan

```swift
let plan = MeshRouter.routingPlan(
    for: 4.0,
    in: engine.topology
)

switch plan.mode {
case .singleNode:
    print(plan.primaryNode?.displayName ?? "none")
case .distributed:
    print("Distributed routing")
case .unavailable:
    print("No available node")
}
```

## Fallback behavior

If the preferred node is unavailable, request a new route from the current topology. Apps should keep local execution as a fallback when the model fits the current device.

## Streaming responses

Edge Mesh routing selects where work should run. Your app still owns the request/response UI. Keep the user-facing stream the same whether the selected node is local or remote.
