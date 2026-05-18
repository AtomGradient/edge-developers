---
sidebar_position: 5
title: Model Evolution
---

# Model evolution

Edge Halo lets a local model adapt to a user's preferences without sending
private interaction data to a server.

Use it when your app needs:

- A local profile that summarizes user preferences over time.
- Lightweight adapters trained from user-owned data.
- Runtime steering for small behavior adjustments without retraining.

Edge Halo is a developer-preview package. The app remains the composition
point: it connects Edge Kit inference, Edge Halo evolution, local storage, and
optional Edge Mesh transfer.

## What model evolution does

Model evolution adds a private lifecycle around a base model:

1. Collect app-approved interaction events.
2. Build a user profile on the device.
3. Train or receive a small adapter on a user-owned Mac.
4. Validate, apply, or roll back that adapter.
5. Apply session-level steering for temporary preference changes.

The base model stays general. The profile, adapter, and steering state are the
parts that make the experience personal.

## Set up Edge Halo

Edge Halo does not own your inference runtime. Your app provides two bridges:

- `HaloTextGenerator` for short local generations used by profile jobs.
- `HaloEngineSession` for adapter and steering operations.

```swift
import EdgeHalo
import Foundation

struct AppTextGenerator: HaloTextGenerator {
    func tokenize(_ text: String) async throws -> [Int] {
        // Use the tokenizer that matches your loaded model.
        Array(text.utf8.map(Int.init))
    }

    func generate(prompt: String, maxTokens: Int) async throws -> String {
        // In production, call your Edge Kit LLMEngine here.
        "Local summary for: \(prompt.prefix(80))"
    }
}

final class AppEngineSession: HaloEngineSession, @unchecked Sendable {
    func injectLoRA(adapterPath: String, scale: Float) throws {
        // Bridge to the loaded model session.
    }

    func removeLoRA() throws {
        // Remove the active adapter from the loaded model session.
    }

    func captureHiddenState(tokens: [Int], layer: Int) async throws -> [Float] {
        // Bridge to your model session's profile-capture path.
        Array(repeating: 0, count: 4096)
    }

    func injectSteering(vectors: [[Float]], layers: [Int], scales: [Float]) throws {
        // Apply the current profile to the loaded model session.
    }

    func removeSteering() throws {
        // Clear session-level steering.
    }
}

let halo = EdgeHalo(
    engine: AppEngineSession(),
    generator: AppTextGenerator()
)
```

In a production app, the bridge methods should call the same loaded model
session that serves user requests. This keeps inference and evolution aligned
with the model the user is actually using.

## User profiling

A profile is a compact representation of how the user's preferred behavior
differs from the default model behavior. It includes machine-readable
directions and human-readable labels that your app can show in settings,
debugging tools, or validation UI.

`UserProfile` exposes:

| Property | Use |
| --- | --- |
| `directions` | Numeric profile directions used by steering. |
| `directionNames` | Short labels for the profile dimensions. |
| `narrative` | A short natural-language summary. |
| `sampleCount` | Number of examples used for the current profile. |
| `stabilityScore` | A score from `0` to `1` for profile consistency. |

Run profile analysis from an app-owned local data job. Keep raw user content in
your app's storage, pass only the prepared local inputs required by the preview
API, and read the resulting profile from `currentProfile`.

```swift
struct ProfileResources {
    let examples: [String]
    let preparedInputs: [PreparedProfileInput]
    let profileDirectionsURL: URL
    let modelID: String
}

func refreshProfile(
    halo: EdgeHalo,
    resources: ProfileResources
) async throws -> UserProfile? {
    try await halo.runProfileAnalysis(
        sentences: resources.examples,
        rawTransactions: resources.preparedInputs,
        directionsAURL: resources.profileDirectionsURL,
        modelID: resources.modelID,
        progress: { progress in
            print("Profile progress:", progress)
        }
    )

    return await halo.currentProfile
}
```

After the job finishes, use the profile for product UI and for runtime
steering.

```swift
if let profile = await halo.currentProfile {
    print(profile.narrative)
    print(profile.directionNames)
    print(profile.stabilityScore)
}
```

## Adapter lifecycle

Adapters are small model customizations trained from local user data. A common
flow is:

1. The iPhone or iPad collects approved interaction events.
2. A user-owned Mac trains an adapter from those events.
3. The adapter is transferred back over the local mesh.
4. The app validates the adapter offer before applying it.

Use `AdapterVersion` to describe an adapter and `AdapterDecision` to decide
what to do with it.

```swift
let offer = AdapterVersion(
    version: 3,
    hash: "sha256-adapter-file",
    baseModelID: "qwen3.5-0.8b",
    trainingDataHash: "sha256-training-data",
    trainedAt: Date()
)

switch await halo.validateAdapter(offer) {
case .apply:
    try await halo.applyAdapter(
        path: "/path/to/adapter",
        version: offer
    )

case .validateFirst(let rounds):
    let passed = try await runLocalValidation(rounds: rounds)
    if passed {
        try await halo.applyAdapter(
            path: "/path/to/adapter",
            version: offer
        )
    }

case .rejectIncompatible(let reason):
    print("Adapter rejected:", reason)

case .rejectOutdated:
    print("A newer adapter is already active.")
}
```

If quality drops or the user disables personalization, roll back to the base
model:

```swift
try await halo.rollback()
```

## Activation steering

Steering adjusts model behavior for the current session without producing a new
adapter. Use it for controls such as tone, formality, domain focus, or "follow
my profile more gently in this conversation."

```swift
// Uses the current profile, if one is available.
try await halo.updateSteering(scales: [0.08, 0.04, 0.02])

// Generate with the same model session your app already uses.
let answer = try await generateAssistantReply()

// Clear steering when leaving the session or changing mode.
try engineSession.removeSteering()
```

Keep steering controls conservative and visible to the user. They should feel
like session preferences, not permanent model changes.

## Evolution state machine

Use `evolutionState` to drive UI and background work.

| State | What the app should do |
| --- | --- |
| `.idle` | Normal use. Data may be collected if the user opted in. |
| `.collecting(progress:)` | Show progress toward the next local training opportunity. |
| `.readyToTrain` | Offer to train on a user-owned Mac. |
| `.training` | Show training status and keep the base model active. |
| `.validating` | Evaluate the incoming adapter before applying it. |
| `.evolved(version:)` | Show the active adapter version and rollback control. |

```swift
switch await halo.evolutionState {
case .idle:
    print("Base model active")
case .collecting(let progress):
    print("\(progress.collected) of \(progress.threshold) examples")
case .readyToTrain:
    print("Ready to train on this user's Mac")
case .training:
    print("Training in progress")
case .validating:
    print("Validating adapter")
case .evolved(let version):
    print("Adapter version \(version.version) active")
}
```

## Architecture

Edge Halo follows a V-shaped composition model:

```text
App
  |- Edge Kit for inference
  |- Edge Halo for evolution lifecycle
      \- shared engine runtime
```

The app owns policy decisions: what data is eligible, when to train, whether to
apply an adapter, when to roll back, and how to explain personalization to the
user.

## Privacy

Model evolution is designed for user-owned devices:

- Interaction data stays on device.
- Training runs on the user's Mac.
- Adapter transfer uses the user's local mesh when enabled.
- The user can disable personalization and roll back to the base model.

Do not copy raw corrections, transcripts, or private prompts into logs,
analytics, crash reports, or support bundles. Store local profile artifacts as
user data and make them removable from app settings.
