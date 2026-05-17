---
sidebar_position: 1
title: Overview
---

# Edge Mesh

Edge Mesh is a private local-network mesh for user-owned Apple devices.

It discovers nearby devices, tracks capabilities, and helps route work to the best available node. Traffic stays on the local network; there is no cloud relay in the default design.

:::info Developer Preview
Edge Mesh is in **Developer Preview**. Pairing, trust, and transport behavior should be validated in your app before production use.
:::

## Components

| Component | Description |
| --- | --- |
| `MeshEngine` | Main coordinator for discovery, topology, trust, and routing helpers. |
| `MeshDiscovery` | Local-network device discovery. |
| `MeshRouter` | Selects an inference-capable device for a model size. |
| `MeshNode` | Represents a device and its capabilities. |
| `MeshTopology` | Current mesh state grouped by device role. |
| `MeshSummary` | Privacy-preserving summary type for cross-device aggregation. |

## Start discovery

```swift
import EdgeMesh

let engine = MeshEngine()
try engine.startDiscovery()

print(engine.peers)
print(engine.topology.count)
```

## Route a model

```swift
if let node = engine.bestNode(for: 4.0) {
    print("Run on:", node.displayName)
}
```

## Topology

Mesh topology groups devices by role:

| Tier | Role |
| --- | --- |
| `tier0` | Data collection and sensor-like nodes. |
| `tier1` | Daily inference nodes. |
| `tier2` | Higher-capacity inference nodes. |

## Privacy model

Edge Mesh is designed for user-owned devices. Keep raw personal data local and share only the minimum artifact needed for the task.

## Next steps

- [Device discovery](/docs/edge-mesh/discovery)
- [Task routing](/docs/edge-mesh/routing)
