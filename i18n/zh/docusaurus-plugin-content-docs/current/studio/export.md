---
sidebar_position: 3
title: 导出
---

# 导出

Edge Studio 导出优化后的模型和 app 项目，供下游使用。

## 导出格式

| 格式 | 用途 |
| --- | --- |
| Edge Kit native | 使用 Edge Kit engine 运行模型。 |
| Edge Scaffold | 生成完整 iOS app 项目。 |
| GGUF | 在兼容推理 engine 中使用模型。 |
| CoreML | 在支持的 Core ML 工作流中集成。 |

## 导出工作流

1. 选择优化后的候选。
2. 选择导出格式。
3. 配置模型名称、类别和目标 app 设置。
4. 导出。
5. 在目标运行时中验证输出。

## Edge Scaffold 导出

Edge Scaffold 导出会创建一个 iOS 项目，其中包含：

- App 元数据。
- 模型引用。
- 生成的配置文件。
- Edge Kit 集成。
- 所选模型类别的 UI 路径。

导出后，打开生成的项目，在真实设备上运行 app，并验证首次启动、模型加载和生成。

## Edge Kit native 导出

当你已经有 app，只需要模型 bundle 时使用此格式。

```swift
import EdgeInference

let engine = LLMEngine()
let modelURL = URL(fileURLWithPath: "/path/to/exported-model")

try await engine.loadLocal(directory: modelURL)
```

## 验证检查清单

- 导出的目录包含 `config.json`。
- 文本模型包含 tokenizer 文件。
- 所选 engine 可以加载模型。
- 首次推理在目标设备上完成。
- app 可以在不重启的情况下卸载或切换模型。
