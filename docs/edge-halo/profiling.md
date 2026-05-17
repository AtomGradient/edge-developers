---
sidebar_position: 2
title: User Profiling
---

# User profiling

User profiling creates a local representation of a user's preferences from their own data.

The output is a `UserProfile`:

| Field | Description |
| --- | --- |
| `directions` | Numeric preference directions used by runtime steering. |
| `directionNames` | Human-readable labels for the directions. |
| `narrative` | Human-readable profile summary. |
| `sampleCount` | Number of samples used to compute the profile. |
| `computedAt` | Timestamp. |
| `stabilityScore` | Confidence score from `0` to `1`. |

## When to run profiling

Run profile analysis after the app has enough local user data to produce a stable result. Do not run it for a single interaction.

Typical triggers:

- The user has provided enough accepted/corrected examples.
- A scheduled local maintenance window starts.
- The user explicitly asks the app to refresh personalization.

## Run profile analysis

The current Developer Preview API exposes a low-level profile-analysis call.

```swift
let output = try await halo.runProfileAnalysis(
    sentences: profileSentences,
    rawTransactions: profileEvents,
    directionsAURL: profileDirectionsURL,
    modelID: "qwen3.5-local",
    progress: { progress in
        print(progress)
    }
)

let profile = await halo.currentProfile
print(profile?.narrative ?? "")
```

Keep the input data and resulting profile local to the user's devices.

## Use the profile

After analysis, `currentProfile` is available for steering and UI display.

```swift
if let profile = await halo.currentProfile {
    print(profile.directionNames)
    print(profile.stabilityScore)
}
```

## Stability score

Use `stabilityScore` as a confidence signal. A low score means the app should collect more examples before applying profile-driven behavior broadly.

## Storage

Store profiles in your app's local secure storage. Do not upload raw profile inputs, profile vectors, or user correction text to a third-party service.
