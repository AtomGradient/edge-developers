---
sidebar_position: 1
title: Build your first device Agent
sidebar_label: 2. First Device Agent (CLI)
slug: /get-started/minute-demo
---

# Build your first device Agent

Runnable in current preview.

In Edge, the device is the Agent. The app is the carrier.

This page is the shortest complete path through the Developer Preview: install
Edge Studio, inspect a local finance signal, compare the base model, generate a
Neural Imprint, inspect the learned tool policy, then export the same Agent path
to an iPhone carrier.

You will see three moments:

| Moment | What you prove |
| --- | --- |
| Aha #1 | The same base model answers differently after local Neural Imprint restore. |
| Aha #2 | The Agent learns which local tools are available, when to use them, and when not to use them. |
| Aha #3 | The Mac proof becomes a carrier app with the hooks required for device-side learning. |

The finance sample is synthetic and inspectable. It is not financial advice.

## 1. Why This Exists

Personalization is usually heavy:

| Approach | What happens in a real product |
| --- | --- |
| LoRA / fine-tuning | A user preference becomes training, packaging, rollout, rollback, and regression work. |
| Prompt stuffing | Private profile text is repeated in every request and consumes context. |
| Cloud personalization | Sensitive local state leaves the device and adds trust, latency, connectivity, and compliance burden. |

Edge takes a different path. Local signals become removable runtime learning
state. The base model package stays stable. Restore is compatibility-checked
and can fail closed back to the base model.

## 2. Install Edge Studio

Create a Python 3.11 environment and install the public package:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor
```

`--pre` installs the current release candidate. Keep it until the first stable
package is published.

<details>
<summary>Use uv instead</summary>

```bash
uv venv --python 3.11 .venv
source .venv/bin/activate
uv pip install --upgrade --pre edge-studio
edge doctor
```

</details>

`edge doctor` checks the Python environment, model paths, and system
compatibility. The install reference is available in
[Install Edge Studio](/docs/get-started/source-build).

## 3. The Scenario

Imagine a private finance assistant. The user says:

```text
I avoid high-risk recommendations. I care about cash flow and stable returns.
```

Later the user asks:

```text
I have $800 left after bills this month. What should I do with it?
```

The Agent should not become a stock picker. It should respect the user's local
risk boundary, explain cash-flow impact first, use only the local tools exposed
by the carrier, and avoid unsupported return claims.

## 4. Prepare The Model

The demo uses `qwen3.5-9b-4bit`.

```bash
edge models where qwen3.5-9b-4bit
```

If the model is missing, fetch it explicitly:

```bash
edge models fetch qwen3.5-9b-4bit --source auto
```

The demo does not silently download models. If the model is already present,
Edge reuses the local match and reports the cached path.

## 5. Inspect The Local Learning Signal

Before any model load, inspect exactly what the Agent will learn:

```bash
edge demo learn run --dry-run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --include-text \
  --json
```

Look for the records and correction:

```json
{
  "sample_id": "finance_conservative_cashflow_v1",
  "question": "I have $800 left after bills this month. What should I do with it?",
  "sample_text": {
    "records": [
      {
        "kind": "explicit_preference",
        "text": "The synthetic user avoids high-risk recommendations and prefers stable, cash-flow-aware guidance."
      },
      {
        "kind": "cashflow_context",
        "text": "The synthetic user's rent and fixed subscriptions are already covered; they have $800 left after bills this month."
      },
      {
        "kind": "trust_boundary",
        "text": "The synthetic user wants cash-flow impact explained before any recommendation and does not want unsupported return claims."
      }
    ],
    "corrections": [
      {
        "correction_type": "profile_correction",
        "target": {"profile_field": "financial_guidance_style"}
      }
    ]
  }
}
```

The dry run does not load the model, write demo state, restore an artifact, or
use the network. It lets you audit the local learning signal first.

### Customize The Learning Sample

`finance_conservative_cashflow_v1` is the built-in sample shipped with the CLI.
It maps to the packaged fixture in `backend/cli/demo_samples.py`. To use your
own local data, save the same shape as JSON and pass it with `--sample-file`.
Each `corrections[].peer_id` must match the top-level `peer_id`; mismatches fail
closed before the model is loaded.

The Mac CLI learning path does not consume the `Resources/RPP/` A-library. Any
domain-shaped local sample can use `--sample-file`; the A-library is required
later by the on-device Edge Halo profile analysis path.

Start from a validated template:

```bash
edge demo learn sample init --output ./my-budget-sample.json
edge demo learn sample validate ./my-budget-sample.json
```

`validate` reuses the same loader as `--sample-file`. By default it prints only
hashes and counts; add `--json` for a machine-readable report. The template
looks like this:

```json
{
  "schema_version": "edge.demo.learn.sample.v1",
  "sample_id": "my_budget_sample_v1",
  "peer_id": "my-demo-peer",
  "app_id": "com.example.myapp",
  "base_model_id": "qwen3.5-9b-4bit",
  "question": "How should I plan my remaining budget this month?",
  "records": [
    {
      "record_id": "budget-001",
      "kind": "explicit_preference",
      "text": "The user wants fixed expenses and emergency cash protected before discretionary spending.",
      "tags": ["budget", "cashflow"]
    },
    {
      "record_id": "budget-002",
      "kind": "cashflow_context",
      "text": "The user has $800 left after rent, utilities, and subscriptions this month.",
      "tags": ["budget", "cashflow"]
    },
    {
      "record_id": "budget-003",
      "kind": "trust_boundary",
      "text": "The user does not want unsupported return claims or speculative investment recommendations.",
      "tags": ["budget", "trust_boundary"]
    }
  ],
  "corrections": [
    {
      "peer_id": "my-demo-peer",
      "app_id": "com.example.myapp",
      "correction_type": "profile_correction",
      "target": {"profile_field": "budget_guidance_style"},
      "correction": {
        "profile_overlay": {
          "priority": "fixed expenses and emergency cash first",
          "boundary": "no unsupported return claims"
        }
      },
      "status": "recorded"
    }
  ],
  "tool_schema_export": {
    "schema_version": "edgestudio.tool_schema_export.v1",
    "tools": [
      {
        "name": "my_budget_facts_lookup",
        "description": "Read-only lookup for local budget facts.",
        "permissions": ["read_facts"],
        "intentTags": ["exact_fact", "budget"],
        "parameters": {
          "type": "object",
          "properties": {"topic": {"type": "string"}}
        }
      }
    ]
  },
  "expected_tool_policy": {
    "description": "Deterministic tool-use policy learned from this sample",
    "tools_available": [
      {
        "name": "my_budget_facts_lookup",
        "when": "User asks about budget priorities",
        "args_constraint": "topic must reference this budget sample"
      }
    ],
    "negative_policy": ["Do not call network tools", "Do not invent return claims"]
  }
}
```

#### Translate App data into canonical records

Do not put app-specific tables such as `transactions`, `merchants`, or
`categories` at the sample-file top level. Edge Studio accepts the canonical
sample fields above and fails closed on unknown top-level fields. Your app owns
the translation from business data into canonical `records` and `corrections`.

Use `records[].kind` as a stable, semantic `snake_case` vocabulary. It is a free
string, but it is not cosmetic: the profile body sorts records by
`(kind, record_id)` and renders one `[kind]` block per group.

Keep each record to one independently restatable fact, preference, or boundary.
The built-in finance sample uses `explicit_preference`, `cashflow_context`, and
`trust_boundary` for that reason.

Choose `correction_type` by what changed:

| Type | Use when | Required shape |
|---|---|---|
| `eval_feedback` | The user rated a specific answer | `correction.rating` is `positive`, `negative`, or `neutral` |
| `fact_correction` | A concrete fact is wrong | `target.fact_id` plus corrected structured fields |
| `profile_correction` | Behavior style or boundary should change | `target.profile_field` or `target.direction_id` plus structured correction fields |

Fact corrections need at least two independent supporting corrections before
they enter the compiled overlay. A single fact correction is treated as
unstable and skipped, so use `profile_correction` for one-shot style or
guardrail changes.

Then inspect or run it:

```bash
edge demo learn run --dry-run \
  --sample-file ./my-budget-sample.json \
  --model qwen3.5-9b-4bit \
  --json
```

Without `--include-text`, the JSON report keeps the raw sample text out of the
terminal output and returns hashed identifiers instead.

## 6. Ask The Base Model

Start a base-model chat:

```bash
edge demo chat --model qwen3.5-9b-4bit --interactive --max-tokens 160
```

Ask:

```text
you> I have $800 left after bills this month. What should I do with it?
```

The answer is usually useful but generic: savings, debt, investing, and planning
based on goals and risk tolerance. That is the before state. The model has not
restored the user's local finance preference.

Exit with:

```text
you> /exit
```

## 7. Run RPP Self-Learning

Run the local learning flow:

```bash
edge demo learn run \
  --sample finance_conservative_cashflow_v1 \
  --model qwen3.5-9b-4bit \
  --max-tokens 160 \
  --include-text
```

`--include-text` is safe here because the sample is synthetic. Do not use it
with real user prompts or private financial records that you would not want
printed in a terminal or stored in a local receipt.

You should see output shaped like this:

```text
Edge demo learn (edge.demo.learn.run.v1)
status: completed
model: qwen3.5-9b-4bit
model_prepare: skipped_existing
sample: finance_conservative_cashflow_v1
state: .../demo_runs/edge-learn-.../learn_state
generation_job: neural_imprint_gen_...
artifact: .../neural_imprint.safetensors
metadata: .../neural_imprint_metadata.json
answers_differ: True
receipt: .../learn_receipt.json
next: edge demo chat --model qwen3.5-9b-4bit --interactive --with-imprint ".../learn_receipt.json"
raw_text_in_receipt: true
```

The `receipt` path is the handoff object. You do not need to pass the raw
artifact path yourself. `--with-imprint` accepts `learn_receipt.json`, reads the
artifact and metadata recorded inside it, validates them, and fails closed if
they do not match.

## 8. Ask Again With Neural Imprint

Copy the `next:` command from the learn output:

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --interactive \
  --max-tokens 160 \
  --with-imprint ".../learn_receipt.json"
```

Ask the same question:

```text
you> I have $800 left after bills this month. What should I do with it?
```

The answer should move toward conservative, cash-flow-first guidance. In a
verified local run, the restored session produced this behavior shape:

```text
Based on your current cash flow of $800 and your preference for stability, here
is the best way to handle that money:

Priority 1: Preserve Your Cash Flow Stability
...
Emergency Fund Top-up
...
Pay Down High-Interest Debt
```

**Aha #1:** same base model package, same question, local learning state
restored from the receipt.

Exact wording can vary by model build and generation settings. The contract is
that behavior changed after restoring local Neural Imprint artifact for the
inspected synthetic signal.

## 9. Inspect The Tool Policy

The same dry-run JSON now includes `expected_tool_policy`:

```json
{
  "tool_learning": {
    "policy_kind": "deterministic_preview",
    "actual_tool_calls": false,
    "expected_tool_policy": {
      "description": "Deterministic tool-use policy learned from this sample",
      "tools_available": [
        {
          "name": "sample_finance_facts_lookup",
          "when": "User asks about specific financial preferences or risk boundaries",
          "args_constraint": "topic must be one of: risk_boundary, cashflow, trust_boundary"
        },
        {
          "name": "sample_finance_cashflow_summary",
          "when": "User asks about current cash flow, bills, or available balance",
          "args_constraint": "scope must be a recognized finance scope"
        }
      ],
      "negative_policy": [
        "Do not call external market data tools",
        "Do not call tools that require network access",
        "Do not invent financial return numbers without user-provided facts"
      ]
    }
  }
}
```

**Aha #2:** the Agent is not only learning who the user is. It is also learning
which local tools the carrier exposes, when they are appropriate, and which
tools or claims are out of bounds.

This is a deterministic preview, not a live tool-call trace. The tools are
synthetic read-only tools, not financial services. When the live tool runner is
exposed in this path, the trace field will be named separately.

## 10. Inspect The Receipt And Local-Only Contract

The learning run did four local things:

1. Wrote the synthetic records into isolated demo state.
2. Recorded the synthetic correction.
3. Generated and restored a local Neural Imprint artifact.
4. Compared the answer before and after restore.

By default, receipts are local and hash-only. In this guide, `--include-text`
prints and stores raw text only because the sample is synthetic and meant to be
read. Without `--include-text`, the receipt keeps hashed identifiers and no raw
user text:

```json
{
  "raw_text_included": false,
  "network_used_during_demo": false,
  "network_used_during_model_prepare": false,
  "question_sha256": "sha256:...",
  "before_answer_sha256": "sha256:...",
  "after_answer_sha256": "sha256:...",
  "expected_tool_policy_sha256": "sha256:..."
}
```

Inspect a receipt without loading the model again:

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

The local-only check verifies that non-localhost network access did not occur
during the demo. Carry the same principle into your carrier: keep private
signals local by default, keep learning state removable, and keep restore
fail-closed.

Optional lower-level Neural Imprint smoke checks:

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

These commands are useful for artifact reuse and implementation checks. They
are not required for the 5-minute demo.

## 11. Export The Agent Carrier To iPhone

Open the local workbench:

```bash
edge studio
```

Open `http://127.0.0.1:18842`.

In Edge Studio:

1. Load the same model.
2. Open **Export**.
3. Choose **Edge Scaffold**.
4. Export the Agent carrier and download the project.

The exported app is not just a static shell, but it is also not a pre-learned
copy of the Mac demo. In the current preview, Edge Studio does not automatically
embed the `learn_receipt.json` from Step 7 into the ZIP. The Mac receipt proves
the learning mechanism and gives you a local artifact to inspect. The exported
carrier gives the iPhone app the runtime wiring needed to learn from device
signals.

The ZIP contains:

| Part | Role |
| --- | --- |
| App source and `ScaffoldConfig.swift` | The carrier surface, model settings, sample domain, and runtime knobs. |
| Edge Kit / Edge Engine dependencies | On-device model loading, streaming generation, and hidden-state capture support. |
| Edge Halo binary dependency | Neural Imprint lifecycle: profile work, artifact capture, compatibility validation, and restore. |
| `Resources/SampleData/` | Synthetic facts and sample domains for first-run smoke checks. |
| `Resources/RPP/` | Optional model-matched RPP A-library assets. If empty, RPP behavior fails closed instead of pretending to learn. |

The RPP A-library is not the learned user state. It is a model/layer/domain
matched basis that lets Edge Halo run profile analysis on local records. A
Neural Imprint artifact is generated later from the device's local facts,
corrections, tool schema, and model session.

Open the generated project:

```bash
cd FinanceAgent/FinanceAgent
xcodegen generate
open FinanceAgent.xcodeproj
```

Then select a signing team, choose a physical iPhone or iPad, and build. Do not
use Simulator for this validation path.

On the device, validate two things separately.

First, validate the carrier:

```text
I have $800 left after bills this month. What should I do with it?
```

- Model/session status is local.
- The app loads the intended model and chat path.
- The app still runs the intended path with Airplane Mode enabled.

Second, validate device-side learning when your export includes the required
RPP assets and you have enabled an app trigger:

1. The app records local, app-approved signals through its data layer: settings,
   facts, explicit corrections, and the local tool schema.
2. App code or a user-visible control starts the Edge Halo profile job after
   the model is loaded and enough eligible facts exist. It should not be a
   hidden background surprise.
3. Edge Halo runs RPP profile analysis on the device using the bundled
   `Resources/RPP/` A-library, captures a Neural Imprint artifact, and writes a
   local capsule.
4. The capsule is restored only after compatibility checks for the model,
   tokenizer/runtime, cache backend, and tool schema pass.
5. A new phone-side preference, for example "I want to be more aggressive now,"
   becomes a new local correction. The carrier can trigger a later profile job
   and replace the active capsule only after the same validation gates pass.

Current preview boundary: the CLI path above is the deterministic proof of
learning and restore. The exported scaffold exposes the device-side runtime
wiring, fail-closed RPP behavior, and smoke surfaces. Product-specific trigger
policy, consent UI, deletion UX, and task evaluation remain app work before you
make production claims.

**Aha #3:** the Mac demo proves the mechanism; the carrier app is where the
same learning loop belongs on the device. The app is the carrier; the device is
the Agent.

## 12. What Just Happened

- The Agent learned from a local synthetic finance signal.
- RPP self-learning produced a local learning representation.
- Neural Imprint restored that state into a compatible model session.
- Restore passed through model, tokenizer, runtime, and tool-schema
  compatibility checks.
- The tool policy showed which local tools are appropriate and which actions
  are out of bounds.
- The exported carrier separates the Mac proof artifact from the device-side
  learning loop.
- If compatibility fails, the product keeps the base-model path.

This is not LoRA, SFT, prompt stuffing, or cloud personalization.

## 13. Common Questions

### Is this LoRA or SFT?

No. LoRA and SFT are useful when you intentionally want a trained model or
adapter release. That requires compute, data curation, release packaging,
rollback, and regression evaluation. Neural Imprint is a different contract for
per-user device learning: the base model package stays stable, and local
learning state is restored only when compatibility checks pass.

### Is this prompt stuffing?

No. Prompt stuffing repeats profile text or instructions inside every request.
That consumes context budget and replays private state. The after-learning chat
restores local runtime state from a Neural Imprint receipt, then handles the
current message through the normal generation path.

### What did the Agent learn?

Only the synthetic signal you inspected: risk boundary, cash-flow context,
trust boundary, and expected local tool policy. In a real finance product, those
signals would come from app-approved local settings, explicit user preferences,
and user-visible corrections. The carrier app owns that policy.

### Does the exported app already contain the Mac learning result?

Not by default. The current export does not automatically package the Step 7
`learn_receipt.json` or its Neural Imprint artifact into the app. That is
deliberate: a user's learned state should be owned by the device/carrier
lifecycle, not silently baked into a template ZIP. Use the Mac demo to inspect
and prove the mechanism; use the exported app to wire the same lifecycle on a
real device.

### How does the phone learn a new preference?

The carrier records a user-approved signal locally, such as a setting,
correction, or classified fact. When the app decides the signal is eligible, it
starts a device-side Edge Halo job. That job uses the local model session,
local tool schema, and bundled RPP A-library to build a new Neural Imprint
capsule. Restore is compatibility-checked and fail-closed. The phone does not
need to return to the Mac or re-export the app for every new preference.

### Does `answers_differ: True` prove production readiness?

No. It proves that the restored Neural Imprint artifact is active for this
controlled synthetic example and that the answer moved after restore. Production
readiness still needs task-specific evaluation, UI controls, deletion UX, and
real-device validation.

## 14. Next: Experience It on iPhone

You just proved learning works on the Mac. Now see the same thing happen on a real device.

**→ [Device Agent Learning](/docs/get-started/device-agent-learning)** — export the carrier, deploy to iPhone, pick a domain, trigger on-device learning, see the behavior change, verify offline, and remove the learned state.

---

- Developer docs: [atomgradient.github.io/edge-developers](https://atomgradient.github.io/edge-developers/)
- GitHub: [github.com/AtomGradient](https://github.com/AtomGradient)
- Install reference: [Install Edge Studio](/docs/get-started/source-build)
