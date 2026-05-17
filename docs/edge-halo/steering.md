---
sidebar_position: 4
title: Activation Steering
---

# Activation steering

Activation steering adjusts model behavior during inference without retraining.

Use it for session-level adjustments such as tone, formality, verbosity, or domain focus. Steering is ephemeral: remove it when the session ends or when the user changes modes.

## Update steering from the current profile

```swift
try await halo.updateSteering()
```

Provide scales when your app has validated them:

```swift
try await halo.updateSteering(scales: [0.08, 0.05, 0.03])
```

## Direct engine-session API

`HaloEngineSession` exposes the low-level operations Edge Halo needs:

```swift
try engineSession.injectSteering(
    vectors: steeringVectors,
    layers: selectedLayers,
    scales: steeringScales
)

try engineSession.removeSteering()
```

Keep layer selection and scale calibration inside your app or validation tooling. Public app code should treat steering as a validated runtime configuration.

## Combine steering and adapters

Adapters are better for durable personalization. Steering is better for temporary adjustments.

| Mechanism | Use it for |
| --- | --- |
| Adapter | Long-lived user-specific behavior. |
| Steering | Session-level tone, verbosity, or focus. |
| Both | Adapter for baseline personalization, steering for temporary adjustment. |

## Session cleanup

Remove steering when the inference session ends:

```swift
try engineSession.removeSteering()
```

If the user starts a new conversation with different behavior settings, remove the old steering before applying the new one.
