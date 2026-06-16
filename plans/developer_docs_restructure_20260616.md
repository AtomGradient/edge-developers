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

## Follow-up Alignment: Beginner Learning Ladder

After the first docs pass, the developer onboarding path was refined again. The first command should not be a dense full-stack learning proof. A new developer should see a familiar model workflow first:

1. Download or resolve `qwen3.5-9b-4bit`.
2. Run a normal local chat with the base model.
3. Inspect the synthetic correction-learning sample.
4. Run local correction learning and Neural Imprint restore.
5. Compare before/after answer hashes from the local receipt.

The one-command learning demo remains useful, but only as an advanced shortcut after the developer understands the pieces. Future CLI UX should add a clearer `edge demo learn sample show/list` command and a direct base-vs-Neural-Imprint chat replay command.

## Follow-up Alignment: Homepage as a Documentation Service

After reviewing the live Docusaurus homepage, the homepage needs to behave like a professional documentation entry point rather than a broad product capability grid.

User feedback:

1. The first screen must make the developer's next action obvious.
2. Python/CLI and iOS/Swift should not be mixed at the same priority level.
3. The homepage's first job is to help a developer successfully try the product.
4. `/Users/alex/Documents/Codes/edge-studio` remains the local external-test clone for following the docs exactly.

Claude review agreed with the direction and added three implementation constraints:

1. Keep `qwen3.5-9b-4bit` as the documented preview baseline only because it is the current verified baseline; do not switch to a lighter default until the full learning demo is tested on that model.
2. Do not copy the full learning flow onto the homepage. The homepage should show a short teaser and link to `docs/get-started/5-minute-demo.md`, which remains the source of truth.
3. Avoid wording that implies a developer is training on personal data during the first run. Use receipt-anchored wording: generate/restore a local Neural Imprint artifact from a synthetic sample and compare the local receipt.

Homepage target:

- First screen: "Run a local model, then validate the learning loop."
- Primary lane: Python/CLI first-success path.
- Secondary lane: iOS/Swift app integration path, clearly marked as preview-access/device-validation work.
- Capability grid stays present but lower priority.
- No claims of model quality improvement, router improvement, or behavior improvement without evaluation evidence.
