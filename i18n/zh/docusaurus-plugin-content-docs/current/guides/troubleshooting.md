---
sidebar_position: 7
title: 故障排查
---

# 故障排查

常见问题及修复方式。

## 模型加载

### “Model not found” 或空目录

模型路径必须指向包含 `config.json` 和权重文件（`.safetensors`）的目录。请检查：

- 路径存在且可读。
- 目录里直接包含 `config.json`，而不是嵌套子目录。
- 在 iOS 上，使用相对于 app container 的路径，绝对路径会在安装之间变化。

### 模型能加载但生成内容异常

使用 instruction-tuned 模型（名称包含 `-it-` 或 `-instruct`）。未经指令微调的 base model 会生成不连贯文本。

### 首次启动加载模型很慢

首次加载包含权重反序列化。后续启动会使用缓存数据，速度更快。请在真实目标设备的 Release build 中测量冷启动加载时间。

## 内存和崩溃

### iOS 上 app 被终止（Jetsam）

iOS 会终止超过内存限制的 app。这些限制远低于物理 RAM。

修复方式：
- 在 Xcode target 中启用 **Increased Memory Limit** entitlement。
- 在内存有限的设备上使用更小模型（例如 4B-4bit，而不是 9B-4bit）。
- 用 `phys_footprint` 监控，不要依赖 `os_proc_available_memory()`，它可能高估 2–3 GB。
- 让 Edge Kit 自动管理 KV cache 策略。除非已经实测效果，否则不要覆盖 `memoryPolicy`。

### 内存随轮次增长

Edge Kit 的 DSR Attention 会让内存保持有界。如果看到无界增长，请检查：
- 你没有持续持有旧生成结果的引用。
- 对一次性任务（转写、语音合成），engine 会自动释放缓存。
- 切换模型时调用 `engine.unload()`。

## 构建错误

### SPM “missing module” 或 “cannot find type”

- 清理 DerivedData：`rm -rf ~/Library/Developer/Xcode/DerivedData`
- 确保 `Package.swift` exact pin 到已验证的开发者预览 tag：`.package(url: "...", exact: "1.0.0-rc94")`
- 确认 Xcode 版本为 15 或更高。

### “Metal library not found” 或 kernel crash

Edge Kit 需要 Metal GPU 访问。模拟器不支持 Metal 推理。请始终构建到真实设备，或用 `generic/platform=iOS` destination 做编译检查。

## 性能

### TPS 明显低于预期

- 确认运行的是 **Release** build。Debug build 会慢 2–10 倍。
- 检查热状态，过热设备会明显降频。冷却设备后重新测试。
- 确认模型量化等级。4-bit 模型通常比 8-bit 或 bf16 更快。

### TTFT 随轮次增长

这是预期行为：TTFT 会随上下文长度增长。对 iPhone 上的 9B 模型，典型对话的 TTFT 中位数保持在 1 秒以内。如果 TTFT 突增：
- 检查对话长度。很长的上下文（>8K tokens）会增加 prefill 时间。
- 清空提示缓存以开始新对话：`engine.clearPromptCache()`

## 导出和部署

### 导出的 bundle 无法在 Edge Kit 中加载

- 确认导出目录包含 `config.json` 和所有权重 shard。
- 确保 Edge Kit 版本与导出版本匹配。两者都要固定版本。

### Edge Scaffold app 显示空白页

- 检查 `ScaffoldConfig.swift` 中的模型路径是否正确。
- 在真实设备上运行，而不是模拟器。
- 查看 Xcode console 中的启动错误。

### xcodegen 后 entitlements 被重置

`xcodegen` 可能清空 entitlements。重新生成项目后，确认 Increased Memory Limit 和任何网络相关 entitlements 仍然存在。

## Edge Mesh

### 设备之间无法发现

- 两台设备必须在同一本地网络。
- 确认 Info.plist 设置了 `NSLocalNetworkUsageDescription`。
- 检查 Bonjour service 没有被网络配置阻断。

## 仍然卡住？

在 [github.com/AtomGradient](https://github.com/AtomGradient) 提交 issue，或发送邮件到 [alex@atomgradient.com](mailto:alex@atomgradient.com)。
