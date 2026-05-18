---
sidebar_position: 2
title: Configuration
---

# Configuration

`ScaffoldConfig.swift` is the main configuration file for an Edge Scaffold app.

## Required settings

```swift
import EdgeInference

enum ScaffoldConfig {
    static let appName = "My Edge App"
    static let appDescription = "Runs a local model with Edge Kit"
    static let defaultSystemPrompt = "You are a helpful assistant."
    static let modelCategory: ModelCategory = .llm
    static let modelID = "qwen3.5-0.8b"
    static let modelDisplayName = "Qwen3.5 0.8B"
    static let modelSizeGB: Double = 1.6
    static let bundleModelName: String? = nil
    static let defaultTTSSpeaker: String? = nil
}
```

## Fields

| Field | Description |
| --- | --- |
| `appName` | Display name used by the app. |
| `appDescription` | Short description used in onboarding and settings. |
| `defaultSystemPrompt` | Initial system prompt for chat-style models. |
| `modelCategory` | Selects the UI and engine path. |
| `modelID` | Stable identifier for the selected model. |
| `modelDisplayName` | Human-readable model name. |
| `modelSizeGB` | Approximate model size for UI and device checks. |
| `bundleModelName` | Bundle folder name when a model is included with the app. |
| `defaultTTSSpeaker` | Optional default speaker for TTS apps. |

## Model categories

| Category | Input | Output |
| --- | --- | --- |
| `.llm` | Text | Text |
| `.vlm` | Text and photo | Text |
| `.tts` | Text | Audio |
| `.stt` | Audio | Text |

The app UI adapts to the selected category.

## Project generation

Edge Scaffold uses project generation so the exported app can be opened and built in Xcode. You normally do not need to edit generated project files by hand.

## Changing models

When you switch models:

1. Update `modelCategory` if the model type changes.
2. Update the model name and size fields.
3. Re-run the app on a real device.
4. Verify first launch and generation.
