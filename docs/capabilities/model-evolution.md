---
sidebar_position: 5
title: Model Evolution
---

# Model evolution

{/* CODEX: Merge and rewrite edge-halo/overview.md + profiling.md + adapters.md + steering.md into ONE task-focused capability page.

  Anthropic/OpenAI style: focus on WHAT THE DEVELOPER CAN DO, not what the module is.

  Structure:
  ## What model evolution does
  Brief: models that grow with users. 3 capabilities: profiling, adapters, steering.

  ## User profiling
  - What it does (extract user preference geometry — keep generic)
  - Code example: initialize EdgeHalo, run profiling, read UserProfile
  - UserProfile properties: directions, directionNames, narrative, stabilityScore

  ## Adapter lifecycle
  - What adapters are (lightweight customizations trained from user data)
  - Code example: validate adapter, apply, rollback
  - AdapterVersion, AdapterDecision types
  - Training on Mac, transfer via Mesh

  ## Activation steering
  - What it does (adjust model behavior in real-time without retraining)
  - Code example: inject steering, generate, remove
  - Use cases: tone, formality, domain focus

  ## Evolution state machine
  idle → collecting → readyToTrain → training → validating → evolved

  ## Architecture
  V-shape: App composes edge-kit + edge-halo, both depend on edge-engine.

  ## Privacy
  All data stays on device. Training on user's Mac. Adapter transfer via local mesh only.

  Read existing content from docs/edge-halo/*.md for reference.

  DO NOT EXPOSE: RPP algorithm, A/B matrix, Gram-Schmidt, PCA math, specific layer numbers.
*/}
