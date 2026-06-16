---
sidebar_position: 1
slug: /
title: Start Here
---

# Start Here

AtomGradient Edge is a local-first developer platform for building private AI agents that run, learn, and coordinate on user-owned devices.

The Developer Preview ships on Apple platforms first. Android, Linux, HarmonyOS, Windows, robots, vehicles, and industrial devices share the same long-term technical core: local models, local learning artifacts, app-owned tools, and explicit compatibility gates.

:::info Developer Preview
All Edge products are in **Developer Preview**. APIs may change between releases. Some repositories and Swift package dependencies may still require AtomGradient preview access. Pin package versions and validate on real devices after each upgrade.
:::

## Try it first

Start with the smallest path that proves something useful:

| Goal | Start here | What it proves |
| --- | --- | --- |
| Download, chat, then teach the model | [CLI learning demo](/docs/get-started/minute-demo) | A local model can answer normally first, then a synthetic correction can generate a Neural Imprint artifact and write a hash-only comparison receipt. |
| Install the preview package | [Install Edge Studio from source](/docs/get-started/source-build) | The `edge` CLI and local Web UI can run from the future pip package source tree. |
| Launch the local workbench | [Web UI from source](/docs/get-started/source-build#launch-the-web-ui) | Edge Studio can run as a localhost workbench at `http://127.0.0.1:18842`. |
| Build an iOS shell | [Minimal iOS app](/docs/get-started/minimal-ios-app) | Edge Scaffold compiles as the smallest current iOS reference app. Preview access is required. |
| Integrate the Swift SDK | [Swift SDK setup](/docs/get-started/quickstart) | Edge Kit can be added to an Apple-platform app and load a local model. |

## First commands

Start with the familiar path: download a model, then chat with it locally.

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --prompt "What is edge AI?" --max-tokens 64
```

After the base chat works, continue to the [CLI learning demo](/docs/get-started/minute-demo) to inspect a synthetic correction sample, generate a local Neural Imprint artifact, and compare before/after answer hashes.

## Product stack

| Product | What developers use it for |
| --- | --- |
| **Edge Studio** | Local workbench and CLI for model readiness, model fetch receipts, local learning demos, Neural Imprint generation, device management, benchmark, and export. |
| **Edge Kit** | Swift SDK for LLM, VLM, speech, model management, EdgeData, EdgeMesh, EdgeDataMeshBridge, EdgeSession, and EdgeUI. |
| **Edge Engine** | Native on-device inference runtime. It is packaged under Edge Kit; most apps do not import it directly. |
| **Edge Halo** | Personalization lifecycle layer: profile jobs, Neural Imprint capsule validation, restore orchestration, and compatibility gates. |
| **Edge Scaffold** | Reference app and export template that shows the recommended iOS integration pattern. |

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
| **Neural Imprint** | A local personalization artifact that lets a compatible base model restore a user-specific state without changing model weights. |
| **App-owned tools** | Apps define their own tool schemas and action surfaces. Edge infrastructure should not embed app business rules. |
| **EdgeMesh** | Local-network trust, discovery, and device-to-device transfer for user-owned devices. |
| **Fail-closed compatibility** | Personalization and model artifacts must match model identity, tokenizer/template identity, runtime version, and tool schema before restore. |
