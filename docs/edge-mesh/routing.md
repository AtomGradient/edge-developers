---
sidebar_position: 3
title: Task Routing
---

# Task routing

{/* CODEX: Write routing guide. Cover:
  - Automatic routing of inference tasks to best available device
  - MeshRouter: decides which device handles a request
  - Factors: model availability, device capability, current load, thermal state
  - Fallback: if preferred device unavailable, routes to next best
  - Streaming responses work across mesh (same API as local)
  
  Show example: send inference request through mesh, receive streaming response.
  
  DO NOT expose:
  - Routing score calculation
  - Load balancing algorithm
  - Topology update protocol
*/}
