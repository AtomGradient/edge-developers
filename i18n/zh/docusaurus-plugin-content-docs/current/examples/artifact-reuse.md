---
sidebar_position: 5
title: Artifact 复用
---

# 示例：Neural Imprint artifact 复用

本页解释 Neural Imprint artifact 的跨 App **兼容性检查模式**。它不是 runtime sharing 功能，不是分发机制，也不是 cross-device sync。

当两个 app（例如合成参考角色 `NotesAgent` 与 `FinanceAgent`）需要确认自己是否能在各自 compatibility gates 下恢复同一个本地 Neural Imprint capsule 时，可以参考这个模式。

## reuse 的含义

在当前 preview 中，artifact reuse 指：

1. 本地已经存在一个 Neural Imprint capsule。
2. 每个 app 独立读取指向该 capsule 的 receipt 或 manifest。
3. 每个 app 根据自己已加载的 base model、tokenizer、runtime version 和 tool schema hash 构造 runtime requirements。
4. 每个 app 在 restore 前独立校验 capsule。
5. 如果校验失败，app 保持 base model active，并提供 regenerate、re-export 或 load matching model 等恢复路径。

artifact 文件默认不会移动。capsule 如何进入每个 app sandbox 不属于本 preview 页面范围；后续可以由 OS-level file handoff、用户选择导入或显式可信 transport 处理。

## 双 App 参考场景

`NotesAgent` 与 `FinanceAgent` 是合成参考角色：

| App | 自己拥有 | 使用共享 artifact 做什么 |
|---|---|---|
| `NotesAgent` | notes UI、notes storage、note tools、app policy | 针对已加载 notes model 做 compatibility validation |
| `FinanceAgent` | finance UI、finance storage、finance tools、app policy | 针对已加载 finance model 做 compatibility validation |

两个 app 都保留自己的数据和 tools。只有当 app 的 compatibility gates 通过时，Neural Imprint artifact 才能 restore。Tool schema hashes 是 gate 的一部分，因此为一个 tool surface 准备的 capsule 可以在另一个 app 中 fail closed。

## Python receipt smoke

Developer Preview CLI 包含一个用于该概念的 receipt/manifest smoke：

```bash
edge demo reuse --run edge-run-example --apps notes,finance --json
```

该命令读取一个已完成的本地 demo receipt，并写出 per-app reuse manifests。它是 artifact reuse smoke。它不复制 artifacts、不加载模型、不 restore artifact，也不使用网络。

用它验证 receipt shape、per-app manifests 和 local-only safety contract 是否清楚。它不是多个 app 的 runtime evidence。

## Swift 验证路径

Swift 侧的 lower-level package 与 restore coordinator receipt 验证，请使用 Swift CLI 验证指南：

- [`edge-swift imprint validate --fixture --json`](/docs/get-started/swift-cli)
- [`edge-swift imprint restore --fixture --json`](/docs/get-started/swift-cli)

这些命令运行在 EdgeStudio 的 `tests/smoke_test` package 中。restore fixture 是 coordinator path 的 receipt-only smoke，不是生产 restore。

## App 集成边界

在真实 app 中，app layer 仍然负责：

- 哪些本地数据可以用于 personalization。
- 本地 receipts 与 manifests 放在哪里。
- 用户如何 import、select 或 remove Neural Imprint capsule。
- 该 app 可用哪些 tools。
- 如何向用户解释 failed compatibility。

Edge Kit 与 Edge Halo 提供可复用 SDK infrastructure。它们不应拥有 app-specific records、product policy 或 private business logic。

## 安全边界

- Artifact reuse 是 compatibility check pattern。
- 它不是 automatic sharing。
- 它不是 cross-device sync。
- 一个 app 不会触发另一个 app restore。
- receipt smoke 默认不复制 artifacts。
- receipt smoke 不加载模型，也不 restore artifacts。
- compatibility validation 失败时，base model 保持 active。
- 不要把 profile text replay 到 prompts；应 restore 兼容 artifact。
- 没有单独 eval 证据时，不要声称 quality improvement。

## 相关指南

- [Neural Imprint 生命周期](personalized-model.md)
- [Swift CLI 验证](/docs/get-started/swift-cli)
- [架构与产品边界](/docs/guides/architecture)
