---
sidebar_position: 11
title: Devices
---

# Devices

Devices is the EdgeMesh device-management page for trusted local devices.

## Route

`/devices`

## What it does

The Devices page shows the local Mac, paired devices, pairing requests, and device readiness for EdgeMesh workflows.

Key features:

- Shows local host identity and mesh status.
- Lists trusted iPhones, iPads, and Macs.
- Shows device capability summaries such as chip, memory, and GPU information when available.
- Shows device status such as available, busy, or offline.
- Starts pairing for a new device.
- Revokes or deletes trusted devices.
- Shows event summary cards for recent mesh activity.
- Helps assess whether a device can run a selected model or receive a personalized adapter.

## Page sections

| Section | Purpose |
| --- | --- |
| Local identity | Confirms the current Mac and local mesh service status. |
| Trusted devices | Lists paired devices and their availability. |
| Pairing | Starts a new device pairing flow. |
| Pending requests | Shows devices waiting for approval. |
| Activity summary | Summarizes recent local mesh events. |
| Training distribution | Shows when a personalized adapter can be sent to a trusted device. |

## When to use it

Use Devices when you need to connect an iPhone, iPad, or another Mac to the local Edge Studio host. It is also the place to revoke access when a device should no longer participate.

## Validation checklist

- Confirm the local Mac shows as available.
- Pair the target device and verify it appears in the trusted list.
- Check the device status before starting a long-running workflow.
- Remove devices that are no longer trusted.
- Re-check compatibility after switching model candidates.
