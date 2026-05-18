---
sidebar_position: 9
title: Batch & Benchmark
---

# Batch operations and benchmark

Batch and benchmark tools run repeated work across one or more models.

## Benchmark Dashboard

Route: `/benchmark-dashboard`

Benchmark Dashboard runs benchmark jobs and compares results side by side.

Key features:

- Adds one or more model directories to a benchmark queue.
- Runs benchmark tasks across the selected models.
- Shows side-by-side result cards.
- Uses charts for visual comparison.
- Exports results as CSV.
- Tracks disk size, peak memory, tokens per second, time to first token, and perplexity.

Use it when you need comparable measurements for several model candidates or export variants.

## Batch Operations

Route: `/batch`

Batch Operations queues optimization work for multiple models.

Key features:

- Adds multiple models to a queue.
- Applies a selected optimization operation per model.
- Tracks queue progress and per-model status.
- Shows a results table after completion.
- Estimates duration and summarizes failures for follow-up.

Use it when you need to process a model catalog or run the same workflow across several candidates.

## Typical workflow

1. Load or add the models you want to process.
2. Run Batch Operations to create candidates.
3. Open Benchmark Dashboard.
4. Benchmark the original and optimized candidates together.
5. Export only candidates that pass your quality and device-fit checks.
