---
sidebar_position: 10
title: Personal Training
---

# Personal training

Personal Training creates personalized adapters from local user data.

## Route

`/personal-training`

## What it does

The Personal Training page guides a local workflow from data preparation to adapter testing.

Key features:

- Uploads or prepares user interaction data.
- Selects a base model.
- Starts a local training run.
- Monitors training progress.
- Tests the personalized result against the base model.
- Exports an adapter for deployment with Edge Kit.

## Workflow

1. Collect or upload local training data.
2. Process the data into a training-ready form.
3. Select the base model.
4. Run training on the Mac.
5. Validate the adapter.
6. Compare the personalized response with the base model response.
7. Export the adapter.

## Page sections

| Section | Purpose |
| --- | --- |
| Data | Select or prepare the local dataset. |
| Train | Configure the model source and start the training run. |
| Chat | Test the personalized model behavior. |
| Workflow guide | Shows progress through data, train, and chat stages. |

## Deployment

After export, the adapter can be loaded by Edge Kit in an app that supports LoRA adapters.

## When to use it

Use Personal Training when your app needs user-specific behavior and the personalization data should stay local. Validate the resulting adapter before distributing it to another device.
