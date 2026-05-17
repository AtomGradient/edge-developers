---
sidebar_position: 2
title: Model Optimization
---

# Model optimization

Model optimization reduces model size and improves runtime fit while monitoring output quality.

## Optimization types

| Type | Description |
| --- | --- |
| Quantization | Reduces weight precision to lower disk and memory use. |
| Vocabulary pruning | Removes unused tokens for supported workflows. |
| Layer optimization | Produces a smaller deployment candidate when quality checks pass. |

## Workflow

1. Choose a model.
2. Select a target device class.
3. Run analysis.
4. Apply one optimization at a time.
5. Benchmark the candidate.
6. Compare quality and resource use.
7. Export only the candidate that passes your app's quality bar.

## Quality monitoring

Use the built-in benchmark view to compare:

| Metric | Why it matters |
| --- | --- |
| Disk size | App download size and storage use. |
| Memory | Device fit and stability. |
| Tokens per second | Interactive responsiveness. |
| Perplexity | Regression signal for text quality. |

## Device-aware recommendations

Edge Studio can recommend a deployment target based on the selected device class. Treat recommendations as a starting point, then validate with Edge Kit on the actual device.

## Best practices

- Optimize in small steps.
- Benchmark after every step.
- Keep the original model as the source of truth.
- Use the same prompts when comparing candidates.
- Export a new candidate only after benchmark results are acceptable.
