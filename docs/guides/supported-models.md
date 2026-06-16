---
sidebar_position: 1
title: Supported Models
---

# Supported models

Edge Kit supports local model directories that follow the expected model family layout for each engine.

> **Developer Preview**
>
> Model support is expanding during Developer Preview. Validate each model on the target device class before shipping.

## Categories

| Category | Engine | Input | Output |
| --- | --- | --- | --- |
| LLM | `LLMEngine` | Text messages | Streaming text |
| VLM | `VLMEngine` | Text messages and images | Streaming text |
| STT | `STTEngine` for native ASR; `WhisperEngine` only as a preview bridge | Audio | Text |
| TTS | `TTSEngine` | Text | PCM audio |

## Recommended preview models

| Category | Recommended starting point |
| --- | --- |
| LLM | Qwen3-4B-4bit, Qwen3.5-0.8B, Qwen3.5-4B-4bit, Qwen3.5-9B-4bit |
| VLM | Qwen3.5-4B-4bit VLM variant |
| STT | Qwen3-ASR-0.6B-8bit for `STTEngine`; Whisper-family files only when your app supplies a real Whisper binding |
| TTS | Qwen3-TTS-12Hz-0.6B-CustomVoice-bf16 |

## Device fit

| Model size | Recommended device class |
| --- | --- |
| 0.8B | Any Apple Silicon device |
| 4B | 8 GB or more unified memory recommended |
| 9B | 16 GB or more unified memory recommended, or a validated high-memory iOS device |

iOS memory limits are lower than physical RAM. Test on the exact device class you plan to support.

## Model source

Preview models are distributed through Hugging Face. Edge Kit can load from:

- A local directory that already contains the model files.
- A `ModelConfig` entry that points to a Hugging Face repository.
- A model exported from Edge Studio.

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/model")

try await engine.loadLocal(directory: modelURL)
```

## Custom models

Use safetensors-format models compatible with the supported model families. For best results:

- Keep tokenizer files next to `config.json`.
- Test generation, memory use, and unload/reload behavior.
- Export through Edge Studio when you need an Edge Kit-ready bundle.
