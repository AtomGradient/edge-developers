---
sidebar_position: 6
title: 设备网格
---

# 设备网格

Edge Mesh 让 app 可以在本地网络上发现并使用附近的用户自有 Apple 设备。

当一个设备最适合感知，另一个设备最适合日常交互，而更大的 Mac 最适合较重的本地工作时，可以使用它。用户应该体验到一个私有系统，而不是一组需要手动管理的设备。

## 设备网格做什么

Edge Mesh 提供：

- 本地设备发现。
- 带能力和健康信息的类型化设备模型。
- 帮助选择模型规模任务应在哪台设备上运行的 helper。
- 面向用户自有 peer 的信任管理。

典型设置：

| 设备 | 角色 |
| --- | --- |
| iPhone | 传感和采集设备。 |
| MacBook | 日常交互设备。 |
| Mac Studio | 高容量本地计算设备。 |

app 决定如何使用选中的设备。Edge Mesh 提供本地设备图和选择 helper。

## 设备发现

创建 `MeshEngine`，广播本地设备，并观察 `peers`。

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

在 SwiftUI 中显示发现到的 peer：

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

生产 App 需要添加本地网络用途说明，并在与目标设备相同的 Wi-Fi 网络上测试发现。

## 任务路由

当 app 知道大致模型大小，并希望为任务找到合理 peer 时，使用 `bestNode(for:)`。

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

选择符合产品场景的策略：

| 策略 | 适用场景 |
| --- | --- |
| `.bestFit` | 需要均衡默认选择。 |
| `.leastLoaded` | 更偏好当前可用内存更多的 peer。 |
| `.fastest` | 更偏好测得吞吐更高的 peer。 |

如果需要更多 UI 细节，请请求 routing plan：

```swift
let plan = mesh.routingPlan(for: 7.0)
print(plan.mode)
print(plan.primaryNode?.displayName ?? "local")
```

将路由输出视为建议。你的 app 仍然应处理 fallback、取消和用户选择。

## 设备层级

`MeshTopology` 将设备分组到不同层级，让产品 UI 保持简单：

| 层级 | 示例角色 | 典型设备 |
| --- | --- | --- |
| `tier0` | 采集和感知 | iPhone、iPad |
| `tier1` | 日常交互 | MacBook、iPad Pro |
| `tier2` | 高容量本地工作 | Mac Studio、Mac mini |

```swift
let topology = mesh.topology

print("Sensors:", topology.tier0.count)
print("Daily devices:", topology.tier1.count)
print("High-capacity devices:", topology.tier2.count)
```

将层级用于标签和默认选择。除非用户明确需要控制，否则避免把低层设备选择细节暴露为产品设置。

## 信任

发现告诉你附近有什么设备。信任告诉你 app 被允许使用什么设备。

```swift
try mesh.setupSecurity(
    peerId: "macbook-pro",
    displayName: "Alex's MacBook Pro",
    trustStoreURL: trustStoreURL
)

let trustedPeers = try mesh.listTrustedPeers()
print(trustedPeers.map(\.displayName))
```

当用户从设置中移除设备时，撤销信任并从本地状态中删除：

```swift
try mesh.revoke(peerId: "mac-studio")
try mesh.deletePeer(peerId: "mac-studio")
```

## 隐私

Edge Mesh 面向私有本地网络设计：

- 网格发现或本地任务交接不需要云端 relay。
- 设备应由用户拥有并被显式信任。
- 当工作离开当前设备时，app 应显示哪台设备处于活跃状态。
- 本地网络权限文案应解释用户可见的收益。

除非用户已启用该工作流且 peer 可信，否则不要向 peer 发送原始 prompt、私有 profile inputs 或用户 correction。

## API 概览

| Method | 作用 |
|--------|-------------|
| `MeshEngine()` | 创建 mesh coordinator。 |
| `startDiscovery()` | 开始本地网络发现。 |
| `peers` | 当前可见设备。 |
| `bestNode(for:)` | 为指定模型大小寻找最佳设备。 |
| `topology` | 按设备层级组织的当前 mesh 状态。 |

完整签名 → [EdgeMesh API Reference](/docs/api-reference/edge-mesh)

## 下一步

- [模型进化](/docs/build/model-evolution) — 在可信用户自有设备之间传输 Neural Imprint 产物。
- [架构](/docs/guides/architecture) — 了解所有层如何连接。
