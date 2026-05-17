---
sidebar_position: 1
title: Overview
---

# Edge Halo

Edge Halo is the Developer Preview module for model self-evolution.

It provides profile extraction, adapter lifecycle management, and runtime steering. The app composes Edge Halo with Edge Kit: Edge Kit runs inference, and Edge Halo manages how the model adapts to the user.

:::info Developer Preview
Edge Halo is in **Developer Preview**. Keep profile data, adapters, and validation results on user-owned devices.
:::

## Architecture

```text
        App
       /   \
Edge Kit   Edge Halo
       \   /
    Edge Engine
```

The app is the composition point. Edge Halo does not own the app UI or the inference engine. Instead, your app passes protocol implementations into `EdgeHalo`.

## Capabilities

| Capability | Description |
| --- | --- |
| User profiling | Extracts a local representation of user preferences from user data. |
| Adapter lifecycle | Validates, applies, versions, and rolls back adapters. |
| Activation steering | Adjusts model behavior during a session without retraining. |
| Evolution state | Tracks collection, training, validation, and active adapter state. |

## State machine

```text
idle -> collecting -> readyToTrain -> training -> validating -> evolved
```

## Initialize

```swift
import EdgeHalo

let halo = EdgeHalo(
    engine: engineSession,
    generator: textGenerator,
    dataStream: dataEvents
)
```

`engineSession` conforms to `HaloEngineSession`. `textGenerator` conforms to `HaloTextGenerator`.

## Read state

```swift
let state = await halo.evolutionState
let profile = await halo.currentProfile
let adapter = await halo.activeAdapter
```

## Privacy boundary

Profiles and adapters are local artifacts. Training can run on the user's Mac and transfer the resulting adapter to the user's other devices through the private device mesh.

## Guides

- [User profiling](/docs/edge-halo/profiling)
- [Adapter lifecycle](/docs/edge-halo/adapters)
- [Activation steering](/docs/edge-halo/steering)
