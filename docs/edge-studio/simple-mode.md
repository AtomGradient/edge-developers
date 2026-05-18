---
sidebar_position: 3
title: Simple Mode
---

# Simple mode — guided wizard

{/* CODEX: Write complete guide for Simple mode. Document EVERY step:

  ## Overview
  Simple mode is a 7-step guided wizard at /simple. Designed for first-time users.

  ## Step 0: Device AI Profile (/simple)
  DeviceProfilePage.tsx — Auto-detects hardware (chip, memory, GPU cores).
  Shows AI capability rating. Zero user interaction needed.

  ## Step 1: Focus Selection (/simple/focus)
  FocusSelectPage.tsx — "What do you want AI to do?"
  6 cards: Chat, Coding, Vision, ASR (Speech-to-Text), TTS (Text-to-Speech), Voice Duplex.
  Single click to select and advance.

  ## Step 2: Tier Selection (/simple/tier)
  TierSelectPage.tsx — Choose performance level.
  Shows Standard/Pro/Max/Ultra package cards based on device capability.
  Backend recommends tiers based on detected hardware.

  ## Step 3: Setup (/simple/setup)
  SetupPage.tsx — Downloads model(s), loads them, provides immediate experience.
  Shows download progress. After load, user can test the model immediately.
  For multi-modal selections, may download multiple models (e.g., LLM + ASR + TTS for Duplex).

  Embedded experience panels:
  - Chat panel for LLM/VLM
  - ASRPanel for speech-to-text (ASRPanel.tsx)
  - TTSPanel for text-to-speech (TTSPanel.tsx)
  - DuplexPanel for voice duplex (DuplexPanel.tsx) — speak → ASR → LLM → TTS → listen

  ## Step 4: Complete (/simple/done)
  CompletePage.tsx — Success celebration. Shows "AI Ready" state.
  CTA to start Phase 2 (export), or change model/upgrade.

  ## Phase 2 Step 1: Export Device (/simple/export/device)
  ExportDevicePage.tsx — Choose target iOS device (iPhone / iPad).
  Two large cards, single click.

  ## Phase 2 Step 2: Export Generate (/simple/export/generate)
  ExportGeneratePage.tsx — Smart adaptation for target device + ZIP export.
  Generates complete iOS app project. Shows post-export guidance.

  ## Legacy v1 wizard (/simple/v1/*)
  Note: v1 wizard (SimpleWelcome → DeviceAssessment → ModelPicker → OneClickOptimize → TestChat → SimpleExport) is retained at /simple/v1/ for backward compatibility. v2 is the current default.

  DO NOT expose: backend API endpoints, optimization algorithm details.
*/}
