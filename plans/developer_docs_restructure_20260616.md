# Developer Docs Restructure Plan - 2026-06-16

## Goal

Make the developer documentation sell and prove the smallest useful Edge Studio experience before asking developers to read SDK reference material.

The first path should answer:

- What can Edge Studio do for me today?
- How do I run a minimal local learning loop?
- What model should I use for the preview baseline?
- What is available now, and what still requires preview access?

## Current Problem

The current "Get Started" section mixes several different entry points:

- Swift Package Manager quickstart
- CLI learning demo
- Minimal iOS app
- Installation details
- Swift CLI validation

That makes the first developer action unclear. The CLI learning demo should be the first-wow path because it can show the learning loop before the developer commits to an iOS integration.

## Agreed Direction

Codex and Claude aligned on a minimal first pass:

1. Do not move doc files in the first pass.
2. Reorder `sidebars.ts` so the CLI learning demo is first under "Quickstart".
3. Keep the iOS quickstart, but mark it honestly as requiring preview access.
4. Add a "Core Concepts" group without changing file paths.
5. Move deeper SDK install/reference material out of the first path.
6. Add the Web UI launch path where source-build instructions appear.
7. Avoid claiming public `pip install edgestudio` availability until the package is actually published.

## Target Information Architecture

1. Start Here
   - `docs/overview.md`
   - Developer Preview status
   - Apple Silicon / Python / Xcode requirements
   - Clear paths: CLI learning loop, Web UI, minimal iOS app, SDK integration

2. Quickstart
   - CLI learning demo first
   - Minimal iOS app second, marked "Preview Access Required"
   - Installation and Swift CLI validation after that

3. Core Concepts
   - Neural Imprint / model evolution
   - Neural Imprint vs LoRA
   - Model and tool cache
   - Architecture

4. Build with Edge Kit
   - Native SDK capability guides

5. Examples
   - Existing app examples

6. Reference
   - Supported models
   - Memory and performance guidance
   - Platform requirements
   - Troubleshooting
   - Original Swift SDK quickstart as a reference-oriented setup guide

7. Optimize & Ship
   - Edge Studio workbench
   - Benchmark, export, scaffold, UI reference

## Content Guardrails

- Use `qwen3.5-9b-4bit` as the baseline preview model.
- Say "source checkout / editable install during preview"; do not say public `pip install edgestudio` works today.
- It is acceptable to mention that public `pip install edgestudio` is the intended release path.
- Keep iOS docs honest: package resolution may require AtomGradient preview access while repos remain private.
- Do not add dogfood app details, internal roadmap claims, local mailbox details, or AI-collaboration instructions to public docs.
- Do not claim model quality improvement, router improvement, or behavior improvement without evaluation evidence.

## First Implementation Batch

1. Update `sidebars.ts`.
2. Rewrite the top of `docs/overview.md` as "Start Here".
3. Update the CLI learning demo title and links.
4. Update minimal iOS app title to include "Preview Access Required".
5. Add a short Web UI launch section to installation/source-build docs.
6. Mirror the same critical wording in the Chinese localized docs.
7. Run `npm run typecheck` and `npm run build`.
8. Commit, push, and send a Claude review request with the committed SHA.

