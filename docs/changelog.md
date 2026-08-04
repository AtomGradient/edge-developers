---
sidebar_position: 100
title: Changelog
---

# Changelog

Breaking changes, new features, and migration notes for each Developer Preview release.

:::info Info
Edge products are in **Developer Preview**. Expect breaking changes between releases. Pin your package versions and validate after each upgrade.
:::

## Versioning policy

During Developer Preview, Swift package releases follow `1.0.0-rcN` tags and the Edge Studio Python package releases as `0.0.1rcN` on PyPI. The current pins for every surface live on [Current Versions](/docs/versions). Breaking changes are documented here with migration steps. After general availability, we will follow semantic versioning.

PyPI retention note: Edge Studio preview wheels before `0.0.1rc19` have been removed from PyPI. Changelog entries before `v0.0.1rc19` remain as release history, not as currently installable package pins.

## How to upgrade

1. Update the version pin in your `Package.swift`.
2. Read the changelog entry for any breaking changes.
3. Build and fix compiler errors.
4. Run your test suite on a real device.
5. Verify first-launch, multi-turn, and memory behavior.

## Developer Preview boundaries

Developer Preview is a limited preview channel. The changelog documents what is shipped, what is public, and what is deliberately not enabled yet.

### Current versions

Current version pins and the compatibility matrix live on one page:
[Current Versions](/docs/versions). This changelog records release history and
per-version notes; it is not the source of truth for what to install today.

Generic builds and simulator checks are not enough for runtime claims. Re-run real-device validation after changing any preview tag.

### Known limitations

The B2/B4/B5/B6/B7 CLI commands listed below are shipped in current preview; the limitations describe their safety boundaries.

- `edge studio` launches the local Studio UI and API server on localhost by default. It is a local developer workbench entrypoint, not a hosted service.
- `edge doctor` is a read-only environment check. It does not download models, load models, start the backend, or run Neural Imprint workflows.
- `edge models list`, `edge models where`, and `edge models doctor` are read-only model readiness checks. They do not download models, write receipts, or probe the network.
- `edge models fetch` is an explicit model preparation command with `--dry-run`, source selection, local receipts, and no silent demo download.
- `edge demo chat` is a base-model chat command. It uses an explicitly prepared local model and writes a hash-only `edge.demo.chat.receipt.v1` receipt by default.
- `edge demo receipt` and `edge demo local-only` are receipt inspection tools. They validate `edge.demo.receipt.v1` local-only invariants and do not generate Neural Imprint artifacts or call model runtimes.
- `edge demo imprint run --dry-run` is a pre-flight planner. It emits `edge.demo.imprint.plan.v1` with hash-only sample/question metadata and local model prerequisite status.
- `edge demo imprint run` without `--dry-run` is the Neural Imprint demo. It generates and restores a local artifact and writes a comparison receipt.
- `edge demo imprint compare` is a receipt-only comparison inspector. It reads a completed `edge.demo.receipt.v1` receipt and emits `edge.demo.imprint.compare.v1` without loading models, restoring artifacts, generating answers, or using the network.
- `edge demo learn run --dry-run` is a correction-learning pre-flight planner. It emits `edge.demo.learn.plan.v1` with hash-only synthetic correction metadata and isolated-state paths; it does not write correction ledgers, call regen, load models, or write a learn receipt.
- `edge demo learn run` without `--dry-run` is the correction-learning demo. It writes synthetic Persona/RPP input and correction ledger entries under the demo run state, triggers correction regen, restores the regenerated local Neural Imprint artifact, compares before/after answer hashes, and writes `edge.demo.learn.receipt.v1`.
- `edge demo learn run --prepare-model` combines model preparation and the learning demo in one command. It may explicitly prepare a compatible local model first, then records model-preparation network use separately as `network_used_during_model_prepare` from the local learning demo.
- `edge demo facts import-url` is a bounded single-URL material import path. It accepts HTTP(S) text content, records `network_used=true`, writes hash-only receipts by default, and does not crawl linked pages. In rc22 the optional `host-model` extractor can propose candidate facts from one page with a local Mac model; Edge deterministically validates the structured output before writing facts.
- `edge demo facts crawl-url` is a bounded static HTTP(S) material import path for a small same-origin documentation set. It requires explicit depth, URL, byte, total-byte, and timeout bounds; it does not execute JavaScript, use a browser, consult `robots.txt`, or leave the origin.
- `edge demo tools validate` accepts only local read-only facts lookup manifests in this preview. It does not execute processes, perform network access, or write demo state.
- `edge tools validate` / `edge tools inspect <tools.py>` (rc21+) import the tool file inside an isolated Edge-owned runner subprocess — top-level code executes. They never run developer code in the Edge CLI process, and they are not static safety scans for untrusted files.
- `edge demo chat --tools <tools.py>` (rc21+) enables Edge-managed custom Python tools; it is mutually exclusive with `--tools-manifest` and `--facts-store`. Tool code executes only in the runner subprocess; the model can only emit JSON calls.
- `edge demo chat --tools-manifest <tools.json>` enables developer-named read-only tools backed by local facts stores. It is mutually exclusive with the `--facts-store` shortcut.
- `edge demo reuse` is an artifact reuse smoke check. It reads a completed receipt and writes per-app `edge.demo.reuse.receipt.v1` manifests without copying artifacts, syncing devices, restoring artifacts, loading models, or using the network.
- Product-default paired-device route is not enabled by this preview documentation or changelog. Broad live routing still requires separate explicit policy, opt-in, and real-device evidence.
- Background automation scheduler is not shipped. The bounded automation API remains explicit, dry-run by default, and fail-closed.
- Generic capsule apply-status UI reference is shipped in Edge Scaffold and the dogfood validation app. Product-specific placement, layout, or copy remains outside the preview baseline.
- Model push and product-default Neural Imprint regen execution remain unsupported without separate explicit policy/design. The shipped `edge demo learn run` path is an explicit local synthetic demo.
- EdgeMesh capsule auto-restore SDK orchestration is already shipped through `HaloCapsuleAutoRestoreCoordinator` in Edge Kit `1.0.0-rc94`; it is not a current limitation.

---

## edge-studio

### v0.0.1rc23

- PyPI release candidate version: `0.0.1rc23`. Deterministic install: `python -m pip install edge-studio==0.0.1rc23`.
- Adds generic `read`, `prepare`, and `commit` execution levels for custom Python tools. `commit` calls become local pending actions and run only after an explicit `edge tools confirm` command validates the expiring confirmation token and the frozen tool contract.
- Requires every `return_direct=True` tool to declare a closed `output_schema`. Edge validates the actual tool result before direct delivery and fails closed with `tool_result_schema_mismatch` for missing fields, wrong types, or undeclared fields.
- Confirmation is bound to the tools file, active set, tool schema, arguments, and execution level. Concurrent or repeated confirmation does not re-run a claimed action.
- Known limits: expired pending files are not automatically removed, and a process crash after a side effect but before receipt persistence can leave an audit gap. Edge preserves at-most-once execution and does not retry that action automatically.

### v0.0.1rc22

- PyPI release candidate version: `0.0.1rc22`. Deterministic install: `python -m pip install edge-studio==0.0.1rc22`.
- Adds `edge demo facts import-url --extractor host-model --extractor-model <model>` for local Mac host-model facts extraction. The model output is treated as candidate facts only; Edge validates the structured payload before writing the local facts store. Receipts include hashes for the model, prompt, schema, model input, raw model output, and validated payload, plus truncation metadata and `non_deterministic_extraction=true`.
- Adds `edge demo facts crawl-url <url>` for bounded static same-origin material import. Required bounds are `--max-depth`, `--max-urls`, `--max-bytes`, `--max-bytes-total`, and `--timeout`; receipts capture redirect-chain hashes, per-page statuses, total bytes, same-origin policy decisions, and `network_used=true`.
- Keeps crawling deliberately narrow: no browser, no JavaScript execution, no cross-origin traversal, and no `robots.txt` fetch. You remain responsible for using sources you are allowed to access.
- Updates the Ethereum example as a generic domain-material workflow: URL import, optional local host-model extraction, bounded crawl, custom Python tools, and Neural Imprint learning. Ethereum is an example domain, not a special Edge runtime path.
- Keeps the rc21 custom Python tool path unchanged: `@edge_tool`, `edge tools validate`, `edge tools inspect`, `edge demo chat --tools`, and `edge demo learn run --tools`.

### v0.0.1rc21

- PyPI release candidate version: `0.0.1rc21`. Deterministic install: `python -m pip install edge-studio==0.0.1rc21`.
- Adds custom Python tools. Mark plain functions with `@edge_tool` (`from edgestudio.tools import edge_tool`), then run `edge tools validate <tools.py>`, `edge tools inspect <tools.py>`, and `edge demo chat --tools <tools.py>`. Up to 8 tools are active per run; select with repeatable `--tool <name>` or `--tool-tag <tag>`. See the [Custom Python Tools guide](/docs/knowledge-tools/custom-python-tools).
- Developer tool code never runs in the Edge CLI or model process. Discovery and every call execute in a fixed Edge-owned runner subprocess that verifies the tools file is byte-identical to the frozen active set before importing it (`tools_file_changed` fails closed). Per-call timeout kills the runner; results are capped at 64 KB of canonical JSON.
- Tool schemas are generated deterministically from type hints (`edge.tools.schema_gen.v1`). Supported hints: `str`, `int`, `float`, `bool`, `Literal`, `Optional`, `list[T]`. Unsupported hints fail validation instead of degrading to `Any`.
- Receipts for Python tool runs are hash-first and runner-aware: `tools_file_sha256`, `active_set_sha256`, `schema_generator_version`, and per-call `args_sha256`, `result_sha256`, `tool_schema_sha256`, `runner_secret_verified`, `tools_file_sha256_verified`, `network_used_by_edge: false`.
- Adds `edge demo learn run --tools <tools.py>`: bakes the Python tool contract into the Neural Imprint so a restored Agent already carries the tool schemas. `edge demo chat --with-imprint --tools` gates restore at the schema level: implementation-only edits keep the artifact valid, while schema or active-set changes fail closed and require relearning (`imprint_requires_tools`, `imprint_tool_active_set_mismatch`, `imprint_tool_schema_mismatch`).
- `--tools`, `--tools-manifest`, and `--facts-store` are pairwise mutually exclusive per run; `--tool` / `--tool-tag` require `--tools`.

### v0.0.1rc20

- PyPI release candidate version: `0.0.1rc20`. Deterministic install: `python -m pip install edge-studio==0.0.1rc20`.
- Adds `edge demo facts import-url <url>` for bounded HTTP(S) material import into the local facts store. The importer supports `--split page` and `--split html-table-rows`, records source/final URL hashes, content type, status, raw/extracted hashes, truncation state, and `network_used=true`.
- `html-table-rows` captures links inside each row as data and absolutizes relative `href` values against the final URL. It stores those links in fact text and does not follow them.
- Adds `edge demo tools validate <tools.json>` for `edge.demo.tools.manifest.v1`. The rc20 runtime supports developer-named read-only tools with `kind: "local_facts_lookup"` only.
- Adds `edge demo chat --tools-manifest <tools.json>`. Chat can now use developer-named read-only local fact tools; receipts record `tools_manifest_sha256`, tool summaries, tool calls, and `network_used=false`.
- Adds `edge demo tools validate --learn-sample <sample.json>` mismatch warnings when a learn sample's `tool_schema_export.tools[].name` does not match the runtime tools manifest. The warning is non-blocking so you can audit sample/runtime drift before a run.
- Keeps `edge demo chat --facts-store <store>` as the shortcut for the built-in `local_facts_lookup` tool. Use `--tools-manifest` when the carrier wants stable developer-owned tool names.
- Updates model catalog readiness for local Mac-class workstations so `qwen3.5-27b-4bit` resolves as an LLM-capable local model for learn/chat workflows. The strongest available local model remains a developer choice, not a hard dependency.

### v0.0.1rc19

- PyPI release candidate version: `0.0.1rc19`. Deterministic install: `python -m pip install edge-studio==0.0.1rc19`.
- Adds local facts workflows through `edge demo facts import`, `list`, and `inspect`. The store is local-only and defaults to hash-only inspection output.
- Adds `edge demo chat --facts-store <store>` for read-only `local_facts_lookup` tool use. The tool loop is fail-closed and records `network_used=false`.
- Supports combining `--with-imprint` and `--facts-store`, so Neural Imprint behavior and local fact lookup can run together in one chat path.
- Extends chat receipts with `tool_calls[]`, `tool_instruction_mode`, and `tool_instruction_sha256` for auditable local tool behavior.
- Updates the Neural Imprint prefix renderer to the v2 JSON tool-call contract, keeping baked and runtime tool instructions aligned.
- Lets you refresh local knowledge by re-importing facts into a store without re-running the learning flow.
- Renames the installed Python package namespace from `backend` to `edgestudio`. The public CLI remains `edge`; package-internal source references now use paths such as `edgestudio/cli/demo_samples.py`.
- Keeps `--sample-file` as the customization path for local `edge.demo.learn.sample.v1` JSON learning samples.
- Aligns release metadata with the AtomGradient Proprietary License. The public `AtomGradient/edge-studio` repository is an issue and support shell, not an open-source source distribution.

### v0.0.1rc18

- Historical PyPI release candidate version: `0.0.1rc18` (removed from PyPI; kept here as release history).
- Adds `edge demo learn run --sample-file` for local `edge.demo.learn.sample.v1` JSON samples. The file path overrides built-in `--sample` fixtures and is validated before dry-run or execution.

### v0.0.1rc9

- Historical PyPI release candidate version: `0.0.1rc9` (removed from PyPI; kept here as release history).
- Adds `expected_tool_policy` to the finance learning demo dry-run, receipt, and text preview. The field is a deterministic preview, not a live tool-call trace.
- Updates the first-run developer path into a one-page device Agent flow: preference learning, tool policy inspection, and Edge Studio carrier export.

### v0.0.1rc8

- Historical PyPI release candidate version: `0.0.1rc8` (removed from PyPI; kept here as release history).
- Fixes package version consistency so Python package metadata and `edgestudio_core.__version__` both report `0.0.1rc8`.

### v0.0.1rc7

- Historical PyPI release candidate version: `0.0.1rc7` (removed from PyPI; kept here as release history).
- Adds `finance_conservative_cashflow_v1` as the default learning demo sample. The sample is synthetic, inspectable, finance-shaped, and designed for the device Agent quickstart.
- Updates the public first-run path around raw local signal inspection, base model chat, RPP self-learning, Neural Imprint generation, base model + Neural Imprint chat, and Edge Studio carrier export.

### v0.0.1rc6

- Historical PyPI release candidate version: `0.0.1rc6` (removed from PyPI; kept here as release history).
- Improves Edge Scaffold export documentation. Generated apps now receive an instance-specific README that includes the app name, model name, model path, ODR tag, key files, model loading notes, and troubleshooting.
- Keeps the exported app structure flat: `MyApp/MyApp/App/ScaffoldConfig.swift`, not a triple-nested app path.

### v0.0.1rc5

- Current public Python package distribution name: `edge-studio`.
- Historical PyPI release candidate version: `0.0.1rc5` (removed from PyPI; kept here as release history).
- `edge demo chat` streams tokens in interactive mode and supports Neural Imprint restore through `--with-imprint <learn_receipt.json>`.
- `edge demo learn run --include-text` prints the completed learning receipt and a ready-to-run `next:` command for after-learning chat.
- `edge studio` now reports an already-running EdgeMesh service as an actionable warning while keeping the Studio UI available.

### v0.0.1rc1

- Public Python package distribution name: `edge-studio`.
- Historical PyPI release candidate version: `0.0.1rc1` (removed from PyPI; kept here as release history).
- Installed command surface is intentionally a single `edge` entry point.
- `edge studio` launches the local Studio UI/API server at `http://127.0.0.1:18842` by default.
- `edge demo chat`, `edge demo learn`, model readiness, explicit model fetch, receipt inspection, and install docs are aligned with the public package path.
- The repository history was compacted to a single root commit before public release and tagged `v0.0.1rc1`.

## edge-kit

The current Edge Kit pin lives on [Current Versions](/docs/versions). Preview
capability summary: modules EdgeInference, EdgeModelKit, EdgeVoice, EdgeMesh,
EdgeData, EdgeDataMeshBridge, EdgeUI, EdgeSession; LLM, VLM, TTS, STT engine
support; DSR Attention for long-context multi-turn sessions; automatic KV cache
memory policy; Neural Imprint runtime restore primitives and EdgeMesh capsule
auto-restore coordinator APIs; production app builds can embed generic
`EdgeBuildCommit` metadata for snapshot traceability.

### 1.0.0-rc103

- SDK release gate for this release.
- Aligns `EdgeKitRuntime.version`, `edge-kit/.dependency_versions`, `Package.swift`, and public SPM metadata to Edge Engine `1.0.0-rc143`.
- Keeps the public package graph on `edge-engine`, `swift-transformers`, and `GRDB`; historical `mlx-swift` / `mlx-swift-lm` packages remain out of the default dependency graph.

### 1.0.0-rc98

- Historical SDK release gate.
- Aligns package, tests, and public metadata to Edge Engine `1.0.0-rc138`.
- Keeps RPP orchestration and activation steering implementation out of the public SDK source; those internals live behind Edge Halo.

### 1.0.0-rc94

- Added EdgeMesh capsule auto-restore coordinator APIs.
- Depends on Edge Engine `1.0.0-rc137`.

## edge-halo

The current Edge Halo binary pin lives on [Current Versions](/docs/versions).
Preview capability summary: lifecycle for local profile jobs and Neural Imprint
capsule compatibility; fail-closed validation for model, tokenizer, runtime,
and tool-schema identity; `HaloTextGenerator` and `HaloEngineSession`
protocols; `EdgeHaloRuntime` public actor; RPP A-library provenance validation
and profile artifact lifecycle helpers. Public apps consume the binary package
`edge-halo-binary`; the source repository remains private.

## edge-engine

The current Edge Engine dependency tag lives on
[Current Versions](/docs/versions); it is resolved by Edge Kit rather than
imported directly. Preview capability summary: native Metal inference runtime;
DSR Attention implementation. Unreleased commits on `main` are not part of this
Developer Preview until a new `1.0.0-rcN` release is published.

## edge-scaffold

The current Edge Scaffold pins live on [Current Versions](/docs/versions).
Preview capability summary: iOS app template generation from Edge Studio
export; ScaffoldConfig-based customization; four-tier model delivery
(Cache → Bundle → ODR → HuggingFace).
