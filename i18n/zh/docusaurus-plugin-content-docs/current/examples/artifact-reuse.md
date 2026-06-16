---
sidebar_position: 5
title: 产物复用
---

# 示例：Neural Imprint 产物复用

本页解释 Neural Imprint 产物的跨 App **兼容性检查模式**。它不是运行时共享功能，不是分发机制，也不是跨设备同步。

当两个 App（例如合成参考角色 `NotesAgent` 与 `FinanceAgent`）需要确认自己是否能在各自兼容性闸门下恢复同一个本地 Neural Imprint capsule 时，可以参考这个模式。

## 复用的含义

在当前预览版中，产物复用指：

1. 本地已经存在一个 Neural Imprint capsule。
2. 每个 App 独立读取指向该 capsule 的回执或 manifest。
3. 每个 App 根据自己已加载的基础模型、tokenizer、运行时版本和工具 schema 哈希构造运行时要求。
4. 每个 App 在恢复前独立校验 capsule。
5. 如果校验失败，App 保持基础模型活跃，并提供重新生成、重新导出或加载匹配模型等恢复路径。

产物文件默认不会移动。capsule 如何进入每个 App sandbox 不属于本预览页面范围；后续可以由系统级文件交接、用户选择导入或显式可信传输处理。

## 双 App 参考场景

`NotesAgent` 与 `FinanceAgent` 是合成参考角色：

| App | 自己拥有 | 使用共享产物做什么 |
|---|---|---|
| `NotesAgent` | notes UI、notes storage、note 工具、App 策略 | 针对已加载 notes model 做兼容性验证 |
| `FinanceAgent` | finance UI、finance storage、finance 工具、App 策略 | 针对已加载 finance model 做兼容性验证 |

两个 App 都保留自己的数据和工具。只有当 App 的兼容性闸门通过时，Neural Imprint 产物才能恢复。工具 schema 哈希是闸门的一部分，因此为一个工具表面准备的 capsule 可以在另一个 App 中失败即关闭。

## Python 回执冒烟检查

开发者预览 CLI 包含一个用于该概念的回执/manifest 冒烟检查：

```bash
edge demo reuse --run edge-run-example --apps notes,finance --json
```

该命令读取一个已完成的本地演示回执，并写出每个 App 的复用 manifest。它是产物复用冒烟检查。它不复制产物、不加载模型、不恢复产物，也不使用网络。

用它验证回执形状、每个 App 的 manifest 和仅本地安全约定是否清楚。它不是多个 App 的运行时证据。

## Swift 验证路径

Swift 侧的底层 package 与 restore coordinator 回执验证，请使用 Swift CLI 验证指南：

- [`edge-swift imprint validate --fixture --json`](/docs/get-started/swift-cli)
- [`edge-swift imprint restore --fixture --json`](/docs/get-started/swift-cli)

这些命令运行在 EdgeStudio 的 `tests/smoke_test` package 中。restore fixture 是 coordinator path 的仅回执冒烟检查，不是生产恢复。

## App 集成边界

在真实 App 中，App 层仍然负责：

- 哪些本地数据可以用于个性化。
- 本地回执与 manifests 放在哪里。
- 用户如何导入、选择或移除 Neural Imprint capsule。
- 该 App 可用哪些工具。
- 如何向用户解释兼容性失败。

Edge Kit 与 Edge Halo 提供可复用 SDK 基础设施。它们不应拥有 App 专属记录、产品策略或私有业务逻辑。

## 安全边界

- 产物复用是兼容性检查模式。
- 它不是自动共享。
- 它不是跨设备同步。
- 一个 App 不会触发另一个 App 恢复。
- 回执冒烟检查默认不复制产物。
- 回执冒烟检查不加载模型，也不恢复产物。
- 兼容性验证失败时，基础模型保持活跃。
- 不要把画像文本重放到 prompt；应恢复兼容产物。
- 没有单独评估证据时，不要声称质量提升。

## 相关指南

- [Neural Imprint 生命周期](personalized-model.md)
- [Swift CLI 验证](/docs/get-started/swift-cli)
- [架构与产品边界](/docs/guides/architecture)
