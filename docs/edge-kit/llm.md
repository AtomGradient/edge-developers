---
sidebar_position: 3
title: Text Generation (LLM)
---

# Text generation with LLMEngine

{/* CODEX: Write LLM guide. Cover:
  - LLMEngine class overview (@MainActor, ObservableObject)
  - Loading a model: engine.load(from: path) or engine.load(config:)
  - Streaming generation: for try await chunk in engine.generate(messages:)
  - ChatMessage types: .system(), .user(), .assistant()
  - Multi-turn conversation (prompt cache automatic)
  - EngineState: .idle, .loading, .ready, .generating
  - Published properties: state, loadedConfig, lastMetrics
  - InferenceMetrics: tokensPerSecond, timeToFirstToken, totalTokens
  - Clearing conversation: engine.clearPromptCache()
  - LoRA adapter: engine.loadLoRA(path:)
  
  Show complete SwiftUI example.
  
  DO NOT expose:
  - InferencePolicy internals
  - KVCacheMemoryPolicy computation logic
  - H2O or DSR attention details
  - MemoryBudgetPlanner internals
  - DeviceProfile detection logic
*/}
