---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting

Common issues and how to fix them.

## Model loading

### "Model not found" or empty directory

The model path must point to a directory containing `config.json` and weight files (`.safetensors`). Check:

- The path exists and is readable.
- The directory contains `config.json`, not a nested subdirectory.
- On iOS, use a path relative to the app's container — absolute paths change between installs.

### Model loads but generation produces garbage

Use an instruction-tuned model (names containing `-it-` or `-instruct`). Base models without instruction tuning generate incoherent text.

### Model loads slowly on first launch

First load includes weight deserialization. Subsequent launches use cached data and are faster. Measure cold-load time from a Release build on the actual target device.

## Memory and crashes

### App terminated on iOS (Jetsam)

iOS terminates apps that exceed memory limits. These limits are well below physical RAM.

Fixes:
- Enable the **Increased Memory Limit** entitlement in your Xcode target.
- Use a smaller model (4B-4bit instead of 9B-4bit) on devices with limited memory.
- Monitor with `phys_footprint` — do not trust `os_proc_available_memory()`, which can overestimate by 2–3 GB.
- Let Edge Kit manage KV cache policy automatically. Do not override `memoryPolicy` unless you have measured the effect.

### Memory grows across turns

Edge Kit's DSR Attention keeps memory bounded. If you see unbounded growth, check:
- You are not accumulating references to old generation results.
- For single-shot tasks (transcription, speech synthesis), the engine releases cache automatically.
- Call `engine.unload()` when switching models.

## Build errors

### SPM "missing module" or "cannot find type"

- Clean DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Ensure your `Package.swift` pins the tested Developer Preview tag exactly: `.package(url: "...", exact: "1.0.0-rc98")`
- Verify Xcode version is 15 or later.

### "Metal library not found" or kernel crash

Edge Kit requires Metal GPU access. Simulators do not support Metal inference — always build for a real device or use the `generic/platform=iOS` destination for compile checks.

## Performance

### TPS much lower than expected

- Confirm you are running a **Release** build. Debug builds are 2–10× slower.
- Check thermal state — a hot device throttles significantly. Cool the device and retest.
- Verify the model quantization level. A 4-bit model is faster than 8-bit or bf16.

### TTFT increases across turns

Expected: TTFT grows with context length. For a 9B model on iPhone, median TTFT stays under 1 second for typical conversations. If TTFT spikes:
- Check conversation length. Very long contexts (>8K tokens) increase prefill time.
- Clear prompt cache to start a fresh conversation: `engine.clearPromptCache()`

## Export and deployment

### Exported bundle does not load in Edge Kit

- Verify the export directory contains `config.json` and all weight shards.
- Ensure the Edge Kit version matches the export version. Pin both.

### Edge Scaffold app shows blank screen

- Check that the model path in `ScaffoldConfig.swift` is correct.
- Run on a real device, not simulator.
- Check Xcode console for error messages on launch.

### Entitlements reset after xcodegen

`xcodegen` can clear entitlements. After regenerating the project, verify that Increased Memory Limit and any network entitlements are still present.

## Edge Mesh

### Devices not discovering each other

- Both devices must be on the same local network.
- Verify `NSLocalNetworkUsageDescription` is set in Info.plist.
- Check that the Bonjour service is not blocked by network configuration.

## Still stuck?

File an issue at [github.com/AtomGradient](https://github.com/AtomGradient) or email [alex@atomgradient.com](mailto:alex@atomgradient.com).
