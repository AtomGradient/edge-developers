---
sidebar_position: 5
title: Build the Agent carrier
---

# Build the Agent carrier

This guide shows the public developer path from Edge Studio to a real iOS
carrier: install the package, prove the device Agent in the CLI, export an Edge
Scaffold project, then validate the carrier on a physical device.

The scenario is a private finance assistant. The user says:

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

The carrier app should keep that preference on the device, restore it into a
compatible model session, and keep the base model package unchanged. The app is
the surface; the device Agent owns the local learning state.

## What you will build

You will create an iOS carrier with:

- a local LLM loaded through Edge Kit and Edge Engine,
- finance sample data and read-only demo tools from Edge Scaffold,
- Edge Halo binary integration for Neural Imprint restore hooks,
- a carrier-owned settings surface for learning state and deletion,
- a real-device build that does not depend on a simulator runtime.

Edge Scaffold is a template, not a runtime dependency. Edge Studio resolves the
public `edge-scaffold` template, copies it into a new app folder, rewrites the
app name and model configuration, runs XcodeGen, and gives you a ZIP.

## 1. Install Edge Studio

Create a Python 3.11 environment and install the public package:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

`--pre` is required while Edge Studio is published as release candidates. If
`edge doctor` reports an environment or model-path issue, fix that before
exporting an app.

## 2. Fetch the demo model

Use the same model for the CLI proof and the exported app:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
edge models where qwen3.5-9b-4bit --json
```

The model is roughly 5 GB. The first model load can take tens of seconds while
MLX initializes and maps the model files.

## 3. Prove learning locally

Before building the iOS carrier, run the CLI learning demo:

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

The built-in sample is synthetic and safe to inspect. It proves the mechanics:
a correction is written into isolated local state, a Neural Imprint artifact is
generated, and the receipt records the before/after answers plus the restore
artifact path. This is the same finance signal used in
[Build your first device Agent](/docs/get-started/minute-demo).

Use the receipt directly when you want to compare behavior:

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive \
  --with-imprint "/path/to/learn_receipt.json"
```

In a finance carrier, the same lifecycle maps to user-owned finance preferences
and classified local facts. The app decides what it records, how users review
it, and how users delete it.

## 4. Launch Edge Studio

Start the local workbench:

```bash
edge studio
```

Open:

```text
http://127.0.0.1:18842
```

Load the model you fetched, then open **Export** and choose **Edge iOS App**.
Use an app name such as `CashFlowCoach` and keep the default finance direction
set unless you are testing a model-matched A-library produced for another
domain.

The export uses the public Edge Scaffold template. If you have no local
`edge-scaffold` checkout, Edge Studio downloads a fixed public template archive
and caches it. Advanced local testing can override the template with
`EDGE_SCAFFOLD_DIR=/path/to/edge-scaffold`.

## 5. Inspect the exported app

After downloading and unzipping the ZIP, the structure should look like this:

```text
CashFlowCoach/
+-- CashFlowCoach.xcodeproj/
+-- project.yml
+-- CashFlowCoach_model_config
+-- README.md
+-- Resources/
+-- CashFlowCoach/
    +-- App/
    |   +-- ScaffoldConfig.swift
    +-- AI/
    +-- Chat/
    +-- Settings/
    +-- Business/
```

The repeated app name is expected. The first `CashFlowCoach/` is the app
project root. The second `CashFlowCoach/` is the Swift source directory for the
Xcode target.

Read the generated `README.md` first. It is instance-specific and points to the
exact files to edit.

## 6. Build the shell first

Open the project in Xcode, select your development team, set a unique bundle
identifier, and choose a physical iPhone or iPad.

For a command-line build check without copying model weights:

```bash
xcodebuild -project CashFlowCoach.xcodeproj \
  -scheme CashFlowCoach \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  SKIP_MODEL_COPY=1 \
  build
```

This verifies signing, Swift Package Manager resolution, XcodeGen output, and
the app shell. It does not validate model load or learning quality.

If Swift Package Manager cache state looks stale, clear local build state and
resolve again:

```bash
rm -rf .build
rm -rf ~/Library/Developer/Xcode/DerivedData
xcodebuild -resolvePackageDependencies -project CashFlowCoach.xcodeproj
```

## 7. Add the model and run on device

Open `CashFlowCoach_model_config` and confirm the model folder:

```bash
MODEL_NAME=Qwen3.5-9B-4bit
MODELS_SOURCE_DIR=$HOME/Documents/mlx-community
MODEL_COPY="true"
```

Then build without `SKIP_MODEL_COPY=1`. For larger models, enable the Increased
Memory Limit entitlement and validate a Release build on the oldest device
class you plan to support.

On the device, verify:

| Area | What to check |
| --- | --- |
| First launch | The app opens and does not reference developer-only paths. |
| Model load | The model loads from the configured local, bundled, ODR, or cache path. |
| Streaming | A reply streams and completes. |
| Local data | Finance sample facts and carrier-owned tool schemas are visible in the app surfaces. |
| Neural Imprint | Restore stays fail-closed when metadata does not match. |
| Deletion | Users can clear local model cache and learning state. |

## 8. Customize the finance assistant

Start with these files:

| File | Use it for |
| --- | --- |
| `CashFlowCoach/App/ScaffoldConfig.swift` | App name, system prompt, model ID, generation defaults, finance sample domain, Neural Imprint runtime settings. |
| `CashFlowCoach/AI/AIManager.swift` | Model loading, generation, and Edge Kit session integration. |
| `CashFlowCoach/AI/EdgeDataBootstrap.swift` | App-owned schemas, facts, and tool registration. |
| `CashFlowCoach/AI/PersonalizationManager.swift` | Learning-state surfaces and Neural Imprint restore wiring. |
| `CashFlowCoach/Chat/DemoChatView+LLM.swift` | Streaming chat behavior and user-facing interaction. |
| `Resources/SampleData/` | Synthetic finance data used by the reference app. Replace it with your app's own local facts. |

For the finance scenario, add product UI that lets the user review or change
preferences like risk tolerance, cash-flow horizon, and return stability. Do
not upload user transcripts, account details, or preference artifacts to
analytics or remote support systems.

## 9. Production checklist

- Pin Edge Kit, Edge Engine, and Edge Halo binary package versions.
- Test on the exact physical device classes you support.
- Keep simulator builds for UI iteration only; do not use them for MLX runtime
  validation.
- Keep the base model path working when Neural Imprint restore fails.
- Make learning state inspectable enough for user trust and removable from app
  settings.
- Replace scaffold sample tools and data with app-owned finance schemas and
  read-only tool policies.
- Keep App Store privacy answers aligned with what the app actually stores,
  transfers, and deletes.

## Next steps

- Run the [device Agent demo](/docs/get-started/minute-demo) if you have not
  already compared before/after answers.
- Read [Edge Scaffold configuration](/docs/optimize-and-ship/scaffold) for the
  template fields Edge Studio rewrites during export.
- Review [Neural Imprint vs LoRA](/docs/guides/neural-imprint-vs-lora) when
  choosing between local learning artifacts and model-adapter releases.
