---
sidebar_position: 3
title: Voice Assistant
---

# Example: Voice assistant

{/* CODEX: Write an example showing full voice duplex: speak → ASR → LLM → TTS → listen.

  ## What this example builds
  A voice conversation app using three models together.

  ## Architecture
  ```
  Microphone → WhisperEngine (ASR) → LLMEngine → TTSEngine → Speaker
  ```

  ## Complete code
  Show the pipeline:
  1. Record audio (AudioRecorder or file)
  2. Transcribe with WhisperEngine
  3. Send transcript to LLMEngine as user message
  4. Generate response text
  5. Synthesize speech with TTSEngine
  6. Play audio

  Use real APIs from EdgeVoice (WhisperEngine, AudioRecorder) + EdgeInference (LLMEngine, TTSEngine).

  ## Key concepts
  Three-model pipeline, sequential async, memory budget for 3 models.

  DO NOT EXPOSE any internal pipeline details.
*/}
