---
sidebar_position: 3
title: 语音助手
---

# 示例：语音助手

本示例构建一个语音对话 app：录制语音、转写语音、将转写文本发送给本地 LLM、合成回复并播放音频。

## 架构

```text
Microphone -> WhisperEngine -> LLMEngine -> TTSEngine -> Speaker
```

当你需要一个无需将语音或 prompt 发送到服务器即可运行的私有助手时，可以使用这种形态。

## 前置条件

- 已通过 Swift Package Manager 添加 Edge Kit。
- 同一 package setup 中可用的 Edge Voice。
- LLM 和 TTS 模型的本地模型目录。
- app 的 `Info.plist` 中包含麦克风用途说明。

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app records your voice to run private on-device transcription.</string>
```

## 完整代码

创建新的 SwiftUI app target，添加 Edge Kit，并将 app 代码替换为以下内容：

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
    @Published var llmModelPath = "\(NSHomeDirectory())/Models/Qwen3.5-0.8B"
    @Published var ttsModelPath = "\(NSHomeDirectory())/Models/Qwen3-TTS"
    @Published var transcript = ""
    @Published var reply = ""
    @Published var phase = "Load models to begin."
    @Published var isLoading = false
    @Published var isReady = false
    @Published var isProcessing = false

    private let recorder = AudioRecorder()
    private let whisper = WhisperEngine()
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
            try await whisper.load(.base)
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
            let result = try await whisper.transcribe(audioURL: audioURL)
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

## 关键概念

- 顺序运行三个模型调用：转写、生成、合成。
- 为语音保持较短回复，让 TTS 可以快速开始并完成。
- 对对话历史复用同一个 `LLMEngine`。
- 在计划支持的最低配置设备上测试完整 pipeline。
- 提供可见的录音状态和清晰的麦克风权限文案。

## 下一步

- 通过 [视觉聊天](/docs/examples/vision-chat) 添加文本和图像上下文。
- 查看 [语音转文字](/docs/build/speech-to-text) 和 [文字转语音](/docs/build/text-to-speech) 指南。
