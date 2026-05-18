---
sidebar_position: 4
title: Edge Scaffold
---

# Edge Scaffold

Edge Scaffold generates a ready-to-build app project from an optimized model. One configuration file, automatic device detection, four-tier model delivery. Currently generates iOS apps, with additional platforms planned.

:::info Developer Preview
Generated apps require signing, device testing, and store review before release.
:::

## How it works

```text
Edge Studio (export) → Edge Scaffold (template + config) → Xcode project → App
```

Edge Studio writes a ZIP containing the app template, model metadata, and configuration. You unzip, configure, build, and ship.

## ScaffoldConfig.swift

All app behavior is controlled by one file:

```swift
enum ScaffoldConfig {
    static let appName = "MyApp"
    static let appDescription = "A private on-device assistant."
    static let defaultSystemPrompt = "You are a concise assistant."
    static let modelCategory: ModelCategory = .llm  // .llm | .vlm | .tts
    static let bundleModelName: String? = "Qwen3.5-0.8B"
    static let defaultTTSSpeaker: String? = nil
}
```

| Field | Controls |
|-------|---------|
| `appName` | Display name in app UI |
| `modelCategory` | Which engine and UI path the app uses |
| `bundleModelName` | Bundle folder name when shipping model inside the app |
| `defaultSystemPrompt` | Initial system instruction for chat |

The app UI automatically adapts based on `modelCategory`:

| Category | Input | Output |
|----------|-------|--------|
| LLM | Text | Streaming text |
| VLM | Text + photo | Streaming text |
| TTS | Text | Audio |

## Build and test

1. Unzip the export. Open in Xcode.
2. Select your development team and a unique bundle identifier.
3. Set a **real device** as run destination — not simulator.
4. Build as **Release** for performance validation.
5. Test: first launch, model load, first response, multi-turn, backgrounding.

For models larger than ~2B parameters, enable the **Increased Memory Limit** entitlement.

## Model delivery

| Tier | When to use |
|------|-------------|
| **Bundle** | Small models (< 2GB). Ships inside the app binary. |
| **On-Demand Resources** | Medium models. Downloaded after install, managed by the OS. |
| **HuggingFace** | Large models. Downloaded on first launch from HuggingFace. |
| **Cache** | Previously downloaded models. Fastest path on subsequent launches. |

## Next steps

- [Build and ship example](/docs/examples/build-and-ship) — End-to-end walkthrough from optimize to App Store.
- [Platform requirements](/docs/guides/platform-requirements) — Device and OS constraints.
