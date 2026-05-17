---
sidebar_position: 4
title: Vision Language (VLM)
---

# Vision-language inference with VLMEngine

{/* CODEX: Write VLM guide. Cover:
  - VLMEngine class overview
  - Loading a VLM model
  - Sending image + text: messages with image attachment
  - Multi-turn with images
  - Supported models: Qwen3.5-VLM family
  - Memory considerations for VLM (vision encoder is large)
  - Streaming output same pattern as LLM
  
  Show complete example: load image from PhotosPicker, send to VLM, stream response.
  
  DO NOT expose:
  - Vision encoder offload strategy
  - Deferred loading internals
  - Phased loading architecture
*/}
