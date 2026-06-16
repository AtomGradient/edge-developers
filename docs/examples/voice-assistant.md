---
sidebar_position: 3
title: Voice Assistant
---

# Example: Voice assistant

This example builds a voice conversation app that records speech, transcribes
it, sends the transcript to a local LLM, synthesizes the reply, and plays the
audio.

## Architecture

```text
Microphone -> STTEngine -> LLMEngine -> TTSEngine -> Speaker
```

Use this shape when you want a private assistant that can run without sending
voice or prompts to a server.

## Prerequisites

- Edge Kit added with Swift Package Manager.
- Edge Voice available in the same package setup for microphone recording.
- Local model directories for the STT, LLM, and TTS models.
- Microphone usage text in your agent's `Info.plist`.

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app records your voice to run private on-device transcription.</string>
```

## Complete code

Create a new SwiftUI app target, add Edge Kit, and replace the app code with
the following:

```swift
import AVFoundation
import EdgeInference
import EdgeVoice
import SwiftUI

@main
struct VoiceAssistantExampleApp: App {
    var body: some Scene {
        WindowGroup {
            VoiceAssistantView()
        }
    }
}

struct VoiceAssistantView: View {
    @StateObject private var model = VoiceAssistantViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Group {
                TextField("STT model directory", text: $model.sttModelPath)
                TextField("LLM model directory", text: $model.llmModelPath)
                TextField("TTS model directory", text: $model.ttsModelPath)
            }
            .textFieldStyle(.roundedBorder)

            HStack {
                Button(model.isReady ? "Models Loaded" : "Load Models") {
                    Task { await model.loadModels() }
                }
                .disabled(model.isLoading)

                Button(model.isRecording ? "Stop" : "Record") {
                    Task { await model.toggleRecording() }
                }
                .disabled(!model.isReady || model.isProcessing)
            }

            Text(model.phase)
                .font(.caption)
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 8) {
                Text("Transcript")
                    .font(.headline)
                Text(model.transcript.isEmpty ? "No speech yet." : model.transcript)
                    .textSelection(.enabled)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Assistant")
                    .font(.headline)
                Text(model.reply.isEmpty ? "No reply yet." : model.reply)
                    .textSelection(.enabled)
            }

            Spacer()
        }
        .padding()
    }
}

@MainActor
final class VoiceAssistantViewModel: ObservableObject {
    @Published var sttModelPath = "\(NSHomeDirectory())/Models/Qwen3-ASR"
    @Published var llmModelPath = "\(NSHomeDirectory())/Models/Qwen3.5-9B-4bit"
    @Published var ttsModelPath = "\(NSHomeDirectory())/Models/Qwen3-TTS"
    @Published var transcript = ""
    @Published var reply = ""
    @Published var phase = "Load models to begin."
    @Published var isLoading = false
    @Published var isReady = false
    @Published var isProcessing = false

    private let recorder = AudioRecorder()
    private let stt = STTEngine()
    private let llm = LLMEngine()
    private let tts = TTSEngine()

    private var history: [ChatMessage] = [
        .system("You are a concise voice assistant. Keep replies short.")
    ]

    private var playbackEngine: AVAudioEngine?
    private var playerNode: AVAudioPlayerNode?

    var isRecording: Bool {
        recorder.isRecording
    }

    func loadModels() async {
        guard !isLoading else { return }
        isLoading = true
        phase = "Loading models..."
        defer { isLoading = false }

        do {
            try await stt.loadLocal(directory: URL(fileURLWithPath: sttModelPath))
            try await llm.loadLocal(directory: URL(fileURLWithPath: llmModelPath))
            try await tts.loadLocal(directory: URL(fileURLWithPath: ttsModelPath))
            isReady = true
            phase = "Ready"
        } catch {
            isReady = false
            phase = "Load failed: \(error.localizedDescription)"
        }
    }

    func toggleRecording() async {
        if recorder.isRecording {
            guard let audioURL = recorder.stopRecording() else { return }
            await answer(audioURL: audioURL)
        } else {
            do {
                _ = try await recorder.startRecording()
                phase = "Listening..."
            } catch {
                phase = "Recording failed: \(error.localizedDescription)"
            }
        }
    }

    private func answer(audioURL: URL) async {
        guard isReady, !isProcessing else { return }
        isProcessing = true
        defer { isProcessing = false }

        do {
            phase = "Transcribing..."
            let result = try await stt.transcribe(audioURL: audioURL)
            let userText = result.text.trimmingCharacters(in: .whitespacesAndNewlines)
            transcript = userText

            phase = "Generating..."
            let request = history + [.user(userText)]
            let assistantText = try await llm.generateOnce(
                messages: request,
                parameters: EdgeGenerateParameters(maxTokens: 160)
            )
            reply = assistantText
            history = request + [.assistant(assistantText)]

            phase = "Speaking..."
            let audio = try await tts.speak(assistantText)
            try play(audio)
        } catch {
            phase = "Failed: \(error.localizedDescription)"
        }
    }

    private func play(_ result: AudioResult) throws {
        guard !result.samples.isEmpty else { return }

        let format = AVAudioFormat(
            commonFormat: .pcmFormatFloat32,
            sampleRate: Double(result.sampleRate),
            channels: 1,
            interleaved: false
        )!

        let frameCount = AVAudioFrameCount(result.samples.count)
        guard let buffer = AVAudioPCMBuffer(
            pcmFormat: format,
            frameCapacity: frameCount
        ) else {
            return
        }

        buffer.frameLength = frameCount
        result.samples.withUnsafeBufferPointer { samples in
            if let base = samples.baseAddress,
               let channel = buffer.floatChannelData?[0] {
                channel.update(from: base, count: samples.count)
            }
        }

        let engine = AVAudioEngine()
        let player = AVAudioPlayerNode()
        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)

        try engine.start()
        player.play()
        player.scheduleBuffer(buffer, at: nil, options: .interrupts) { [weak self] in
            Task { @MainActor in
                self?.phase = "Ready"
            }
        }

        playbackEngine = engine
        playerNode = player
    }
}
```

## Key concepts

- Run the three model calls sequentially: transcribe, generate, synthesize.
- Keep replies short for voice so TTS starts and finishes quickly.
- Reuse the same `LLMEngine` for the conversation history.
- Test the full pipeline on the minimum device you plan to support.
- Provide a visible recording state and clear microphone permission text.

## Next steps

- Add text and image context with [Vision chat](/docs/examples/vision-chat).
- See the [speech-to-text](/docs/build/speech-to-text) and
  [text-to-speech](/docs/build/text-to-speech) guides.
