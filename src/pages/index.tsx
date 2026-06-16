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
    title: 'Install the preview CLI',
    body: 'Use a source checkout during preview. The public pip package is the intended release path, but it is not published yet.',
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
    title: '安装预览版 CLI',
    body: '预览阶段先使用源码安装。公开 pip 包是目标发布路径，但现在还没有发布到 PyPI。',
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
    title: 'Fastest path to the first wow',
    body: 'Start here if you want to see the local model workflow: explicit model download, interactive base chat, synthetic correction sample, Neural Imprint restore, and a hash-only comparison receipt.',
    primaryLabel: 'Start the CLI path',
    primaryLink: '/docs/get-started/source-build',
    secondaryLabel: 'Read the learning demo',
    secondaryLink: '/docs/get-started/minute-demo',
  },
  {
    eyebrow: 'iOS / Swift',
    title: 'Smallest app path',
    body: 'Use this lane after the CLI path, or when you already have preview access. Build the minimal iOS shell first, then wire Edge Kit, Edge Halo, and Edge Scaffold deliberately.',
    primaryLabel: 'Build the minimal iOS app',
    primaryLink: '/docs/get-started/minimal-ios-app',
    secondaryLabel: 'Swift SDK setup',
    secondaryLink: '/docs/get-started/quickstart',
  },
];

const zhPaths: LinkCard[] = [
  {
    eyebrow: 'Python / CLI',
    title: '最快获得第一感的路径',
    body: '如果你想先看到本地模型工作流，从这里开始：显式下载模型、普通多轮对话、合成纠错样本、Neural Imprint 恢复，以及仅哈希的对比回执。',
    primaryLabel: '开始 CLI 路径',
    primaryLink: '/docs/get-started/source-build',
    secondaryLabel: '阅读学习演示',
    secondaryLink: '/docs/get-started/minute-demo',
  },
  {
    eyebrow: 'iOS / Swift',
    title: '最小应用路径',
    body: 'CLI 路径跑通后，或者你已经有预览访问权限时，再走这条路径。先构建最小 iOS 应用壳，再有意识地接入 Edge Kit、Edge Halo 和 Edge Scaffold。',
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

const EN_CODE = `# install once during Developer Preview
git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -e .

# first local chat
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --interactive`;

const ZH_CODE = `# 预览阶段安装一次
git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -e .

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
            <div className={styles.sectionLabel}>{isZh ? '第一目标' : 'First objective'}</div>
            <h2>{isZh ? '让开发者成功跑通一次' : 'Help the developer succeed once'}</h2>
            <p>
              {isZh
                ? '首页不再把 Python、Swift、能力列表混在同一层。第一屏只服务一个目标：让开发者从本地模型对话自然走到学习流程。'
                : 'The homepage now optimizes for one goal: move a developer from local base chat to the learning loop before asking them to choose deeper SDK surfaces.'}
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
            <div className={styles.sectionLabel}>{isZh ? '选择路径' : 'Choose a lane'}</div>
            <h2>{isZh ? 'Python 先证明价值，Swift 再集成到 app' : 'Python proves the value first, Swift takes it into apps'}</h2>
            <p>
              {isZh
                ? '两条路径必须分清：CLI 是最快体验路径；iOS/Swift 是应用集成路径，需要预览访问权限和真机构建验证。'
                : 'Keep the paths separate: CLI is the fastest experience path; iOS/Swift is the app integration path and requires preview access plus device validation.'}
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
            <div className={styles.sectionLabel}>{isZh ? '深入阅读' : 'Read next'}</div>
            <h2>{isZh ? '核心概念和产品表面放在成功路径之后' : 'Core concepts and product surfaces come after the first path'}</h2>
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
