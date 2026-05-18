---
sidebar_position: 4
title: 文字转语音
---

# 使用 TTSEngine 进行文字转语音

`TTSEngine` 加载本地 TTS 模型并返回 PCM 音频采样。

## 加载 TTS 模型

```swift
import EdgeInference

let engine = TTSEngine()
let modelURL = URL(fileURLWithPath: "/path/to/tts-model")

try await engine.loadLocal(directory: modelURL)
```

## 生成语音

```swift
let audio = try await engine.speak(
    "Hello from an on-device voice model.",
    voice: "serena"
)

print(audio.sampleRate)
print(audio.duration)
```

`AudioResult.samples` 包含 `[-1.0, 1.0]` 范围内的 Float PCM 采样。

## 高级生成

```swift
let audio = try await engine.generate(
    text: "Read this sentence naturally.",
    speaker: "serena",
    instruct: nil,
    language: "auto",
    temperature: 0.9,
    topK: 50,
    maxTokens: 2048
)
```

## 流式语音

当你需要进度和音频分片时，使用 `speakStream`。

```swift
for try await event in engine.speakStream(
    "Generate this as streaming audio.",
    voice: "serena"
) {
    switch event {
    case .progress(let tokenID):
        print("Generated token:", tokenID)
    case .audioChunk(let chunk):
        print("Chunk", chunk.chunkIndex, chunk.audioDuration)
    case .audio(let result):
        print("Final audio:", result.duration)
    }
}
```

## 模型信息

```swift
print(engine.availableSpeakers)
print(engine.ttsModelType)
print(engine.sampleRate)
```

## 播放音频

在你的 app 音频层中将 `AudioResult.samples` 转换为 `AVAudioPCMBuffer`。把播放代码放在 engine 之外，这样你的 app 可以自行选择 `AVAudioEngine`、`AVAudioPlayerNode` 或自定义音频管线。

## API 概览

| Method | 作用 |
|--------|-------------|
| `TTSEngine()` | 创建文字转语音 engine。`@MainActor`。 |
| `loadLocal(directory:)` | 加载本地 TTS 模型。 |
| `speak(_:voice:)` | 生成单个 `AudioResult`。 |
| `speakStream(_:voice:)` | 流式返回 `TTSEvent` 值。 |
| `generate(text:speaker:)` | 使用显式参数生成。 |
| `availableSpeakers` | 已加载模型暴露的 speaker。 |

完整签名 → [EdgeInference API Reference](/docs/api-reference/edge-inference)

## 下一步

- [语音助手示例](/docs/examples/voice-assistant) — 完整双工语音管线。
- [语音转文字](/docs/build/speech-to-text) — 补全语音闭环。
