---
sidebar_position: 2
title: EdgeModelKit
---

# EdgeModelKit API 参考

`EdgeModelKit` 包含模型下载、缓存管理和设备层级选择 helper。

## HFDownloader

```swift
public final class HFDownloader: NSObject
```

将已注册模型下载到本地模型缓存。

| API | 描述 |
| --- | --- |
| `HFDownloader.shared` | 共享 downloader 实例。 |
| `download(config:progress:)` | 下载 `ModelConfig` 的文件。 |
| `cancel(modelID:)` | 取消某个 model ID 的活跃下载。 |

示例：

```swift
try await HFDownloader.shared.download(config: config) { progress in
    print(progress)
}
```

## ModelCache

```swift
public final class ModelCache
```

管理本地模型缓存目录。

| API | 描述 |
| --- | --- |
| `ModelCache.shared` | 共享缓存管理器。 |
| `cachedURL(for:)` | 返回某个模型配置的本地缓存 URL。 |
| `isCached(_:)` | 检查模型目录是否存在。 |
| `cacheSize(for:)` | 返回单个模型目录的字节大小。 |
| `totalCacheSize()` | 返回总缓存字节大小。 |
| `evict(_:)` | 移除一个已缓存模型。 |
| `evictAll()` | 移除所有已缓存模型。 |

## ModelTierManager

```swift
public final class ModelTierManager: ObservableObject
```

为当前设备选择模型层级。

| 属性或方法 | 描述 |
| --- | --- |
| `ModelTierManager.shared` | 共享层级管理器。 |
| `currentTier` | 当前推荐或已选择层级。 |
| `availableTiers` | 此设备上可用的层级。 |
| `refresh()` | 重新计算可用层级。 |
| `select(tier:)` | 选择一个可用层级。 |
| `currentConfig` | 当前层级对应的 `ModelConfig`。 |

## ModelTier

```swift
public enum ModelTier: String, CaseIterable, Sendable
```

| Case | 预期用途 |
| --- | --- |
| `.standard` | 面向广泛设备支持的较小模型。 |
| `.pro` | 中等规模模型。 |
| `.max` | 面向较高内存设备的较大模型。 |
| `.ultra` | 面向已验证设备的最高本地层级。 |
