---
sidebar_position: 8
title: 内存管理
---

# 内存管理

Edge Kit 会自动管理模型和生成内存，但 app 层选择仍然重要。

## 为什么 iOS 内存不同

iOS 可能在物理 RAM 耗尽前终止 app。请把进程 footprint 和真实设备行为作为事实来源。

对于较大的模型，请启用 Increased Memory Limit entitlement。

## Edge Kit 管理什么

| 区域 | 行为 |
| --- | --- |
| 模型加载 | 加载前根据当前设备检查模型。 |
| KV cache | 为文本生成应用自动 KV cache 管理。 |
| 提示缓存 | 跨轮次复用对话上下文。 |
| 内存压力 | 响应系统内存警告。 |
| 单次任务 | 在 STT 和 TTS 类工作负载后释放临时 buffer。 |

## 对话缓存

为一次对话保留提示缓存：

```swift
for try await chunk in engine.generate(messages: history) {
    print(chunk.text, terminator: "")
}
```

新对话开始时清理缓存：

```swift
engine.clearPromptCache()
```

## 卸载未使用的 engine

```swift
engine.unload()
```

对于 TTS，如果流式生成可能仍在运行，请使用 `unloadAsync()`：

```swift
await ttsEngine.unloadAsync()
```

## App 最佳实践

- 在你支持的最低内存设备上测试。
- 使用 Release build 验证内存。
- 避免同时加载多个大型 engine。
- 当不需要全分辨率时，在发送到 VLM 前缩小图像。
- 保持长时间生成可取消。
- 使用进程物理 footprint 调试。

## 常见症状

| 症状 | 检查项 |
| --- | --- |
| app 在加载时退出 | 模型对目标设备过大，或缺少 entitlement。 |
| 第一轮很慢 | 冷启动模型加载或长 prompt prefill。 |
| 后续轮次变慢 | 对话历史正在增长；适当时总结或清理。 |
| VLM 在图像上失败 | 尝试更小图像并验证设备内存。 |
