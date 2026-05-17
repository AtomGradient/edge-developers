---
sidebar_position: 1
title: Overview
---

# Edge Scaffold **Developer Preview**

{/* CODEX: Write overview for Edge Scaffold. Key points:
  - Ready-to-ship iOS app template
  - Edge Studio exports optimized model → Edge Scaffold generates complete Xcode project
  - Includes: onboarding flow, chat UI, VLM photo picker, TTS playback, settings
  - Four-tier model loading: Cache → Bundle → ODR → HuggingFace
  - Automatic device capability detection
  - One config file (ScaffoldConfig.swift) controls everything
  - Powered by Edge Kit for inference
  - Supports 3 model categories: LLM, VLM, TTS (UI auto-adapts)
  
  Pipeline:
    Edge Studio (optimize) → Edge Scaffold (template) + Edge Kit (SDK) → App Store
  
  DO NOT expose:
  - Internal xcodegen configuration
  - pbxproj manipulation details
  - ODR implementation details
*/}
