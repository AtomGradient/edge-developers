---
sidebar_position: 4
title: Personalized Model
---

# Example: Personalized model

This example builds the app-side control surface for model evolution with
Edge Halo. It collects local events, checks evolution state, validates an
adapter, applies it, updates steering, and rolls back.

The profile-analysis job itself should live behind your private local data
layer. That job prepares app-approved examples, runs the preview analysis API,
and then exposes `currentProfile` to the UI shown here.

## Complete code

Create a SwiftUI app target that depends on Edge Halo and replace the app code
with the following:

```swift
import EdgeHalo
import Foundation
import SwiftUI

@main
struct PersonalizedModelExampleApp: App {
    var body: some Scene {
        WindowGroup {
            PersonalizationView()
        }
    }
}

struct PersonalizationView: View {
    @StateObject private var model = PersonalizationViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Evolution State")
                .font(.headline)

            Text(model.stateText)
                .font(.body)

            if let profile = model.profile {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Profile")
                        .font(.headline)
                    Text(profile.narrative)
                    Text("Signals: \(profile.directionNames.joined(separator: ", "))")
                        .font(.caption)
                    Text("Stability: \(profile.stabilityScore, format: .number.precision(.fractionLength(2)))")
                        .font(.caption)
                }
            }

            Divider()

            TextField("Adapter path", text: $model.adapterPath)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Accepted Reply") {
                    model.recordAcceptedReply()
                }

                Button("Correction") {
                    model.recordCorrection()
                }

                Button("Session Ended") {
                    model.recordSessionCompleted()
                }
            }

            HStack {
                Button("Refresh") {
                    Task { await model.refreshState() }
                }

                Button("Apply Adapter") {
                    Task { await model.applyAdapter() }
                }

                Button("Steer") {
                    Task { await model.updateSteering() }
                }

                Button("Roll Back") {
                    Task { await model.rollback() }
                }
            }

            Text(model.status)
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()
        }
        .padding()
        .task {
            await model.refreshState()
        }
    }
}

@MainActor
final class PersonalizationViewModel: ObservableObject {
    @Published var adapterPath = "\(NSHomeDirectory())/Adapters/user-v1"
    @Published var stateText = "Idle"
    @Published var status = "Ready"
    @Published var profile: UserProfile?

    private let halo: EdgeHalo
    private let eventSink: AsyncStream<HaloDataEvent>.Continuation
    private let baseModelID = "qwen3.5-0.8b"

    init() {
        let events = AsyncStream.makeStream(of: HaloDataEvent.self)
        eventSink = events.continuation

        halo = EdgeHalo(
            engine: DemoEngineSession(),
            generator: DemoTextGenerator(),
            dataStream: events.stream
        )
    }

    func recordAcceptedReply() {
        eventSink.yield(.feedback(
            accepted: true,
            conversationID: UUID().uuidString
        ))
        status = "Feedback stored locally"
    }

    func recordCorrection() {
        eventSink.yield(.correction(
            original: "Draft reply",
            corrected: "Preferred reply",
            conversationID: UUID().uuidString
        ))
        status = "Correction stored locally"
    }

    func recordSessionCompleted() {
        eventSink.yield(.sessionCompleted(
            turnCount: 8,
            conversationID: UUID().uuidString
        ))
        status = "Session event stored locally"
    }

    func refreshState() async {
        let state = await halo.evolutionState
        profile = await halo.currentProfile

        switch state {
        case .idle:
            stateText = "Idle"
        case .collecting(let progress):
            stateText = "Collecting \(progress.collected)/\(progress.threshold)"
        case .readyToTrain:
            stateText = "Ready to train on this user's Mac"
        case .training:
            stateText = "Training"
        case .validating:
            stateText = "Validating"
        case .evolved(let version):
            stateText = "Adapter v\(version.version) active"
        }
    }

    func applyAdapter() async {
        let offer = AdapterVersion(
            version: 1,
            hash: "sha256-adapter-file",
            baseModelID: baseModelID,
            trainingDataHash: "sha256-training-data",
            trainedAt: Date()
        )

        do {
            switch await halo.validateAdapter(offer) {
            case .apply:
                try await halo.applyAdapter(path: adapterPath, version: offer)
                status = "Adapter applied"

            case .validateFirst(let rounds):
                let passed = await runValidation(rounds: rounds)
                if passed {
                    try await halo.applyAdapter(path: adapterPath, version: offer)
                    status = "Adapter validated and applied"
                } else {
                    status = "Adapter validation failed"
                }

            case .rejectIncompatible(let reason):
                status = "Rejected: \(reason)"

            case .rejectOutdated:
                status = "Rejected: an equal or newer adapter is active"
            }

            await refreshState()
        } catch {
            status = "Apply failed: \(error.localizedDescription)"
        }
    }

    func updateSteering() async {
        do {
            try await halo.updateSteering(scales: [0.08, 0.04, 0.02])
            status = "Steering updated for this session"
        } catch {
            status = "Steering failed: \(error.localizedDescription)"
        }
    }

    func rollback() async {
        do {
            try await halo.rollback()
            status = "Rolled back to base model"
            await refreshState()
        } catch {
            status = "Rollback failed: \(error.localizedDescription)"
        }
    }

    private func runValidation(rounds: Int) async -> Bool {
        // Replace with your local evaluation prompts and user-facing checks.
        rounds > 0
    }
}

struct DemoTextGenerator: HaloTextGenerator {
    func tokenize(_ text: String) async throws -> [Int] {
        text.utf8.map(Int.init)
    }

    func generate(prompt: String, maxTokens: Int) async throws -> String {
        "Profile summary for \(prompt.prefix(80))"
    }
}

final class DemoEngineSession: HaloEngineSession, @unchecked Sendable {
    private let lock = NSLock()
    private var adapterPath: String?

    func injectLoRA(adapterPath: String, scale: Float) throws {
        lock.withLock {
            self.adapterPath = adapterPath
        }
    }

    func removeLoRA() throws {
        lock.withLock {
            self.adapterPath = nil
        }
    }

    func captureHiddenState(tokens: [Int], layer: Int) async throws -> [Float] {
        Array(repeating: 0, count: 4096)
    }

    func injectSteering(vectors: [[Float]], layers: [Int], scales: [Float]) throws {
        // Bridge to your loaded model session in production.
    }

    func removeSteering() throws {
        // Clear session-level steering in production.
    }
}
```

## Add profile analysis

The app-facing pattern is:

1. Collect only user-approved events.
2. Prepare local examples for the profile job.
3. Run the preview analysis API from your local data layer.
4. Read `await halo.currentProfile`.
5. Call `updateSteering(scales:)` or show the profile in settings.

Keep the data-preparation code private to your app. It should not copy raw
corrections into logs or analytics.

## Key concepts

- The app composes Edge Kit and Edge Halo. Edge Halo does not own your UI or
  product policy.
- `HaloDataEvent` records the signals your app allows.
- `EvolutionState` drives training, validation, and rollback UI.
- `AdapterVersion` and `AdapterDecision` protect the adapter lifecycle.
- `UserProfile` is local user data and should be removable from settings.

## Next steps

- See the [Model evolution capability guide](/docs/build/model-evolution).
- Use [Device mesh](/docs/build/device-mesh) when training or adapter
  transfer should happen on another user-owned device.
