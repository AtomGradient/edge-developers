---
sidebar_position: 2
title: Device Discovery
---

# Device discovery

Edge Mesh discovers nearby devices on the local network.

## Start discovery

```swift
import EdgeMesh

let engine = MeshEngine()
try engine.startDiscovery()
```

`MeshEngine` publishes discovered peers:

```swift
for peer in engine.peers {
    print(peer.displayName)
    print(peer.capability)
    print(peer.deviceProfile.totalRAMGB)
}
```

## Provide a local node

You can pass a `MeshNode` that describes the local device.

```swift
let localNode = MeshNode(
    displayName: "Alex's Mac",
    capability: .both,
    deviceProfile: .init(
        chipName: "M-series",
        totalRAMGB: 32,
        availableRAMGB: 20,
        bandwidthGBs: 200,
        thermalState: .nominal
    ),
    endpoint: .init(host: "192.168.1.10", port: 9000)
)

try engine.startDiscovery(as: localNode)
```

## Stop discovery

```swift
engine.stopDiscovery()
```

## Device capabilities

`MeshNode` includes:

| Property | Description |
| --- | --- |
| `displayName` | User-facing device name. |
| `capability` | `.inference`, `.data`, or `.both`. |
| `deviceProfile` | Lightweight memory, chip, bandwidth, and thermal snapshot. |
| `trustStatus` | Local trust state for the peer. |

## Local Network permission

iOS apps that discover local devices need a Local Network usage description:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app discovers your nearby devices for private on-device AI.</string>
```
