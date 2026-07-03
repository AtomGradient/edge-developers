---
sidebar_position: 1
title: Start Here
---

# Start Here

In Edge, the device is the Agent. The app is the carrier.

The app still matters: it owns the UI, permissions, local product policy,
settings, user controls, and App Store boundary. But the long-lived intelligence
is not a cloud profile and not an app-specific model fork. It is a local Agent
runtime on the user's device: local inference, app-approved local signals, RPP
self-learning, Neural Imprint restore, and user-controlled deletion.

Use a finance assistant as the first concrete case. A user says:

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

Later the same user asks:

```text
I have $800 left after bills this month. What should I do with it?
```

The base model can answer generically. The device Agent should answer with the
local preference in mind: protect cash flow first, explain conservative options
before upside, and avoid unsupported return claims. That is the product shift
Edge is built for: each user's device can keep learning the user while the base
model package stays stable.

Edge calls the local learning artifact a **Neural Imprint**. It is restored only
when compatibility checks pass, it is removable local data, and it does not
require putting private profile text into every prompt.

:::info Developer Preview
Runnable in current preview. Edge Studio, Edge Kit, Edge Engine, Edge Scaffold,
and the Edge Halo binary package are public release surfaces. Edge Halo source
remains private. APIs may change between release candidates, so pin versions
and validate on real devices after each upgrade. Current pins live on one page:
[Current Versions](/docs/versions).
:::

## Choose Your Path

Three developer journeys share this documentation. Pick the one that matches
what you want to do first — each is self-contained, and you can cross over
later.

| You want to… | Start at | You will need |
| --- | --- | --- |
| **Run the device-Agent learning loop on a Mac** — install one CLI, watch a base model learn a preference locally, inspect receipts | [Quickstart / Device Agent](/docs/quickstart/install) | A Mac with Apple Silicon, Python 3.11 |
| **Build an iOS app with on-device inference** — LLM/VLM/speech in Swift, model management, EdgeMesh | [Edge Kit (Swift)](/docs/edge-kit/installation) | Xcode, a real iPhone or iPad for validation |
| **Optimize, benchmark, and export models** — the local workbench UI and export pipeline | [Edge Studio (Workbench)](/docs/studio/studio-overview) | A Mac with Apple Silicon |

Working with local knowledge and developer tools (facts stores, URL import,
custom Python tools, tool learning) is its own track:
[Local Knowledge & Tools](/docs/knowledge-tools/learning-samples).

## What Edge Gives You

| Developer problem | Edge approach |
| --- | --- |
| A user-specific preference should not become a model-release project | Keep the base model package stable and restore local learning artifacts at runtime. |
| Sensitive local state should not be replayed into every request | Store learned state as app-managed local data, not repeated prompt text. |
| The user must be able to remove learned state | Let the carrier app delete the local artifact and keep the base model path active. |
| Restore must be safe | Check model identity, tokenizer/template, runtime version, tool schema, and artifact metadata before activation. |
| Product policy belongs to the app | Keep user data, tools, permissions, deletion UX, and evaluation rules in the carrier layer. |

## First Path: Device Agent on a Mac

The default journey, in order. Each step ends with a checkable result:

| Step | Guide | Expected result |
| --- | --- | --- |
| 1. Install Edge Studio | [Install Edge Studio](/docs/quickstart/install) | The `edge` CLI is installed from the public `edge-studio` Python package. |
| 2. Build the first device Agent | [First Device Agent](/docs/quickstart/first-agent) | A synthetic finance signal becomes a local Neural Imprint; the same base model answers differently after restore. |
| 3. Export the carrier | [Build the Agent carrier](/docs/quickstart/build-agent-carrier) | Edge Studio exports an Edge Scaffold project that you validate on a real iPhone or iPad. |

Two useful side doors, not steps: launch the local workbench with
[`edge studio`](/docs/quickstart/install#launch-the-web-ui)
(`http://127.0.0.1:18842`), or build only the iOS shell via
[Minimal iOS app](/docs/edge-kit/minimal-ios-app).

## First Commands

Create an environment, install Edge Studio, and run the local doctor check:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

Then prepare the demo model and run the finance learning path:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

The sample is synthetic so you can inspect the learning signal safely. The run
writes a local receipt with the generated Neural Imprint artifact path and a
ready-to-copy `edge demo chat --with-imprint ".../learn_receipt.json"` command.

## Product Stack

| Product | What developers use it for |
| --- | --- |
| **Edge Studio** | Local workbench and CLI for model readiness, model fetch receipts, local learning demos, Neural Imprint generation, device management, benchmark, and export. |
| **Edge Kit** | Swift SDK for LLM, VLM, speech, model management, EdgeData, EdgeMesh, EdgeDataMeshBridge, EdgeSession, and EdgeUI. |
| **Edge Engine** | Native on-device inference runtime. Packaged under Edge Kit; most apps do not import it directly. |
| **Edge Halo** | Personalization lifecycle layer: profile jobs, Neural Imprint capsule validation, restore orchestration, and compatibility checks. Apps consume the public binary package. |
| **Edge Scaffold** | Reference carrier template exported by Edge Studio for iOS integration. |

## Privacy Model

Edge is designed around user-owned compute:

- Inference runs locally.
- Corrections, preferences, and conversation history remain app-managed local data.
- Learning artifacts are local, removable, and compatibility-checked before restore.
- EdgeMesh transfer is local-network and trust-gated when an app enables it.

Do not upload user transcripts, corrections, financial details, or profile
artifacts to analytics, crash logs, or remote support systems.

## Core Concepts

| Concept | Developer-facing meaning |
| --- | --- |
| **Device Agent** | The private on-device runtime that owns local inference, app-approved learning signals, Neural Imprint restore, and deletion. |
| **Carrier app** | The app surface that owns UI, permissions, tools, settings, local policy, and user controls. |
| **Neural Imprint** | Edge's local learning artifact: removable, compatibility-checked, and restored without replacing the base model package. |
| **App-owned tools** | Apps define their own tool schemas and action surfaces. Edge infrastructure does not embed app business rules. |
| **EdgeMesh** | Local-network trust, discovery, and device-to-device transfer for user-owned devices. |
| **Fail-closed compatibility** | If the artifact does not match the model, tokenizer/template, runtime, or tool schema, the carrier keeps the base model path active. |
