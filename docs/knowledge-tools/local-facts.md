---
sidebar_position: 2
title: Local Facts Stores
slug: /knowledge-tools/local-facts
---

# Local Facts Stores

Local facts are the refreshable knowledge path: material the assistant should
look up instead of memorize. Facts live in a local SQLite store, are imported
from files or URLs, and are queried at chat time through a read-only tool. They
never feed the Neural Imprint profile body — update the facts file and re-import
whenever the knowledge changes, with no learning run required.

## Create A Facts File

A facts file is a JSON document with schema `edge.demo.facts.v1`:

```json
{
  "schema_version": "edge.demo.facts.v1",
  "store": "protocol_docs_v1",
  "facts": [
    {
      "fact_id": "rate-limit-policy",
      "topic": "API rate limits",
      "text": "The public API allows 60 requests per minute per key. Batch endpoints are excluded.",
      "tags": ["api", "limits"],
      "source_label": "developer-notes"
    },
    {
      "fact_id": "retention-window",
      "topic": "data retention",
      "text": "Exported reports are retained for 30 days and then deleted automatically.",
      "tags": ["policy", "retention"],
      "source_label": "app-policy"
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `schema_version` | Always `edge.demo.facts.v1` |
| `store` | Local store name. Version it with your material, e.g. `protocol_docs_v1` |
| `fact_id` | Stable ID. Re-importing the same `fact_id` overwrites the old content |
| `topic` | Lookup subject. The model often starts lookups from the topic |
| `text` | The fact text itself |
| `tags` | Keyword array |
| `source_label` | Provenance label, e.g. `developer-notes`, `audit-report`, `app-policy` |

## Import, List, Inspect

```bash
edge demo facts import ./facts.json --store protocol_docs_v1 --json

edge demo facts list --store protocol_docs_v1 --json

edge demo facts inspect rate-limit-policy \
  --store protocol_docs_v1 \
  --include-text \
  --json
```

By default, command output and receipts are hash-only. Fact text is shown only
when you pass `--include-text`.

To import material that lives on a web page instead of a local file, see
[Import From URL](/docs/knowledge-tools/import-from-url).

## Use Facts In Chat: The Shortcut

`--facts-store` registers the built-in read-only `local_facts_lookup` tool for
one store:

```bash
edge demo chat \
  --model qwen3.5-9b-4bit \
  --facts-store protocol_docs_v1 \
  --prompt "What is the API rate limit? Check local facts." \
  --json
```

Without `--facts-store` or `--tools-manifest`, chat does not register a local
facts tool and remains ordinary base-model chat.

## Give The Tool A Developer-Owned Name

The shortcut is fine for quick checks. For app integration, prefer a stable
tool name owned by the carrier. A tools manifest names and binds the built-in
read-only facts lookup executor — it does not register developer-implemented
code:

```json
{
  "schema_version": "edge.demo.tools.manifest.v1",
  "tools": [
    {
      "name": "protocol_docs_lookup",
      "kind": "local_facts_lookup",
      "store": "protocol_docs_v1",
      "description": "Read-only lookup for imported protocol documentation."
    }
  ]
}
```

Validate and use it:

```bash
edge demo tools validate ./tools.json --json

edge demo chat \
  --model qwen3.5-9b-4bit \
  --tools-manifest ./tools.json \
  --prompt "Check local protocol docs before answering." \
  --json
```

The only executable kind in the manifest path is `local_facts_lookup`. Edge owns
the executor, parser, dispatcher, and receipt. The manifest does not authorize
network access, process execution, file writes, or developer-implemented tool
code. To implement your own tool logic as plain Python functions, use
[Custom Python Tools](/docs/knowledge-tools/custom-python-tools) instead.

## What To Check In The Chat Receipt

| Field | Expected result |
|---|---|
| `tool_calls[].name` | Your tool name (`protocol_docs_lookup`) |
| `tool_calls[].rows` | Greater than `0` when local facts matched |
| `tool_calls[].result_sha256` | Hash of the local lookup result |
| `network_used` | `false` |
| `tool_instruction_sha256` | Hash of the model-visible tool instruction |

## Keep Learned Tool Names Aligned

If a learn sample teaches `tool_schema_export.tools[].name =
"protocol_docs_lookup"`, runtime chat should register that same name through
`--tools-manifest`. If you use the `--facts-store` shortcut instead, the sample
should use the built-in `local_facts_lookup` name.

Audit the alignment before a run:

```bash
edge demo tools validate ./tools.json \
  --learn-sample ./sample-that-declares-protocol_docs_lookup.json \
  --json
```

The validator warns on name mismatches but does not block the run; treat the
warning as a signal that the Neural Imprint prefix and runtime tool registry may
teach different names. Fix it by changing either the sample
`tool_schema_export` name or the manifest tool name so they match. See
[Tool Learning](/docs/knowledge-tools/tool-learning) for how tool schemas enter
the Neural Imprint.
