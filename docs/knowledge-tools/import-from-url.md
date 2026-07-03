---
sidebar_position: 3
title: Import From URL
slug: /knowledge-tools/import-from-url
---

# Import From URL

When source material already lives on a documentation page, import it into a
local facts store directly from the URL. Two commands cover this path: a
single-URL import, and an explicitly bounded same-origin crawl. Neither
executes JavaScript or launches a browser, and both write hash-first receipts
with `network_used=true`.

## Import One URL

```bash
edge demo facts import-url "https://example.org/materials" \
  --store protocol_docs_v1 \
  --topic "Protocol documentation" \
  --tags protocol,docs \
  --json
```

For index-style pages with HTML tables, split rows into separate facts:

```bash
edge demo facts import-url "https://example.org/all" \
  --store protocol_docs_v1 \
  --topic "Protocol index" \
  --tags protocol,index \
  --split html-table-rows \
  --fact-id-prefix protocol-index \
  --json
```

`import-url` is not a crawler. It fetches one URL, enforces size and content
limits, and writes hash-only receipts by default. In `html-table-rows` mode,
row links are stored as fact text after URL absolutization; Edge does not
follow those links.

For long prose pages where table-row splitting is not enough, a stronger local
model can propose the facts instead — see
[Host-Model Extraction](/docs/knowledge-tools/host-model-extraction).

## Crawl A Small Same-Origin Documentation Set

Requires edge-studio `0.0.1rc22` or later.

When a documentation set spans a few linked pages, use `crawl-url` instead of
scripting repeated single imports:

```bash
edge demo facts crawl-url "https://example.org/docs" \
  --store protocol_docs_v1 \
  --topic "Protocol docs" \
  --tags protocol,docs \
  --max-depth 1 \
  --max-urls 10 \
  --max-bytes 1000000 \
  --max-bytes-total 5000000 \
  --timeout 15 \
  --json
```

This is a bounded static HTTP(S) crawl:

- **Same origin only, always.** Cross-origin links are not queued, and a
  cross-origin redirect fails closed for that page. There is no cross-origin
  mode.
- **Explicit bounds are required.** `--max-depth`, `--max-urls`, `--max-bytes`,
  `--max-bytes-total`, and `--timeout` have no defaults; hard ceilings apply on
  top of your values.
- **Static fetch only.** No browser, no JavaScript execution; links come from
  static HTML anchors.
- **Hash-first receipts.** The receipt records fetched URL hashes,
  redirect-chain hashes, failed URL statuses, total bytes, and the policy
  decision. The only plaintext URL in the receipt is the start URL you typed.
- **`robots.txt` is not consulted.** The receipt discloses this as an explicit
  policy decision, so point the command only at documentation sets you are
  entitled to fetch.

`crawl-url` uses the deterministic extraction path only. It is a bounded
material importer, not a general web crawler, and it does not accept the
host-model extractor.

## What Lands In The Store

Both commands write facts into the same local SQLite store as file imports:
list and inspect them with `edge demo facts list` / `inspect`, query them in
chat via `--facts-store` or a tools manifest, and refresh them by re-running
the import when the source changes. See
[Local Facts Stores](/docs/knowledge-tools/local-facts).
