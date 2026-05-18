---
sidebar_position: 3
title: Simple Mode
---

# Simple mode — guided wizard

Simple mode is a seven-step guided wizard for setting up an on-device AI experience without using the full Pro workbench.

:::info Developer Preview
Simple mode is the default beginner flow. The older v1 wizard is still available for compatibility, but v2 is the current flow.
:::

## Overview

Route: `/simple`

Simple mode has two phases:

| Phase | Steps | Goal |
| --- | --- | --- |
| Phase 1 | Device profile -> focus -> tier -> setup -> complete | Detect the Mac, choose what the model should do, download and load the model, then test it. |
| Phase 2 | Export device -> export generate | Choose an iOS target and prepare the app export flow. |

Use Simple mode when you want Edge Studio to make the main setup decisions from a small number of choices.

## Step 0: Device AI Profile

Route: `/simple`

The Device AI Profile page detects the current Mac and estimates what model tiers it can handle.

Key features:

- Detects chip, memory, and GPU information.
- Shows an AI capability rating.
- Recommends a starting tier.
- Lets the user continue without manually selecting hardware.

Use this step to establish the hardware baseline before choosing a model category.

## Step 1: Focus Selection

Route: `/simple/focus`

The Focus Selection page asks what the AI should do.

Options:

| Focus | Use it for |
| --- | --- |
| Chat | Text-in, text-out conversation. |
| Coding | Code-oriented chat and generation. |
| Vision | Image plus text input. |
| ASR | Speech-to-text transcription. |
| TTS | Text-to-speech generation. |
| Voice Duplex | A spoken conversation loop using ASR, LLM, and TTS models. |

Select one card to continue. The choice controls which model package and test panel appear later.

## Step 2: Tier Selection

Route: `/simple/tier`

The Tier Selection page shows model package cards based on the detected device and selected focus.

Key features:

- Shows available tiers such as Standard, Pro, Max, and Ultra when supported.
- Marks the recommended tier for the current Mac.
- Displays package-level model information before setup.
- Supports custom model input where the current build enables it.

Use this step to choose the quality and resource level before downloading or loading a model.

## Step 3: Setup

Route: `/simple/setup`

The Setup page downloads and loads the selected model package, then provides an immediate test experience.

Key features:

- Shows download and load progress.
- Resumes in-progress setup when possible.
- Loads one model for single-model focuses.
- Loads multiple models for Voice Duplex.
- Opens the relevant test panel after the model is ready.

Embedded panels:

| Panel | Appears for | What it tests |
| --- | --- | --- |
| Chat panel | Chat, Coding, Vision | Prompt input, streamed text output, and optional image input for vision models. |
| ASR panel | ASR | Audio input and transcription. |
| TTS panel | TTS | Text input, speaker selection when available, and generated audio. |
| Duplex panel | Voice Duplex | Spoken input, model response, and spoken output in one flow. |

Use this step to confirm that the selected package actually runs before moving to export.

## Step 4: Complete

Route: `/simple/done`

The Complete page confirms that setup succeeded.

Key features:

- Shows the "AI Ready" state.
- Offers a path into Phase 2 export.
- Allows changing focus or upgrading the selected package.
- Keeps the loaded model available for further testing.

Use this step as the checkpoint between model setup and app packaging.

## Phase 2 Step 1: Export Device

Route: `/simple/export/device`

The Export Device page chooses the iOS target.

Key features:

- Provides iPhone and iPad target cards.
- Records the target device choice for the export check.
- Advances with a single click.

Use this step to size the generated app for the device family you plan to test first.

## Phase 2 Step 2: Export Generate

Route: `/simple/export/generate`

The Export Generate page checks the selected model against the target device and prepares the app export flow.

Key features:

- Runs a device-fit check.
- Suggests downgrade, focus change, or target-device change when needed.
- Accepts an app name.
- Shows export progress when app generation is enabled in the current build.
- Provides post-export guidance for the generated ZIP.

Use this step after the model is loaded and the target device is selected.

## Legacy v1 wizard

Route prefix: `/simple/v1`

The v1 wizard is retained for compatibility:

| Route | Page |
| --- | --- |
| `/simple/v1` | Welcome |
| `/simple/v1/device` | Device assessment |
| `/simple/v1/pick-model` | Model picker |
| `/simple/v1/optimize` | One-click optimization |
| `/simple/v1/test` | Test chat |
| `/simple/v1/export` | Simple export |

Use v2 for new work. Use v1 only when validating older flows or reproducing behavior from an earlier build.
