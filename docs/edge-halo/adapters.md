---
sidebar_position: 3
title: Adapter Lifecycle
---

# Adapter lifecycle management

{/* CODEX: Write adapter lifecycle guide. Cover:
  - What adapters are: lightweight model customizations trained from user data
  - AdapterVersion: version, hash, baseModelID, trainedAt
  - AdapterDecision: apply, validateFirst, rejectIncompatible, rejectOutdated
  - Applying an adapter: halo.applyAdapter(offer)
  - Rollback: halo.rollback()
  - A/B validation before applying
  - Version management (monotonic versioning)
  - Training happens on Mac, adapter transferred via Mesh to iPhone/iPad
  
  Show example: receive adapter offer, validate, apply, rollback if needed.
  
  DO NOT expose:
  - LoRA rank/layer details
  - Training data format
  - DPO/SFT specifics
  - Merge strategy
*/}
