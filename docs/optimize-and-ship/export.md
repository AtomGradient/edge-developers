---
sidebar_position: 3
title: Export
---

# Export

Edge Studio exports optimized models and app projects for downstream use.

## Export formats

| Format | Use it for |
| --- | --- |
| Edge Kit native | Running the model with Edge Kit engines. |
| Edge Scaffold | Generating a complete iOS app project. |
| GGUF | Using the model with compatible inference engines. |
| CoreML | Integrating with Core ML workflows where supported. |

## Export workflow

1. Select the optimized candidate.
2. Choose an export format.
3. Configure model name, category, and target app settings.
4. Export.
5. Validate the output in the target runtime.

## Edge Scaffold export

Edge Scaffold export creates an iOS project with:

- App metadata.
- Model references.
- A generated configuration file.
- Edge Kit integration.
- UI paths for the selected model category.

After export, open the generated project, run the app on a real device, and verify first launch, model loading, and generation.

## Edge Kit native export

Use this when you already have an app and only need the model bundle.

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/exported-model")

try await engine.loadLocal(directory: modelURL)
```

## Validation checklist

- The exported directory contains `config.json`.
- Tokenizer files are present for text models.
- The selected engine can load the model.
- First inference completes on the target device.
- The app can unload or switch models without restarting.
