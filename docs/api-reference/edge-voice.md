---
sidebar_position: 3
title: EdgeVoice
---

# EdgeVoice API reference

`EdgeVoice` contains audio recording and Whisper-based speech-to-text preview APIs.

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

Speech-to-text engine for Whisper-family models.

| Property or method | Description |
| --- | --- |
| `isLoaded` | Whether a model is loaded. |
| `isTranscribing` | Whether transcription is active. |
| `load(_:)` | Loads a model size. |
| `transcribe(audioURL:language:)` | Transcribes an audio file. |
| `startRealtime(language:)` | Starts realtime transcription stream. |
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
