---
sidebar_position: 6
title: Architecture
---

# Architecture and product boundaries

This page explains how the Edge developer products fit together and where your agent should integrate.

## Layer map

```text
┌─────────────────────────────────────────────┐
│                 Your Agent                  │
│  UI · app policy · local user data · tools  │
├─────────────────────────────────────────────┤
│ Edge Kit        Edge Halo        Edge Mesh  │
│ inference SDK   personalization  local mesh │
├─────────────────────────────────────────────┤
│              Edge Engine runtime            │
└─────────────────────────────────────────────┘

Development-time tools:
  Edge Studio  →  Edge Scaffold  →  Xcode project
```

## Product responsibilities

| Product | Responsibility | Does not own |
| --- | --- | --- |
| **Edge Engine** | Native model execution, runtime scheduling, and low-level cache primitives. | App UI, tool policy, user data, or app storage. |
| **Edge Kit** | Public Swift SDK for inference, model management, EdgeData, EdgeMesh, EdgeSession, EdgeUI, and voice. | Product-specific business logic or private user-data policy. |
| **Edge Halo** | Personalization lifecycle: profile jobs, Neural Imprint capsule validation, restore orchestration, and fail-closed compatibility checks. | Model forward passes, mesh transport, or app-specific data import. |
| **Edge Studio** | Local workbench for optimization, benchmark, export, artifact generation, and device coordination. | Runtime behavior inside the shipped agent. |
| **Edge Scaffold** | Reference iOS agent template showing the recommended integration. | A shared runtime dependency for production apps. Fork or export from it, then own your app. |

Your agent is the composition point. It chooses what user data is eligible, which tools are available, when personalization can run, and how the user can inspect or disable it.

## Runtime flow

```text
1. Load a base model with Edge Kit.
2. Register tools and local data surfaces in your agent.
3. Optionally run an Edge Halo profile job from local, app-approved inputs.
4. Generate or receive a Neural Imprint artifact.
5. Validate compatibility before restore.
6. Run chat with the restored state, without replaying profile text into prompts.
```

The important boundary: Neural Imprint is a local artifact and restore flow. It is not a request-time prompt stuffing pattern and it is not a remote profile service.

## Development workflow

```text
Source model
  → Edge Studio analysis / optimization / benchmark
  → export model + runtime config
  → Edge Scaffold reference project
  → your agent integrates Edge Kit + Edge Halo
  → real-device validation
```

Use Edge Studio during development. Use Edge Kit and Edge Halo in the shipping app. Use Edge Scaffold as a reference implementation, not as a hidden dependency.

## Data boundaries

| Data | Owner | Leaves current device? |
| --- | --- | --- |
| Model weights | App bundle, local cache, or user download | No by default |
| Prompt and conversation history | Your agent | No by default |
| Tool results and app facts | Your agent / EdgeData | No by default |
| Profile inputs | Your agent | No by default |
| Neural Imprint artifact | Your agent / Edge Halo lifecycle | Only to trusted user-owned devices when enabled |
| Device status and receipts | EdgeMesh / Edge Studio pairing | Local mesh only |

Do not put raw transcripts, corrections, or private facts in remote logs. If your support workflow needs diagnostics, export hashes, schema versions, status receipts, and local file names rather than user content.

## Compatibility gates

Personalization artifacts must fail closed when runtime identity changes. At minimum, validate:

- Base model identity and family.
- Model shape and layer count.
- Tokenizer and chat template identity.
- Runtime version.
- Tool schema hash.
- Neural Imprint artifact hash and prefix metadata.

If a gate fails, keep the base model active and show a clear recovery path: regenerate, re-export, or load the matching model.

## Public abstraction level

Developer documentation intentionally describes concepts, APIs, and workflows. It does not describe private model-personalization algorithms, internal training objectives, kernel implementation details, or memory-budget implementation details.

Use these docs to integrate the products. Use Edge Scaffold and the API reference for concrete code paths.
