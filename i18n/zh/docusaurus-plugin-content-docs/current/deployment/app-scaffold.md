---
sidebar_position: 1
title: Overview
---

# Edge Scaffold

Edge Scaffold is a ready-to-ship app template for Edge Kit models. Currently generates iOS apps, with support for additional platforms planned.

:::info Developer Preview
Edge Scaffold is in **Developer Preview**. Generated apps still require normal iOS signing, device testing, and App Store review.
:::

## What it includes

| Area | Included |
| --- | --- |
| App shell | SwiftUI app structure and settings. |
| Onboarding | Device checks and model setup flow. |
| Chat UI | Streaming text interface. |
| VLM UI | Photo picker path for vision-language models. |
| TTS UI | Text input and audio playback path. |
| Model loading | Cache, bundled model, On-Demand Resources, and Hugging Face paths. |
| Inference | Powered by Edge Kit. |

## Pipeline

```text
Edge Studio optimize -> Edge Scaffold template + Edge Kit SDK -> App Store
```

## Configuration

One file controls the generated app:

```swift
enum ScaffoldConfig {
    static let appName = "My Edge App"
    static let appDescription = "Private on-device AI"
    static let defaultSystemPrompt = "You are a helpful assistant."
    static let modelCategory: ModelCategory = .llm
    static let bundleModelName: String? = "MyModel"
    static let defaultTTSSpeaker: String? = nil
}
```

## Model categories

| Category | App behavior |
| --- | --- |
| `.llm` | Text chat. |
| `.vlm` | Text plus photo input. |
| `.tts` | Text input and audio output. |
| `.stt` | Audio input and transcription where enabled. |

## Next steps

- [Configure Edge Scaffold](/docs/deployment/scaffold-configuration)
- [Build and ship](/docs/deployment/building)
