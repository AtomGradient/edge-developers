---
sidebar_position: 4
title: Edge Scaffold
---

# Edge Scaffold

Edge Scaffold generates a ready-to-build reference agent from an optimized model. It shows the recommended iOS integration for Edge Kit, Edge Halo, EdgeMesh, EdgeData, and Neural Imprint.

> **Developer Preview**
>
> Generated apps require signing, device testing, and store review before release.

## How it works

```text
Edge Studio (export) → Edge Scaffold (template + config) → Xcode project → App
```

Edge Studio writes a ZIP containing the app template, model metadata, runtime configuration, and optional personalization resources. You unzip, configure signing, build, test on a real device, and then own the resulting app project.

## ScaffoldConfig.swift

All app behavior is controlled by one file:

```swift
enum ScaffoldConfig {
    static let appName = "MyApp"
    static let appDescription = "A private on-device assistant."
    static let defaultSystemPrompt = "You are a concise assistant."
    static let modelCategory: ModelCategory = .llm  // .llm | .vlm | .tts
    static let bundleModelName: String? = "Qwen3.5-9B-4bit"
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

## Reference personalization lanes

Edge Scaffold includes developer-facing settings screens for the full local personalization lifecycle:

| Lane | What it demonstrates |
| --- | --- |
| **Base Model** | Load model, inspect runtime state, toggle Neural Imprint restore for A/B checks. |
| **Tool Protocol Learning** | Register app-owned read-only tools and test tool-call behavior without putting live tool schema into every prompt. |
| **User Profile Learning** | Run the profile workflow from local sample data and activate a combined Neural Imprint artifact. |
| **Correction Learning** | Capture feedback and corrections as local data that can feed later profile refreshes. |
| **EdgeMesh** | Pair with a Mac, upload receipts, receive compatible capsules, and report apply status. |

Use these lanes as reference code. Replace the sample data and sample tools with your agent's own domain model.

## Build and test

1. Unzip the export. Open in Xcode.
2. Select your development team and a unique bundle identifier.
3. Set a **real device** as run destination — not simulator.
4. Build as **Release** for performance validation.
5. Test: first launch, model load, first response, multi-turn, backgrounding.

For larger models, enable the **Increased Memory Limit** entitlement and validate with a Release build on the target device.

## Model delivery

| Tier | When to use |
|------|-------------|
| **Bundle** | Small models (< 2GB). Ships inside the app binary. |
| **On-Demand Resources** | Medium models. Downloaded after install, managed by the OS. |
| **HuggingFace** | Large models. Downloaded on first launch from HuggingFace. |
| **Cache** | Previously downloaded models. Fastest path on subsequent launches. |

## What to customize

Start with:

1. `ScaffoldConfig.swift` for product name, model ID, model category, sample domain, and bundled resources.
2. The sample data provider for your agent's local facts.
3. The tool registry for your app-owned read-only tools.
4. The settings copy that explains personalization and reset behavior to your users.

Do not copy dogfood-specific business logic into a production agent. Keep app policy in the app layer and use Edge Kit / Edge Halo only for reusable infrastructure.

## Next steps

- [Build and ship example](/docs/examples/build-and-ship) — End-to-end walkthrough from optimize to App Store.
- [Platform requirements](/docs/guides/platform-requirements) — Device and OS constraints.
