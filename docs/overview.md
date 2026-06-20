---
sidebar_position: 1
title: Start Here
---

# Start Here

You want your app to understand each user better over time.

That usually becomes painful fast. LoRA and SFT turn every important preference
change into training, packaging, rollout, and regression work. Prompt stuffing
puts private profile text back into every request. Cloud personalization sends
the most sensitive user state away from the device.

Edge is built for the on-device version of that problem. A finance assistant can
learn a user's sentence:

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

After learning, the assistant should answer with that preference in mind. The
preference stays local, can be removed by the app, and can be restored later
into a compatible model session. The base model package is not replaced or
retrained.

Edge calls that local learning artifact a **Neural Imprint**. You do not need to
understand the full lifecycle before trying it. Start with the CLI demo, then
carry the same idea into a generated iOS app.

:::info Developer Preview
All Edge products are in **Developer Preview**. APIs may change between
releases. Edge Studio, Edge Kit, Edge Engine, Edge Scaffold, and the Edge Halo
binary package are public release surfaces; Edge Halo source remains private.
Pin package versions and validate on real devices after each upgrade.
:::

## What Edge gives you

| Developer problem | Edge approach |
| --- | --- |
| Per-user learning should not require a model release | Keep the base model package stable and restore local learning artifacts at runtime. |
| Private preferences should not be pasted into every prompt | Store learning state as app-managed local data, not repeated request text. |
| Learning must be reversible | Let the app remove the local artifact and continue on the base model path. |
| Restore must be safe | Check model identity, tokenizer/template, runtime version, and tool schema before activation. |
| The app owns product policy | Keep user data, tools, deletion UX, and evaluation rules in the app layer. |

## First path

| Goal | Guide | Expected result |
| --- | --- | --- |
| Install Edge Studio | [Install Edge Studio](/docs/get-started/source-build) | The `edge` CLI is installed from the public `edge-studio` Python package. |
| See local learning | [CLI learning demo](/docs/get-started/minute-demo) | A synthetic correction changes runtime behavior; the guide maps the same lifecycle to finance preferences. |
| Build a learnable iOS app | [Build a learnable iOS app](/docs/examples/build-and-ship) | Edge Studio exports an Edge Scaffold project that you validate on a real device. |
| Launch the local workbench | [Launch the Web UI](/docs/get-started/source-build#launch-the-web-ui) | `edge studio` runs Edge Studio at `http://127.0.0.1:18842`. |
| Build only the iOS shell | [Minimal iOS app](/docs/get-started/minimal-ios-app) | Edge Scaffold compiles with public Swift package dependencies and local signing. |

## First commands

Create an environment, install Edge Studio, and run the local doctor check:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

Then prepare the demo model and run the learning demo:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge demo learn run \
  --sample synthetic_profile_correction_v1 \
  --model qwen3.5-9b-4bit \
  --include-text
```

The demo uses synthetic data so you can inspect the text safely. It writes a
local receipt that shows the before/after answers and the local artifact used
for restore. After that, continue to [Build a learnable iOS app](/docs/examples/build-and-ship).

## Product stack

| Product | What developers use it for |
| --- | --- |
| **Edge Studio** | Local workbench and CLI for model readiness, model fetch receipts, local learning demos, Neural Imprint generation, device management, benchmark, and export. |
| **Edge Kit** | Swift SDK for LLM, VLM, speech, model management, EdgeData, EdgeMesh, EdgeDataMeshBridge, EdgeSession, and EdgeUI. |
| **Edge Engine** | Native on-device inference runtime. Packaged under Edge Kit; most apps do not import it directly. |
| **Edge Halo** | Personalization lifecycle layer: profile jobs, Neural Imprint capsule validation, restore orchestration, and compatibility checks. Apps consume the public binary package. |
| **Edge Scaffold** | Reference app and export template showing the recommended iOS integration pattern. |

## Privacy model

Edge is designed around user-owned compute:

- Inference runs locally.
- Corrections, preferences, and conversation history remain app-managed local data.
- Learning artifacts are local, removable, and compatibility-checked before restore.
- EdgeMesh transfer is local-network and trust-gated when an app enables it.

Do not upload user transcripts, corrections, financial details, or profile
artifacts to analytics, crash logs, or remote support systems.

## Core concepts

| Concept | Developer-facing meaning |
| --- | --- |
| **Local-first inference** | Models, prompts, user data, and personalization artifacts stay on user-owned devices unless the user explicitly enables a trusted transfer. |
| **Neural Imprint** | Edge's name for the local learning artifact: removable, compatibility-checked, and restored without replacing the base model package. |
| **App-owned tools** | Apps define their own tool schemas and action surfaces. Edge infrastructure should not embed app business rules. |
| **EdgeMesh** | Local-network trust, discovery, and device-to-device transfer for user-owned devices. |
| **Fail-closed compatibility** | If the artifact does not match the model, tokenizer/template, runtime, or tool schema, the app keeps the base model path active. |
