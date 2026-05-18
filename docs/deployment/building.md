---
sidebar_position: 3
title: Building & Shipping
---

# Building and shipping

Build an Edge Scaffold app like a normal iOS app: generate the Xcode project, configure signing, run on device, then archive.

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Xcode 15 or later | Required for iOS 17 targets. |
| XcodeGen | Used by the scaffold project. |
| Apple Developer account | Required for device signing and App Store submission. |
| Target device | Required for runtime validation. |

Install XcodeGen if needed:

```bash
brew install xcodegen
```

## Build from an Edge Studio export

1. Export an Edge Scaffold project from Edge Studio.
2. Open the exported folder.
3. Generate the Xcode project if it is not already generated.
4. Open the project in Xcode.
5. Select a real device.
6. Build and run.

## Manual build

```bash
xcodegen generate
xcodebuild -scheme EdgeScaffold -configuration Release build
```

Use the generated scheme name if your app was renamed during export.

## Signing

In Xcode:

1. Select the app target.
2. Set the bundle identifier.
3. Choose your team.
4. Enable required capabilities.
5. Run on a real device.

For larger models, enable the Increased Memory Limit entitlement.

## Model delivery

Choose the model delivery path that fits your app:

| Path | Use it when |
| --- | --- |
| Cache | The model is downloaded or copied during development. |
| Bundle | The model is small enough to ship inside the app. |
| On-Demand Resources | The model should be downloaded by iOS after install. |
| Hugging Face | The app downloads a preview model at runtime. |

## App Store checklist

- Release build runs on the minimum supported device.
- First model load succeeds after a fresh install.
- Offline behavior is clear to the user.
- The app handles memory pressure and cancellation.
- Privacy nutrition labels match your data flow.
- Local network permission text is present if Edge Mesh is enabled.
