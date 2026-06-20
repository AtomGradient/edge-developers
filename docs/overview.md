---
sidebar_position: 1
title: Start Here
---

# Start Here

AtomGradient Edge is a local-first developer platform for building private AI agents that run, learn, and coordinate on user-owned devices.

Neural Imprint is the on-device learning primitive in that stack: user-specific
state becomes a local, removable artifact that can be restored into a compatible
base model without replacing the base model package or replaying private profile
text in every prompt.

The Developer Preview ships on Apple platforms first. Android, Linux, HarmonyOS, Windows, robots, vehicles, and industrial devices share the same long-term technical core: local models, local learning artifacts, app-owned tools, and explicit compatibility gates.

:::info Developer Preview
All Edge products are in **Developer Preview**. APIs may change between releases. Some repositories and Swift package dependencies may still require AtomGradient preview access. Pin package versions and validate on real devices after each upgrade.
:::

## Getting started

| Goal | Guide | Expected result |
| --- | --- | --- |
| Download, chat, then run a learning demo | [CLI learning demo](/docs/get-started/minute-demo) | Local chat works, then a synthetic correction generates a Neural Imprint artifact that can change runtime behavior while the base model package stays intact. |
| Install the preview package | [Install Edge Studio](/docs/get-started/source-build) | The `edge` CLI is installed from the `edge-studio` Python package. |
| Launch the local workbench | [Launch the Web UI](/docs/get-started/source-build#launch-the-web-ui) | `edge studio` runs Edge Studio at `http://127.0.0.1:18842`. |
| Build an iOS shell | [Minimal iOS app](/docs/get-started/minimal-ios-app) | Edge Scaffold compiles as the smallest iOS reference app. Preview access required. |
| Integrate the Swift SDK | [Swift SDK setup](/docs/get-started/quickstart) | Edge Kit loads a local model in an Apple-platform app. |

## First commands

Download a model and chat locally:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install edge-studio
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive
```

After the base chat works, continue to the [CLI learning demo](/docs/get-started/minute-demo) to inspect a synthetic correction sample, generate a local Neural Imprint artifact, and see user-specific learning restored without creating a new model release.

## Product stack

| Product | What developers use it for |
| --- | --- |
| **Edge Studio** | Local workbench and CLI for model readiness, model fetch receipts, local learning demos, Neural Imprint generation, device management, benchmark, and export. |
| **Edge Kit** | Swift SDK for LLM, VLM, speech, model management, EdgeData, EdgeMesh, EdgeDataMeshBridge, EdgeSession, and EdgeUI. |
| **Edge Engine** | Native on-device inference runtime. Packaged under Edge Kit; most apps do not import it directly. |
| **Edge Halo** | Personalization lifecycle layer: profile jobs, Neural Imprint capsule validation, restore orchestration, and compatibility gates. |
| **Edge Scaffold** | Reference app and export template showing the recommended iOS integration pattern. |

## Privacy model

Edge is designed around user-owned compute:

- Inference runs locally.
- Training inputs, corrections, and conversation history remain app-managed local data.
- EdgeMesh transfer is local-network and trust-gated.
- Neural Imprint artifacts are compatibility-checked before restore and can be removed by the app.

Do not upload user transcripts, corrections, or profile artifacts to analytics, crash logs, or remote support systems.

## Core concepts

| Concept | Developer-facing meaning |
| --- | --- |
| **Local-first inference** | Models, prompts, user data, and personalization artifacts stay on user-owned devices unless the user explicitly enables local mesh transfer. |
| **Neural Imprint** | The on-device learning artifact for user-specific state: local, removable, compatibility-gated, and restored without replacing the base model package. |
| **App-owned tools** | Apps define their own tool schemas and action surfaces. Edge infrastructure should not embed app business rules. |
| **EdgeMesh** | Local-network trust, discovery, and device-to-device transfer for user-owned devices. |
| **Fail-closed compatibility** | Personalization and model artifacts must match model identity, tokenizer/template identity, runtime version, and tool schema before restore. |
