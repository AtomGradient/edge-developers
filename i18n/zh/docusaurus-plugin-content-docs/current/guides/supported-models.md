---
sidebar_position: 1
title: 支持的模型
---

# 支持的模型

Edge Kit 支持符合各 engine 预期模型家族布局的本地模型目录。

> **开发者预览**
>
> 在开发者预览期间，模型支持范围正在扩展。发布前请在目标设备类别上验证每个模型。

## 类别

| 类别 | Engine | 输入 | 输出 |
| --- | --- | --- | --- |
| LLM | `LLMEngine` | 文本消息 | 流式文本 |
| VLM | `VLMEngine` | 文本消息和图像 | 流式文本 |
| STT | 原生 ASR 使用 `STTEngine`；`WhisperEngine` 仅作为 预览桥接 | 音频 | 文本 |
| TTS | `TTSEngine` | 文本 | PCM 音频 |

## 推荐预览模型

| 类别 | 推荐起点 |
| --- | --- |
| LLM | Qwen3-4B-4bit、Qwen3.5-0.8B、Qwen3.5-4B-4bit、Qwen3.5-9B-4bit |
| VLM | Qwen3.5-4B-4bit VLM variant |
| STT | `STTEngine` 使用 Qwen3-ASR-0.6B-8bit；Whisper-family 文件只适用于 app 已提供真实 Whisper binding 的场景 |
| TTS | Qwen3-TTS-12Hz-0.6B-CustomVoice-bf16 |

## 设备适配

| 模型大小 | 推荐设备类别 |
| --- | --- |
| 0.8B | 任意 Apple Silicon 设备 |
| 4B | 建议 8 GB 或更多统一内存 |
| 9B | 建议 16 GB 或更多统一内存，或已验证的高内存 iOS 设备 |

iOS 内存限制低于物理 RAM。请在你计划支持的确切设备类别上测试。

## 模型来源

预览模型通过 Hugging Face 分发。Edge Kit 可以从以下来源加载：

- 已包含模型文件的本地目录。
- 指向 Hugging Face repository 的 `ModelConfig` 条目。
- 从 Edge Studio 导出的模型。

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/model")

try await engine.loadLocal(directory: modelURL)
```

## 自定义模型

使用与受支持模型家族兼容的 safetensors-format 模型。为了获得最佳结果：

- 将 tokenizer 文件放在 `config.json` 旁边。
- 测试生成、内存使用和卸载/重新加载行为。
- 当你需要 Edge Kit-ready bundle 时，通过 Edge Studio 导出。
