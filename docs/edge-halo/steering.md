---
sidebar_position: 4
title: Activation Steering
---

# Activation steering

{/* CODEX: Write steering guide. Cover:
  - What activation steering does: adjust model behavior in real-time without retraining
  - Inject direction vectors into model layers during inference
  - Use cases: adjust tone, formality, verbosity, domain focus
  - HaloEngineSession protocol: injectSteering(vectors:layers:scales:), removeSteering()
  - Steering is ephemeral — removed when inference session ends
  - Can combine with adapters (steering for fine adjustment, adapter for major personality)
  
  Show example: inject steering vector, generate with adjusted behavior, remove.
  
  DO NOT expose:
  - Specific layer numbers
  - Direction extraction method
  - Scale calibration
  - Interaction with H2O attention
*/}
