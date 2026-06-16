---
sidebar_position: 1
title: 基础聊天应用
---

# 示例：基础聊天应用

本示例构建一个最小 iOS 或 macOS 聊天应用：加载本地文本模型，并流式生成多轮回复。

## 前置条件

- 已通过 Swift Package Manager 将 Edge Kit 添加到 Xcode 项目。
- 设备或模拟器上有本地文本模型目录。
- iOS 17 或 macOS 14 或更高。

基准开发路径使用 Qwen3.5 9B 4bit。如果是在受限设备上追求更低延迟迭代，可以选择更小的受支持模型，但 app wiring 保持一致。

## 完整代码

创建新的 SwiftUI app target，添加 Edge Kit，并将 app 代码替换为以下内容：

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
如果模型位于 app bundle 中，请将可编辑的 `modelPath` 替换为 `Bundle.main.url(forResource:withExtension:)`。
:::

## 关键概念

- `LLMEngine` 是 `@MainActor`；请将 UI 状态和 engine 调用保持在 main actor 上。
- `generate(messages:)` 返回由 `GenerateChunk` 值组成的 async sequence。
- 为模型保留独立的 `[ChatMessage]` history，并为渲染保留 UI-specific `ChatTurn` 数组。
- 一次对话复用一个 engine，以便提示缓存可以复用。
- 当用户开始新对话时调用 `clearPromptCache()`。

## 下一步

- 通过 [视觉聊天](/docs/examples/vision-chat) 添加图像输入。
- 查看 [EdgeInference API 参考](/docs/api-reference/edge-inference)。
