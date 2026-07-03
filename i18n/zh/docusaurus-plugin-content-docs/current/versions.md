---
sidebar_position: 2
title: 当前版本
slug: /versions
---

# 当前版本

本页是全部 Edge 发布面的 Developer Preview **当前版本权威来源**。安装与配置类
页面仍会展示具体版本号，保证片段可直接复制——那些片段以本页为镜像。如果任何
页面与本页不一致，以本页为准——同时请报告这个不一致。

## 当前预览版本

| 发布面 | 当前版本 | 安装 / 解析 |
|---|---|---|
| Edge Studio | PyPI `edge-studio==0.0.1rc22`，GitHub tag `v0.0.1rc22` | `python -m pip install edge-studio==0.0.1rc22` |
| Edge Kit | `1.0.0-rc103` | SPM `github.com/AtomGradient/edge-kit`，`exact: "1.0.0-rc103"` |
| Edge Engine | `1.0.0-rc143` | 由 Edge Kit 解析；绝大多数 App 不直接 import |
| Edge Halo binary | `1.0.0-rc25` | SPM `github.com/AtomGradient/edge-halo-binary`，`exact: "1.0.0-rc25"` |
| Edge Scaffold | 固定 Edge Kit `1.0.0-rc103` 与 Edge Halo binary `1.0.0-rc25` | 由 Edge Studio 导出生成 |

## 兼容矩阵

| 组件 | 兼容预览版本 |
|---|---|
| Edge Studio | `v0.0.1rc22` |
| Edge Kit | `1.0.0-rc103`，依赖 Edge Engine `1.0.0-rc143` |
| Edge Halo binary | `1.0.0-rc25` |
| Edge Scaffold | 当前预览固定 Edge Kit `1.0.0-rc103` 与 Edge Halo binary `1.0.0-rc25` |

以上组合是成对验证过的。混用其他组合未经测试。

## 版本策略

- Swift 包以 `1.0.0-rcN` tag 发布；Edge Studio Python 包以 `0.0.1rcN` 发布到
  PyPI。文档与生成的工程使用**精确版本固定**。升级前必须在真机上重新验证。
- generic 构建和模拟器检查不足以支撑 runtime 结论。任何预览 tag 变更后必须
  重跑真机验证。
- `0.0.1rc19` 之前的 Edge Studio 预览 wheel 已从 PyPI 移除。更早的 changelog
  条目仅作为发布历史保留，不再是可安装版本。
- API 在 release candidate 之间可能变化。先固定、再验证、然后升级。

## 这些数字从哪来

Edge Kit 与 Edge Engine 固定版本对应 Edge Kit 仓库中经过测试的版本契约
（`.dependency_versions`）；Edge Scaffold 与 Edge Halo binary 固定版本对应
scaffold 模板的 `project.yml` 与 `edge-halo-binary` 包 manifest；Edge Studio
版本对应 PyPI 最新发布。发布历史与逐版本说明见 [Changelog](/docs/changelog)。
