import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import styles from './index.module.css';

const capabilities = [
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

const quickstartCode = `import EdgeKit

let engine = LLMEngine()
try await engine.load(from: "~/models/Qwen3.5-4B-4bit")

for try await chunk in engine.generate(
    messages: [.user("What is edge AI?")]
) {
    print(chunk.text, terminator: "")
}`;

export default function Home(): React.JSX.Element {
  return (
    <Layout title="AtomGradient Edge" description="On-device AI for Apple Silicon">
      {/* Hero */}
      <header className={styles.heroBanner}>
        <div className={styles.previewBadge}>Developer Preview</div>
        <h1 className={styles.heroTitle}>
          On-device AI for{' '}
          <span className={styles.heroAccent}>Apple Silicon</span>
        </h1>
        <p className={styles.heroSubtitle}>
          A complete platform for building AI-powered apps that run entirely
          on-device. No cloud. No latency. Complete privacy.
        </p>
        <div className={styles.buttons}>
          <Link to="/docs/get-started/quickstart" className={styles.primaryButton}>
            Get started
          </Link>
          <Link to="/docs/" className={styles.secondaryButton}>
            Documentation
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
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className={styles.codeSection}>
          <div className={styles.codeSectionLabel}>Quick Start</div>
          <CodeBlock language="swift" title="5 lines — load a model, stream tokens">
            {quickstartCode}
          </CodeBlock>
        </section>
      </main>
    </Layout>
  );
}
