---
sidebar_position: 7
title: Receipts & Local-Only Contract
slug: /knowledge-tools/receipts-and-local-contract
---

# Receipts And The Local-Only Contract

Every learning, import, and chat run writes a local receipt. Receipts are the
audit trail for two promises: **what happened is recorded truthfully**, and
**private data stayed local**. This page covers reading receipts, the hash-only
default, and the local-only verification commands.

## Hash-Only By Default

By default, receipts store hashed identifiers and no raw user text:

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

`--include-text` prints and stores raw text. Use it only with synthetic samples
that are meant to be read. Do not use it with real user prompts or private
records that you would not want printed in a terminal or stored in a local
receipt file.

## What A Learn Receipt Proves

A completed learning run did four local things, and the receipt records each:

1. Wrote the synthetic records into isolated demo state.
2. Recorded the correction.
3. Generated and restored a local Neural Imprint artifact.
4. Compared the answer before and after restore.

The receipt is also the handoff object: `--with-imprint` accepts the
`learn_receipt.json` path, reads the artifact and metadata recorded inside it,
validates them, and fails closed if they do not match. You never pass raw
artifact paths around.

## Inspect Receipts Without Reloading The Model

```bash
edge demo receipt --path <receipt_path>
edge demo local-only --path <receipt_path> --json
```

The local-only check verifies that non-localhost network access did not occur
during the demo. Model preparation (fetching a model you do not have) is
recorded separately as `network_used_during_model_prepare`, so a legitimate
download does not blur the demo's local-only claim.

Network-using commands are explicit about it: URL imports record
`network_used=true` and keep receipts hash-first. See
[Import From URL](/docs/knowledge-tools/import-from-url).

## Carry The Contract Into Your App

The same principles apply to a production carrier:

- Keep private signals local by default; make text exposure an explicit,
  deliberate choice.
- Keep learning state removable — deleting the artifact must return the app to
  the base-model path.
- Keep restore fail-closed on model, tokenizer/template, runtime, and tool
  schema identity.
- Record what happened, truthfully, in a local audit trail your app (and your
  user) can inspect.

## Optional Lower-Level Smoke Checks

```bash
edge demo imprint run --dry-run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint run --sample synthetic_profile_v1 --model qwen3.5-9b-4bit --json
edge demo imprint compare --path <receipt_path> --json
edge demo reuse --run <run_id> --json
```

These commands are useful for artifact reuse and implementation checks. They
are not required for the quickstart path.
