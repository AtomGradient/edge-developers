---
sidebar_position: 5
title: Build & Ship iOS App
---

# Example: Build and ship an iOS app

This walkthrough takes a model from Edge Studio to a signed iOS app generated
with Edge Scaffold.

## What this example builds

You will create a private on-device chat app with:

- A model optimized in Edge Studio.
- A generated SwiftUI app from Edge Scaffold.
- One configuration file for the app name, model category, and prompt.
- A release build tested on a real iPhone or iPad.

## 1. Optimize the model

Open Edge Studio and load the source model.

For a first app, use Simple mode:

1. Choose the target device class.
2. Select the model category.
3. Run the recommended optimization.
4. Validate a short prompt on the target device profile.

Use the Pro pipeline when you need a custom benchmark matrix, multiple export
targets, or manual comparison across model variants.

## 2. Export an Edge Scaffold app

In Edge Studio, choose **Export** and select **Edge Scaffold app**.

Export settings to check:

| Setting | Recommendation |
| --- | --- |
| App name | Use the product name you want to see in Xcode. |
| Model category | Match the exported model: LLM, VLM, TTS, or STT. |
| Model delivery | Bundle for small models; remote or on-demand delivery for larger ones. |
| Minimum OS | Match the devices you validated. |

Edge Studio writes a ZIP containing the app template, configuration, and model
metadata needed by Edge Kit.

## 3. Open in Xcode

Unzip the export and open the generated project in Xcode.

Before running:

1. Select your development team.
2. Set a unique bundle identifier.
3. Choose a real device as the run destination.
4. Confirm the deployment target is iOS 17 or later.

Use a Release build for performance validation. Debug builds are useful while
editing UI, but they do not represent final load time or throughput.

## 4. Configure ScaffoldConfig.swift

`ScaffoldConfig.swift` controls the generated app behavior.

```swift
import EdgeInference

enum ScaffoldConfig {
    static let appName = "Pocket Research"
    static let appDescription = "A private on-device research assistant."
    static let defaultSystemPrompt = """
    You are a concise research assistant. Answer with citations when context is provided.
    """

    static let modelCategory: ModelCategory = .llm
    static let modelID = "qwen3.5-0.8b"
    static let modelDisplayName = "Qwen3.5 0.8B"
    static let modelSizeGB: Double = 1.6

    // Use this when the model is included in the app bundle.
    static let bundleModelName: String? = "Qwen3.5-0.8B"

    // Used only by TTS apps.
    static let defaultTTSSpeaker: String? = nil
}
```

### ScaffoldConfig reference

| Field | Controls |
| --- | --- |
| `appName` | Display name used in the app UI. |
| `appDescription` | Short onboarding and settings description. |
| `defaultSystemPrompt` | Initial system instruction for chat-style apps. |
| `modelCategory` | Which UI and engine path the app uses. |
| `modelID` | Stable identifier for logs, cache keys, and settings. |
| `modelDisplayName` | Human-readable model name. |
| `modelSizeGB` | Approximate size shown in device checks. |
| `bundleModelName` | Bundle folder name when shipping the model inside the app. |
| `defaultTTSSpeaker` | Optional default speaker for TTS models. |

## 5. Configure permissions and entitlements

For larger models, enable the Increased Memory Limit entitlement on the iOS
target.

Add usage strings for the capabilities your agent exposes:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app records your voice for private on-device transcription.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>This app lets you choose photos for private on-device analysis.</string>

<key>NSLocalNetworkUsageDescription</key>
<string>This app discovers your nearby devices for private on-device AI.</string>
```

Only include permissions that the shipped app actually uses.

## 6. Test on device

Run this checklist before archiving:

| Area | What to verify |
| --- | --- |
| First launch | App opens, model setup appears, no missing files. |
| Model load | Cold load succeeds on the minimum supported device. |
| Generation | First reply streams and completes. |
| Long session | Multi-turn use stays responsive. |
| Backgrounding | App handles background and foreground transitions. |
| Storage | Model cache and user data can be cleared. |
| Permissions | Only required prompts appear. |

For VLM, TTS, STT, or mesh apps, run the feature-specific path end to end on
device before submission.

## 7. Archive and submit

In Xcode:

1. Select **Any iOS Device** or your distribution destination.
2. Choose **Product > Archive**.
3. Open Organizer.
4. Validate the archive.
5. Upload to App Store Connect.

In App Store Connect, make sure the privacy nutrition labels match the app's
actual behavior. If the app keeps all prompts, audio, images, and model data on
device, say that clearly in the review notes and in user-facing copy.

## Deployment checklist

- App name, icon, bundle ID, and signing team are final.
- Increased Memory Limit entitlement is enabled when needed.
- Model delivery strategy is tested: bundled, on-demand, or remote download.
- First launch works without developer-only paths.
- Minimum supported device has been tested with a Release build.
- Settings include a way to clear local model and personalization data.
- App Store privacy answers match the shipped app behavior.

## Next steps

- See [Edge Scaffold configuration](/docs/optimize-and-ship/scaffold).
- Review [Platform requirements](/docs/guides/platform-requirements).
