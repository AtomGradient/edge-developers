---
sidebar_position: 2
title: Performance Tuning
---

# Performance tuning

{/* CODEX: Write performance tuning guide. Cover:
  - Measuring performance: InferenceMetrics (TPS, TTFT, total tokens)
  - Device thermal state affects performance (use cooling for benchmarks)
  - Debug vs Release builds: 2-10x performance difference — always benchmark in Release
  - Model size selection: larger model = better quality but slower
  - Memory pressure: monitor with phys_footprint, not os_proc_available_memory()
  - Multi-turn conversation: prompt cache speeds up subsequent turns
  - Tips:
    - Use quantized models (4-bit) for best speed/quality tradeoff
    - Use bf16 models for training, quantized for inference
    - Release builds only for performance measurement
  
  DO NOT expose:
  - maxOps tuning
  - syncEval strategy
  - ANE scheduling parameters
  - H2O window sizing
  - Specific TPS numbers per device
*/}
