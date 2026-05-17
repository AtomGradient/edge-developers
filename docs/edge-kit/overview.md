---
sidebar_position: 1
title: Overview
---

# Edge Kit **Developer Preview**

{/* CODEX: Write overview for Edge Kit. Key points:
  - Swift SDK for on-device AI inference on Apple Silicon
  - 7 modules: EdgeKit (umbrella), EdgeInference, EdgeModelKit, EdgeVoice, EdgeMesh, EdgeData, EdgeUI
  - Supports 4 model categories: LLM, VLM (vision-language), ASR (speech-to-text), TTS (text-to-speech)
  - Multi-turn conversation with streaming output
  - Automatic device capability detection and memory management
  - LoRA adapter support for personalized models
  - Built on Edge Engine
  
  Show the module map:
    EdgeKit (umbrella)
    ├── EdgeInference — LLM, VLM, TTS engines + inference policy
    ├── EdgeModelKit — Model download, cache, tier management
    ├── EdgeVoice — Audio recording + WhisperEngine (ASR)
    ├── EdgeMesh — Device mesh networking
    ├── EdgeData — Data collection + classification
    └── EdgeUI — SwiftUI components

  DO NOT expose:
  - H2O attention implementation details
  - KV cache eviction algorithms
  - ANE/GPU scheduling internals
  - Pruning metadata internals
  - RPP math internals (that's edge-halo territory)
*/}
