---
sidebar_position: 2
title: 视觉理解
---

# 使用 VLMEngine 进行视觉语言推理

`VLMEngine` 从接受图像和文本的模型流式返回文本响应。

## 加载 VLM

```swift
import EdgeInference

let engine = VLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/vlm-model")

try await engine.loadLocal(directory: modelURL)
```

## 发送图像 URL

```swift
let imageURL = URL(fileURLWithPath: "/path/to/photo.jpg")

for try await chunk in engine.generate(
    messages: [.user("Describe this image.")],
    images: [imageURL]
) {
    print(chunk.text, terminator: "")
}
```

## 发送内存中的图像

对于已经在内存中持有图像数据的 iOS 应用，请使用 `ciImages:` overload。

```swift
let ciImage = CIImage(image: uiImage)!

for try await chunk in engine.generate(
    messages: [.user("What objects are visible?")],
    ciImages: [ciImage]
) {
    print(chunk.text, terminator: "")
}
```

## 带图像的多轮对话

包含完整对话历史。把图像附加到首次引入图像的用户轮次。

```swift
var messages: [ChatMessage] = [
    .user("Describe this image.")
]

let first = try await collect(
    engine.generate(messages: messages, images: [imageURL])
)

messages.append(.assistant(first))
messages.append(.user("Now focus on the text in the image."))

for try await chunk in engine.generate(messages: messages) {
    print(chunk.text, terminator: "")
}
```

示例 collector：

```swift
func collect(_ stream: AsyncThrowingStream<GenerateChunk, Error>) async throws -> String {
    var result = ""
    for try await chunk in stream {
        result += chunk.text
    }
    return result
}
```

## 参数

`VLMEngine` 使用与 `LLMEngine` 相同的 `EdgeGenerateParameters` 类型。

```swift
let parameters = EdgeGenerateParameters(maxTokens: 256)

for try await chunk in engine.generate(
    messages: [.user("Give a concise answer.")],
    images: [imageURL],
    parameters: parameters
) {
    print(chunk.text, terminator: "")
}
```

## 内存说明

视觉语言模型的运行时要求高于纯文本模型，因为图像处理和文本生成在同一会话中运行。请从较小图像尺寸开始，并在你支持的最低配置设备上验证。
