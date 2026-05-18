---
sidebar_position: 7
title: 模型管理
---

# 模型管理

`EdgeModelKit` 提供模型下载、缓存和设备层级 helper。

## 下载已注册模型

```swift
import EdgeInference
import EdgeModelKit

guard let config = ModelConfig.find(modelID: "qwen3.5-0.8b") else {
    throw EdgeRuntimeError.modelNotFound("qwen3.5-0.8b")
}

try await HFDownloader.shared.download(config: config) { progress in
    print("Download progress:", progress)
}
```

## 从缓存加载

```swift
let cachedURL = ModelCache.shared.cachedURL(for: config)

let engine = LLMEngine()
try await engine.loadLocal(directory: cachedURL)
```

## 检查缓存状态

```swift
if ModelCache.shared.isCached(config) {
    print("Cached at:", ModelCache.shared.cachedURL(for: config))
}

print("Model cache bytes:", ModelCache.shared.cacheSize(for: config))
print("Total cache bytes:", ModelCache.shared.totalCacheSize())
```

## 驱逐模型

```swift
try ModelCache.shared.evict(config)
try ModelCache.shared.evictAll()
```

## 设备层级

`ModelTierManager` 会基于当前设备推荐层级。

```swift
import EdgeModelKit

let manager = ModelTierManager.shared
manager.refresh()

print(manager.currentTier)
print(manager.availableTiers)
print(manager.currentConfig)
```

## 模型类别

`ModelCategory.detect(from:)` 读取 `config.json` 并选择 engine 类别。

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

## 加载策略

| 来源 | 适用场景 |
| --- | --- |
| 本地路径 | 你已经在磁盘上有模型 bundle。 |
| 模型缓存 | app 下载了已注册模型。 |
| Edge Studio 导出 | 你在 Edge Studio 中优化或准备了模型。 |
| App bundle 或 ODR | app 通过 iOS 分发来携带或下载模型。 |
