---
sidebar_position: 2
title: User Profiling
---

# User profiling

{/* CODEX: Write profiling guide. Cover:
  - What user profiling does: extracts a geometric representation of user preferences from model activations
  - UserProfile struct: directions, directionNames, narrative, sampleCount, stabilityScore
  - Running profile analysis: halo.runProfileAnalysis(data:)
  - Profile narrative: LLM-generated human-readable summary
  - Stability score: confidence measure (0-1)
  - When to run profiling (after sufficient user data)
  - Profiles are local-only, never transmitted
  
  Show example: initialize EdgeHalo, run profiling, read results.
  
  DO NOT expose:
  - RPP pipeline steps
  - A-matrix / B-matrix concepts
  - PCA computation
  - Hidden state capture mechanics
  - Specific layer targeting
  - Gram-Schmidt process
*/}
