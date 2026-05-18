---
sidebar_position: 7
title: Chat & Voice
---

# Chat and voice testing

{/* CODEX: Write guide for chat/voice pages:

  ## Chat (/chat)
  Chat.tsx — Multi-modal chat with the loaded model.
  Supports 4 modes based on model category:
  - **LLM mode**: Text-in, text-out streaming chat
  - **VLM mode**: Image + text input, text output (photo picker for images)
  - **STT mode**: Audio input, text output (speech transcription)
  - **TTS mode**: Text input, audio output (speech synthesis with speaker selection)

  Features:
  - Streaming token output
  - Multi-turn conversation
  - System prompt configuration
  - Temperature and parameter controls
  - Message history

  ## Duplex Chat (/duplex)
  DuplexChat.tsx — Expert-mode voice duplex.
  Full voice conversation loop: speak → ASR → LLM → TTS → listen.
  Requires ASR + LLM + TTS models loaded.
  Features: push-to-talk or voice activity detection, continuous conversation.

  Use case: Test the complete voice interaction pipeline before deploying to an app.

  DO NOT expose: WebSocket protocol details, internal message format, inference pipeline implementation.
*/}
