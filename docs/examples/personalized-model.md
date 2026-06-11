---
sidebar_position: 4
title: Personalized Model
---

# Example: Neural Imprint lifecycle

This page documents the settings/lifecycle integration contract, not a standalone runnable bridge.

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

## Runtime bridge reference

Use the Edge Scaffold runtime bridge as the runnable reference. For a working example, see `EdgeScaffold/AI/ScaffoldHaloRuntimeAdapter.swift` in the `edge-scaffold` repository.

The scaffold adapter is app-layer code, not framework code:

- `ScaffoldHaloRuntimeAdapter` conforms to `HaloTextGenerator` and `HaloEngineSession`.
- It tokenizes and generates through the loaded `LLMEngine` or `VLMEngine` session used by chat.
- It captures profile activations through `LLMEngine.captureHiddenStates(...)` or `VLMEngine.captureHiddenStates(...)`.
- It restores a compatible Neural Imprint artifact through `AIManager.restorePersonaKVCacheForHalo(from:)`.

Do not stub generation output or hidden states in app code. If the loaded runtime is unavailable, incompatible, or missing the required capture/restore path, the app should fail closed and keep the base model active.

## Capsule storage and runtime requirements

Production apps usually load capsule manifests and local artifact URLs from an Edge Studio export, the Edge Scaffold flow, app-owned local storage, or a trusted EdgeMesh transfer. Runtime requirements should be built from the currently loaded model, tokenizer, tool schema, and runtime identity before calling `validateCapsule` and `activateCapsule`.

Keep storage and reset policy in your app layer. Edge Kit and Edge Halo provide reusable runtime and lifecycle infrastructure; they should not own app-specific records or product policy.

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
