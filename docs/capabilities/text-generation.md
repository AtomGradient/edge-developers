---
sidebar_position: 1
title: Text Generation
---

# Text generation with LLMEngine

`LLMEngine` loads a local or registered text model and streams generated text.

## Create and load

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/model")

try await engine.loadLocal(directory: modelURL)
```

Load from a registered `ModelConfig`:

```swift
guard let config = ModelConfig.find(modelID: "qwen3.5-0.8b") else {
    throw EdgeRuntimeError.modelNotFound("qwen3.5-0.8b")
}

try await engine.load(config: config)
```

## Generate streaming text

```swift
let messages: [ChatMessage] = [
    .system("You are concise."),
    .user("Explain on-device AI in one sentence.")
]

for try await chunk in engine.generate(messages: messages) {
    print(chunk.text, terminator: "")
}
```

## Messages

| Helper | Role |
| --- | --- |
| `.system("...")` | System instruction |
| `.user("...")` | User message |
| `.assistant("...")` | Previous assistant output |
| `.tool("...")` | Tool result for a follow-up turn |

## Parameters

```swift
let parameters = EdgeGenerateParameters(
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 512
)

for try await chunk in engine.generate(
    messages: [.user("Write a haiku about local AI.")],
    parameters: parameters
) {
    print(chunk.text, terminator: "")
}
```

Edge Kit applies automatic memory management on top of the parameters unless you explicitly use low-level overrides for testing.

## Multi-turn conversations

Keep one engine instance for a conversation. Edge Kit manages prompt cache reuse automatically.

```swift
var history: [ChatMessage] = [
    .user("Give me three app ideas.")
]

let first = try await engine.generateOnce(messages: history)
history.append(.assistant(first))
history.append(.user("Make the second one more specific."))

for try await chunk in engine.generate(messages: history) {
    print(chunk.text, terminator: "")
}
```

Clear conversation state when starting over:

```swift
engine.clearPromptCache()
```

## LoRA adapters

```swift
let adapterURL = URL(fileURLWithPath: "/path/to/adapter")

try await engine.loadLoRA(adapterPath: adapterURL)
print(engine.hasLoRAAdapter)

engine.unloadLoRA()
```

## Metrics

After generation completes, read `lastMetrics`.

```swift
if let metrics = engine.lastMetrics {
    print("TTFT:", metrics.ttftMs)
    print("Decode TPS:", metrics.decodeTPS)
    print("Generated tokens:", metrics.generationTokenCount)
}
```

## SwiftUI example

```swift
import EdgeInference
import SwiftUI

@MainActor
final class ChatViewModel: ObservableObject {
    @Published var output = ""
    @Published var isLoading = false

    private let engine = LLMEngine()

    func load(modelURL: URL) async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await engine.loadLocal(directory: modelURL)
        } catch {
            output = error.localizedDescription
        }
    }

    func send(_ text: String) async {
        output = ""

        do {
            for try await chunk in engine.generate(messages: [.user(text)]) {
                output += chunk.text
            }
        } catch {
            output = error.localizedDescription
        }
    }
}

struct ChatView: View {
    @StateObject private var model = ChatViewModel()
    @State private var prompt = "What is edge AI?"

    var body: some View {
        VStack {
            TextEditor(text: $prompt)
            Button("Send") {
                Task { await model.send(prompt) }
            }
            ScrollView {
                Text(model.output)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding()
    }
}
```
