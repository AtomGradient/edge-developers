---
sidebar_position: 3
title: 语音转文字
---

# 语音转文字

Edge Kit 暴露了用于本地转写的开发者预览版语音转文字 API。

使用 `EdgeVoice` 进行麦克风录音和基于 Whisper 的转写。在包含语音运行时的 EdgeInference 构建中，也可以通过 `STTEngine` 使用原生 ASR 路径。

## 录制音频

```swift
import EdgeVoice

let recorder = AudioRecorder()
let recordingURL = try await recorder.startRecording()

// Later, for example after the user taps Stop:
let finalURL = recorder.stopRecording() ?? recordingURL
```

## 转写音频文件

```swift
import EdgeVoice

let engine = WhisperEngine()
try await engine.load(.base)

let result = try await engine.transcribe(
    audioURL: finalURL,
    language: "auto"
)

print(result.text)
```

## 实时转写

`startRealtime(language:)` 返回 `AsyncStream<String>`。

```swift
for await partial in engine.startRealtime(language: "auto") {
    print(partial)
}
```

## Whisper 模型尺寸

| 尺寸 | 文件名 |
| --- | --- |
| `.tiny` | `ggml-tiny.bin` |
| `.base` | `ggml-base.bin` |
| `.small` | `ggml-small.bin` |
| `.medium` | `ggml-medium.bin` |

## 原生 STT

当你的构建包含原生 STT 支持时，使用 `STTEngine`：

```swift
import EdgeInference

let engine = STTEngine()
let modelURL = URL(fileURLWithPath: "/path/to/asr-model")

try await engine.loadLocal(directory: modelURL)
let result = try await engine.transcribe(audioURL: finalURL)

print(result.text)
```

## 支持的音频

使用由 `AudioRecorder` 录制的文件 URL，或使用你的 app 准备好的 WAV/PCM 数据。请在你支持的设备上验证采样率转换。

## API 概览

| Method | 作用 |
|--------|-------------|
| `WhisperEngine()` | 创建语音转文字 engine。 |
| `load(_:)` | 加载 Whisper 模型变体。 |
| `transcribe(audioURL:)` | 转写音频文件。 |
| `transcribe(samples:sampleRate:)` | 转写 PCM 采样。 |
| `transcribeStream(audioURL:)` | 流式返回转写事件。 |
| `AudioRecorder()` | 从麦克风录音。 |

完整签名 → [EdgeVoice API Reference](/docs/api-reference/edge-voice)

## 下一步

- [语音助手示例](/docs/examples/voice-assistant) — ASR → LLM → TTS 管线。
- [文字转语音](/docs/build/text-to-speech) — 补全语音闭环。
