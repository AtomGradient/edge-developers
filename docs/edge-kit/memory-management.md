---
sidebar_position: 8
title: Memory Management
---

# Memory management

{/* CODEX: Write memory management guide. Cover:
  - Why memory matters on iOS (Jetsam limits are far below physical RAM)
  - Increased Memory Limit entitlement (required)
  - Automatic memory budgeting (Edge Kit handles this)
  - KVCacheMemoryPolicy: automatic KV cache sizing based on device + model
  - GPU cache: when to keep (multi-turn chat) vs release (single tasks like STT/TTS)
  - MemoryWarningHandler: how Edge Kit responds to memory pressure
  - Best practices for iOS apps
  
  Key guidance:
  - Use phys_footprint for monitoring, not os_proc_available_memory()
  - Let Edge Kit manage KV cache policy automatically
  - For single-shot tasks (transcription, synthesis), cache is released automatically
  
  DO NOT expose:
  - Specific Jetsam thresholds per device
  - MemoryBudgetPlanner algorithm
  - KV cache eviction strategy details
  - H2O window sizing logic
*/}
