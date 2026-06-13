---
sidebar_position: 3
title: Swift CLI validation
---

# Swift CLI validation

Use this page when you want a repeatable SDK validation path before integrating Edge Kit and Edge Halo into an app.

There are two separate workflows:

1. **Integrate the SDK in your app.** Add the released Swift packages to your app's `Package.swift`.
2. **Run the validation CLI.** Build and run EdgeStudio's `edge-swift` smoke CLI from `tests/smoke_test`.

`edge-swift` is a validation tool, not an SDK product that you add to an app. It stays in EdgeStudio so the SDK packages remain infrastructure-only.

## Integrate Edge packages in an app

Pin Developer Preview packages exactly:

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/AtomGradient/edge-kit.git", exact: "1.0.0-rc94"),
    .package(url: "git@github.com:AtomGradient/edge-halo.git", exact: "1.0.0-rc17")
]
```

Then add the products you need:

```swift
.target(
    name: "MyApp",
    dependencies: [
        .product(name: "EdgeInference", package: "edge-kit"),
        .product(name: "EdgeMesh", package: "edge-kit"),
        .product(name: "EdgeHalo", package: "edge-halo")
    ]
)
```

Edge Kit `1.0.0-rc94` and Edge Halo `1.0.0-rc17` both use Edge Engine `1.0.0-rc136` in this preview. Some preview package resolution paths may require AtomGradient preview access or SSH access.

## Run the EdgeStudio validation CLI

Clone EdgeStudio and place the SDK repositories at the local paths expected by `tests/smoke_test/Package.swift`:

```bash
git clone git@github.com:AtomGradient/EdgeStudio.git
cd EdgeStudio

git clone git@github.com:AtomGradient/edge-kit.git edge-kit
git -C edge-kit checkout 1.0.0-rc94

git clone git@github.com:AtomGradient/edge-halo.git edge-halo
git -C edge-halo checkout 1.0.0-rc17
```

Run commands from the smoke package directory:

```bash
cd tests/smoke_test
swift package resolve
swift run edge-swift --help
```

From the EdgeStudio root, the equivalent form is:

```bash
swift run --package-path tests/smoke_test edge-swift --help
```

## Zero-model SDK checks

These commands validate SDK contracts without loading a model:

```bash
swift run edge-swift halo-bridge-check --json
swift run edge-swift imprint validate --fixture --json
swift run edge-swift imprint restore --fixture --json
```

The fixture restore command is a **receipt-only smoke**. It verifies the restore coordinator and apply-status receipt path, but it does not inject artifacts into an engine.

To verify the fail-closed receipt path:

```bash
set +e
swift run edge-swift imprint restore --fixture --simulate-failure --json
status=$?
set -e
test "$status" -eq 1
```

## Model smoke checks

After you prepare a local model, run the category smoke tests:

```bash
swift run edge-swift smoke llm /path/to/qwen-model --level all
swift run edge-swift smoke vlm /path/to/vlm-model --image /path/to/image.jpg
swift run edge-swift smoke asr /path/to/asr-model --audio /path/to/audio.mp3
swift run edge-swift smoke tts /path/to/tts-model --output ./tts-output
```

These commands load the model path you pass explicitly. They do not silently fetch models.

## Safety boundaries

- `halo-bridge-check`, `imprint validate --fixture`, and `imprint restore --fixture` do not load models.
- `imprint restore --fixture` is receipt-only smoke, not production artifact restore.
- Fixture commands use synthetic descriptors and hash-only reports; they do not include raw user text or file contents.
- No network is used by the fixture commands after Swift Package Manager has resolved dependencies.
- App-specific business data belongs in the app layer, not in Edge Kit, Edge Halo, or this validation CLI.

## CI sample

This sample keeps C3 as documentation only. Adapt paths and access tokens to your preview environment.

```yaml
name: Edge Swift CLI smoke

on:
  pull_request:
  workflow_dispatch:

jobs:
  edge-swift:
    runs-on: macos-14
    steps:
      - name: Checkout EdgeStudio
        uses: actions/checkout@v4
        with:
          repository: AtomGradient/EdgeStudio
          path: EdgeStudio

      - name: Checkout Edge Kit
        uses: actions/checkout@v4
        with:
          repository: AtomGradient/edge-kit
          ref: 1.0.0-rc94
          path: EdgeStudio/edge-kit

      - name: Checkout Edge Halo
        uses: actions/checkout@v4
        with:
          repository: AtomGradient/edge-halo
          ref: 1.0.0-rc17
          path: EdgeStudio/edge-halo

      - name: Run zero-model Swift CLI checks
        run: |
          cd EdgeStudio/tests/smoke_test
          swift package resolve
          swift run edge-swift halo-bridge-check --json
          swift run edge-swift imprint validate --fixture --json
          swift run edge-swift imprint restore --fixture --json

          set +e
          swift run edge-swift imprint restore --fixture --simulate-failure --json
          status=$?
          set -e
          test "$status" -eq 1
```

