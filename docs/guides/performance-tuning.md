---
sidebar_position: 2
title: Performance Tuning
---

# Performance tuning

Measure performance with the metrics Edge Kit records after generation. Edge Kit's inference path uses **DSR Attention** to keep throughput stable across long multi-turn conversations.

## Read inference metrics

`LLMEngine` and `VLMEngine` expose `lastMetrics` after a generation completes.

```swift
for try await chunk in engine.generate(messages: [.user("Summarize this.")]) {
    print(chunk.text, terminator: "")
}

if let metrics = engine.lastMetrics {
    print("TTFT:", metrics.ttftMs)
    print("Decode TPS:", metrics.decodeTPS)
    print("Prompt tokens:", metrics.promptTokenCount)
    print("Generated tokens:", metrics.generationTokenCount)
    print("Memory delta:", metrics.memoryDeltaMB)
}
```

## Benchmark in Release

Debug builds can be much slower than Release builds. Always collect benchmark numbers from:

- A Release configuration.
- The real target device.
- A cooled device with stable thermal state.
- The same prompt and model across runs.

## Choose the model size first

Larger models can improve quality, but they also increase load time, memory pressure, and per-token cost.

| Goal | Recommendation |
| --- | --- |
| Lowest latency | Start with a 0.8B or small 4-bit model. |
| Balanced chat quality | Start with a 4B 4-bit model. |
| Highest local quality | Use a larger model only on validated high-memory devices. |
| Training or adapter work | Keep higher-precision source models on a Mac. |

## Use prompt cache for conversations

Multi-turn LLM and VLM conversations reuse conversation context automatically. Keep the same engine instance for one conversation, then clear the cache when the user starts a new one.

```swift
engine.clearPromptCache()
```

## Monitor process footprint

Use process physical footprint when debugging memory pressure. Available-memory APIs can be misleading on iOS because system limits are lower than physical RAM.

## Reference benchmarks

Real-device measurements with Qwen3.5 models, 20-turn conversation stress tests:

| Device | Model | First turn | Median | T20 | TTFT |
|--------|-------|-----------|--------|-----|------|
| iPhone 17 (A19, 11GB) | 9B-4bit | 12.6 TPS | 11.6 TPS | 10.8 TPS | 566ms |
| iPhone Air (A19, 11GB) | 9B-4bit | 9.5 TPS | 7.8 TPS | 7.5 TPS | 918ms |
| iPhone 17 (A19, 11GB) | 4B-4bit | 21.8 TPS | 19.6 TPS | 17.3 TPS | 420ms |

Custom engine prefill vs generic framework (M2 Ultra 192GB):

| Workload | Edge Engine | Generic | Speedup |
|----------|-----------|---------|---------|
| Text prefill (4B) | 1,305 TPS | 187 TPS | 7× |
| Text prefill (9B) | 843 TPS | 122 TPS | 6.9× |
| VLM image prefill (4B) | 1,803 TPS | 851 TPS | 2.1× |
| VLM image prefill (9B) | 1,234 TPS | 511 TPS | 2.4× |

Use these numbers as orientation. Your results will vary based on model, device thermal state, and conversation length.

## Practical checklist

- Use quantized models for interactive inference.
- Prefer local model directories during development for repeatable tests.
- Keep one active generation per engine instance.
- Unload unused engines before switching model categories.
- Re-run benchmarks after changing model size, build configuration, or target device.
