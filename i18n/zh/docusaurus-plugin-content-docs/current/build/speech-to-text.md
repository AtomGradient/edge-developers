---
sidebar_position: 3
title: 语音转文字
---

# 语音转文字

Edge Kit 暴露了用于本地转写的开发者预览版语音转文字 API。

使用 `EdgeVoice` 进行麦克风录音。对于包含语音运行时的构建，使用 `EdgeInference` 中的 `STTEngine` 做原生 ASR。`WhisperEngine` 目前只是未来 whisper.cpp integration 的 预览桥接；在 `edge-kit@1.0.0-rc96` 中它仍是 skeleton，不执行真实转写。

## 录制音频

```swift
import EdgeVoice

let recorder = AudioRecorder()
let recordingURL = try await recorder.startRecording()

// Later, for example after the user taps Stop:
let finalURL = recorder.stopRecording() ?? recordingURL
```

## 使用原生 STT 转写音频文件

```swift
import EdgeInference

let engine = STTEngine()
let modelURL = URL(fileURLWithPath: "/path/to/asr-model")

try await engine.loadLocal(directory: modelURL)
let result = try await engine.transcribe(audioURL: finalURL)

print(result.text)
```

## 流式原生转写

`transcribeStream(audioURL:language:)` 返回 `STTStreamEvent` 值。

```swift
for try await event in engine.transcribeStream(audioURL: finalURL) {
    switch event {
    case .token(let text):
        print(text, terminator: "")
    case .result(let result):
        print("\nFinal:", result.text)
    default:
        break
    }
}
```

## Whisper 预览桥接

`WhisperEngine` 仍保留在 `EdgeVoice` 中，作为计划嵌入 whisper.cpp xcframework 的 App 的 预览桥接。当前预览版 tag 中，`load(_:)` 只会把 skeleton 标为已加载，`transcribe(audioURL:language:)` 返回 placeholder 字符串，`startRealtime(language:)` 会立即结束。

在 App 提供真实 Whisper binding 之前，请使用 `STTEngine` 作为可运行的原生 ASR 示例。

## 支持的音频

使用由 `AudioRecorder` 录制的文件 URL，或使用你的 app 准备好的 WAV/PCM 数据。请在你支持的设备上验证采样率转换。

## API 概览

| Method | 作用 |
|--------|-------------|
| `STTEngine()` | 创建原生语音转文字 engine。 |
| `loadLocal(directory:)` | 加载本地 ASR 模型目录。 |
| `transcribe(audioURL:)` | 转写音频文件。 |
| `transcribe(samples:sampleRate:)` | 转写 PCM 采样。 |
| `transcribeStream(audioURL:)` | 流式返回转写事件。 |
| `AudioRecorder()` | 从麦克风录音。 |

完整签名 → [EdgeInference API Reference](/docs/api-reference/edge-inference) 与 [EdgeVoice API Reference](/docs/api-reference/edge-voice)

## 下一步

- [语音助手示例](/docs/examples/voice-assistant) — ASR → LLM → TTS 管线。
- [文字转语音](/docs/build/text-to-speech) — 补全语音闭环。
