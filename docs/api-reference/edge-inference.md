---
sidebar_position: 1
title: EdgeInference
---

# EdgeInference API Reference

{/* CODEX: Write API reference for EdgeInference module. Anthropic docs style — clean, structured.
  
  Cover these public types with their public properties and methods:

  ## LLMEngine
  - @MainActor public final class LLMEngine: ObservableObject
  - Properties: state, loadedConfig, lastMetrics, lastPolicy, memoryPolicy, promptCache
  - Methods: load(from:), load(config:), generate(messages:parameters:), clearPromptCache(), loadLoRA(path:)
  - EngineState: .idle, .loading(progress), .ready, .generating, .error(Error)

  ## VLMEngine
  - @MainActor public final class VLMEngine: ObservableObject
  - Similar pattern to LLMEngine but with image support

  ## TTSEngine
  - @MainActor public final class TTSEngine: ObservableObject
  - Methods: synthesize(text:speaker:), load(from:)
  - TTSEvent: .audioChunk(AudioChunkResult), .complete(AudioResult)

  ## EdgeRuntime
  - public final class EdgeRuntime — unified runtime manager
  - AnyEngine wrapper

  ## Supporting Types
  - ChatMessage, ModelConfig, InferenceMetrics, InferencePolicy
  - ModelCategory: .llm, .vlm, .asr, .tts
  - LoRAAdapter, AdapterMetadata
  - DeviceProfile
  - KVCacheMemoryPolicy (mention exists, don't detail internals)

  Format: For each type, show declaration, description, properties table, methods table.
  Use Swift code blocks for signatures.
  
  DO NOT expose:
  - InferenceAutoTuner internals
  - MemoryBudgetPlanner API
  - NativeQwenH2OPolicyPlanner
  - NativeRuntimeBridge
  - RPPMath (that's edge-halo docs)
  - RPPRunner
  - ActivationSteering internals
  - HiddenStatesCapture
  - Any private/internal members
*/}
