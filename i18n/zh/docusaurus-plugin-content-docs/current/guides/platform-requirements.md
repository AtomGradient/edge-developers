---
sidebar_position: 3
title: Platform Requirements
---

# Platform requirements

Edge products target Apple Silicon devices.

## Minimum versions

| Component | Requirement |
| --- | --- |
| iOS | 17.0 or later |
| macOS | 14.0 or later |
| Xcode | 15 or later for Edge Kit and Edge Scaffold |
| Swift | 5.9 or later for Edge Kit |
| Hardware | Apple Silicon |

Edge Engine and Edge Halo preview packages use newer Swift toolchains in some builds. Check each package's `Package.swift` before pinning a release.

## Recommended hardware

| Workload | Recommended device |
| --- | --- |
| 0.8B text models | Any Apple Silicon device |
| 4B text or VLM models | 8 GB or more unified memory |
| 9B models | 16 GB or more unified memory, or a validated high-memory iOS device |
| Optimization and export | Mac with sufficient disk space for source and exported models |
| Adapter training | User-owned Mac |

## iOS entitlements

For larger models, enable the Increased Memory Limit entitlement in the iOS target.

Also add Local Network permissions if your app uses Edge Mesh:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app discovers your nearby devices for private on-device AI.</string>
```

## Build settings

Use Release builds for performance validation. Debug builds are useful for development, but they are not representative for throughput or latency.

## Validation matrix

Before shipping, test:

- Cold load and unload.
- First-token latency.
- Long conversation memory behavior.
- Background/foreground transitions on iOS.
- Local network discovery if Edge Mesh is enabled.
