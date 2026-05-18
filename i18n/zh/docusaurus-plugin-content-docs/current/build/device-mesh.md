---
sidebar_position: 6
title: Device Mesh
---

# Device mesh

Edge Mesh lets an app discover and use nearby user-owned devices on the
local network. Currently supports Apple platforms, with cross-platform support planned.

Use it when one device is best at sensing, another is best for daily
interaction, and a larger Mac is best for heavier local work. The user should
experience one private system, not a set of manually managed devices.

## What device mesh does

Edge Mesh provides:

- Local device discovery.
- A typed device model with capability and health information.
- Helpers for choosing where a model-sized task should run.
- Trust management for user-owned peers.

A typical setup:

| Device | Role |
| --- | --- |
| iPhone | Sensor and capture device. |
| MacBook | Daily interaction device. |
| Mac Studio | High-capacity local compute device. |

The app decides what to do with the selected device. Edge Mesh provides the
local device graph and selection helpers.

## Device discovery

Create a `MeshEngine`, advertise the local device, and observe `peers`.

```swift
import EdgeMesh
import SwiftUI

@MainActor
final class MeshViewModel: ObservableObject {
    @Published var peers: [MeshNode] = []
    @Published var status = "Not discovering"

    private let mesh = MeshEngine()

    func start() {
        do {
            let localNode = MeshNode(
                displayName: "Alex's MacBook Pro",
                capability: .both,
                deviceProfile: .init(
                    chipName: "Apple M3 Pro",
                    totalRAMGB: 36,
                    availableRAMGB: 18,
                    bandwidthGBs: 180,
                    thermalState: .nominal
                ),
                endpoint: .init(host: "macbook-pro.local", port: 8800),
                trustStatus: .trusted
            )

            try mesh.startDiscovery(as: localNode)
            peers = mesh.peers
            status = "Discovering"
        } catch {
            status = error.localizedDescription
        }
    }

    func refresh() {
        peers = mesh.peers
    }

    func stop() {
        mesh.stopDiscovery()
        status = "Stopped"
        peers = []
    }
}
```

Show discovered peers in SwiftUI:

```swift
struct MeshView: View {
    @StateObject private var model = MeshViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(model.status)

            HStack {
                Button("Start") { model.start() }
                Button("Refresh") { model.refresh() }
                Button("Stop") { model.stop() }
            }

            List(model.peers) { peer in
                VStack(alignment: .leading) {
                    Text(peer.displayName)
                        .font(.headline)
                    Text("\(peer.deviceProfile.chipName), \(peer.deviceProfile.availableRAMGB) GB available")
                        .font(.caption)
                }
            }
        }
        .padding()
    }
}
```

For production apps, add a local-network usage string and test discovery on the
same Wi-Fi network as the target devices.

## Task routing

Use `bestNode(for:)` when your app knows the approximate model size and wants a
reasonable peer for the task.

```swift
@MainActor
func selectDevice(forModelSize sizeGB: Double, mesh: MeshEngine) -> MeshNode? {
    mesh.bestNode(for: sizeGB, strategy: .bestFit)
}

if let node = selectDevice(forModelSize: 7.0, mesh: mesh) {
    print("Run on:", node.displayName)
} else {
    print("No available peer. Run locally or ask the user to open the Mac app.")
}
```

Choose the strategy that matches the product moment:

| Strategy | Use when |
| --- | --- |
| `.bestFit` | You want the balanced default. |
| `.leastLoaded` | You prefer the peer with more currently available memory. |
| `.fastest` | You prefer the peer with higher measured throughput. |

If you need more UI detail, ask for a routing plan:

```swift
let plan = mesh.routingPlan(for: 7.0)
print(plan.mode)
print(plan.primaryNode?.displayName ?? "local")
```

Treat routing output as a recommendation. Your app should still handle
fallback, cancellation, and user choice.

## Device tiers

`MeshTopology` groups devices into tiers so product UI can stay simple:

| Tier | Example role | Typical device |
| --- | --- | --- |
| `tier0` | Capture and sensing | iPhone, iPad |
| `tier1` | Daily interaction | MacBook, iPad Pro |
| `tier2` | High-capacity local work | Mac Studio, Mac mini |

```swift
let topology = mesh.topology

print("Sensors:", topology.tier0.count)
print("Daily devices:", topology.tier1.count)
print("High-capacity devices:", topology.tier2.count)
```

Use tiers for labels and defaults. Avoid exposing low-level device selection
details as product settings unless your users explicitly need that control.

## Trust

Discovery tells you what is nearby. Trust tells you what your app is allowed to
use.

```swift
try mesh.setupSecurity(
    peerId: "macbook-pro",
    displayName: "Alex's MacBook Pro",
    trustStoreURL: trustStoreURL
)

let trustedPeers = try mesh.listTrustedPeers()
print(trustedPeers.map(\.displayName))
```

When a user removes a device from settings, revoke it and remove it from local
state:

```swift
try mesh.revoke(peerId: "mac-studio")
try mesh.deletePeer(peerId: "mac-studio")
```

## Privacy

Edge Mesh is designed for private local networks:

- No cloud relay is required for mesh discovery or local task handoff.
- Devices should be user-owned and explicitly trusted.
- Apps should show which device is active when work leaves the current device.
- Local-network permission text should explain the user-visible benefit.

Do not send raw prompts, private training examples, or user corrections to a
peer unless the user has enabled that workflow and the peer is trusted.

## API surface

| Method | What it does |
|--------|-------------|
| `MeshEngine()` | Create the mesh coordinator. |
| `startDiscovery()` | Begin local network discovery. |
| `peers` | Currently visible devices. |
| `bestNode(for:)` | Find the best device for a model size. |
| `topology` | Current mesh state by device tier. |

Full signatures → [EdgeMesh API Reference](/docs/api-reference/edge-mesh)

## Try it next

- [Model evolution](/docs/build/model-evolution) — Transfer adapters across devices.
- [Architecture](/docs/guides/architecture) — How all the layers connect.
