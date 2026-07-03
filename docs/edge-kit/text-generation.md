---
sidebar_position: 1
title: Text Generation
---

# Text generation with LLMEngine

`LLMEngine` loads a local text model directory and streams generated text. Edge Kit applies the runtime memory policy automatically so multi-turn conversations stay bounded on device.

## Create and load

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/model")

try await engine.loadLocal(directory: modelURL)
```

For sessions that need a different memory posture, pass a high-level intent at
load time:

```swift
try await engine.loadLocal(
    directory: modelURL,
    options: NativeRuntimeLoadOptions(memoryIntent: .exactRecall)
)
```

Use `.exactRecall` with app-owned tools or fact storage for auditable facts such
as amounts, dates, and counts.

Prepare a registered `ModelConfig` with `EdgeModelKit`, then load the local cache directory:

```swift
import EdgeModelKit

guard let config = ModelConfig.find(modelID: "qwen3.5-9b-4bit") else {
    throw EdgeRuntimeError.modelNotFound("qwen3.5-9b-4bit")
}

try await HFDownloader.shared.download(config: config)
try await engine.loadLocal(directory: ModelCache.shared.cachedURL(for: config))
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

## API surface

The methods you will use most often:

| Method | What it does |
|--------|-------------|
| `LLMEngine()` | Create an engine instance. `@MainActor`. |
| `loadLocal(directory:)` | Load a model from a local path. |
| `load(config:)` | Preview metadata hook; the native default build does not perform remote downloads here. Use `EdgeModelKit` plus `loadLocal(directory:)`. |
| `generate(messages:parameters:)` | Stream `GenerateChunk` values. Async sequence. |
| `generateOnce(messages:)` | Return one accumulated string. |
| `clearPromptCache()` | Reset conversation state. |
| `lastMetrics` | TTFT, TPS, token counts after generation. |

Full signatures and types → [EdgeInference API Reference](/docs/api-reference/edge-inference)

## Try it next

- [Basic chat app](/docs/examples/basic-chat) — Complete SwiftUI app you can paste and run.
- [Vision](/docs/edge-kit/vision) — Add image understanding.
- [Model evolution](/docs/concepts/model-evolution) — Make the model adapt to the user.
