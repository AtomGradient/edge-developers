// SPDX-License-Identifier: LicenseRef-AtomGradient-Proprietary
// Copyright (c) 2026 AtomGradient. All rights reserved.
// 版权所有 (c) 2026 质子梯度（北京）科技有限公司。保留所有权利。
// Unauthorized copying, distribution, or use is strictly prohibited.
// 未经授权，禁止复制、分发或使用本文件。
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

type LinkCard = {
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel?: string;
  secondaryLink?: string;
};

type Step = {
  label: string;
  title: string;
  body: string;
  link?: string;
};

const enSteps: Step[] = [
  {
    label: '1',
    title: 'Install Edge Studio',
    body: 'Create a Python 3.11 environment, install the public edge-studio package, and run the local doctor check.',
    link: '/docs/get-started/source-build',
  },
  {
    label: '2',
    title: 'See local learning',
    body: 'Run the local learning demo, inspect the synthetic input, then map the same lifecycle to a finance preference.',
    link: '/docs/get-started/minute-demo',
  },
  {
    label: '3',
    title: 'Build the app',
    body: 'Export an Edge Scaffold project, open it in Xcode, and validate the same learnable behavior on a real device.',
    link: '/docs/examples/build-and-ship',
  },
];

const zhSteps: Step[] = [
  {
    label: '1',
    title: '安装 Edge Studio',
    body: '创建 Python 3.11 环境，安装公开的 edge-studio 包，并先运行本地 doctor 检查。',
    link: '/docs/get-started/source-build',
  },
  {
    label: '2',
    title: '看见本地学习',
    body: '运行本地学习 demo，检查合成输入，再把同一套生命周期映射到理财偏好。',
    link: '/docs/get-started/minute-demo',
  },
  {
    label: '3',
    title: '构建 App',
    body: '导出 Edge Scaffold 项目，在 Xcode 中打开，并在真机上验证同一套可学习行为。',
    link: '/docs/examples/build-and-ship',
  },
];

const enPaths: LinkCard[] = [
  {
    eyebrow: 'Python / CLI',
    title: 'Prove learning locally',
    body: 'Before you build UI, inspect a controlled synthetic sample and verify that a local learning artifact changes runtime behavior without replacing the model package.',
    primaryLabel: 'Run the learning demo',
    primaryLink: '/docs/get-started/minute-demo',
    secondaryLabel: 'Install Edge Studio',
    secondaryLink: '/docs/get-started/source-build',
  },
  {
    eyebrow: 'iOS / Swift',
    title: 'Build a learnable iOS app',
    body: 'Export the scaffold, wire the public Edge Kit package and Edge Halo binary package, then validate model load and local learning restore on a real device.',
    primaryLabel: 'Build the learnable app',
    primaryLink: '/docs/examples/build-and-ship',
    secondaryLabel: 'Minimal iOS shell',
    secondaryLink: '/docs/get-started/minimal-ios-app',
  },
];

const zhPaths: LinkCard[] = [
  {
    eyebrow: 'Python / CLI',
    title: '先在本地证明学习有效',
    body: '构建 UI 前，先检查受控合成样本，验证本地学习产物能改变运行时行为，同时不替换模型包。',
    primaryLabel: '运行学习演示',
    primaryLink: '/docs/get-started/minute-demo',
    secondaryLabel: '安装 Edge Studio',
    secondaryLink: '/docs/get-started/source-build',
  },
  {
    eyebrow: 'iOS / Swift',
    title: '构建可学习的 iOS App',
    body: '导出 scaffold，接入公开的 Edge Kit package 和 Edge Halo binary package，然后在真机上验证模型加载和本地学习恢复。',
    primaryLabel: '构建可学习 App',
    primaryLink: '/docs/examples/build-and-ship',
    secondaryLabel: '最小 iOS 应用壳',
    secondaryLink: '/docs/get-started/minimal-ios-app',
  },
];

const enCapabilities: LinkCard[] = [
  {
    eyebrow: 'Inference',
    title: 'Text generation',
    body: 'Stream local LLM responses with multi-turn session state.',
    primaryLabel: 'Text generation guide',
    primaryLink: '/docs/build/text-generation',
  },
  {
    eyebrow: 'Multimodal',
    title: 'Vision',
    body: 'Use vision-language models for image understanding on device.',
    primaryLabel: 'Vision guide',
    primaryLink: '/docs/build/vision',
  },
  {
    eyebrow: 'Voice',
    title: 'Speech and voice',
    body: 'Build local speech-to-text and text-to-speech loops.',
    primaryLabel: 'Speech guide',
    primaryLink: '/docs/build/speech-to-text',
  },
  {
    eyebrow: 'Core concept',
    title: 'Neural Imprint',
    body: 'A removable local learning artifact: user-specific behavior can be restored into a compatible session while the base model package stays unchanged.',
    primaryLabel: 'Model evolution',
    primaryLink: '/docs/build/model-evolution',
  },
  {
    eyebrow: 'SDK',
    title: 'Edge Kit',
    body: 'Swift APIs for local inference, model management, EdgeData, EdgeMesh, EdgeSession, EdgeUI, speech, and vision.',
    primaryLabel: 'Edge Inference API',
    primaryLink: '/docs/api-reference/edge-inference',
  },
  {
    eyebrow: 'Local mesh',
    title: 'Device Mesh',
    body: 'Route and transfer artifacts between trusted user-owned Apple devices.',
    primaryLabel: 'Device Mesh guide',
    primaryLink: '/docs/build/device-mesh',
  },
];

const zhCapabilities: LinkCard[] = [
  {
    eyebrow: '推理',
    title: '文本生成',
    body: '用多轮 session state 流式生成本地 LLM 回答。',
    primaryLabel: '文本生成指南',
    primaryLink: '/docs/build/text-generation',
  },
  {
    eyebrow: '多模态',
    title: '视觉理解',
    body: '在端侧使用视觉语言模型理解图像。',
    primaryLabel: '视觉指南',
    primaryLink: '/docs/build/vision',
  },
  {
    eyebrow: '语音',
    title: '语音与声音',
    body: '构建本地 speech-to-text 和 text-to-speech 闭环。',
    primaryLabel: '语音指南',
    primaryLink: '/docs/build/speech-to-text',
  },
  {
    eyebrow: '核心概念',
    title: 'Neural Imprint',
    body: '可删除的本地学习产物：用户特定行为可以恢复进兼容 session，同时基础模型包保持不变。',
    primaryLabel: '模型进化',
    primaryLink: '/docs/build/model-evolution',
  },
  {
    eyebrow: 'SDK',
    title: 'Edge Kit',
    body: '面向本地推理、模型管理、EdgeData、EdgeMesh、EdgeSession、EdgeUI、语音和视觉的 Swift API。',
    primaryLabel: 'Edge Inference API',
    primaryLink: '/docs/api-reference/edge-inference',
  },
  {
    eyebrow: '本地设备网格',
    title: 'Device Mesh',
    body: '在用户可信自有 Apple 设备之间路由和传输产物。',
    primaryLabel: 'Device Mesh 指南',
    primaryLink: '/docs/build/device-mesh',
  },
];

const EN_CODE = `# install the Developer Preview package
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor

# run the local learning demo
edge models fetch qwen3.5-9b-4bit --source auto
edge demo learn run \\
  --sample synthetic_profile_correction_v1 \\
  --model qwen3.5-9b-4bit \\
  --include-text`;

const ZH_CODE = `# 安装 Developer Preview 包
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor

# 运行本地学习演示
edge models fetch qwen3.5-9b-4bit --source auto
edge demo learn run \\
  --sample synthetic_profile_correction_v1 \\
  --model qwen3.5-9b-4bit \\
  --include-text`;

export default function Home(): React.JSX.Element {
  const {i18n} = useDocusaurusContext();
  const isZh = i18n.currentLocale === 'zh';
  const steps = isZh ? zhSteps : enSteps;
  const paths = isZh ? zhPaths : enPaths;
  const capabilities = isZh ? zhCapabilities : enCapabilities;
  const code = isZh ? ZH_CODE : EN_CODE;

  return (
    <Layout
      title="AtomGradient Edge"
      description={isZh ? '让 AI 在每台设备上生长' : 'Make AI grow on every device'}
    >
      <header className={styles.heroBanner}>
        <div className={styles.heroLayout}>
          <div className={styles.heroCopy}>
            <div className={styles.previewBadge}>{isZh ? '开发者预览' : 'Developer Preview'}</div>
            <h1 className={styles.heroTitle}>
              {isZh ? '让 App 在设备上学会用户偏好' : 'Build apps that learn on the device'}
            </h1>
            <p className={styles.heroSubtitle}>
              {isZh
                ? '比如一个理财助手：用户说“我不喜欢高风险推荐，我更关注现金流和稳健收益”。Edge 让这个偏好留在设备上，不上传云端，不重新训练模型，也不把一大段 profile 塞进每次 prompt。'
                : 'Imagine a finance assistant where the user says, “I avoid high-risk recommendations; I care about cash flow and stable returns.” Edge keeps that preference on the device without cloud uploads, retraining, or stuffing a profile into every prompt.'}
            </p>
            <p className={styles.heroNote}>
              {isZh
                ? '学习状态是本地、可移除的产物；基础模型包保持不变，恢复前会做兼容性校验，失败则继续走基础模型路径。'
                : 'The learning state is a local, removable artifact. The base model package stays unchanged, and restore is compatibility-checked before it becomes active.'}
            </p>
            <div className={styles.buttons}>
              <Link to="/docs/get-started/source-build" className={styles.primaryButton}>
                {isZh ? '安装 Edge Studio' : 'Install Edge Studio'}
              </Link>
              <Link to="/docs/get-started/minute-demo" className={styles.secondaryButton}>
                {isZh ? '运行学习演示' : 'Run the learning demo'}
              </Link>
            </div>
          </div>
          <div className={styles.heroCode}>
            <CodeBlock language="bash" title={isZh ? '最快验证路径' : 'Fastest validation path'}>
{code}
            </CodeBlock>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>{isZh ? '快速开始' : 'Quick start'}</div>
            <h2>{isZh ? '三步看到端侧学习' : 'Three steps to see on-device learning'}</h2>
            <p>
              {isZh
                ? '先用 CLI 证明偏好可以在本地恢复，再把同一条路径带进 iOS app。'
                : 'Prove the preference restore locally first, then carry the same path into an iOS app.'}
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <Link key={step.title} to={step.link ?? '/docs'} className={styles.stepCard}>
                <span className={styles.stepNumber}>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>{isZh ? '集成路径' : 'Integration'}</div>
            <h2>{isZh ? '选择你的集成路径' : 'Choose your integration path'}</h2>
            <p>
              {isZh
                ? 'CLI 用来快速看见学习效果；iOS/Swift 路径用公开包构建真实 app，并在真机上验证。'
                : 'Use the CLI to see the learning effect quickly. Use the iOS/Swift path to build the real app with public packages and device validation.'}
            </p>
          </div>
          <div className={styles.pathGrid}>
            {paths.map((path) => (
              <article className={styles.pathCard} key={path.title}>
                <div className={styles.cardEyebrow}>{path.eyebrow}</div>
                <h3>{path.title}</h3>
                <p>{path.body}</p>
                <div className={styles.cardLinks}>
                  <Link to={path.primaryLink} className={styles.cardPrimaryLink}>
                    {path.primaryLabel}
                  </Link>
                  {path.secondaryLink && path.secondaryLabel ? (
                    <Link to={path.secondaryLink} className={styles.cardSecondaryLink}>
                      {path.secondaryLabel}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>{isZh ? '构建' : 'Build'}</div>
            <h2>{isZh ? '核心能力' : 'Core capabilities'}</h2>
          </div>
          <div className={styles.capabilitiesGrid}>
            {capabilities.map((item) => (
              <article className={styles.productCard} key={item.title}>
                <div className={styles.cardEyebrow}>{item.eyebrow}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <Link to={item.primaryLink} className={styles.productLink}>
                  {item.primaryLabel}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
