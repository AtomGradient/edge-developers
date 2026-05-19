---
sidebar_position: 4
title: Text to Speech
---

# Text to speech with TTSEngine

`TTSEngine` loads a local TTS model and returns PCM audio samples.

## Load a TTS model

```swift
import EdgeInference

let engine = TTSEngine()
let modelURL = URL(fileURLWithPath: "/path/to/tts-model")

try await engine.loadLocal(directory: modelURL)
```

## Generate speech

```swift
let audio = try await engine.speak(
    "Hello from an on-device voice model.",
    voice: "serena"
)

print(audio.sampleRate)
print(audio.duration)
```

`AudioResult.samples` contains Float PCM samples in the `[-1.0, 1.0]` range.

## Advanced generation

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

## Streaming speech

Use `speakStream` when you want progress and audio chunks.

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

## Model info

```swift
print(engine.availableSpeakers)
print(engine.ttsModelType)
print(engine.sampleRate)
```

## Play audio

Convert `AudioResult.samples` to an `AVAudioPCMBuffer` in your agent audio layer. Keep playback code outside the engine so your agent can choose `AVAudioEngine`, `AVAudioPlayerNode`, or a custom audio pipeline.

## API surface

| Method | What it does |
|--------|-------------|
| `TTSEngine()` | Create a text-to-speech engine. `@MainActor`. |
| `loadLocal(directory:)` | Load a local TTS model. |
| `speak(_:voice:)` | Generate a single `AudioResult`. |
| `speakStream(_:voice:)` | Stream `TTSEvent` values. |
| `generate(text:speaker:)` | Generate with explicit parameters. |
| `availableSpeakers` | Speakers exposed by the loaded model. |

Full signatures → [EdgeInference API Reference](/docs/api-reference/edge-inference)

## Try it next

- [Voice assistant example](/docs/examples/voice-assistant) — Full duplex voice pipeline.
- [Speech to text](/docs/build/speech-to-text) — Complete the voice loop.
