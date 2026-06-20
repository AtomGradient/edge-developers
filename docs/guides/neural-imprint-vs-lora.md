---
sidebar_position: 7
title: Neural Imprint vs LoRA
---

# Neural Imprint vs LoRA, SFT, and prompt stuffing

Neural Imprint is Edge's on-device learning contract. It lets an app keep a
stable base model package while restoring user-specific learning state as a
local, removable artifact.

This matters for real products. User personalization should not turn every
preference update into a new training run, a model-release event, or a larger
prompt that repeats private profile text. Neural Imprint keeps the baseline
model path intact and moves personalization into compatibility-gated runtime
state.

## The short version

| Pattern | Product contract | What developers carry |
|---|---|---|
| **Neural Imprint** | Restore a local learning artifact into a compatible base model session | Local artifact lifecycle, compatibility gates, deletion UX |
| **LoRA / SFT** | Train and ship new model or adapter weights | Training compute, data curation, release packaging, full regression evaluation |
| **Prompt stuffing** | Insert profile text or instructions into every request | Prompt budget pressure, repeated private-state exposure, prompt governance |

These patterns have different tradeoffs. Choosing the right one depends on the
app's deployment boundaries, data ownership model, and evaluation claims.

## Why Neural Imprint is the right primitive for on-device AI

On-device AI has a different constraint set from centralized model releases.
The app needs to learn from a user's local state, preserve privacy boundaries,
stay removable, survive app updates, and avoid destabilizing the base model
release path.

Neural Imprint is built around that contract:

- **The base model package and base weights stay intact.** Personalization does
  not replace the shipped model or mutate its weights; the base weights remain
  unchanged.
- **The learning state is local user data.** The artifact can live in app-owned
  storage, move only through trusted user-owned channels, and be removed by the
  app.
- **Restore is compatibility-gated.** Model identity, tokenizer/template,
  runtime version, tool schema, and artifact metadata are checked before
  activation.
- **Failure is closed and recoverable.** If the artifact does not match, the app
  keeps the base model path active and can regenerate, re-export, or load the
  matching model.
- **No profile text replay.** The user's learned state is not pasted into every
  request; generation stays focused on the current message and tool context.

That is the core advantage: the product can let the model keep learning about
the user without converting personalization into a new model release or a
request-time prompt payload.

## The problem with LoRA and SFT for per-user learning

LoRA and SFT are useful when the desired output is a trained model or adapter
release. They are not the right default for per-user, on-device learning loops.

For a developer shipping personalization, they introduce a heavy contract:

- Training needs enough compute, curated data, and repeatable infrastructure.
- The adapted model or adapter becomes a versioned release artifact.
- Every release needs compatibility handling, rollback, and regression
  evaluation.
- Weight adaptation can shift behavior outside the target preference or task, so
  the base-model baseline must be revalidated.
- Per-user adapters multiply storage, lifecycle, and support complexity.

LoRA and SFT remain good tools for centralized domain adaptation or curated
model releases. Neural Imprint is stronger when the product goal is continuous,
user-specific learning on the device while the base model package remains
stable.

## The problem with prompt stuffing

Prompt stuffing is easy to prototype: put a profile summary, memory list, or
behavior instruction into each request. It breaks down when personalization
becomes real product state.

The issues are direct:

- Private profile text is replayed in prompt context.
- Context budget is spent on state replay instead of the current task.
- Longer prompts are harder to govern, inspect, and keep stable.
- Prompt text is not a removable, compatibility-gated artifact lifecycle.
- The app must constantly decide which private facts are safe to paste into a
  request.

Neural Imprint avoids that shape. The user's learned state is restored as local
runtime state under explicit compatibility gates; the prompt can stay focused on
the current request.

## Choosing the pattern

Use **Neural Imprint** when you need:

- on-device user-specific learning,
- a stable base model package,
- local and removable personalization state,
- compatibility-gated restore,
- failure that keeps the base model path active,
- no request-time private profile replay.

These are valid use cases for Neural Imprint; they are not blanket evaluation
claims about every model, task, or deployment.

Use **LoRA or SFT** when you intentionally want:

- a trained model or adapter release,
- centralized evaluation and distribution,
- a domain adaptation that is not per-user local state,
- a model update lifecycle independent of user-owned artifacts,
- the budget to run full training and regression evaluation.

Use **prompt stuffing** only when you intentionally want:

- a lightweight prototype or short-lived instruction layer,
- explicit request-time instructions,
- no artifact lifecycle,
- brief non-private context that can safely repeat in every prompt.

## Public boundary

This page describes the product and integration contract, including deployment
boundaries, data ownership, and evaluation claims. It does not describe private
artifact construction methods, training internals, runtime formulas, or
low-level implementation details.

## Related guides

- [Architecture and product boundaries](architecture.md)
- [Model evolution with Edge Halo](/docs/build/model-evolution)
- [Neural Imprint lifecycle example](/docs/examples/personalized-model)
