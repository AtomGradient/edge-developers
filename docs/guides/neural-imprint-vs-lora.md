---
sidebar_position: 7
title: Neural Imprint vs LoRA
---

# Why Neural Imprint is an artifact, not LoRA or prompt stuffing

Neural Imprint is a local artifact and restore flow. It is designed for apps that need user-specific state while keeping the base model weights unchanged, removable, and guarded by runtime compatibility checks.

This page compares three valid personalization patterns at a public product level:

- Neural Imprint artifact restore
- LoRA or SFT weight adaptation
- Prompt stuffing

These are different tradeoffs for different deployment contracts. Neural Imprint, LoRA, and SFT serve different use cases.

## Summary

| Pattern | What changes | When it happens | Privacy and update contract |
|---|---|---|---|
| Neural Imprint artifact restore | A local runtime artifact is restored into a compatible base model session | Runtime, after compatibility gates pass | Base weights stay unchanged; artifact is local, removable user data |
| LoRA / SFT | Model weights or adapter weights are trained and shipped | Training or fine-tuning time | Produces a new model or adapter release that must be distributed and validated |
| Prompt stuffing | Extra profile or instruction text is inserted into each request | Request time | Repeats private profile text in the prompt context and consumes context budget |

## Neural Imprint artifact restore

Neural Imprint keeps the base model intact. Your app or local workflow creates a Neural Imprint artifact, stores it as local user data, and restores it only when compatibility gates pass.

The important properties are:

- **Base weights unchanged.** The base model package remains the same.
- **Local artifact.** The personalization state is stored as a local artifact and can be removed.
- **Compatibility gates.** Restore must validate model identity, runtime version, tokenizer identity, tool schema hash, and artifact metadata before activation.
- **No profile text replay.** Chat should run through the same generation path after restore; the app should not paste profile text into every system prompt.
- **Fail closed.** If validation fails, keep the base model active and offer a recovery path such as regenerate, re-export, or load the matching model.

This explanation intentionally stays at the public API and workflow level. It does not describe private artifact construction, model-personalization algorithms, training internals, runtime internals, or implementation formulas.

## LoRA and SFT weight adaptation

LoRA and SFT are legitimate techniques for training-time adaptation. They are useful when you want to train a model or adapter and ship that adapted artifact as a new release.

They have valid use cases when the deployment contract is a trained model or adapter release.

Their deployment contract is different:

- The adapted model or adapter becomes a versioned artifact to distribute.
- The release must be validated like any other model update.
- Rollback and removability are model or adapter management concerns.
- The adaptation is not simply a per-user local runtime restore.

For products that want centralized model releases, curated domain behavior, or offline batch training, LoRA or SFT can be the right tool. Neural Imprint targets a different contract: local, user-specific runtime state around an unchanged compatible base model.

## Prompt stuffing

Prompt stuffing means inserting profile text, summaries, or long instructions into every request. It can be useful for simple prototypes, but it has a different privacy and runtime shape:

- Profile text repeats in request context.
- Context budget is spent on replaying state.
- The app must decide what private text is safe to include in every prompt.
- Prompt content can drift from the local artifact lifecycle and compatibility gates.

Neural Imprint avoids request-time profile replay. The restored artifact changes runtime state under compatibility gates, while the prompt remains focused on the current user request and tool context.

## Choosing the pattern

Use Neural Imprint artifact restore when you need:

- local user-specific state,
- unchanged base weights,
- fail-closed compatibility validation,
- user-removable personalization data,
- no request-time profile text replay.

Use LoRA or SFT when you need:

- a trained model or adapter release,
- centralized evaluation and distribution,
- a domain adaptation that is not per-user local state,
- a model update lifecycle independent of user-owned artifacts.

Use prompt stuffing when you need:

- a lightweight prototype,
- explicit request-time instructions,
- no artifact lifecycle,
- brief non-private context that can safely repeat in prompts.

## Non-claims

This page does not rank Neural Imprint, LoRA, SFT, or prompt stuffing. It does not make evaluation claims. It describes deployment boundaries and data ownership.

It also does not describe private implementation details such as artifact construction, training methods, runtime formulas, or resource planning internals.

## Related guides

- [Architecture and product boundaries](architecture.md)
- [Model evolution with Edge Halo](/docs/build/model-evolution)
- [Neural Imprint lifecycle example](/docs/examples/personalized-model)
