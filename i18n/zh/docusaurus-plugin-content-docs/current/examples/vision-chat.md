---
sidebar_position: 2
title: 视觉聊天
---

# 示例：视觉聊天

本示例构建一个 iOS app，让用户选择照片并围绕照片追问。

## 前置条件

- 已通过 Swift Package Manager 添加 Edge Kit。
- 本地视觉语言模型目录。
- iOS 17 或更高。

如果产品需要更广泛的照片访问，请为 app 添加照片图库访问说明。`PhotosPicker` 也可以在有限选择器流程中运行。

## 完整代码

创建新的 iOS SwiftUI 应用 target，添加 Edge Kit，并将 App 代码替换为以下内容：

```swift
import CoreImage
import EdgeInference
import PhotosUI
import SwiftUI
import UIKit

@main
struct VisionChatExampleApp: App {
    var body: some Scene {
        WindowGroup {
            VisionChatView()
        }
    }
}

struct VisionChatView: View {
    @StateObject private var model = VisionChatViewModel()
    @State private var selectedItem: PhotosPickerItem?

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                TextField("VLM model directory", text: $model.modelPath)
                    .textFieldStyle(.roundedBorder)

                Button(model.isLoaded ? "Loaded" : "Load") {
                    Task { await model.loadModel() }
                }
                .disabled(model.isLoading)
            }

            PhotosPicker(selection: $selectedItem, matching: .images) {
                Label("Choose Photo", systemImage: "photo")
            }
            .onChange(of: selectedItem) {
                Task { await model.loadImage(selectedItem) }
            }

            if let preview = model.previewImage {
                preview
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 240)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            ScrollView {
                LazyVStack(alignment: .leading, spacing: 12) {
                    ForEach(model.turns) { turn in
                        MessageBubble(turn: turn)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            HStack(alignment: .bottom) {
                TextField("Ask about the image", text: $model.input, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...4)

                Button("Ask") {
                    Task { await model.ask() }
                }
                .disabled(!model.canAsk)
            }

            Text(model.status)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
    }
}

struct MessageBubble: View {
    let turn: VisionTurn

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(turn.role == .user ? "You" : "Assistant")
                .font(.caption)
                .foregroundStyle(.secondary)

            Text(turn.text.isEmpty ? "..." : turn.text)
                .textSelection(.enabled)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(turn.role == .user ? Color.green.opacity(0.12) : Color.gray.opacity(0.12))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct VisionTurn: Identifiable, Equatable {
    enum Role {
        case user
        case assistant
    }

    let id: UUID
    let role: Role
    var text: String

    init(id: UUID = UUID(), role: Role, text: String) {
        self.id = id
        self.role = role
        self.text = text
    }
}

@MainActor
final class VisionChatViewModel: ObservableObject {
    @Published var modelPath = "\(NSHomeDirectory())/Models/Qwen2.5-VL-3B"
    @Published var input = "What should I notice in this image?"
    @Published var previewImage: Image?
    @Published var turns: [VisionTurn] = []
    @Published var status = "Load a model and choose a photo."
    @Published var isLoading = false
    @Published var isGenerating = false
    @Published var isLoaded = false

    private let engine = VLMEngine()
    private var selectedImage: CIImage?
    private var history: [ChatMessage] = [
        .system("Answer questions about the selected image clearly.")
    ]

    var canAsk: Bool {
        isLoaded
            && selectedImage != nil
            && !input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && !isGenerating
    }

    func loadModel() async {
        guard !isLoading else { return }
        isLoading = true
        status = "Loading vision model..."
        defer { isLoading = false }

        do {
            try await engine.loadLocal(directory: URL(fileURLWithPath: modelPath))
            isLoaded = true
            status = "Choose a photo."
        } catch {
            isLoaded = false
            status = "Load failed: \(error.localizedDescription)"
        }
    }

    func loadImage(_ item: PhotosPickerItem?) async {
        guard let item else { return }

        do {
            guard let data = try await item.loadTransferable(type: Data.self),
                  let uiImage = UIImage(data: data),
                  let ciImage = CIImage(data: data)
            else {
                status = "Could not read image."
                return
            }

            previewImage = Image(uiImage: uiImage)
            selectedImage = ciImage
            turns.removeAll()
            history = [.system("Answer questions about the selected image clearly.")]
            status = isLoaded ? "Ready" : "Load a model to ask questions."
        } catch {
            status = "Image failed: \(error.localizedDescription)"
        }
    }

    func ask() async {
        let question = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let image = selectedImage, !question.isEmpty, isLoaded, !isGenerating else { return }

        input = ""
        turns.append(VisionTurn(role: .user, text: question))

        let assistantID = UUID()
        turns.append(VisionTurn(id: assistantID, role: .assistant, text: ""))

        let request = history + [.user(question)]
        var response = ""
        isGenerating = true
        status = "Generating..."
        defer { isGenerating = false }

        do {
            for try await chunk in engine.generate(
                messages: request,
                ciImages: [image],
                parameters: EdgeGenerateParameters(maxTokens: 384)
            ) {
                response += chunk.text
                updateAssistant(id: assistantID, text: response)
            }

            history = request + [.assistant(response)]
            status = "Ready"
        } catch {
            updateAssistant(id: assistantID, text: "Error: \(error.localizedDescription)")
            status = "Generation failed"
        }
    }

    private func updateAssistant(id: UUID, text: String) {
        guard let index = turns.firstIndex(where: { $0.id == id }) else { return }
        turns[index].text = text
    }
}
```

## 关键概念

- 对接受文本和图像的模型使用 `VLMEngine`。
- 当图像已经在内存中时，使用 `ciImages:` overload。
- 像文本聊天一样保留对话历史。
- 追问时附加当前图像，让模型可以把每个回答建立在所选照片上。
- 从小图像开始，并在你支持的最低配置设备上验证。

## 下一步

- 通过 [语音助手](/docs/examples/voice-assistant) 添加语音输入。
- 查看 [视觉能力指南](/docs/edge-kit/vision)。
