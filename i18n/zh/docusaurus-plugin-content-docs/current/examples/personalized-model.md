---
sidebar_position: 4
title: 个性化模型
---

# 示例：个性化模型

本示例构建使用 Edge Halo 进行模型进化的 app 侧控制界面。它收集本地事件、检查进化状态、验证适配器、应用适配器、更新调控并执行回滚。

画像分析任务本身应位于你的私有本地数据层之后。该任务准备 app 批准的示例，运行预览分析 API，然后将 `currentProfile` 暴露给这里展示的 UI。

## 完整代码

创建依赖 Edge Halo 的 SwiftUI app target，并将 app 代码替换为以下内容：

```swift
import EdgeHalo
import Foundation
import SwiftUI

@main
struct PersonalizedModelExampleApp: App {
    var body: some Scene {
        WindowGroup {
            PersonalizationView()
        }
    }
}

struct PersonalizationView: View {
    @StateObject private var model = PersonalizationViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Evolution State")
                .font(.headline)

            Text(model.stateText)
                .font(.body)

            if let profile = model.profile {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Profile")
                        .font(.headline)
                    Text(profile.narrative)
                    Text("Signals: \(profile.directionNames.joined(separator: ", "))")
                        .font(.caption)
                    Text("Stability: \(profile.stabilityScore, format: .number.precision(.fractionLength(2)))")
                        .font(.caption)
                }
            }

            Divider()

            TextField("Adapter path", text: $model.adapterPath)
                .textFieldStyle(.roundedBorder)

            HStack {
                Button("Accepted Reply") {
                    model.recordAcceptedReply()
                }

                Button("Correction") {
                    model.recordCorrection()
                }

                Button("Session Ended") {
                    model.recordSessionCompleted()
                }
            }

            HStack {
                Button("Refresh") {
                    Task { await model.refreshState() }
                }

                Button("Apply Adapter") {
                    Task { await model.applyAdapter() }
                }

                Button("Steer") {
                    Task { await model.updateSteering() }
                }

                Button("Roll Back") {
                    Task { await model.rollback() }
                }
            }

            Text(model.status)
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()
        }
        .padding()
        .task {
            await model.refreshState()
        }
    }
}

@MainActor
final class PersonalizationViewModel: ObservableObject {
    @Published var adapterPath = "\(NSHomeDirectory())/Adapters/user-v1"
    @Published var stateText = "Idle"
    @Published var status = "Ready"
    @Published var profile: UserProfile?

    private let halo: EdgeHalo
    private let eventSink: AsyncStream<HaloDataEvent>.Continuation
    private let baseModelID = "qwen3.5-0.8b"

    init() {
        let events = AsyncStream.makeStream(of: HaloDataEvent.self)
        eventSink = events.continuation

        halo = EdgeHalo(
            engine: DemoEngineSession(),
            generator: DemoTextGenerator(),
            dataStream: events.stream
        )
    }

    func recordAcceptedReply() {
        eventSink.yield(.feedback(
            accepted: true,
            conversationID: UUID().uuidString
        ))
        status = "Feedback stored locally"
    }

    func recordCorrection() {
        eventSink.yield(.correction(
            original: "Draft reply",
            corrected: "Preferred reply",
            conversationID: UUID().uuidString
        ))
        status = "Correction stored locally"
    }

    func recordSessionCompleted() {
        eventSink.yield(.sessionCompleted(
            turnCount: 8,
            conversationID: UUID().uuidString
        ))
        status = "Session event stored locally"
    }

    func refreshState() async {
        let state = await halo.evolutionState
        profile = await halo.currentProfile

        switch state {
        case .idle:
            stateText = "Idle"
        case .collecting(let progress):
            stateText = "Collecting \(progress.collected)/\(progress.threshold)"
        case .readyToTrain:
            stateText = "Ready to train on this user's Mac"
        case .training:
            stateText = "Training"
        case .validating:
            stateText = "Validating"
        case .evolved(let version):
            stateText = "Adapter v\(version.version) active"
        }
    }

    func applyAdapter() async {
        let offer = AdapterVersion(
            version: 1,
            hash: "sha256-adapter-file",
            baseModelID: baseModelID,
            trainingDataHash: "sha256-training-data",
            trainedAt: Date()
        )

        do {
            switch await halo.validateAdapter(offer) {
            case .apply:
                try await halo.applyAdapter(path: adapterPath, version: offer)
                status = "Adapter applied"

            case .validateFirst(let rounds):
                let passed = await runValidation(rounds: rounds)
                if passed {
                    try await halo.applyAdapter(path: adapterPath, version: offer)
                    status = "Adapter validated and applied"
                } else {
                    status = "Adapter validation failed"
                }

            case .rejectIncompatible(let reason):
                status = "Rejected: \(reason)"

            case .rejectOutdated:
                status = "Rejected: an equal or newer adapter is active"
            }

            await refreshState()
        } catch {
            status = "Apply failed: \(error.localizedDescription)"
        }
    }

    func updateSteering() async {
        do {
            try await halo.updateSteering(scales: [0.08, 0.04, 0.02])
            status = "Steering updated for this session"
        } catch {
            status = "Steering failed: \(error.localizedDescription)"
        }
    }

    func rollback() async {
        do {
            try await halo.rollback()
            status = "Rolled back to base model"
            await refreshState()
        } catch {
            status = "Rollback failed: \(error.localizedDescription)"
        }
    }

    private func runValidation(rounds: Int) async -> Bool {
        // Replace with your local evaluation prompts and user-facing checks.
        rounds > 0
    }
}

struct DemoTextGenerator: HaloTextGenerator {
    func tokenize(_ text: String) async throws -> [Int] {
        text.utf8.map(Int.init)
    }

    func generate(prompt: String, maxTokens: Int) async throws -> String {
        "Profile summary for \(prompt.prefix(80))"
    }
}

final class DemoEngineSession: HaloEngineSession, @unchecked Sendable {
    private let lock = NSLock()
    private var adapterPath: String?

    func injectLoRA(adapterPath: String, scale: Float) throws {
        lock.withLock {
            self.adapterPath = adapterPath
        }
    }

    func removeLoRA() throws {
        lock.withLock {
            self.adapterPath = nil
        }
    }

    func captureHiddenState(tokens: [Int], layer: Int) async throws -> [Float] {
        Array(repeating: 0, count: 4096)
    }

    func injectSteering(vectors: [[Float]], layers: [Int], scales: [Float]) throws {
        // Bridge to your loaded model session in production.
    }

    func removeSteering() throws {
        // Clear session-level steering in production.
    }
}
```

## 添加画像分析

面向 app 的模式是：

1. 只收集用户批准的事件。
2. 为画像任务准备本地示例。
3. 从你的本地数据层运行预览分析 API。
4. 读取 `await halo.currentProfile`。
5. 调用 `updateSteering(scales:)`，或在设置中显示画像。

将数据准备代码保留在 app 私有范围内。它不应将原始 correction 复制到日志或分析中。

## 关键概念

- app 组合 Edge Kit 和 Edge Halo。Edge Halo 不拥有你的 UI 或产品策略。
- `HaloDataEvent` 记录 app 允许的信号。
- `EvolutionState` 驱动训练、验证和回滚 UI。
- `AdapterVersion` 和 `AdapterDecision` 保护适配器生命周期。
- `UserProfile` 是本地用户数据，应能从设置中移除。

## 下一步

- 查看 [模型进化能力指南](/docs/build/model-evolution)。
- 当训练或适配器传输应发生在另一台用户自有设备上时，使用 [设备网格](/docs/build/device-mesh)。
