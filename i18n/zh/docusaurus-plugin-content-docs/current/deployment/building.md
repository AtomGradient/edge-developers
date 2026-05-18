---
sidebar_position: 3
title: 构建与发布
---

# 构建和发布

像构建普通 iOS app 一样构建 Edge Scaffold app：生成 Xcode 项目、配置签名、在设备上运行，然后 archive。

## 前置条件

| 要求 | 说明 |
| --- | --- |
| Xcode 15 或更高 | iOS 17 target 必需。 |
| XcodeGen | scaffold 项目使用。 |
| Apple Developer 账号 | 设备签名和 App Store 提交必需。 |
| 目标设备 | 运行时验证必需。 |

如有需要，安装 XcodeGen：

```bash
brew install xcodegen
```

## 从 Edge Studio 导出构建

1. 从 Edge Studio 导出 Edge Scaffold 项目。
2. 打开导出的文件夹。
3. 如果尚未生成 Xcode 项目，则先生成。
4. 在 Xcode 中打开项目。
5. 选择真实设备。
6. 构建并运行。

## 手动构建

```bash
xcodegen generate
xcodebuild -scheme EdgeScaffold -configuration Release build
```

如果你的 app 在导出时被重命名，请使用生成的 scheme 名称。

## 签名

在 Xcode 中：

1. 选择 app target。
2. 设置 bundle identifier。
3. 选择你的 team。
4. 启用所需 capabilities。
5. 在真实设备上运行。

对于较大的模型，请启用 Increased Memory Limit entitlement。

## 模型交付

选择符合 app 的模型交付路径：

| 路径 | 适用场景 |
| --- | --- |
| Cache | 开发期间下载或复制模型。 |
| Bundle | 模型足够小，可以随 app 一起发布。 |
| On-Demand Resources | 模型应在安装后由 iOS 下载。 |
| Hugging Face | app 在运行时下载预览模型。 |

## App Store 检查清单

- Release build 能在最低支持设备上运行。
- 全新安装后首次模型加载成功。
- 离线行为对用户清晰。
- app 能处理内存压力和取消。
- 隐私营养标签与数据流一致。
- 如果启用 Edge Mesh，则存在本地网络权限文案。
