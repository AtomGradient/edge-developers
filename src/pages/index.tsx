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
    body: 'Create a Python 3.11 environment and install the public edge-studio package from PyPI. Use a source checkout only when contributing to Edge Studio itself.',
    link: '/docs/get-started/source-build',
  },
  {
    label: '2',
    title: 'Download and chat',
    body: 'Fetch the preview baseline model explicitly, then enter an interactive local chat session before any learning demo.',
    link: '/docs/get-started/minute-demo',
  },
  {
    label: '3',
    title: 'Run the learning loop',
    body: 'Inspect the synthetic sample, generate a local Neural Imprint artifact, restore it under compatibility gates, and compare the receipt.',
    link: '/docs/get-started/minute-demo',
  },
];

const zhSteps: Step[] = [
  {
    label: '1',
    title: '安装 Edge Studio',
    body: '创建 Python 3.11 环境，并从 PyPI 安装公开的 edge-studio 包。只有参与 Edge Studio 本身开发时才需要源码安装。',
    link: '/docs/get-started/source-build',
  },
  {
    label: '2',
    title: '下载模型并对话',
    body: '显式下载预览基准模型，然后先进入普通本地多轮对话，再看学习 demo。',
    link: '/docs/get-started/minute-demo',
  },
  {
    label: '3',
    title: '运行学习闭环',
    body: '检查合成样本，生成本地 Neural Imprint 产物，在兼容性闸门下恢复，并对比本地回执。',
    link: '/docs/get-started/minute-demo',
  },
];

const enPaths: LinkCard[] = [
  {
    eyebrow: 'Python / CLI',
    title: 'CLI and local model workflow',
    body: 'Download a model, run a local chat, inspect a synthetic correction sample, generate and restore a Neural Imprint artifact, and compare answer hashes in a local receipt.',
    primaryLabel: 'Start the CLI path',
    primaryLink: '/docs/get-started/source-build',
    secondaryLabel: 'Read the learning demo',
    secondaryLink: '/docs/get-started/minute-demo',
  },
  {
    eyebrow: 'iOS / Swift',
    title: 'iOS app integration',
    body: 'Build the minimal iOS shell, then integrate the public Edge Kit package, Edge Halo binary package, and Edge Scaffold template. Validate on a real device before treating the app path as integrated.',
    primaryLabel: 'Build the minimal iOS app',
    primaryLink: '/docs/get-started/minimal-ios-app',
    secondaryLabel: 'Swift SDK setup',
    secondaryLink: '/docs/get-started/quickstart',
  },
];

const zhPaths: LinkCard[] = [
  {
    eyebrow: 'Python / CLI',
    title: 'CLI 和本地模型工作流',
    body: '下载模型、运行本地对话、检查合成纠错样本、生成并恢复 Neural Imprint 产物，在本地回执中对比回答哈希。',
    primaryLabel: '开始 CLI 路径',
    primaryLink: '/docs/get-started/source-build',
    secondaryLabel: '阅读学习演示',
    secondaryLink: '/docs/get-started/minute-demo',
  },
  {
    eyebrow: 'iOS / Swift',
    title: 'iOS 应用集成',
    body: '构建最小 iOS 应用壳，再接入公开的 Edge Kit package、Edge Halo binary package 和 Edge Scaffold 模板。把应用路径视为已集成前，请先完成真机验证。',
    primaryLabel: '构建最小 iOS 应用',
    primaryLink: '/docs/get-started/minimal-ios-app',
    secondaryLabel: 'Swift SDK 设置',
    secondaryLink: '/docs/get-started/quickstart',
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
    body: 'A local personalization artifact that restores user-specific runtime state under compatibility gates without changing model weights.',
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
    body: '本地个性化产物，在兼容性闸门下恢复用户相关运行时状态，不改模型权重。',
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

const EN_CODE = `# install Edge Studio CLI
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor

# first local chat
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive`;

const ZH_CODE = `# 安装 Edge Studio CLI
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade --pre edge-studio
edge doctor

# 第一次本地多轮对话
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive`;

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
              {isZh ? '先跑通本地模型，再验证学习闭环' : 'Run a local model, then validate the learning loop'}
            </h1>
            <p className={styles.heroSubtitle}>
              {isZh
                ? 'Edge 的第一条开发者路径很简单：下载预览基准模型，进入本地多轮对话，然后用合成样本生成并恢复 Neural Imprint，用本地回执对比结果。'
                : 'The first Edge developer path is deliberately small: download the preview baseline model, enter a local multi-turn chat, then use a synthetic sample to generate and restore a Neural Imprint artifact with a local comparison receipt.'}
            </p>
            <p className={styles.heroNote}>
              {isZh
                ? '当前文档以 qwen3.5-9b-4bit 为预览基准；首次下载和加载需要时间。'
                : 'The current docs use qwen3.5-9b-4bit as the preview baseline; first download and first load can take time.'}
            </p>
            <div className={styles.buttons}>
              <Link to="/docs/get-started/source-build" className={styles.primaryButton}>
                {isZh ? '开始 CLI 路径' : 'Start the CLI path'}
              </Link>
              <Link to="/docs/get-started/minute-demo" className={styles.secondaryButton}>
                {isZh ? '查看学习演示' : 'View the learning demo'}
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
            <h2>{isZh ? '三步完成：下载、对话、学习' : 'Three steps: download, chat, learn'}</h2>
            <p>
              {isZh
                ? '从本地模型对话开始，然后用合成样本验证学习闭环。'
                : 'Start with a local model chat, then validate the learning loop with a synthetic sample.'}
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
                ? 'CLI 是最快的体验路径。iOS/Swift 是应用集成路径，使用公开包解析，并且必须完成真机验证。'
                : 'The CLI path is the fastest way to try Edge. The iOS/Swift path is for app integration with public packages and must be validated on real devices.'}
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
