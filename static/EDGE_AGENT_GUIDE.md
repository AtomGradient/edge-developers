# EDGE_AGENT_GUIDE.md

> **This file is for your Code Agent, not for you to read.**
> Drop it into your AI coding assistant (Codex, Claude Code, Cursor, OpenCode).
> It will guide you through everything — from install to running a learning
> agent on your iPhone.

---

## For the Code Agent: What You Are Helping Build

You are helping the developer build a **device-resident AI Agent**.

Core concepts:
- **The device is the Agent. The app is the carrier.** Models run and learn on the user's device, no cloud dependency.
- **Edge** is the full stack for building such Agents: inference engine + Swift SDK + learning lifecycle + app template + optimization workbench.
- **Neural Imprint (NI)** is the on-device learning artifact: locally generated, compatibility-gated before restore, removable, does not modify base model weights.
- **RPP** is the self-learning algorithm: generates NI from local signals (user preferences, corrections, facts).
- Data **never leaves the device**. No cloud profile service. No uploads.

## Task 1: Install Edge Studio

### Requirements

| Requirement | Version |
|-------------|---------|
| macOS | 14+ |
| Hardware | Apple Silicon (M1/M2/M3/M4) |
| Python | 3.11 |

### Run

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

### Verify

```bash
edge --version
# Expected: edge-studio 0.0.1rc11 or higher
edge doctor
# Expect everything OK except two benign warnings at this stage:
#   - model.cache    → no model downloaded yet (you fetch one in Task 2)
#   - backend.health → server not running yet (you start it in Task 8)
# Nothing should say `fail`.
```

### If it fails

- `python3.11: command not found` → install it first (`brew install python@3.11`, or your preferred 3.11), then redo the venv step
- `edge: command not found` → confirm venv is active: `which python` should point to `.venv/bin/python`
- `edge doctor` shows a `fail` (not just a `warn`) → follow the remediation text it prints; usually Python version or a missing dependency

## Task 2: Download the model

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

### Verify

```bash
edge models where qwen3.5-9b-4bit
# Shows the local cache path and status: complete
# The printed path is where the model lives — use it to inspect or clean a download.
```

First download is ~5GB and requires network. After that, no network needed.

If a download is interrupted, `edge models where` reports `incomplete` (not a false `complete`), and `edge models fetch` prints a `--retry` command — rerun that to resume with a clean slate.

## Task 3: Try base model chat

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

Ask this question:

```
I have $800 left after bills this month. What should I do with it?
```

**Remember this answer.** It should be generic financial advice (save, invest, pay debt, etc.). This is the base model state — the model doesn't know the user's preferences.

Exit: type `/exit`

## Task 4: Inspect the learning signal

Before running learning, inspect exactly what the Agent will learn:

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text --json
```

### You will see (key fields below — your real output is longer)

The actual `--json` output is 500+ lines: it also includes `schema_version`, `run_id`, `audit`, `preflight`, model-resolution and per-`sha256` fields (for auditing). That is expected — focus on the key fields shown here:

```json
{
  "sample_id": "finance_conservative_cashflow_v1",
  "question": "I have $800 left after bills this month. What should I do with it?",
  "sample_text": {
    "records": [
      {"kind": "explicit_preference", "text": "User prefers conservative, cash-flow-aware guidance"},
      {"kind": "cashflow_context", "text": "User has $800 remaining after bills"},
      {"kind": "trust_boundary", "text": "User wants no unsupported return claims"}
    ]
  },
  "tool_learning": {
    "expected_tool_policy": {
      "tools_available": [
        {"name": "sample_finance_facts_lookup", "when": "Query risk preferences or boundaries"},
        {"name": "sample_finance_cashflow_summary", "when": "Query cash flow or balance"}
      ],
      "negative_policy": [
        "Do not call external market data tools",
        "Do not call tools that require network access",
        "Do not invent return numbers"
      ]
    },
    "policy_kind": "deterministic_preview",
    "actual_tool_calls": false
  }
}
```

**Explain to the developer:**
- This is synthetic data, not real financial information
- `records` are the preference signals given to the Agent
- `expected_tool_policy` is the tool-use policy the Agent will learn
- `dry-run` does not load the model, does not use the network, writes nothing

## Task 5: Compare existing approaches

**Explain to the developer why Edge is different:**

| Approach | What it does | Problem |
|----------|-------------|---------|
| LoRA / fine-tuning | Train an adapter per user | High compute cost, requires release packaging, doesn't scale per-user |
| Prompt stuffing | Paste user profile into every request | Privacy exposure, context bloat, hard to govern |
| Cloud personalization | Upload user behavior to a server | Data leaves device, compliance burden, network dependency |
| **Edge RPP + NI** | Local signals → local learning → local artifact → compatibility-gated restore | No weight changes, no data leaves, removable |

## Task 6: Run learning

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

### Expected output

```
status: completed
sample: finance_conservative_cashflow_v1
artifact: .../neural_imprint.safetensors
metadata: .../neural_imprint_metadata.json
answers_differ: True
receipt: .../learn_receipt.json
next: edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
```

**Key fields:**
- `answers_differ: True` → answers differ before and after learning
- `receipt` → handoff file for `--with-imprint`
- `next` → copy this command to run the next step

## Task 7: Chat after learning

Copy the `next:` command from above:

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive --max-tokens 160 \
  --with-imprint ".../learn_receipt.json"
```

Ask the same question:

```
I have $800 left after bills this month. What should I do with it?
```

**Compare with Task 3.** The answer should now be more conservative, cash-flow focused, avoiding high-risk suggestions.

**Explain to the developer:**
- Same model, same question
- Neural Imprint restored the user's learned preference state
- Base model weights were not modified
- This is not prompt stuffing — the preference was not pasted into the prompt

## Task 8: Export to iPhone

> **Prerequisites:** XcodeGen (`brew install xcodegen`) and Xcode. A real-device build also needs an Apple Developer Team ID and a valid signing identity.
>
> **Getting the Team ID (Code Agents, read this):** run `security find-identity -v -p codesigning` — the 10-character string in parentheses after your *Apple Development* identity is the Team ID. If it returns `0 valid identities found` (no Apple account configured, or you are a sandboxed agent without keychain access), **ask the developer for their Team ID** and have them sign in under Xcode → Settings → Accounts first. The target iPhone/iPad must also be in Developer Mode and trusted on this Mac.

### 8a. Export the Agent app (one command)

```bash
edge export scaffold \
  --model qwen3.5-9b-4bit \
  --app-name FinanceAgent \
  --output ./exports
```

This runs the export directly — no server, no browser. It writes `./exports/FinanceAgent.zip` (a complete Xcode project) and prints the path; add `--json` for machine-readable output (`zip_path`, `next_steps`). If the model isn't downloaded yet it fails closed and tells you to run `edge models fetch` first — it never silently downloads a multi-GB model.

For a one-tap real-device run, also pass signing: `--bundle-id com.example.financeagent --team-id <YOUR_TEAM_ID>`.

> **Prefer a GUI?** `edge studio` opens a local Web UI at `http://127.0.0.1:18842` with the same export under Export → Edge Scaffold. It also starts an EdgeMesh node (HTTP `18842` + mTLS `18843` + mDNS) so your devices can discover each other — allow these if your firewall prompts. The CLI above is the recommended path for Code Agents.

### 8b. Open the project

```bash
unzip ./exports/FinanceAgent.zip -d ./exports
cd ./exports/FinanceAgent          # project root — holds project.yml + FinanceAgent.xcodeproj
open FinanceAgent.xcodeproj
```

The `.xcodeproj` is already generated by the export. The app source lives in the nested `FinanceAgent/` subfolder; `project.yml`, `Resources/`, and the `.xcodeproj` sit at this project root. If you later edit `project.yml`, regenerate with `xcodegen generate`.

### 8c. Build to a real device

In Xcode:
1. Select your Development Team under Signing & Capabilities
2. **Select a real iPhone/iPad — NOT the Simulator.** Edge runs on-device Metal inference and Neural Imprint restore, which only work on real hardware. A Simulator build fails with a cryptic xcframework-slice error because EdgeHalo ships device slices only — this is by design, not a bug.
3. Build & Run

> **First build fetches Swift packages from GitHub** (edge-kit, edge-engine, edge-halo-binary, …), so it needs network access. Behind a restricted network, configure an HTTPS proxy before building.

### 8d. Experience on iPhone

After app launch:

1. **Onboarding** → device assessment → model selection → download model
2. **Chat** → ask "I have $800 left after bills this month. What should I do with it?" → see generic answer
3. **Settings → Personalization** → select domain (e.g. finance) → load synthetic data
4. Wait for on-device learning → Neural Imprint status becomes Active
5. **Chat again** → same question → answer becomes conservative
6. **Airplane mode** → ask again → still works (offline verification)
7. **Clear data** → NI becomes Not active → answer returns to generic (removable verification)

### Available domains (8 built-in)

| Domain | Scenario |
|--------|----------|
| finance | Personal finance |
| health | Fitness & health |
| cooking | Kitchen & cooking |
| reading | Reading & learning |
| journal | Journal & reflection |
| travel | Travel & exploration |
| music | Music & entertainment |
| work | Work & productivity |

Each domain has its own synthetic dataset. Same learning cycle.

## Task 9: Customize your Agent

The exported project has two levels: the **project root** (`FinanceAgent/`) holds `project.yml`, `Resources/`, and the `.xcodeproj`; the **app source** is the nested `FinanceAgent/FinanceAgent/` subfolder (`App/`, `AI/`, `Chat/`, …). The paths below are relative to whichever level each file lives in — Swift sources are under the source subfolder, `Resources/` and `project.yml` are at the root. (`DemoChatView*.swift` is the main view plus per-modality extensions: `+LLM`/`+VLM`/`+TTS`/`+STT`.)

Key files in the exported project:

| File | Purpose | What to change |
|------|---------|---------------|
| `App/ScaffoldConfig.swift` | Global config | App name, model, system prompt, RPP params |
| `AI/AIManager.swift` | Model loading + inference | Loading strategy, engine type |
| `AI/ScaffoldHaloRuntimeAdapter.swift` | Edge Halo bridge | Learning triggers, NI restore logic |
| `Chat/DemoChatView*.swift` | Chat UI | Styling, interaction flow |
| `Business/HomeView.swift` | Home page | Product business logic |
| `Settings/PersonalizationView.swift` | Personalization panel | Learning status display, data management |
| `Resources/SampleData/` | Synthetic data | Replace with your business data schema |
| `Resources/RPP/` | RPP A-library | Model/layer/domain matched basis |
| `project.yml` | XcodeGen config | Dependencies, build settings |

### Common customizations

**Change app name and description:**
→ Edit `ScaffoldConfig.swift`: `appName` and `appDescription`

**Change system prompt:**
→ Edit `ScaffoldConfig.swift`: `defaultSystemPrompt`

**Change model:**
→ Edit `ScaffoldConfig.swift`: `modelID` and `modelDisplayName`

**Change chat UI:**
→ Edit `Chat/DemoChatView*.swift`

**Add a new tab:**
→ Edit `Business/HomeView.swift` TabView

**Switch domain data:**
→ Replace JSON files in `Resources/SampleData/`, keep schema compatible

## Product architecture

```
┌─────────────────────────────────────┐
│       Your Agent carrier app        │
│  UI · permissions · data policy     │
├─────────────────────────────────────┤
│ Edge Kit       Edge Halo    EdgeMesh│
│ inference SDK  learning     mesh    │
├─────────────────────────────────────┤
│         Edge Engine runtime         │
└─────────────────────────────────────┘

Development tools:
  Edge Studio → Edge Scaffold → Xcode → App
```

| Component | Responsibility |
|-----------|---------------|
| **Edge Engine** | Metal inference runtime |
| **Edge Kit** | Swift SDK (inference, model mgmt, voice, vision, Mesh) |
| **Edge Halo** | Learning lifecycle (profile job, NI validation, restore, fail-closed) |
| **Edge Studio** | Optimization workbench + CLI (analyze, benchmark, export) |
| **Edge Scaffold** | iOS Agent carrier template |

## Dependency versions

| Package | Current version | Install |
|---------|----------------|---------|
| edge-studio | 0.0.1rc11 | `pip install --pre edge-studio` |
| edge-kit | 1.0.0-rc98 | SPM: `github.com/AtomGradient/edge-kit` |
| edge-engine | 1.0.0-rc138 | SPM: `github.com/AtomGradient/edge-engine` |
| edge-halo-binary | 1.0.0-rc24 | SPM: `github.com/AtomGradient/edge-halo-binary` |

## Detailed documentation

When you need to go deeper:

| Topic | Link |
|-------|------|
| CLI learning demo | https://atomgradient.github.io/edge-developers/docs/get-started/minute-demo |
| Device Agent learning | https://atomgradient.github.io/edge-developers/docs/get-started/device-agent-learning |
| Neural Imprint vs LoRA/SFT | https://atomgradient.github.io/edge-developers/docs/guides/neural-imprint-vs-lora |
| Architecture | https://atomgradient.github.io/edge-developers/docs/guides/architecture |
| Edge Kit API | https://atomgradient.github.io/edge-developers/docs/api-reference/edge-inference |
| Memory management | https://atomgradient.github.io/edge-developers/docs/guides/memory-management |
| Supported models | https://atomgradient.github.io/edge-developers/docs/guides/supported-models |

## Important constraints

1. **Do not use Simulator** — Metal inference, memory behavior, and NI restore only work on real devices
2. **Do not upload user data** — never send conversations, corrections, or learning artifacts to any remote service
3. **`--pre` is required** — current release is Developer Preview, `pip install` needs the `--pre` flag
4. **Synthetic data is not financial advice** — the finance sample is a teaching demo, not investment advice
5. **NI does not modify model weights** — base model package stays intact, NI is removable runtime state

---

*AtomGradient Edge · [atomgradient.com](https://atomgradient.com) · [GitHub](https://github.com/AtomGradient)*
