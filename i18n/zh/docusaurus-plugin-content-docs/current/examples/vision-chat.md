---
sidebar_position: 2
title: Vision Chat
---

# Example: Vision chat

This example builds an iOS app that lets the user pick a photo and ask
follow-up questions about it.

## Prerequisites

- Edge Kit added with Swift Package Manager.
- A local vision-language model directory.
- iOS 17 or later.

Add photo-library access text to your app if your product needs broader photo
access. `PhotosPicker` can also run with the limited picker flow.

## Complete code

Create a new iOS SwiftUI app target, add Edge Kit, and replace the app code
with the following:

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

## Key concepts

- Use `VLMEngine` for models that accept text and images.
- Use the `ciImages:` overload when the image is already in memory.
- Keep the conversation history just like text chat.
- Attach the current image when asking follow-up questions so the model can
  ground each answer in the selected photo.
- Start with small images and validate on the minimum device you support.

## Next steps

- Add speech input with [Voice assistant](/docs/examples/voice-assistant).
- See the [Vision capability guide](/docs/capabilities/vision).
