---
sidebar_position: 4
title: 个性化模型
---

# 示例：Neural Imprint 生命周期

这个示例展示使用 Edge Halo 做本地个性化时，app 侧设置页应该如何组织。

它做四件事：

1. 记录本地用户信号。
2. 展示 profile readiness。
3. 校验 Neural Imprint capsule。
4. 仅在兼容性检查通过后恢复 capsule。

Profile job 和 artifact generation 应放在你的本地数据层后面，或直接参考 Edge Scaffold 流程。

## SwiftUI 设置页流程

```swift
import EdgeHalo
import Foundation
import SwiftUI

struct PersonalizationView: View {
    @StateObject private var model = PersonalizationViewModel()

    var body: some View {
        Form {
            Section("State") {
                LabeledContent("Evolution", value: model.evolutionText)
                LabeledContent("Capsule", value: model.capsuleText)
            }

            if let profile = model.profile {
                Section("Local Profile") {
                    Text(profile.narrative.isEmpty ? "Profile ready" : profile.narrative)
                    LabeledContent("Samples", value: "\(profile.sampleCount)")
                    LabeledContent("Stability", value: profile.stabilityText)
                }
            }

            Section("Signals") {
                Button("Record positive feedback") {
                    model.recordFeedback(accepted: true)
                }
                Button("Record correction") {
                    model.recordCorrection()
                }
            }

            Section("Neural Imprint") {
                Button("Refresh state") {
                    Task { await model.refreshState() }
                }
                Button("Restore local capsule") {
                    Task { await model.restoreLocalCapsule() }
                }
                Button("Reset personalization") {
                    Task { await model.resetPersonalization() }
                }
            }

            if !model.status.isEmpty {
                Text(model.status)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Personalization")
        .task { await model.refreshState() }
    }
}

@MainActor
final class PersonalizationViewModel: ObservableObject {
    @Published var evolutionText = "Idle"
    @Published var capsuleText = "Base model"
    @Published var status = ""
    @Published var profile: UserProfile?

    private let halo: EdgeHalo
    private let events: AsyncStream<HaloDataEvent>.Continuation
    private let capsuleStore = LocalCapsuleStore()

    init() {
        let stream = AsyncStream.makeStream(of: HaloDataEvent.self)
        events = stream.continuation

        halo = EdgeHalo(
            engine: AppEngineSession(),
            generator: AppTextGenerator(),
            dataStream: stream.stream
        )
    }

    func recordFeedback(accepted: Bool) {
        events.yield(.feedback(
            accepted: accepted,
            conversationID: UUID().uuidString
        ))
        status = "Feedback recorded locally"
    }

    func recordCorrection() {
        events.yield(.correction(
            original: "Original assistant reply",
            corrected: "User-corrected reply",
            conversationID: UUID().uuidString
        ))
        status = "Correction recorded locally"
    }

    func refreshState() async {
        profile = await halo.currentProfile

        switch await halo.evolutionState {
        case .idle:
            evolutionText = "Idle"
        case .collecting(let progress):
            evolutionText = "Collecting \(progress.collected)/\(progress.threshold)"
        case .readyToBuildCapsule:
            evolutionText = "Ready to build"
        case .buildingCapsule:
            evolutionText = "Building"
        case .validating(let capsuleID):
            evolutionText = "Validating \(capsuleID)"
        case .evolved(let capsuleID):
            evolutionText = "Personalized \(capsuleID)"
        }

        switch await halo.haloState {
        case .idle:
            capsuleText = "Base model"
        case .collecting(let factsCount, let threshold):
            capsuleText = "Collecting \(factsCount)/\(threshold)"
        case .profiling:
            capsuleText = "Preparing profile"
        case .buildingCapsule:
            capsuleText = "Building capsule"
        case .validating(let capsuleID):
            capsuleText = "Validating \(capsuleID)"
        case .active(let capsuleID):
            capsuleText = "Neural Imprint active \(capsuleID)"
        case .incompatible(_, let reason):
            capsuleText = "Incompatible: \(reason)"
        case .failed(let reason):
            capsuleText = "Failed: \(reason)"
        }
    }

    func restoreLocalCapsule() async {
        do {
            let capsule = try capsuleStore.loadLatestCapsule()
            let current = try capsuleStore.currentRuntimeRequirements()
            let compatibility = await halo.validateCapsule(
                capsule.manifest,
                currentRequirements: current
            )

            guard compatibility.isCompatible else {
                status = "Capsule does not match the loaded model. Regenerate it."
                await refreshState()
                return
            }

            try await halo.activateCapsule(
                capsule,
                currentRequirements: current
            )
            status = "Neural Imprint restored"
            await refreshState()
        } catch {
            status = "Restore failed: \(error.localizedDescription)"
        }
    }

    func resetPersonalization() async {
        capsuleStore.removeLocalArtifacts()
        status = "Personalization artifacts removed. Reload the base model."
        await refreshState()
    }
}

private extension UserProfile {
    var stabilityText: String {
        stabilityScore.formatted(.number.precision(.fractionLength(2)))
    }
}
```

## Runtime bridge

你的 agent 通过调用同一个 chat 模型会话来实现 Edge Halo bridge。

```swift
struct AppTextGenerator: HaloTextGenerator {
    func tokenize(_ text: String) async throws -> [Int] {
        Array(text.utf8.map(Int.init))
    }

    func generate(prompt: String, maxTokens: Int) async throws -> String {
        // Call your Edge Kit LLMEngine here.
        "Local profile summary"
    }
}

final class AppEngineSession: HaloEngineSession, @unchecked Sendable {
    func captureHiddenState(tokens: [Int], layer: Int) async throws -> [Float] {
        // Call your loaded model session's profile-capture path.
        Array(repeating: 0, count: 4096)
    }

    func captureFullCache(tokenIds: [Int]) async throws -> HaloCacheSnapshot {
        throw HaloCapsuleError.fullCacheCaptureUnsupported
    }

    func restoreFullCache(_ snapshot: HaloCacheSnapshot, artifactURL: URL) async throws {
        // Restore the local Neural Imprint artifact into the loaded session.
    }

    // 此处省略 preview-only protocol hooks。完整 bridge 请参考你固定版本中的
    // Edge Scaffold 实现。
}
```

## Capsule storage placeholder

上面的示例使用了一个很小的 placeholder store。生产 app 通常从 Edge Scaffold flow、Edge Studio export 或可信 EdgeMesh transfer 获取这些值。

```swift
struct LocalCapsuleStore {
    func loadLatestCapsule() throws -> HaloCapsule {
        // Load manifest + local artifact URL from your app container.
        throw CocoaError(.fileNoSuchFile)
    }

    func currentRuntimeRequirements() throws -> HaloCapsuleRequirements {
        // Build from the currently loaded model, tokenizer, tool schema, and runtime.
        throw CocoaError(.featureUnsupported)
    }

    func removeLocalArtifacts() {
        // Delete local Neural Imprint files and receipts owned by the app.
    }
}
```

## 集成注意事项

- 原始用户文本留在本地 app storage。
- 诊断使用 hashes 和 status receipts。
- 只有 `validateCapsule` 成功后才 restore。
- 个性化缺失或不兼容时，保持 base model 可用。
- 不要把 profile text 加进每次 system prompt；应恢复 artifact。
- 提供用户可见的 reset 路径。

## 下一步

- 阅读 [模型进化能力指南](/docs/build/model-evolution)。
- 当 artifacts 需要在受信任的用户自有设备间移动时，使用 [设备 Mesh](/docs/build/device-mesh)。
- 使用 [Edge Scaffold](/docs/optimize-and-ship/scaffold) 作为参考 iOS 实现。
