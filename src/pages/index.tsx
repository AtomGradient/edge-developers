import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import styles from './index.module.css';

const products = [
  {
    name: 'Edge Engine',
    description: 'Native Metal inference runtime for Apple Silicon. The foundation layer.',
    link: '/docs/edge-engine/overview',
  },
  {
    name: 'Edge Kit',
    description: 'Swift SDK for LLM, VLM, ASR, and TTS inference. The developer surface.',
    link: '/docs/edge-kit/overview',
  },
  {
    name: 'Edge Halo',
    description: 'Model self-evolution. User profiling, adapter lifecycle, activation steering.',
    link: '/docs/edge-halo/overview',
  },
  {
    name: 'Edge Mesh',
    description: 'Private device mesh. Route inference across a user\'s Apple devices.',
    link: '/docs/edge-mesh/overview',
  },
  {
    name: 'Edge Scaffold',
    description: 'iOS app template. From optimized model to App Store in minutes.',
    link: '/docs/edge-scaffold/overview',
  },
  {
    name: 'Edge Studio',
    description: 'Model optimization workbench. Analyze, optimize, benchmark, export.',
    link: '/docs/edge-studio/overview',
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
          <Link to="/docs/getting-started" className={styles.primaryButton}>
            Get started
          </Link>
          <Link to="/docs/" className={styles.secondaryButton}>
            Documentation
          </Link>
        </div>
      </header>

      <main>
        {/* Products */}
        <section className={styles.productsSection}>
          <div className={styles.productsGrid}>
            {products.map((product) => (
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
