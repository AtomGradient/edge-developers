---
sidebar_position: 4
title: Host-Model Extraction
slug: /knowledge-tools/host-model-extraction
---

# Host-Model Extraction

Requires edge-studio `0.0.1rc22` or later.

The deterministic URL importer stores a page as one fact, or splits HTML table
rows. For long prose pages where neither is enough, a stronger local Mac model
can read the fetched material and propose discrete facts. The model only
proposes — Edge validates every candidate against `edge.demo.facts.v1` before
anything is written to the store.

## Run It

```bash
edge demo facts import-url "https://example.org/service-reference" \
  --store service_docs_v1 \
  --topic "service reference" \
  --tags service,docs \
  --extractor host-model \
  --extractor-model qwen3.5-27b-4bit \
  --json
```

- The extractor mode is explicit: without `--extractor host-model`, imports
  stay deterministic. There is no silent model fallback.
- `--extractor-model` names a local model; it defaults to `qwen3.5-27b-4bit`.
  If the model is not available locally, the command fails closed with a fetch
  remediation — it never reaches the network to find one.
- Host-model extraction works on single-URL imports only. `crawl-url` does not
  accept it.

## What The Validation Layer Guarantees

Model output is treated as candidate facts only:

1. The model receives the fetched material plus a strict output contract.
2. Edge parses the response and normalizes only the top-level candidate
   wrapper.
3. Every candidate row passes the same deterministic `edge.demo.facts.v1`
   validator used for file imports — required fields, types, and counts.
4. Invalid output fails closed before any store write. The model cannot
   redirect the target store.

## Read The Receipt

The receipt marks this path as non-deterministic and fingerprints every stage:

| Field | Meaning |
|---|---|
| `extractor.mode` | `host-model` |
| `extractor.extractor_model_ref`, `model_path`, `model_sha256` | Which local model ran, with a directory-manifest hash |
| `prompt_sha256`, `schema_sha256` | The exact instruction and output contract |
| `input_sha256`, `model_input_sha256` | The material given to the model |
| `output_sha256`, `validated_payload_sha256` | Raw model output and the validated payload |
| `source_chars`, `model_input_chars`, `input_truncated` | Whether the model saw the whole page: long pages are clipped at `--max-chars`, and the receipt says so truthfully |
| `validation_status` | `passed` — otherwise nothing was written |
| `non_deterministic_extraction` | `true` |

Two different runs on the same page can produce different fact splits — that is
the trade-off you opt into for extraction quality. If the receipt reports
`input_truncated: true`, raise `--max-chars` or import the page in sections.

## When To Use Which Extractor

| Material | Use |
|---|---|
| Index page with an HTML table | Deterministic `--split html-table-rows` |
| Short page, one coherent topic | Deterministic single-page import |
| Long prose with many discrete facts | `--extractor host-model` |
| Several linked pages | [`crawl-url`](/docs/knowledge-tools/import-from-url) (deterministic only) |
