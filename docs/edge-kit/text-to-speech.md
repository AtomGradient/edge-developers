---
sidebar_position: 6
title: Text to Speech (TTS)
---

# Text-to-speech with TTSEngine

{/* CODEX: Write TTS guide. Cover:
  - TTSEngine class overview
  - Loading a TTS model (Qwen3-TTS family)
  - Generating speech: engine.synthesize(text:speaker:)
  - Available speakers
  - TTSEvent streaming: .audioChunk, .complete
  - AudioChunkResult and AudioResult types
  - Playing audio output
  - Import: import EdgeInference (TTSEngine is in EdgeInference module)
  
  Show complete example: synthesize text, play audio.
  
  DO NOT expose:
  - Streaming decode internals
  - DAC architecture
  - RTF calculation logic
*/}
