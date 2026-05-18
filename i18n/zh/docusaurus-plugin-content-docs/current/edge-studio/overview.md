---
sidebar_position: 1
title: 总览
---

# Edge Studio

Edge Studio 是用于准备端侧部署模型的模型优化工作台。

:::info 开发者预览
Edge Studio 目前处于**开发者预览**阶段。发布前请用 Edge Kit 在目标设备上验证每个导出的模型。
:::

## 它做什么

Edge Studio 帮助你：

- 加载并检查模型架构。
- 分析大小和设备适配。
- 应用模型优化。
- 对每个候选进行基准测试。
- 导出到 Edge Kit、GGUF、CoreML 或 Edge Scaffold。

## 流程

```text
Load model -> Analyze -> Optimize -> Benchmark -> Export -> Ship
```

## 能力

| 能力 | 描述 |
| --- | --- |
| 架构支持 | analyzer 支持 117+ 种模型架构。 |
| 模型目录 | 210+ 个模型条目，带面向设备的推荐。 |
| 质量跟踪 | 在优化步骤后进行基准测试和质量检查。 |
| 导出 | Edge Kit native bundle、GGUF、CoreML 和 Edge Scaffold 项目。 |
| App 生成 | 通过 Edge Scaffold 创建可构建的 iOS 项目。 |

## 典型工作流

1. 选择源模型。
2. 选择目标设备类别。
3. 运行分析。
4. 应用优化。
5. 对优化后的模型做基准测试。
6. 导出模型或完整 Edge Scaffold app。

## 下一步

- [模型优化](/docs/edge-studio/optimization)
- [导出](/docs/edge-studio/export)
- [Edge Scaffold 总览](/docs/deployment/app-scaffold)
