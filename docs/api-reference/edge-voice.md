---
sidebar_position: 3
title: EdgeVoice
---

# EdgeVoice API reference

`EdgeVoice` contains audio recording APIs and a Whisper preview bridge.

> **Current preview boundary**
>
> In `edge-kit@1.0.0-rc95`, `WhisperEngine` is a skeleton for future whisper.cpp xcframework integration. It does not perform real transcription. Use `STTEngine` from `EdgeInference` for runnable native ASR examples in the current preview.

## AudioRecorder

```swift
@MainActor
public final class AudioRecorder: NSObject, ObservableObject
```

Records microphone input to a local WAV file.

| Property or method | Description |
| --- | --- |
| `isRecording` | Whether recording is active. |
| `currentLevel` | Current input level. |
| `startRecording()` | Starts recording and returns the output URL. |
| `stopRecording()` | Stops recording and returns the final URL if available. |

Example:

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

Preview bridge for Whisper-family models.

| Property or method | Description |
| --- | --- |
| `isLoaded` | Whether a model is loaded. |
| `isTranscribing` | Whether transcription is active. |
| `load(_:)` | Records the selected model size for the skeleton bridge. |
| `transcribe(audioURL:language:)` | Returns a placeholder string until whisper.cpp integration is supplied. |
| `startRealtime(language:)` | Completes immediately until realtime Whisper integration is supplied. |
| `unload()` | Releases the loaded model. |

## WhisperEngine.ModelSize

```swift
public enum ModelSize: String, CaseIterable, Sendable
```

| Case | Filename |
| --- | --- |
| `.tiny` | `ggml-tiny.bin` |
| `.base` | `ggml-base.bin` |
| `.small` | `ggml-small.bin` |
| `.medium` | `ggml-medium.bin` |

## TranscriptionResult

```swift
public struct TranscriptionResult: Sendable
```

| Property | Type |
| --- | --- |
| `text` | `String` |
| `language` | `String` |
| `duration` | `TimeInterval` |
