---
sidebar_position: 3
title: Minimal iOS app (Preview Access Required)
---

# Minimal iOS app (Preview Access Required)

The fastest iOS path in the current preview is Edge Scaffold in a no-model build. It verifies the app shell, signing, Swift package wiring, and real-device build path before you add a model.

:::info Preview access
Current preview package resolution can require AtomGradient preview access. If Swift Package Manager cannot resolve `edge-kit`, `edge-halo`, or the transitive Edge Engine dependency, finish preview onboarding before treating the app path as integrated.
:::

## Build the minimal app shell

```bash
git clone https://github.com/AtomGradient/edge-scaffold.git
cd edge-scaffold
xcodegen generate
xcodebuild -project EdgeScaffold.xcodeproj \
  -scheme EdgeScaffold \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  SKIP_MODEL_COPY=1 \
  build
```

`SKIP_MODEL_COPY=1` keeps the first build fast and avoids bundling a large model. This build does not prove model quality, learning quality, or App Store readiness. It proves that the iOS app shell and SDK integration compile.

## Run on a real device

Open the generated project:

```bash
open EdgeScaffold.xcodeproj
```

Then:

1. Select your development team.
2. Set a unique bundle identifier.
3. Choose a real iPhone or iPad destination.
4. Build and run with `SKIP_MODEL_COPY=1` for the first launch.

The simulator is not the target runtime for model execution. Use a real device for model load, Neural Imprint restore, memory behavior, and performance validation.

## Add the baseline local model

After the shell runs, configure the baseline model path in `edgescaffolding_model_config`:

```bash
MODEL_COPY=true
MODEL_NAME=Qwen3.5-9B-4bit
MODELS_SOURCE_DIR=$HOME/Documents/mlx-community
```

Then build without `SKIP_MODEL_COPY=1`. For larger models, enable the Increased Memory Limit entitlement and validate a Release build on the exact device class you plan to support.

## What this app demonstrates

- A SwiftUI reference app using Edge Kit and Edge Halo.
- Model loading surfaces for local, cached, bundled, ODR, and remote delivery.
- Neural Imprint restore and correction-learning reference screens.
- App-owned tool registration and schema snapshot patterns.

Edge Scaffold is not dogfood business logic. Treat it as the smallest current reference app, then replace sample data, sample tools, copy, signing, and model delivery with your app's own policy.
