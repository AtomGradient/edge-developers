---
sidebar_position: 7
title: Model Management
---

# Model management

`EdgeModelKit` provides model download, cache, and device-tier helpers.

## Download a registered model

```swift
import EdgeInference
import EdgeModelKit

guard let config = ModelConfig.find(modelID: "qwen3.5-9b-4bit") else {
    throw EdgeRuntimeError.modelNotFound("qwen3.5-9b-4bit")
}

try await HFDownloader.shared.download(config: config) { progress in
    print("Download progress:", progress)
}
```

## Load from cache

```swift
let cachedURL = ModelCache.shared.cachedURL(for: config)

let engine = LLMEngine()
try await engine.loadLocal(directory: cachedURL)
```

## Check cache state

```swift
if ModelCache.shared.isCached(config) {
    print("Cached at:", ModelCache.shared.cachedURL(for: config))
}

print("Model cache bytes:", ModelCache.shared.cacheSize(for: config))
print("Total cache bytes:", ModelCache.shared.totalCacheSize())
```

## Evict models

```swift
try ModelCache.shared.evict(config)
try ModelCache.shared.evictAll()
```

## Device tiers

`ModelTierManager` recommends a tier based on the current device.

```swift
import EdgeModelKit

let manager = ModelTierManager.shared
manager.refresh()

print(manager.currentTier)
print(manager.availableTiers)
print(manager.currentConfig)
```

## Model categories

`ModelCategory.detect(from:)` reads `config.json` and selects an engine category.

```swift
let category = ModelCategory.detect(from: cachedURL)

switch category {
case .llm:
    print("Use LLMEngine")
case .vlm:
    print("Use VLMEngine")
case .tts:
    print("Use TTSEngine")
case .stt:
    print("Use STTEngine")
}
```

## Loading strategy

| Source | Use it when |
| --- | --- |
| Local path | You already have a model bundle on disk. |
| Model cache | The app downloaded a registered model. |
| Edge Studio export | You optimized or prepared the model in Edge Studio. |
| App bundle or ODR | The app ships or downloads the model through iOS distribution. |
