import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

const enCapabilities = [
  {
    name: 'Text Generation',
    description: 'Stream text from an on-device LLM. Multi-turn conversation, LoRA adapters.',
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
    description: 'Models that grow with users. Profiling, adapters, real-time steering.',
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
    description: '从端侧 LLM 流式生成文本。支持多轮对话和 LoRA 适配器。',
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
    description: '随用户成长的模型。画像分析、适配器和实时调控。',
    link: '/docs/build/model-evolution',
  },
  {
    name: '设备网格',
    description: '在用户的 Apple 设备之间路由推理。私有，仅本地。',
    link: '/docs/build/device-mesh',
  },
];

/* Code block rendered manually for full styling control */

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
          <Link to="/docs/get-started/quickstart" className={styles.primaryButton}>
            {isZh ? '快速开始' : 'Get started'}
          </Link>
          <Link to="/docs/" className={styles.secondaryButton}>
            {isZh ? '查看文档' : 'Documentation'}
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

        {/* Quick Start — same pattern as atomgradient.com/developers */}
        <section className={styles.codeSection}>
          <div className={styles.codeSectionLabel}>{isZh ? '快速开始' : 'Quick Start'}</div>
          <div className={styles.codeWindow}>
            <div className={styles.codeWindowDots}>
              <div className={styles.codeDotRed} />
              <div className={styles.codeDotYellow} />
              <div className={styles.codeDotGreen} />
              <span className={styles.codeWindowTitle}>main.swift</span>
            </div>
            <pre className={styles.codeBlock}>
              <code>
                <span style={{color: '#c678dd'}}>import</span> EdgeInference{'\n'}
{'\n'}
                <span style={{color: '#c678dd'}}>let</span> engine = <span style={{color: '#e5c07b'}}>LLMEngine</span>(){'\n'}
                <span style={{color: '#c678dd'}}>try</span> <span style={{color: '#c678dd'}}>await</span> engine.<span style={{color: '#61afef'}}>loadLocal</span>(directory: modelURL){'\n'}
{'\n'}
                <span style={{color: '#c678dd'}}>for</span> <span style={{color: '#c678dd'}}>try</span> <span style={{color: '#c678dd'}}>await</span> chunk <span style={{color: '#c678dd'}}>in</span> engine.<span style={{color: '#61afef'}}>generate</span>({'\n'}
                {'    '}messages: [.<span style={{color: '#61afef'}}>user</span>(<span style={{color: '#98c379'}}>&quot;What is edge AI?&quot;</span>)]{'\n'}
                ) {'{'}{'\n'}
                {'    '}<span style={{color: '#61afef'}}>print</span>(chunk.text, terminator: <span style={{color: '#98c379'}}>&quot;&quot;</span>){'\n'}
                {'}'}
              </code>
            </pre>
          </div>
          <p className={styles.codeCaption}>
            {isZh ? '5 行代码 — 加载模型，流式推理' : '5 lines — load a model, stream tokens'}
          </p>
        </section>
      </main>
    </Layout>
  );
}
