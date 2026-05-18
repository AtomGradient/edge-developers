---
sidebar_position: 2
title: EdgeModelKit
---

# EdgeModelKit API reference

`EdgeModelKit` contains helpers for model download, cache management, and device-tier selection.

## HFDownloader

```swift
public final class HFDownloader: NSObject
```

Downloads registered models into the local model cache.

| API | Description |
| --- | --- |
| `HFDownloader.shared` | Shared downloader instance. |
| `download(config:progress:)` | Downloads files for a `ModelConfig`. |
| `cancel(modelID:)` | Cancels an active download for a model ID. |

Example:

```swift
try await HFDownloader.shared.download(config: config) { progress in
    print(progress)
}
```

## ModelCache

```swift
public final class ModelCache
```

Manages the local model cache directory.

| API | Description |
| --- | --- |
| `ModelCache.shared` | Shared cache manager. |
| `cachedURL(for:)` | Returns the local cache URL for a model config. |
| `isCached(_:)` | Checks whether the model directory exists. |
| `cacheSize(for:)` | Returns byte size for one model directory. |
| `totalCacheSize()` | Returns total cache byte size. |
| `evict(_:)` | Removes one cached model. |
| `evictAll()` | Removes all cached models. |

## ModelTierManager

```swift
public final class ModelTierManager: ObservableObject
```

Selects a model tier for the current device.

| Property or method | Description |
| --- | --- |
| `ModelTierManager.shared` | Shared tier manager. |
| `currentTier` | Current recommended or selected tier. |
| `availableTiers` | Tiers available on this device. |
| `refresh()` | Recomputes available tiers. |
| `select(tier:)` | Selects an available tier. |
| `currentConfig` | `ModelConfig` for the current tier. |

## ModelTier

```swift
public enum ModelTier: String, CaseIterable, Sendable
```

| Case | Intended use |
| --- | --- |
| `.standard` | Smaller models for broad device support. |
| `.pro` | Mid-sized models. |
| `.max` | Larger models for higher-memory devices. |
| `.ultra` | Highest local tier for validated devices. |
