---
sidebar_position: 4
title: Personalized Model
---

# Example: Personalized model

{/* CODEX: Write an example showing the model evolution workflow with EdgeHalo.

  ## What this example builds
  An app where the model adapts to user preferences over time.

  ## Complete code
  Show the full lifecycle:
  1. Set up EdgeHalo with engine + generator protocols
  2. Collect user data events (HaloDataEvent)
  3. Check evolution state
  4. Run profile analysis → get UserProfile
  5. Apply an adapter (after Mac-side training)
  6. Use steering for fine adjustments
  7. Roll back if quality degrades

  Use real APIs from EdgeHalo: EdgeHalo actor, HaloTextGenerator, HaloEngineSession, EvolutionState, UserProfile, AdapterVersion.

  ## Key concepts
  V-shape architecture, protocol bridging, evolution state machine, local-only data.

  DO NOT EXPOSE RPP algorithm, A/B matrix, PCA math, specific layer numbers.
*/}
