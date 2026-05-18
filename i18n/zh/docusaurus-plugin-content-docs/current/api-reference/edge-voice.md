---
sidebar_position: 3
title: EdgeVoice
---

# EdgeVoice API 参考

`EdgeVoice` 包含音频录制和基于 Whisper 的语音转文字预览 API。

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

面向 Whisper 家族模型的语音转文字 engine。

| 属性或方法 | 描述 |
| --- | --- |
| `isLoaded` | 是否已加载模型。 |
| `isTranscribing` | 是否正在转写。 |
| `load(_:)` | 加载一个模型尺寸。 |
| `transcribe(audioURL:language:)` | 转写音频文件。 |
| `startRealtime(language:)` | 启动实时转写 stream。 |
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
