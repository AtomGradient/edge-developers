---
sidebar_position: 1
title: EdgeInference
---

# EdgeInference API reference

`EdgeInference` contains the primary model engines and shared inference types. Inference is powered by Edge Engine with **DSR Attention** for efficient long-context multi-turn sessions.

## LLMEngine

```swift
@MainActor
public final class LLMEngine: ObservableObject
```

`LLMEngine` loads text-generation models and streams generated text.

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `state` | `EngineState` | Current engine state. |
| `loadedConfig` | `ModelConfig?` | Registered model metadata when available. |
| `downloadProgress` | `Double` | Download or load progress from `0` to `1`. |
| `lastPolicy` | `InferencePolicy.Resolved?` | Last high-level policy summary. |
| `lastMetrics` | `InferenceMetrics?` | Metrics from the last completed generation. |
| `memoryPolicy` | `KVCacheMemoryPolicy?` | Automatic KV cache management policy. |
| `promptCache` | `PromptCacheManager` | Conversation cache manager. |

### Methods

| Method | Description |
| --- | --- |
| `init()` | Creates an engine. |
| `load(config:onProgress:)` | Preview metadata hook. The native default build does not download remote models here; use `EdgeModelKit` to prepare a local directory, then call `loadLocal(directory:)`. |
| `loadLocal(directory:onProgress:)` | Loads a local model directory. |
| `loadLocal(directory:options:onProgress:)` | Loads a local model directory with runtime options such as `memoryIntent`. |
| `generate(messages:tools:onToolCall:parameters:bypassPolicy:)` | Streams `GenerateChunk` values. |
| `generateStream(messages:parameters:)` | Convenience stream wrapper around `generate(messages:parameters:)`. |
| `generateOnce(messages:parameters:)` | Returns a single accumulated string. |
| `clearPromptCache()` | Clears conversation cache. |
| `unload()` | Releases the loaded model. |

## VLMEngine

```swift
@MainActor
public final class VLMEngine: ObservableObject
```

`VLMEngine` loads vision-language models and streams generated text from image plus text input.

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `state` | `EngineState` | Current engine state. |
| `downloadProgress` | `Double` | Download or load progress. |
| `lastPolicy` | `InferencePolicy.Resolved?` | Last high-level policy summary. |
| `lastMetrics` | `InferenceMetrics?` | Metrics from the last completed generation. |
| `memoryPolicy` | `KVCacheMemoryPolicy?` | Automatic KV cache management policy. |
| `promptCache` | `PromptCacheManager` | Conversation cache manager. |
| `visionOffloaded` | `Bool` | Whether the preview runtime is using a memory-saving vision path. |

### Methods

| Method | Description |
| --- | --- |
| `init()` | Creates an engine. |
| `loadLocal(directory:onProgress:)` | Loads a local VLM directory. |
| `load(config:onProgress:)` | Preview metadata hook. The native default build does not download remote VLMs here; prepare a local directory and call `loadLocal(directory:)`. |
| `generate(messages:images:tools:onToolCall:parameters:)` | Streams text from URL images. |
| `generate(messages:ciImages:tools:onToolCall:parameters:)` | Streams text from in-memory `CIImage` values. |
| `generateStream(messages:images:parameters:)` | Convenience stream wrapper around URL-image generation. |
| `unload()` | Releases the loaded model. |

## TTSEngine

```swift
@MainActor
public final class TTSEngine: ObservableObject
```

`TTSEngine` loads a text-to-speech model and returns PCM audio.

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `state` | `EngineState` | Current engine state. |
| `downloadProgress` | `Double` | Load progress. |
| `availableSpeakers` | `[String]` | Speakers exposed by the loaded model. |
| `ttsModelType` | `String` | Model type string. |
| `sampleRate` | `Int` | Output sample rate. |

### Methods

| Method | Description |
| --- | --- |
| `init()` | Creates an engine. |
| `loadLocal(directory:onProgress:)` | Loads a local TTS model. |
| `speak(_:voice:)` | Generates a single `AudioResult`. |
| `generate(text:speaker:instruct:language:temperature:topK:maxTokens:)` | Generates with explicit parameters. |
| `speakStream(_:voice:instruct:streamingInterval:)` | Streams `TTSEvent` values. |
| `unload()` | Cancels active streaming and releases the model. |
| `unloadAsync()` | Waits for active streaming cleanup before releasing the model. |

## STTEngine

```swift
@MainActor
public final class STTEngine
```

`STTEngine` is the native speech-to-text preview engine when the speech runtime is enabled.

| Method | Description |
| --- | --- |
| `loadLocal(directory:)` | Loads a local ASR model. |
| `transcribe(audioURL:language:maxTokens:temperature:)` | Transcribes an audio file. |
| `transcribe(samples:sampleRate:language:)` | Transcribes PCM samples. |
| `transcribeStream(audioURL:language:)` | Streams `STTStreamEvent` values. |

## EdgeRuntime

```swift
@MainActor
public final class EdgeRuntime
```

`EdgeRuntime` detects a local model category and returns an `AnyEngine` wrapper.

| Method | Description |
| --- | --- |
| `loadLocal(directory:)` | Detects model type and loads the matching engine. |
| `loadRecommendedModel()` | Loads a recommended LLM for the current device. |
| `load(_:)` | Loads a registered LLM by model ID. |

## AnyEngine

```swift
public struct AnyEngine
```

| Property | Type | Description |
| --- | --- | --- |
| `category` | `ModelCategory` | Detected model category. |
| `llm` | `LLMEngine?` | LLM engine when `category == .llm`. |
| `vlm` | `VLMEngine?` | VLM engine when `category == .vlm`. |
| `tts` | `TTSEngine?` | TTS engine when `category == .tts`. |
| `stt` | `STTEngine?` | STT engine when `category == .stt`. |

## Supporting types

| Type | Description |
| --- | --- |
| `EngineState` | `.idle`, `.loading`, `.ready`, `.generating`. |
| `GenerateChunk` | Streaming text chunk with `text`. |
| `ChatMessage` | Role and content pair with `.system`, `.user`, `.assistant`, and `.tool` helpers. |
| `EdgeGenerateParameters` | Generation parameters such as temperature, top-p, and max tokens. |
| `ModelConfig` | Registered model metadata and lookup helpers. |
| `ModelCategory` | `.llm`, `.vlm`, `.tts`, `.stt`. |
| `EdgeMemoryIntent` | Product-level memory intent: `.balanced`, `.longSession`, `.exactRecall`, `.batteryFriendly`. |
| `NativeRuntimeLoadOptions` | Low-level native runtime options. Prefer setting only `memoryIntent` unless you are running a measured experiment. |
| `InferenceMetrics` | TTFT, decode TPS, token counts, memory delta, and cache summary. |
| `AudioResult` | PCM samples and sample rate. |
| `AudioChunkResult` | Streaming audio chunk. |
| `TTSEvent` | `.progress`, `.audioChunk`, `.audio`. |
| `TranscriptionResult` | Speech-to-text output and metrics. |
