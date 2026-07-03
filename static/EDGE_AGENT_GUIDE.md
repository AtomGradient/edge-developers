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
# Expected: edge-studio 0.0.1rc19 or higher (--pre always installs the latest preview)
edge doctor
# Expect everything OK except two benign warnings at this stage:
#   - model.cache    → no model downloaded yet (you fetch one in Task 2)
#   - edgestudio.health → server not running yet (you start it in Task 8)
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

To use a custom local learning sample, save an `edge.demo.learn.sample.v1` JSON
file with `sample_id`, `peer_id`, `app_id`, `base_model_id`, `question`,
`records`, `corrections`, `tool_schema_export`, and `expected_tool_policy`.
Each `corrections[].peer_id` must match the top-level `peer_id`. Then replace
`--sample ...` with:

```bash
--sample-file ./my-learn-sample.json
```

Generate and validate a starter file:

```bash
edge demo learn sample init --output ./my-learn-sample.json
edge demo learn sample validate ./my-learn-sample.json
```

This Mac CLI learning path does not consume the bundled `Resources/RPP/`
A-library. Use `--sample-file` for any local domain sample; A-library assets are
used by the on-device Edge Halo profile-analysis path.

Translate app data before handing it to Edge Studio:

- Keep `records[].kind` stable and semantic, using `snake_case`; it becomes the
  profile body group title (`[kind]`) after records are sorted by
  `(kind, record_id)`.
- Make each record one independently restatable fact, preference, or boundary.
  The built-in finance sample uses `explicit_preference`, `cashflow_context`,
  and `trust_boundary`.
- Use `eval_feedback` for answer ratings (`correction.rating` required),
  `fact_correction` for concrete fact fixes (`target.fact_id` required), and
  `profile_correction` for style or boundary changes (`target.profile_field` or
  `target.direction_id` required).
- Fact corrections need at least two independent supports before entering the
  compiled overlay; a single fact correction is skipped as unstable.
- Do not add app-specific top-level fields such as `transactions` or
  `merchants`; unknown top-level fields fail closed.

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

> **Prerequisites:** XcodeGen (`brew install xcodegen`) and Xcode. A real-device **signed** build additionally needs a signing identity, an Xcode account for the team, and a valid provisioning profile — see the "Real-device signing checklist" in 8c.
>
> **Getting the Team ID (Code Agents, read this):** run `security find-identity -v -p codesigning` — the 10-character string in parentheses after your *Apple Development* identity is the Team ID. If it returns `0 valid identities found` (no Apple account configured, or you are a sandboxed agent whose redirected `$HOME` has no keychain access), **do not try to sign from the sandbox** — a Team ID alone cannot sign; signing needs the private key in the host login keychain. Hand the signed build to a host environment or the developer, or **ask the developer for their Team ID** and have them sign in under Xcode → Settings → Accounts first. The target iPhone/iPad must also be in Developer Mode and trusted on this Mac.

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

The `.xcodeproj` is already generated by the export. The app source lives in the nested `FinanceAgent/` subfolder; `project.yml`, `Resources/`, and the `.xcodeproj` sit at this project root.

> **Editing `project.yml` later?** The export already generated the `.xcodeproj`, so you normally don't need to run `xcodegen generate`. On **rc16+** it is safe to regenerate — the export writes both the model's on-demand-resource (ODR) wiring (`KnownAssetTags` + the model source's `resourceTags`) **and a shared app scheme** into `project.yml`, so `xcodegen generate` preserves them. (rc15 preserved ODR but not the scheme, so `xcodebuild -scheme <App>` could fail after regeneration; rc14 and earlier dropped ODR too — use rc16+.)

### 8c. Build to a real device

> **Not the Simulator.** Edge runs on-device Metal inference and Neural Imprint restore, which only work on real hardware. A Simulator build fails with a cryptic xcframework-slice error because EdgeHalo ships device slices only — this is by design, not a bug.

> **⚠️ Complete Xcode signing setup FIRST — this is a hard prerequisite, not a troubleshooting step.** A signed device build fails *before* the `.app` is ever produced unless all of the following are done on the **host Mac** (not in an agent sandbox):
> 1. **Xcode → Settings → Accounts:** sign in to the Apple Developer account that owns your Team.
> 2. **Signing identity** exists in the host login keychain — a Team ID alone cannot sign. Missing → `No Account for Team "<TEAM_ID>"`.
> 3. **A valid, non-expired *iOS App Development* provisioning profile** for your bundle id — or let `-allowProvisioningUpdates` create one once the account is signed in. Missing/expired → `No matching iOS App Development provisioning profile`.
> 4. **Device:** the target iPhone/iPad is plugged in, unlocked, trusted on this Mac, with Developer Mode enabled.
>
> **Preflight (must pass before the commands below):**
> ```bash
> security find-identity -v -p codesigning   # → ≥1 "Apple Development" identity
> xcrun xctrace list devices                 # → your physical device UDID appears
> ```
> If you are an AI/CLI sandbox reporting `0 valid identities found` while the host has one, your redirected `$HOME` has an empty keychain — **run the signed build from the host environment**, or hand it to the developer.

**Code Agent path (CLI)** — once the preflight passes, find the device, then build → install → launch:

```bash
# 1. List connected, trusted devices; copy your iPhone/iPad UUID
xcrun devicectl list devices

# 2. Signed build for that device (run from the project root — the
#    FinanceAgent/ directory you opened in step 8b). Replace <DEVICE_ID> and <TEAM_ID>.
xcodebuild -project FinanceAgent.xcodeproj -scheme FinanceAgent \
  -configuration Release \
  -destination 'platform=iOS,id=<DEVICE_ID>' \
  -derivedDataPath ./build \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=<TEAM_ID> CODE_SIGN_STYLE=Automatic \
  build

# 3. Install + launch the built .app (bundle id must match --bundle-id from 8a)
xcrun devicectl device install app --device <DEVICE_ID> \
  ./build/Build/Products/Release-iphoneos/FinanceAgent.app
xcrun devicectl device process launch --device <DEVICE_ID> com.example.financeagent
```

**Xcode path (GUI)** — open the project, pick your Development Team under Signing & Capabilities, select the real device (not Simulator), Build & Run.

> **Build Release, not Debug — on-device token generation is 2–10× slower in Debug.** The CLI path above already passes `-configuration Release`. In Xcode the **Run** action defaults to Debug, so switch it: **Product → Scheme → Edit Scheme → Run → Build Configuration → Release**, then Build & Run. (Debug uses `-Onone`; MLX/Metal inference needs the optimized Release build to hit real token speeds.)

> **First build fetches Swift packages from GitHub** (edge-kit, edge-engine, edge-halo-binary, …), so it needs network access. Behind a restricted network, configure an HTTPS proxy before building.

> **Build fails with API errors that contradict the package version SPM just resolved?** After you bump an `edge-kit` / `edge-engine` rc tag, Xcode can keep a previous rc's compiled module in its caches, so the compiler reports missing types or method signatures that no longer match — even though `Package.resolved` already shows the new tag. That is a stale cache, not a real dependency break. Reset and re-resolve:
> ```bash
> rm -rf ./build ~/Library/Developer/Xcode/DerivedData
> rm -rf ~/Library/Caches/org.swift.swiftpm
> xcodebuild -resolvePackageDependencies -project FinanceAgent.xcodeproj
> ```
> Then rebuild. For a hermetic build that never reuses a global cache, add `-clonedSourcePackagesDirPath ./build/spm` so the SPM checkout lives beside DerivedData and is cleared together.

### 8c.1 Keep the Release build fast (model delivery)

By default the export bundles the model into the app (`MODEL_COPY="true"` in `<App>_model_config`). That makes every Release build slow — it copies the whole model, several GB — and the `.app` large. It does **not** change inference speed: delivery location only affects build time and app size, never tokens/sec. Once the model is in memory, the bundle, Documents, and ODR paths all infer at the same speed.

For fast on-device iteration, skip the bundle copy and push the model into the app's `Documents/` container instead. The app's loader checks `Documents/<modelID>` first, so it loads from there. The folder name must match the app's model id (here `Qwen3.5-9B-4bit`):

```bash
DEVICE_ID=...        # xcrun devicectl list devices
BUNDLE_ID=...        # project.yml → PRODUCT_BUNDLE_IDENTIFIER
MODEL_DIR=~/Documents/mlx-community/Qwen3.5-9B-4bit
MODEL_NAME=Qwen3.5-9B-4bit

# 1. Release build WITHOUT bundling the model (fast, small app)
xcodebuild -project FinanceAgent.xcodeproj -scheme FinanceAgent -configuration Release \
  -destination "platform=iOS,id=$DEVICE_ID" -derivedDataPath ./build \
  -allowProvisioningUpdates SKIP_MODEL_COPY=1 \
  DEVELOPMENT_TEAM=<TEAM_ID> CODE_SIGN_STYLE=Automatic build

# 2. Install
xcrun devicectl device install app --device "$DEVICE_ID" \
  ./build/Build/Products/Release-iphoneos/FinanceAgent.app

# 3. Push the model into the app's Documents container
for f in "$MODEL_DIR"/*.json "$MODEL_DIR"/*.txt "$MODEL_DIR"/*.jinja "$MODEL_DIR"/*.safetensors; do
  [ -f "$f" ] && xcrun devicectl device copy to --device "$DEVICE_ID" \
    --source "$f" --destination "Documents/$MODEL_NAME/$(basename "$f")" \
    --domain-type appDataContainer --domain-identifier "$BUNDLE_ID"
done

# 4. Launch — the app loads the model from Documents
xcrun devicectl device process launch --device "$DEVICE_ID" "$BUNDLE_ID"
```

The model persists in `Documents/` across app rebuilds, so later iterations only rebuild the small app and skip the multi-GB push. (This is the same pattern Edge Studio's own `tests/device_test` harness uses for real-device Release runs.)

**Three delivery modes** — same inference speed; they differ only in build time, app size, and how the model reaches the device:

| Mode | Use | Trade-off |
|------|-----|-----------|
| Documents-push (above) | Fast dev iteration | Fast build, small app; push the model once via `devicectl` |
| Bundle (`MODEL_COPY="true"`) | Offline / standalone | Slow build, large app; the model travels inside the `.app` |
| ODR | App Store distribution | On-demand from Apple's CDN; App-thinning |

On **rc100+** scaffolds, **Settings** shows where the model actually loaded from (`Source: Bundle` / `Source: Documents` / `Source: ODR`) and only warns about the `Documents` install path on a genuine load failure (or if model files were misplaced at the Documents root). Older scaffolds showed "Local model not found in Documents/&lt;model&gt;" even after a successful bundle or ODR load — that was a diagnostic artifact, not an error.

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

The scaffold bundles 18 A-library artifacts: 9 direction sets for two Qwen3.5
model families. The generic `directions_a` set has 50 directions per model
family; each bundled domain-specific set currently has 10 directions per model
family. Domain-specific sets cover finance, health, reading, journal, travel,
cooking, music, and work. Missing domain-specific coverage falls back to the
generic `directions_a` set when the model family matches; missing model-family
coverage fails closed.

For a custom device domain, use Edge Studio **Training → A-library generation**
to refine the domain description, suggest editable directions, validate YAML,
generate `.safetensors` artifacts plus a health report, then export with
`edge export scaffold --direction-set-id <id>`.

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

| Package | Validated version | Install |
|---------|----------------|---------|
| edge-studio | 0.0.1rc19 | `pip install --pre edge-studio` |
| edge-kit | 1.0.0-rc100 | SPM: `github.com/AtomGradient/edge-kit` |
| edge-engine | 1.0.0-rc141 | SPM: `github.com/AtomGradient/edge-engine` |
| edge-halo-binary | 1.0.0-rc24 | SPM: `github.com/AtomGradient/edge-halo-binary` |

> These are the versions validated for this guide revision. `--pre` (pip) and SPM resolution may pull a newer compatible preview — take the latest and re-validate on a real device after upgrading.

> **VLM text speed (edge-kit rc100+).** If your model is a vision-language model (e.g. Qwen3.5), text-only chat now runs at full speed by default — the same sampled Metal decode path as a text-only LLM. You do **not** need to switch the model category to `.llm` for fast text. (Earlier builds fell back to a slow reference decoder for sampled text on VLM models; edge-kit rc100 fixed it. Measured on iPhone Air with `Qwen3.5-9B-4bit`: 0.5 → 11.2 tok/s at the default temperature.)

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
