---
sidebar_position: 3
title: Adapter Lifecycle
---

# Adapter lifecycle

Adapters are lightweight model customizations trained from user data.

Edge Halo helps validate, apply, and roll back adapters while preserving a monotonic version history.

## AdapterVersion

```swift
let version = AdapterVersion(
    version: 2,
    hash: adapterHash,
    baseModelID: "qwen3.5-local",
    trainingDataHash: trainingDataHash,
    trainedAt: Date()
)
```

| Field | Description |
| --- | --- |
| `version` | Monotonic adapter version. |
| `hash` | Adapter file hash. |
| `baseModelID` | Base model the adapter targets. |
| `trainingDataHash` | Audit hash for the local training data. |
| `trainedAt` | Training completion time. |

## Validate an adapter

```swift
let decision = await halo.validateAdapter(version)

switch decision {
case .apply:
    try await halo.applyAdapter(path: adapterPath, version: version)
case .validateFirst(let rounds):
    try await runValidation(rounds: rounds)
    try await halo.applyAdapter(path: adapterPath, version: version)
case .rejectIncompatible(let reason):
    print("Rejected:", reason)
case .rejectOutdated:
    print("Rejected: older than active adapter")
}
```

## Apply an adapter

```swift
try await halo.applyAdapter(
    path: adapterPath,
    version: version
)
```

Use the optional `scale` argument only when you have validated the value for your app:

```swift
try await halo.applyAdapter(
    path: adapterPath,
    version: version,
    scale: 1.0
)
```

## Roll back

```swift
try await halo.rollback()
```

Rollback removes the current adapter from the engine session and returns the model to the base behavior.

## A/B validation

Before applying an adapter broadly, run local validation rounds:

- Compare the base model and candidate adapter on held-out prompts.
- Check task success and style fit.
- Keep exact user data local.
- Apply only if the candidate passes your app's threshold.

## Device flow

A common flow is:

1. iPhone or iPad collects local feedback.
2. The user's Mac trains an adapter.
3. The adapter is transferred through the user's private mesh.
4. Edge Halo validates and applies the adapter.
5. The app can roll back if validation fails.
