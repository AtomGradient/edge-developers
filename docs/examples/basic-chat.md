---
sidebar_position: 1
title: Basic Chat App
---

# Example: Basic chat app

This example builds a minimal iOS or macOS chat app that loads a local text
model and streams multi-turn replies.

## Prerequisites

- Edge Kit added to your Xcode project with Swift Package Manager.
- A local text model directory on the device or simulator.
- iOS 17 or macOS 14 or later.

For the baseline developer path, use Qwen3.5 9B 4bit. For lower-latency
iteration on constrained devices, choose a smaller supported model and keep the
same app wiring.

## Complete code

Create a new SwiftUI app target, add Edge Kit, and replace the app code with
the following:

```swift
import EdgeInference
import SwiftUI

@main
struct BasicChatExampleApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    @StateObject private var model = ChatViewModel()

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                TextField("Model directory", text: $model.modelPath)
                    .textFieldStyle(.roundedBorder)

                Button(model.isLoaded ? "Loaded" : "Load") {
                    Task { await model.loadModel() }
                }
                .disabled(model.isLoading)
            }

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        ForEach(model.turns) { turn in
                            MessageBubble(turn: turn)
                                .id(turn.id)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 8)
                }
                .onChange(of: model.turns.last?.text) {
                    if let id = model.turns.last?.id {
                        proxy.scrollTo(id, anchor: .bottom)
                    }
                }
            }

            HStack(alignment: .bottom) {
                TextField("Message", text: $model.input, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...4)

                Button("Send") {
                    Task { await model.send() }
                }
                .disabled(!model.canSend)
            }

            HStack {
                Text(model.status)
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Spacer()

                Button("Clear") {
                    model.clear()
                }
                .disabled(model.isGenerating)
            }
        }
        .padding()
    }
}

struct MessageBubble: View {
    let turn: ChatTurn

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
        .background(turn.role == .user ? Color.blue.opacity(0.12) : Color.gray.opacity(0.12))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct ChatTurn: Identifiable, Equatable {
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
final class ChatViewModel: ObservableObject {
    @Published var modelPath = "\(NSHomeDirectory())/Models/Qwen3.5-9B-4bit"
    @Published var input = ""
    @Published var turns: [ChatTurn] = []
    @Published var status = "Load a model to begin."
    @Published var isLoading = false
    @Published var isGenerating = false
    @Published var isLoaded = false

    private let engine = LLMEngine()
    private var history: [ChatMessage] = [
        .system("You are a concise, helpful assistant.")
    ]

    var canSend: Bool {
        !input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && isLoaded
            && !isGenerating
    }

    func loadModel() async {
        guard !isLoading else { return }
        isLoading = true
        status = "Loading model..."
        defer { isLoading = false }

        do {
            let url = URL(fileURLWithPath: modelPath)
            try await engine.loadLocal(directory: url)
            isLoaded = true
            status = "Ready"
        } catch {
            isLoaded = false
            status = "Load failed: \(error.localizedDescription)"
        }
    }

    func send() async {
        let text = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, isLoaded, !isGenerating else { return }

        input = ""
        turns.append(ChatTurn(role: .user, text: text))

        let assistantID = UUID()
        turns.append(ChatTurn(id: assistantID, role: .assistant, text: ""))

        let request = history + [.user(text)]
        var response = ""
        isGenerating = true
        status = "Generating..."
        defer { isGenerating = false }

        do {
            let parameters = EdgeGenerateParameters(maxTokens: 512)
            for try await chunk in engine.generate(
                messages: request,
                parameters: parameters
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

    func clear() {
        engine.clearPromptCache()
        history = [.system("You are a concise, helpful assistant.")]
        turns.removeAll()
        status = isLoaded ? "Ready" : "Load a model to begin."
    }

    private func updateAssistant(id: UUID, text: String) {
        guard let index = turns.firstIndex(where: { $0.id == id }) else { return }
        turns[index].text = text
    }
}
```

:::note
If your model lives inside the app bundle, replace the editable `modelPath`
with `Bundle.main.url(forResource:withExtension:)`.
:::

## Key concepts

- `LLMEngine` is `@MainActor`; keep UI state and engine calls on the main actor.
- `generate(messages:)` returns an async sequence of `GenerateChunk` values.
- Keep a separate `[ChatMessage]` history for the model and a UI-specific
  `ChatTurn` array for rendering.
- Reuse one engine for a conversation so prompt cache reuse can work.
- Call `clearPromptCache()` when the user starts a new conversation.

## Next steps

- Add image input with [Vision chat](/docs/examples/vision-chat).
- See the [EdgeInference API reference](/docs/api-reference/edge-inference).
