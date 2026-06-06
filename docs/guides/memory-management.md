---
sidebar_position: 8
title: Memory Management
---

# Memory management

Edge Kit manages model and generation memory automatically, but app-level choices still matter.

## Why iOS memory is different

iOS can terminate an app before physical RAM is exhausted. Treat the process footprint and real-device behavior as the source of truth.

For larger models, enable the Increased Memory Limit entitlement.

## What Edge Kit manages

| Area | Behavior |
| --- | --- |
| Model load | Checks the model against the current device before loading. |
| KV cache | Applies automatic KV cache management for text generation. |
| Prompt cache | Reuses conversation context across turns. |
| Memory pressure | Responds to system memory warnings. |
| Single-shot tasks | Releases temporary buffers after STT and TTS style workloads. |

## Choose a memory intent

For conversational agents, declare a product-level intent and let Edge Kit plan
the low-level cache policy:

| Intent | Use when |
| --- | --- |
| `.balanced` | Default for most chat sessions. |
| `.longSession` | You want to preserve more resident context when the device budget allows it. |
| `.exactRecall` | The session often asks about amounts, dates, counts, or audit-style facts. Use this with app-owned tool or fact-store recall for exact data. |
| `.batteryFriendly` | You want lower resident-state pressure for thermal or battery-sensitive flows. |

```swift
let options = NativeRuntimeLoadOptions(memoryIntent: .longSession)
try await engine.loadLocal(directory: modelURL, options: options)
```

Do not tune DSR windows or memory environment variables as product API. Those
knobs are diagnostic and experimental. For exact facts, keep a tool or fact
store as the source of truth rather than relying on conversation memory alone.

## Conversation cache

Keep the prompt cache for one conversation:

```swift
for try await chunk in engine.generate(messages: history) {
    print(chunk.text, terminator: "")
}
```

Clear it when a new conversation starts:

```swift
engine.clearPromptCache()
```

## Unload unused engines

```swift
engine.unload()
```

For TTS, use `unloadAsync()` if a streaming generation may still be running:

```swift
await ttsEngine.unloadAsync()
```

## App best practices

- Test on the lowest-memory device you support.
- Use Release builds for memory validation.
- Avoid loading multiple large engines at the same time.
- Downscale images before sending them to a VLM when full resolution is not needed.
- Keep long-running generations cancellable.
- Use process physical footprint for debugging.

## Common symptoms

| Symptom | What to check |
| --- | --- |
| App exits during load | Model is too large for the target device or entitlement is missing. |
| First turn is slow | Cold model load or long prompt prefill. |
| Later turns slow down | Conversation history is growing; summarize or clear when appropriate. |
| VLM fails on images | Try smaller images and validate device memory. |
