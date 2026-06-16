---
sidebar_position: 2
title: Install Edge Studio from source
---

# Install Edge Studio CLI and Web UI from source

During Developer Preview, the runnable package path is a source checkout of the `edge-studio` repository. The intended public release path is `python -m pip install edgestudio`, but the package is not published to PyPI yet.

> **Preview access**
>
> The repository may require AtomGradient preview access while the Developer Preview remains private. Use the commands below only after your GitHub account has been granted access.

## Requirements

| Requirement | Version |
| --- | --- |
| macOS | 14 or later |
| Hardware | Apple Silicon |
| Python | 3.11 recommended |
| Node.js | Required only for building or developing the Web UI |

## Install the CLI

```bash
git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
edge doctor
```

Use `edge` for model readiness checks, model fetch receipts, and local learning demos:

```bash
edge models where qwen3.5-9b-4bit --json
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive
```

`edge models fetch --source auto` can select the best available preview download path from ModelScope, Hugging Face, or an HF mirror. The download is explicit and writes a receipt.

After `[chat:ready]`, ask a few normal questions and exit with `/exit`. The first 9B model load can take tens of seconds.

After the base chat works, continue to the [CLI learning demo](/docs/get-started/minute-demo) to inspect the synthetic correction sample and compare base vs Neural Imprint restored answer hashes.

## Launch the Web UI

For the Web UI, build the frontend assets once, then start the local server:

```bash
npm --prefix frontend ci
npm --prefix frontend run build
edgestudio
```

Open:

```text
http://127.0.0.1:18842
```

The server runs on localhost by default. Stop it with `Ctrl+C`.

## Build a wheel locally

Use the release packaging script when you need the same shape as the future pip package:

```bash
./scripts/build_wheel.sh
```

The script builds the frontend, packages the backend resources, and writes the wheel under `dist/`.
