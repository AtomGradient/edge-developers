---
sidebar_position: 1
title: Overview
---

# Edge Engine **Developer Preview**

{/* CODEX: Write overview for Edge Engine. Key points:
  - Native Metal inference runtime purpose-built for Apple Silicon
  - Foundation layer that Edge Kit builds upon
  - Owns: Metal command scheduling, tensor/storage abstractions, model-family inference code
  - Supports Qwen3.5/Qwen3.6, ASR, TTS model families
  - NOT a general-purpose ML framework — focused on inference
  - No dependency on upstream mlx-swift

  DO NOT expose:
  - ANE scheduling algorithms
  - Disaggregated inference architecture internals
  - Metal kernel implementations
  - Memory management strategies
  - Any benchmark numbers comparing to competitors
*/}
