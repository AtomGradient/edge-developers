---
sidebar_position: 5
title: Speech to Text (ASR)
---

# Speech to text

Edge Kit exposes Developer Preview speech-to-text APIs for local transcription.

Use `EdgeVoice` for microphone recording and Whisper-based transcription. Native ASR paths are also available through `STTEngine` in EdgeInference builds that include the speech runtime.

## Record audio

```swift
import EdgeVoice

let recorder = AudioRecorder()
let recordingURL = try await recorder.startRecording()

// Later, for example after the user taps Stop:
let finalURL = recorder.stopRecording() ?? recordingURL
```

## Transcribe an audio file

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

## Realtime transcription

`startRealtime(language:)` returns an `AsyncStream<String>`.

```swift
for await partial in engine.startRealtime(language: "auto") {
    print(partial)
}
```

## Whisper model sizes

| Size | Filename |
| --- | --- |
| `.tiny` | `ggml-tiny.bin` |
| `.base` | `ggml-base.bin` |
| `.small` | `ggml-small.bin` |
| `.medium` | `ggml-medium.bin` |

## Native STT

When your build includes native STT support, use `STTEngine`:

```swift
import EdgeInference

let engine = STTEngine()
let modelURL = URL(fileURLWithPath: "/path/to/asr-model")

try await engine.loadLocal(directory: modelURL)
let result = try await engine.transcribe(audioURL: finalURL)

print(result.text)
```

## Supported audio

Use file URLs recorded by `AudioRecorder` or WAV/PCM data prepared by your app. Validate sample rate conversion on the devices you support.
