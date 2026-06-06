---
sidebar_position: 4
title: Personalized Model
---

# Example: Neural Imprint lifecycle

This example shows the app-side control surface for local personalization with Edge Halo.

It does four things:

1. Records local user signals.
2. Shows profile readiness.
3. Validates a Neural Imprint capsule.
4. Restores the capsule only when compatibility checks pass.

The profile job and artifact generation should live behind your own local data layer or follow the Edge Scaffold reference flow.

## SwiftUI settings flow

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

Your agent implements the Edge Halo bridge by calling the same loaded model session used by chat.

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

    // This snippet omits preview-only protocol hooks. Use the Edge Scaffold
    // bridge as the complete reference for your pinned Edge Halo release.
}
```

## Capsule storage placeholder

The example above uses a small placeholder store. Production apps usually get these values from the Edge Scaffold flow, an Edge Studio export, or a trusted EdgeMesh transfer.

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

## Integration notes

- Keep raw user text in local app storage.
- Use hashes and status receipts in diagnostics.
- Restore only after `validateCapsule` succeeds.
- Keep the base model available when personalization is missing or incompatible.
- Do not add profile text to every system prompt; restore the artifact instead.
- Provide a user-visible reset path.

## Next steps

- See the [Model evolution capability guide](/docs/build/model-evolution).
- Use [Device mesh](/docs/build/device-mesh) when artifacts should move between trusted user-owned devices.
- Use [Edge Scaffold](/docs/optimize-and-ship/scaffold) for the reference iOS implementation.
