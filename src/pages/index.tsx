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

const enCapabilities = [
  {
    name: 'Text Generation',
    description: 'Stream text from an on-device LLM with multi-turn conversation state.',
    link: '/docs/build/text-generation',
  },
  {
    name: 'Vision',
    description: 'Image understanding with vision-language models. Photo input, text output.',
    link: '/docs/build/vision',
  },
  {
    name: 'Speech to Text',
    description: 'Transcribe audio on-device. File input or streaming microphone.',
    link: '/docs/build/speech-to-text',
  },
  {
    name: 'Text to Speech',
    description: 'Generate spoken audio from text. Multiple speakers, streaming output.',
    link: '/docs/build/text-to-speech',
  },
  {
    name: 'Model Evolution',
    description: 'Local Neural Imprint artifacts that restore user-specific runtime state under compatibility gates.',
    link: '/docs/build/model-evolution',
  },
  {
    name: 'Device Mesh',
    description: 'Route inference across a user\'s Apple devices. Private, local-only.',
    link: '/docs/build/device-mesh',
  },
];

const zhCapabilities = [
  {
    name: '文本生成',
    description: '从端侧 LLM 流式生成文本，并保留多轮对话状态。',
    link: '/docs/build/text-generation',
  },
  {
    name: '视觉理解',
    description: '使用视觉语言模型理解图像。照片输入，文本输出。',
    link: '/docs/build/vision',
  },
  {
    name: '语音转文字',
    description: '在设备上转写音频。支持文件输入或流式麦克风。',
    link: '/docs/build/speech-to-text',
  },
  {
    name: '文字转语音',
    description: '从文本生成语音音频。支持多说话人和流式输出。',
    link: '/docs/build/text-to-speech',
  },
  {
    name: '模型进化',
    description: '通过本地 Neural Imprint artifact，在兼容性闸门下恢复用户特定运行时状态。',
    link: '/docs/build/model-evolution',
  },
  {
    name: '设备网格',
    description: '在用户的 Apple 设备之间路由推理。私有，仅本地。',
    link: '/docs/build/device-mesh',
  },
];

// eslint-disable-next-line
const CODE = `git clone https://github.com/AtomGradient/edge-studio.git
cd edge-studio
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
edge models fetch qwen3.5-9b-4bit --source auto
edge demo chat --model qwen3.5-9b-4bit --prompt "What is edge AI?" --max-tokens 64`;

export default function Home(): React.JSX.Element {
  const {i18n} = useDocusaurusContext();
  const isZh = i18n.currentLocale === 'zh';
  const capabilities = isZh ? zhCapabilities : enCapabilities;

  return (
    <Layout
      title="AtomGradient Edge"
      description={isZh ? '让 AI 在每台设备上生长' : 'Make AI grow on every device'}
    >
      {/* Hero */}
      <header className={styles.heroBanner}>
        <div className={styles.previewBadge}>{isZh ? '开发者预览' : 'Developer Preview'}</div>
        <h1 className={styles.heroTitle}>
          {isZh ? (
            <>
              让 AI 在<span className={styles.heroAccent}>每台设备</span>上生长
            </>
          ) : (
            <>
              Make AI <span className={styles.heroAccent}>grow</span> on every device
            </>
          )}
        </h1>
        <p className={styles.heroSubtitle}>
          {isZh
            ? '端侧推理、个性化、跨设备协同 — 全链路自有代码，零云依赖。当前支持 Apple 平台，更多平台即将到来。'
            : 'On-device inference, personalization, cross-device mesh — full-stack, zero cloud dependency. Shipping on Apple first. More platforms coming.'}
        </p>
        <div className={styles.buttons}>
          <Link to="/docs/get-started/minute-demo" className={styles.primaryButton}>
            {isZh ? '下载模型并聊天' : 'Download and chat'}
          </Link>
          <Link to="/docs/get-started/source-build" className={styles.secondaryButton}>
            {isZh ? '从源码安装' : 'Install from source'}
          </Link>
        </div>
      </header>

      <main>
        {/* Products */}
        <section className={styles.capabilitiesSection}>
          <div className={styles.capabilitiesGrid}>
            {capabilities.map((product) => (
              <Link
                key={product.name}
                to={product.link}
                className={styles.productCard}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productDescription}>
                  {product.description}
                </div>
                <span className={styles.productLink}>
                  {isZh ? '了解更多 →' : 'Learn more →'}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className={styles.codeSection}>
          <div className={styles.codeSectionLabel}>{isZh ? '快速开始' : 'Quick Start'}</div>
          <CodeBlock language="bash" title={isZh ? '预览路径 — 下载模型，先跑一次普通对话' : 'Preview path — download a model, run a normal chat first'}>
{CODE}
          </CodeBlock>
        </section>
      </main>
    </Layout>
  );
}
