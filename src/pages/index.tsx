import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

const enCapabilities = [
  {
    name: 'Text Generation',
    description: 'Stream text from an on-device LLM. Multi-turn conversation, LoRA adapters.',
    link: '/docs/capabilities/text-generation',
  },
  {
    name: 'Vision',
    description: 'Image understanding with vision-language models. Photo input, text output.',
    link: '/docs/capabilities/vision',
  },
  {
    name: 'Speech to Text',
    description: 'Transcribe audio on-device. File input or streaming microphone.',
    link: '/docs/capabilities/speech-to-text',
  },
  {
    name: 'Text to Speech',
    description: 'Generate spoken audio from text. Multiple speakers, streaming output.',
    link: '/docs/capabilities/text-to-speech',
  },
  {
    name: 'Model Evolution',
    description: 'Models that grow with users. Profiling, adapters, real-time steering.',
    link: '/docs/capabilities/model-evolution',
  },
  {
    name: 'Device Mesh',
    description: 'Route inference across a user\'s Apple devices. Private, local-only.',
    link: '/docs/capabilities/device-mesh',
  },
];

const zhCapabilities = [
  {
    name: '文本生成',
    description: '从端侧 LLM 流式生成文本。支持多轮对话和 LoRA 适配器。',
    link: '/docs/capabilities/text-generation',
  },
  {
    name: '视觉理解',
    description: '使用视觉语言模型理解图像。照片输入，文本输出。',
    link: '/docs/capabilities/vision',
  },
  {
    name: '语音转文字',
    description: '在设备上转写音频。支持文件输入或流式麦克风。',
    link: '/docs/capabilities/speech-to-text',
  },
  {
    name: '文字转语音',
    description: '从文本生成语音音频。支持多说话人和流式输出。',
    link: '/docs/capabilities/text-to-speech',
  },
  {
    name: '模型进化',
    description: '随用户成长的模型。画像分析、适配器和实时调控。',
    link: '/docs/capabilities/model-evolution',
  },
  {
    name: '设备网格',
    description: '在用户的 Apple 设备之间路由推理。私有，仅本地。',
    link: '/docs/capabilities/device-mesh',
  },
];

// Template literal at column 0 to avoid unwanted leading whitespace
const quickstartCode = [
  'import EdgeKit',
  '',
  'let engine = LLMEngine()',
  'try await engine.load(from: "~/models/Qwen3.5-4B-4bit")',
  '',
  'for try await chunk in engine.generate(',
  '    messages: [.user("What is edge AI?")]',
  ') {',
  '    print(chunk.text, terminator: "")',
  '}',
].join('\n');

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

        {/* Quick Start */}
        <section className={styles.codeSection}>
          <div className={styles.codeSectionLabel}>{isZh ? '快速开始' : 'Quick Start'}</div>
          <CodeBlock language="swift" title={isZh ? '5 行代码：加载模型并流式输出 token' : '5 lines — load a model, stream tokens'}>
            {quickstartCode}
          </CodeBlock>
        </section>
      </main>
    </Layout>
  );
}
