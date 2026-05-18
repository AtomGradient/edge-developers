---
sidebar_position: 6
title: Architecture
---

# Architecture and technology concepts

How the Edge platform layers connect, and what the core technologies mean for your app.

## Layer map

```text
┌─────────────────────────────────────────────┐
│                Your App                      │
├──────────────┬──────────────┬───────────────┤
│  Edge Kit    │  Edge Halo   │  Edge Mesh    │
│  Inference   │  Evolution   │  Multi-device │
│  SDK         │  (HALO)      │               │
├──────────────┴──────────────┴───────────────┤
│          Edge Engine — Native Runtime        │
│          (DSR Attention)                     │
└─────────────────────────────────────────────┘

Tooling (development-time, not shipped in your app):
  Edge Studio  →  Edge Scaffold  →  App project
```

**Edge Engine** is the inference runtime. It owns Metal command scheduling, tensor storage, and model-family execution. Your app never imports it directly — Edge Kit wraps it.

**Edge Kit** is the developer surface. It provides `LLMEngine`, `VLMEngine`, `TTSEngine`, `WhisperEngine`, model download, memory management, and mesh networking. This is what you `import` in your app.

**Edge Halo** is the evolution layer. Built on the patented **HALO** algorithm system, it handles user profiling, adapter lifecycle, and activation steering. It sits beside Edge Kit — your app composes both.

**Edge Mesh** is the networking layer. Local-network device discovery, capability-aware routing, adapter transfer between devices. No cloud relay.

**Edge Studio** and **Edge Scaffold** are development-time tools. Studio optimizes models. Scaffold generates app projects. Neither ships in your final binary.

## DSR Attention

DSR (Dynamic Sparse Retention) is how Edge Kit keeps multi-turn conversations fast on memory-constrained devices.

What it means for you:

- A 9B model holds stable throughput across 20 conversation turns on iPhone.
- You do not configure DSR. Edge Kit applies it automatically based on the model and device.
- Memory policy is computed at model load time. You can read it via `engine.memoryPolicy` but you should not need to override it.
- If you clear the conversation with `clearPromptCache()`, the cache resets and the next turn starts fresh.

What you observe in metrics:

| Metric | Healthy pattern |
|--------|----------------|
| TPS across turns | Stable or gradual decline, not cliff. |
| TTFT | Grows with context length, stays under 1s for typical conversations. |
| Memory footprint | Bounded, not linear growth per turn. |

## HALO (patented)

HALO is the algorithm system behind Edge Halo's on-device continuous learning.

What it means for you:

- Your app collects interaction events (feedback, corrections, session completions).
- HALO extracts a local user profile — a geometric representation of preferences, not keywords.
- Adapters are trained on the user's Mac and transferred via mesh. No data leaves the user's devices.
- Activation steering lets you adjust model behavior for a session without retraining.
- The user can roll back to the base model at any time.

The industry context: Google, OpenAI, and Anthropic are exploring continuous learning in the cloud. HALO solves it on-device — privacy by architecture, not policy.

## Data boundaries

| Data | Where it lives | Leaves device? |
|------|----------------|---------------|
| Model weights | App bundle or local download | No |
| KV cache | GPU memory | No |
| Conversation history | App-managed local storage | No |
| User profile (HALO) | App-managed local storage | No |
| Trained adapter | User's Mac → mesh → device | Only within user's own devices |
| Optimization artifacts | Edge Studio export | Developer's machine only |

## Platform architecture

Edge is designed as a cross-platform system. The current release targets Apple (iOS 17+, macOS 14+). The runtime abstraction layer supports additional backends — Android, Linux, HarmonyOS, and Windows are on the roadmap.
