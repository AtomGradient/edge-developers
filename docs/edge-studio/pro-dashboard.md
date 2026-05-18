---
sidebar_position: 4
title: Pro Dashboard
---

# Pro Dashboard

{/* CODEX: Write guide for Pro Dashboard (/dashboard).

  ProDashboard.tsx — Progress-aware model cockpit.

  ## Workflow stages
  Dashboard adapts based on current workflow stage:
  - **Just loaded**: Explore architecture + generate profile CTA
  - **Profiled**: Profile summary + optimize CTA
  - **Optimized**: Optimization comparison card + export CTA

  ## Components shown
  - Metrics row (model size, parameter count, quantization level)
  - Quick actions (links to analysis tools, chat, export)
  - Progress timeline (load → analyze → optimize → export)
  - Model info card

  ## How to use
  1. Load a model (from Welcome page or sidebar model selector)
  2. Dashboard shows model overview and suggested next step
  3. Follow the guided flow or jump to any tool via sidebar

  DO NOT expose: internal API calls, dashboard state machine implementation.
*/}
