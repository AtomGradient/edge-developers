---
sidebar_position: 1
title: Why The Device Agent
slug: /concepts/why-device-agent
---

# Why The Device Agent

Most personalization today is a cloud profile, a fine-tuned model release, or a
prompt full of user text. Edge takes a different contract: the device is the
Agent, the app is the carrier, and learning is local runtime state that
restores only when compatibility checks pass. This page explains why — and what
the quickstart actually proved.

## The Product Shift

A model release cannot follow each user. Cloud profiles replay private text
into every request. What a personal assistant actually needs is: the base model
package stays stable, and each user's device keeps learning the user — locally,
removably, auditable.

Edge calls the local learning artifact a **Neural Imprint**. It is restored
only when compatibility checks pass, it is removable local data, and it does
not require putting private profile text into every prompt.

## What Actually Happens In A Learning Run

When you ran the quickstart, this is what happened:

- The Agent learned from a local synthetic signal you inspected first.
- RPP self-learning produced a local learning representation.
- Neural Imprint restored that state into a compatible model session.
- Restore passed through model, tokenizer, runtime, and tool-schema
  compatibility checks.
- The tool policy showed which local tools are appropriate and which actions
  are out of bounds.
- If compatibility fails at any point, the product keeps the base-model path.

This is not LoRA, SFT, prompt stuffing, or cloud personalization.

## Is This LoRA Or SFT?

No. LoRA and SFT are useful when you intentionally want a trained model or
adapter release. That requires compute, data curation, release packaging,
rollback, and regression evaluation. Neural Imprint is a different contract for
per-user device learning: the base model package stays stable, and local
learning state is restored only when compatibility checks pass.

## Is This Prompt Stuffing?

No. Prompt stuffing repeats profile text or instructions inside every request.
That consumes context budget and replays private state. The after-learning chat
restores local runtime state from a Neural Imprint receipt, then handles the
current message through the normal generation path.

## What Did The Agent Learn In The Quickstart?

Only the synthetic signal you inspected: risk boundary, cash-flow context,
trust boundary, and expected local tool policy. In a real product, those
signals would come from app-approved local settings, explicit user preferences,
and user-visible corrections. The carrier app owns that policy.

## Does The Exported App Contain The Mac Learning Result?

Not by default. The export does not automatically package the Mac
`learn_receipt.json` or its Neural Imprint artifact into the app. That is
deliberate: a user's learned state should be owned by the device/carrier
lifecycle, not silently baked into a template ZIP. Use the Mac demo to inspect
and prove the mechanism; use the exported app to wire the same lifecycle on a
real device.

## How Does The Phone Learn A New Preference?

The carrier records a user-approved signal locally, such as a setting,
correction, or classified fact. When the app decides the signal is eligible, it
starts a device-side Edge Halo job. That job uses the local model session,
local tool schema, and bundled RPP A-library to build a new Neural Imprint
capsule. Restore is compatibility-checked and fail-closed. The phone does not
need to return to the Mac or re-export the app for every new preference.

## Does `answers_differ: True` Prove Production Readiness?

No. It proves that the restored Neural Imprint artifact is active for a
controlled synthetic example and that the answer moved after restore.
Production readiness still needs task-specific evaluation, UI controls,
deletion UX, and real-device validation.

## Where To Go Deeper

- The mechanism in practice: [First Device Agent](/docs/quickstart/first-agent)
- How learning artifacts differ from adapters: [Neural Imprint vs LoRA](/docs/concepts/neural-imprint-vs-lora)
- The full lifecycle on device: [Model Evolution](/docs/concepts/model-evolution)
