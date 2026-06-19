---
sidebar_position: 2
title: Install Edge Studio
---

# Install Edge Studio

Create and activate a Python 3.11 environment, then install Edge Studio from
the Python package for normal local development:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install edge-studio
edge doctor
```

If you use `uv`:

```bash
uv venv --python 3.11 .venv
source .venv/bin/activate
uv pip install edge-studio
edge doctor
```

Use the source path when contributing to Edge Studio or testing a local checkout.

## Requirements

| Requirement | Version |
| --- | --- |
| macOS | 14 or later |
| Hardware | Apple Silicon |
| Python | 3.11 recommended |
| Node.js | Required only for building or developing the Web UI |

## Install from source

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

The installed package exposes a single `edge` command. Start the local Studio UI
and API server with:

```bash
edge studio
```

Open:

```text
http://127.0.0.1:18842
```

The server runs on localhost by default. Stop it with `Ctrl+C`.

For frontend development from a source checkout, run Vite separately and keep
the backend server running:

```bash
npm --prefix frontend ci
npm --prefix frontend run dev
edge studio
```

## Build a wheel locally

Use the release packaging script when you need the same shape as the published package:

```bash
./scripts/build_wheel.sh
```

The script builds the frontend, packages the backend resources, and writes the wheel under `dist/`.
