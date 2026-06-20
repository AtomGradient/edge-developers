---
sidebar_position: 5
title: Model Evolution
---

# Model evolution with Edge Halo

Edge Halo helps your agent build and restore local personalization state without sending private user data to a server.

Use it when your agent needs:

- A local user profile derived from app-approved data.
- A Neural Imprint artifact that can be restored by a compatible base model.
- Compatibility checks that fail closed when model, tokenizer, runtime, or tool schema identity changes.
- A clear user-facing lifecycle: base model, learning, artifact ready, restored, incompatible, or needs regeneration.

Edge Halo is a developer-preview package. The agent remains the composition point: it connects Edge Kit inference, Edge Halo lifecycle APIs, local storage, EdgeData, optional EdgeMesh transfer, and product policy.

## What model evolution does

At the developer API level, model evolution is a private lifecycle around a base model:

1. Your agent collects eligible local events and facts.
2. Your agent prepares profile inputs from local data.
3. `EdgeHaloRuntime` runs the profile job with resources exported by Edge Studio or bundled by Edge Scaffold.
4. Edge Studio or your local runtime generates a Neural Imprint artifact.
5. Edge Halo validates the artifact against the current model and runtime.
6. The runtime restores the artifact or fails closed and keeps the base model active.

The base model stays unchanged. The personalization state is local, auditable, removable user data.

## Set up Edge Halo

Edge Halo does not own your inference runtime. Your agent provides two bridges:

- `HaloTextGenerator` for short local generation tasks used by the profile workflow.
- `HaloEngineSession` for model-session operations such as profile capture and Neural Imprint restore.

This page documents the lifecycle contract, not a standalone runnable bridge. Use the Edge Scaffold runtime bridge as the runnable reference. For a working example, see `EdgeScaffold/AI/ScaffoldHaloRuntimeAdapter.swift` in the `edge-scaffold` repository.

The scaffold adapter is app-layer code:

- `ScaffoldHaloRuntimeAdapter` conforms to `HaloTextGenerator` and `HaloEngineSession`.
- It tokenizes and generates through the loaded `LLMEngine` or `VLMEngine` session used by chat.
- It captures profile activations through `LLMEngine.captureHiddenStates(...)` or `VLMEngine.captureHiddenStates(...)`.
- It restores a compatible Neural Imprint artifact through `AIManager.restoreNeuralImprintCacheForHalo(from:)`.

In a production agent, bridge methods should call the same loaded model session that serves user requests. This keeps inference, profile jobs, and restore behavior aligned with the model the user is actually using.

## Prepare profile inputs

Your agent owns data policy. Edge Halo should receive only the local inputs your agent has approved for personalization.

Common inputs:

- Classified local facts from `EdgeData`.
- Explicit user feedback.
- User corrections.
- App-owned records converted into the profile input shape expected by your integration.

Keep raw user text in your app storage. Do not copy transcripts or corrections into analytics, logs, crash reports, or support bundles.

## Run a profile job

The preview profile API accepts prepared examples plus model-matched profile resources exported by Edge Studio or bundled by Edge Scaffold.

In a production agent:

1. Query local facts from your app storage or EdgeData.
2. Convert them into the profile input shape used by your integration.
3. Load the profile resources exported for the exact base model.
4. Run the Edge Halo profile job.
5. Read `await halo.currentProfile`.

Use Edge Scaffold as the concrete reference for the current low-level parameters. Treat the profile result as local user data: show it only at a product-appropriate level and provide a way to reset it.

## Restore a Neural Imprint capsule

Before restoring an artifact, validate it against the loaded runtime. If any requirement does not match, keep the base model active.

```swift
let result = await halo.validateCapsule(
    capsule.manifest,
    currentRequirements: currentRequirements
)

guard result.isCompatible else {
    // Show a recovery action: regenerate, re-export, or load the matching model.
    return
}

try await halo.activateCapsule(
    capsule,
    currentRequirements: currentRequirements
)
```

After restore, chat should run through the same Edge Kit generation path. Do not replay profile text into the system prompt at request time.

## Lifecycle states

Use `evolutionState` and `haloState` to drive settings UI and recovery actions.

| State | What the agent should do |
| --- | --- |
| `.idle` | Base model is active. Personalization may collect local data if the user allows it. |
| `.collecting(progress:)` | Show progress toward a profile refresh or artifact regeneration. |
| `.readyToBuildCapsule` | Offer a user-visible action to build or receive a new artifact. |
| `.buildingCapsule` | Show progress while the local artifact is being prepared. |
| `.validating(capsuleID:)` | Show that compatibility gates are running. |
| `.evolved(capsuleID:)` | Show the active personalized state and provide reset controls. |

`haloState` adds capsule-level recovery states such as `.active(capsuleID:)`,
`.incompatible(capsuleID:reason:)`, and `.failed(reason:)`. Keep the base model
active whenever validation fails.

## Recommended agent workflow

1. Load the base model with Edge Kit.
2. Register app tools and local data surfaces.
3. Collect eligible local facts and corrections.
4. Run profile learning from Settings or a user-approved background flow.
5. Generate or receive a Neural Imprint artifact.
6. Validate and restore the artifact.
7. Provide base-vs-personalized smoke tests and a reset button.

Use [Edge Scaffold](/docs/optimize-and-ship/scaffold) as the reference implementation for this flow.

## Privacy checklist

- Keep profile inputs local.
- Store Neural Imprint artifacts as removable user data.
- Use EdgeMesh only for trusted user-owned devices.
- Log hashes, schema versions, and status receipts instead of raw user content.
- Fail closed on compatibility mismatch.

## API surface

| Method or type | What it does |
| --- | --- |
| `EdgeHaloRuntime(engine:generator:dataStream:)` | Create the lifecycle actor with app-provided bridges. |
| `runProfileAnalysis(...)` | Run a local profile job from prepared inputs and exported resources. |
| `currentProfile` | Most recent local profile result. |
| `validateCapsule(_:currentRequirements:)` | Check whether a Neural Imprint capsule matches the loaded runtime. |
| `activateCapsule(_:currentRequirements:)` | Restore a compatible capsule into the current model session. |
| `evolutionState` | High-level lifecycle state for UI. |
| `haloState` | Capsule validation and restore state. |
| `HaloCapsuleRequirements` | Runtime identity used for fail-closed compatibility. |

Full signatures → [EdgeHalo API Reference](/docs/api-reference/edge-halo)

## Try it next

- [Personalized model example](/docs/examples/personalized-model) — Minimal settings flow.
- [Device mesh](/docs/build/device-mesh) — Transfer artifacts between trusted user-owned devices.
- [Architecture](/docs/guides/architecture) — Product boundaries and data ownership.
- [Neural Imprint vs LoRA](/docs/guides/neural-imprint-vs-lora) — Deployment tradeoffs versus weight adaptation and prompt stuffing.
