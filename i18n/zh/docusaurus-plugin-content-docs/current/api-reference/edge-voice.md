---
sidebar_position: 3
title: EdgeVoice
---

# EdgeVoice API 参考

`EdgeVoice` 包含音频录制 API 和 Whisper 预览桥接。

:::info 当前预览版 边界
在 `edge-kit@1.0.0-rc97` 中，`WhisperEngine` 是为未来 whisper.cpp xcframework integration 保留的 skeleton。它不执行真实转写。当前预览版 的可运行原生 ASR 示例请使用 `EdgeInference` 中的 `STTEngine`。
:::

## AudioRecorder

```swift
@MainActor
public final class AudioRecorder: NSObject, ObservableObject
```

将麦克风输入录制到本地 WAV 文件。

| 属性或方法 | 描述 |
| --- | --- |
| `isRecording` | 当前是否正在录音。 |
| `currentLevel` | 当前输入电平。 |
| `startRecording()` | 开始录音并返回输出 URL。 |
| `stopRecording()` | 停止录音，并在可用时返回最终 URL。 |

示例：

```swift
let recorder = AudioRecorder()
let url = try await recorder.startRecording()
let finalURL = recorder.stopRecording() ?? url
```

## WhisperEngine

```swift
@MainActor
public final class WhisperEngine: ObservableObject
```

面向 Whisper 家族模型的 预览桥接。

| 属性或方法 | 描述 |
| --- | --- |
| `isLoaded` | 是否已加载模型。 |
| `isTranscribing` | 是否正在转写。 |
| `load(_:)` | 为 skeleton bridge 记录所选模型尺寸。 |
| `transcribe(audioURL:language:)` | 在接入 whisper.cpp 前返回 placeholder 字符串。 |
| `startRealtime(language:)` | 在接入 realtime Whisper 前会立即结束。 |
| `unload()` | 释放已加载模型。 |

## WhisperEngine.ModelSize

```swift
public enum ModelSize: String, CaseIterable, Sendable
```

| Case | 文件名 |
| --- | --- |
| `.tiny` | `ggml-tiny.bin` |
| `.base` | `ggml-base.bin` |
| `.small` | `ggml-small.bin` |
| `.medium` | `ggml-medium.bin` |

## TranscriptionResult

```swift
public struct TranscriptionResult: Sendable
```

| 属性 | 类型 |
| --- | --- |
| `text` | `String` |
| `language` | `String` |
| `duration` | `TimeInterval` |
