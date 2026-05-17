---
sidebar_position: 1
title: Overview
---

# Edge Halo **Developer Preview**

{/* CODEX: Write overview for Edge Halo. Key points:
  - Model self-evolution module — makes models grow with users
  - V-shape architecture: edge-halo and edge-kit are siblings, both depend on edge-engine
  - App is the composition point that wires inference + evolution
  - Core capabilities:
    1. User profiling — extract geometric representation of user preferences
    2. Adapter lifecycle — version management, validation, A/B testing, rollback
    3. Activation steering — real-time direction injection into inference
    4. Evolution strategy — when to trigger retraining
  - EdgeHalo actor: main entry point
  - EvolutionState: idle → collecting → readyToTrain → training → validating → evolved
  - Data never leaves device — training happens on user's Mac via Mesh
  
  Architecture diagram:
        App
       /   \
  edge-kit  edge-halo
       \   /
    edge-engine

  DO NOT expose:
  - RPP algorithm details (Residual PCA math)
  - A/B matrix computation
  - Gram-Schmidt orthogonalization steps
  - Bootstrap stability algorithm
  - Specific layer numbers or model internals
*/}
