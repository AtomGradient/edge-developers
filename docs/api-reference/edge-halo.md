---
sidebar_position: 5
title: EdgeHalo
---

# EdgeHalo API Reference

{/* CODEX: Write API reference for EdgeHalo module.

  ## EdgeHalo (actor)
  - init(engine:generator:dataStream:)
  - evolutionState: EvolutionState
  - currentProfile: UserProfile?
  - activeAdapter: AdapterVersion?
  - runProfileAnalysis(data:) → UserProfile
  - applyAdapter(offer:) → void
  - rollback() → void

  ## Protocols
  - HaloTextGenerator: tokenize(_:), generate(prompt:maxTokens:)
  - HaloEngineSession: injectLoRA(adapterPath:scale:), removeLoRA(), captureHiddenState(tokens:layer:), injectSteering(vectors:layers:scales:), removeSteering()

  ## Types
  - EvolutionState: idle, collecting, readyToTrain, training, validating, evolved
  - CollectionProgress: collected, threshold, daysSinceLastTraining
  - AdapterVersion: version, hash, baseModelID, trainingDataHash, trainedAt
  - AdapterDecision: apply, validateFirst, rejectIncompatible, rejectOutdated
  - UserProfile: directions, directionNames, narrative, sampleCount, stabilityScore
  - HaloDataEvent: feedback, correction, sessionCompleted

  Format as Anthropic-style API reference.
  
  DO NOT expose:
  - RPPMath internals
  - RPPRunner implementation
  - A/B matrix details
  - Bootstrap algorithm
*/}
