---
sidebar_position: 1
title: 文本生成
---

# 使用 LLMEngine 进行文本生成

`LLMEngine` 加载本地或已注册的文本模型，并流式生成文本。

## 创建并加载

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/model")

try await engine.loadLocal(directory: modelURL)
```

从已注册的 `ModelConfig` 加载：

```swift
guard let config = ModelConfig.find(modelID: "qwen3.5-0.8b") else {
    throw EdgeRuntimeError.modelNotFound("qwen3.5-0.8b")
}

try await engine.load(config: config)
```

## 生成流式文本

```swift
let messages: [ChatMessage] = [
    .system("You are concise."),
    .user("Explain on-device AI in one sentence.")
]

for try await chunk in engine.generate(messages: messages) {
    print(chunk.text, terminator: "")
}
```

## 消息

| Helper | 角色 |
| --- | --- |
| `.system("...")` | 系统指令 |
| `.user("...")` | 用户消息 |
| `.assistant("...")` | 之前的助手输出 |
| `.tool("...")` | 后续轮次使用的工具结果 |

## 参数

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

除非你为了测试显式使用低层 override，Edge Kit 会在这些参数之上应用自动内存管理。

## 多轮对话

一次对话保留一个 engine 实例。Edge Kit 会自动管理提示缓存复用。

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

开始新对话时清理对话状态：

```swift
engine.clearPromptCache()
```

## LoRA 适配器

```swift
let adapterURL = URL(fileURLWithPath: "/path/to/adapter")

try await engine.loadLoRA(adapterPath: adapterURL)
print(engine.hasLoRAAdapter)

engine.unloadLoRA()
```

## 指标

生成完成后读取 `lastMetrics`。

```swift
if let metrics = engine.lastMetrics {
    print("TTFT:", metrics.ttftMs)
    print("Decode TPS:", metrics.decodeTPS)
    print("Generated tokens:", metrics.generationTokenCount)
}
```

## SwiftUI 示例

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
