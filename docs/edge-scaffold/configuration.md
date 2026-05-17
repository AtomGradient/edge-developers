---
sidebar_position: 2
title: Configuration
---

# Configuring your app

{/* CODEX: Write configuration guide. Cover:
  - ScaffoldConfig.swift — the single configuration file
  - Key settings:
    - appName, appDescription
    - defaultSystemPrompt
    - modelCategory: .llm | .vlm | .tts
    - bundleModelName (optional, for bundled models)
    - defaultTTSSpeaker (for TTS apps)
  - How UI adapts based on modelCategory
  - Model category table (LLM=text→text, VLM=text+photo→text, TTS=text→audio)
  - project.yml for xcodegen
  
  DO NOT expose:
  - Version contract internals (.min_runtime_version)
  - Export engine implementation
*/}
