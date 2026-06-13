---
sidebar_position: 4
title: 个性化模型
---

# 示例：Neural Imprint 生命周期

这个页面记录 settings/lifecycle integration contract，不是 standalone runnable bridge。This page documents the settings/lifecycle integration contract, not a standalone runnable bridge.

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

## Runtime bridge reference

Use the Edge Scaffold runtime bridge as the runnable reference. 可运行参考见 `edge-scaffold` 仓库中的 `EdgeScaffold/AI/ScaffoldHaloRuntimeAdapter.swift`。

Scaffold adapter 属于 app-layer code，不属于基础框架：

- `ScaffoldHaloRuntimeAdapter` 实现 `HaloTextGenerator` 和 `HaloEngineSession`。
- 它通过 chat 使用的已加载 `LLMEngine` 或 `VLMEngine` session 做 tokenize 和 generate。
- 它通过 `LLMEngine.captureHiddenStates(...)` 或 `VLMEngine.captureHiddenStates(...)` 捕获 profile activations。
- 它通过 `AIManager.restorePersonaKVCacheForHalo(from:)` 恢复兼容的 Neural Imprint artifact。

不要在 app code 中 stub generation output 或 hidden states。如果已加载 runtime 不可用、不兼容，或缺少需要的 capture/restore path，app 应 fail closed，并保持 base model active。

## Capsule storage 与 runtime requirements

生产 app 通常从 Edge Studio export、Edge Scaffold flow、app-owned local storage 或可信 EdgeMesh transfer 加载 capsule manifest 与本地 artifact URL。调用 `validateCapsule` 和 `activateCapsule` 前，runtime requirements 应来自当前已加载模型、tokenizer、tool schema 和 runtime identity。

Storage 和 reset policy 留在 app layer。Edge Kit 与 Edge Halo 提供可复用 runtime 和 lifecycle infrastructure；它们不应拥有 app-specific records 或 product policy。

## 集成注意事项

- 原始用户文本留在本地 app storage。
- 诊断使用 hashes 和 status receipts。
- 只有 `validateCapsule` 成功后才 restore。
- 个性化缺失或不兼容时，保持 base model 可用。
- 不要把 profile text 加进每次 system prompt；应恢复 artifact。
- 提供用户可见的 reset 路径。

## 下一步

- 阅读 [模型进化能力指南](/docs/build/model-evolution)。
- 如需了解 Neural Imprint artifacts 的跨 App 兼容性检查，请阅读 [Artifact 复用](artifact-reuse.md)。
- 当 artifacts 需要在受信任的用户自有设备间移动时，使用 [设备 Mesh](/docs/build/device-mesh)。
- 使用 [Edge Scaffold](/docs/optimize-and-ship/scaffold) 作为参考 iOS 实现。
