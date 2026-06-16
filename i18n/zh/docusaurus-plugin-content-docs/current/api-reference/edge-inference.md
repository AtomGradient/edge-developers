---
sidebar_position: 1
title: EdgeInference
---

# EdgeInference API 参考

`EdgeInference` 包含主要模型 engine 和共享推理类型。

## LLMEngine

```swift
@MainActor
public final class LLMEngine: ObservableObject
```

`LLMEngine` 加载文本生成模型并流式生成文本。

### 属性

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `state` | `EngineState` | 当前 engine 状态。 |
| `loadedConfig` | `ModelConfig?` | 可用时记录的已注册模型 metadata。 |
| `downloadProgress` | `Double` | 从 `0` 到 `1` 的下载或加载进度。 |
| `lastPolicy` | `InferencePolicy.Resolved?` | 上一次高层策略摘要。 |
| `lastMetrics` | `InferenceMetrics?` | 上一次完成生成的指标。 |
| `memoryPolicy` | `KVCacheMemoryPolicy?` | 自动 KV cache 管理策略。 |
| `promptCache` | `PromptCacheManager` | 对话缓存管理器。 |

### 方法

| 方法 | 描述 |
| --- | --- |
| `init()` | 创建 engine。 |
| `load(config:onProgress:)` | Preview metadata hook。native default build 不在这里下载远程模型；请用 `EdgeModelKit` 准备本地目录，再调用 `loadLocal(directory:)`。 |
| `loadLocal(directory:onProgress:)` | 加载本地模型目录。 |
| `loadLocal(directory:options:onProgress:)` | 使用 runtime options 加载本地模型目录，例如 `memoryIntent`。 |
| `generate(messages:tools:onToolCall:parameters:bypassPolicy:)` | 流式返回 `GenerateChunk` 值。 |
| `generateStream(messages:parameters:)` | 对 `generate(messages:parameters:)` 的便捷 stream wrapper。 |
| `generateOnce(messages:parameters:)` | 返回累积后的单个字符串。 |
| `clearPromptCache()` | 清理对话缓存。 |
| `unload()` | 释放已加载模型。 |

## VLMEngine

```swift
@MainActor
public final class VLMEngine: ObservableObject
```

`VLMEngine` 加载视觉语言模型，并从图像加文本输入流式生成文本。

### 属性

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `state` | `EngineState` | 当前 engine 状态。 |
| `downloadProgress` | `Double` | 下载或加载进度。 |
| `lastPolicy` | `InferencePolicy.Resolved?` | 上一次高层策略摘要。 |
| `lastMetrics` | `InferenceMetrics?` | 上一次完成生成的指标。 |
| `memoryPolicy` | `KVCacheMemoryPolicy?` | 自动 KV cache 管理策略。 |
| `promptCache` | `PromptCacheManager` | 对话缓存管理器。 |
| `visionOffloaded` | `Bool` | 预览运行时是否正在使用节省内存的视觉路径。 |

### 方法

| 方法 | 描述 |
| --- | --- |
| `init()` | 创建 engine。 |
| `loadLocal(directory:onProgress:)` | 加载本地 VLM 目录。 |
| `load(config:onProgress:)` | Preview metadata hook。native default build 不在这里下载远程 VLM；请先准备本地目录，再调用 `loadLocal(directory:)`。 |
| `generate(messages:images:tools:onToolCall:parameters:)` | 从 URL 图像流式生成文本。 |
| `generate(messages:ciImages:tools:onToolCall:parameters:)` | 从内存中的 `CIImage` 值流式生成文本。 |
| `generateStream(messages:images:parameters:)` | 对 URL-image generation 的便捷 stream wrapper。 |
| `unload()` | 释放已加载模型。 |

## TTSEngine

```swift
@MainActor
public final class TTSEngine: ObservableObject
```

`TTSEngine` 加载文字转语音模型并返回 PCM 音频。

### 属性

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `state` | `EngineState` | 当前 engine 状态。 |
| `downloadProgress` | `Double` | 加载进度。 |
| `availableSpeakers` | `[String]` | 已加载模型暴露的说话人。 |
| `ttsModelType` | `String` | 模型类型字符串。 |
| `sampleRate` | `Int` | 输出采样率。 |

### 方法

| 方法 | 描述 |
| --- | --- |
| `init()` | 创建 engine。 |
| `loadLocal(directory:onProgress:)` | 加载本地 TTS 模型。 |
| `speak(_:voice:)` | 生成单个 `AudioResult`。 |
| `generate(text:speaker:instruct:language:temperature:topK:maxTokens:)` | 使用显式参数生成。 |
| `speakStream(_:voice:instruct:streamingInterval:)` | 流式返回 `TTSEvent` 值。 |
| `unload()` | 取消活跃流并释放模型。 |
| `unloadAsync()` | 等待活跃流清理完成后释放模型。 |

## STTEngine

```swift
@MainActor
public final class STTEngine
```

当启用语音运行时时，`STTEngine` 是原生语音转文字预览 engine。

| 方法 | 描述 |
| --- | --- |
| `loadLocal(directory:)` | 加载本地 ASR 模型。 |
| `transcribe(audioURL:language:maxTokens:temperature:)` | 转写音频文件。 |
| `transcribe(samples:sampleRate:language:)` | 转写 PCM 采样。 |
| `transcribeStream(audioURL:language:)` | 流式返回 `STTStreamEvent` 值。 |

## EdgeRuntime

```swift
@MainActor
public final class EdgeRuntime
```

`EdgeRuntime` 检测本地模型类别，并返回 `AnyEngine` wrapper。

| 方法 | 描述 |
| --- | --- |
| `loadLocal(directory:)` | 检测模型类型并加载匹配的 engine。 |
| `loadRecommendedModel()` | 为当前设备加载推荐 LLM。 |
| `load(_:)` | 按 model ID 加载已注册 LLM。 |

## AnyEngine

```swift
public struct AnyEngine
```

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `category` | `ModelCategory` | 检测到的模型类别。 |
| `llm` | `LLMEngine?` | 当 `category == .llm` 时的 LLM engine。 |
| `vlm` | `VLMEngine?` | 当 `category == .vlm` 时的 VLM engine。 |
| `tts` | `TTSEngine?` | 当 `category == .tts` 时的 TTS engine。 |
| `stt` | `STTEngine?` | 当 `category == .stt` 时的 STT engine。 |

## 支持类型

| 类型 | 描述 |
| --- | --- |
| `EngineState` | `.idle`、`.loading`、`.ready`、`.generating`。 |
| `GenerateChunk` | 带 `text` 的流式文本分片。 |
| `ChatMessage` | 角色和内容对，带 `.system`、`.user`、`.assistant` 和 `.tool` helper。 |
| `EdgeGenerateParameters` | 生成参数，例如 temperature、top-p 和 max tokens。 |
| `ModelConfig` | 已注册模型元数据和查找 helper。 |
| `ModelCategory` | `.llm`、`.vlm`、`.tts`、`.stt`。 |
| `EdgeMemoryIntent` | 产品级 memory intent：`.balanced`、`.longSession`、`.exactRecall`、`.batteryFriendly`。 |
| `NativeRuntimeLoadOptions` | 原生 runtime 低层 options。除非在做实测实验，通常只设置 `memoryIntent`。 |
| `InferenceMetrics` | TTFT、decode TPS、token 数、内存变化和缓存摘要。 |
| `AudioResult` | PCM 采样和采样率。 |
| `AudioChunkResult` | 流式音频分片。 |
| `TTSEvent` | `.progress`、`.audioChunk`、`.audio`。 |
| `TranscriptionResult` | 语音转文字输出和指标。 |
