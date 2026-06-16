---
sidebar_position: 3
title: Speech to Text
---

# Speech to text

Edge Kit exposes Developer Preview speech-to-text APIs for local transcription.

Use `EdgeVoice` for microphone recording. Use `STTEngine` from `EdgeInference` for native ASR in builds that include the speech runtime. `WhisperEngine` is currently a preview bridge for future whisper.cpp integration; in `edge-kit@1.0.0-rc95` it is a skeleton and does not perform real transcription.

## Record audio

```swift
import EdgeVoice

let recorder = AudioRecorder()
let recordingURL = try await recorder.startRecording()

// Later, for example after the user taps Stop:
let finalURL = recorder.stopRecording() ?? recordingURL
```

## Transcribe an audio file with native STT

```swift
import EdgeInference

let engine = STTEngine()
let modelURL = URL(fileURLWithPath: "/path/to/asr-model")

try await engine.loadLocal(directory: modelURL)
let result = try await engine.transcribe(audioURL: finalURL)

print(result.text)
```

## Stream native transcription

`transcribeStream(audioURL:language:)` returns `STTStreamEvent` values.

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

## Whisper preview bridge

`WhisperEngine` remains in `EdgeVoice` as a preview bridge for apps that plan to embed a whisper.cpp xcframework. In the current preview tag, `load(_:)` only marks the skeleton as loaded, `transcribe(audioURL:language:)` returns a placeholder string, and `startRealtime(language:)` completes immediately.

Use `STTEngine` for runnable native ASR examples until your app provides a real Whisper binding.

## Supported audio

Use file URLs recorded by `AudioRecorder` or WAV/PCM data prepared by your agent. Validate sample rate conversion on the devices you support.

## API surface

| Method | What it does |
|--------|-------------|
| `STTEngine()` | Create a native speech-to-text engine. |
| `loadLocal(directory:)` | Load a local ASR model directory. |
| `transcribe(audioURL:)` | Transcribe an audio file. |
| `transcribe(samples:sampleRate:)` | Transcribe PCM samples. |
| `transcribeStream(audioURL:)` | Stream transcription events. |
| `AudioRecorder()` | Record from microphone. |

Full signatures → [EdgeInference API Reference](/docs/api-reference/edge-inference) and [EdgeVoice API Reference](/docs/api-reference/edge-voice)

## Try it next

- [Voice assistant example](/docs/examples/voice-assistant) — ASR → LLM → TTS pipeline.
- [Text to speech](/docs/build/text-to-speech) — Complete the voice loop.
