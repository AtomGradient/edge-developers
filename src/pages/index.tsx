// Copyright © 2026 AtomGradient
// 版权所有 © 2026 质子梯度（北京）科技有限公司
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

const GUIDE_EN = '/edge-developers/EDGE_AGENT_GUIDE.md';
const GUIDE_ZH = '/edge-developers/EDGE_AGENT_GUIDE.zh.md';

const EN_QUICK = `# Download the Agent Guide
curl -O https://atomgradient.github.io/edge-developers/EDGE_AGENT_GUIDE.md

# Give it to your Code Agent and say:
# "Follow EDGE_AGENT_GUIDE.md to help me build a device Agent"`;

const ZH_QUICK = `# 下载 Agent Guide
curl -O https://atomgradient.github.io/edge-developers/EDGE_AGENT_GUIDE.zh.md

# 把它扔给你的 Code Agent，然后说：
# "按照 EDGE_AGENT_GUIDE.zh.md 引导我构建一个设备端 Agent"`;

export default function Home(): React.JSX.Element {
  const {i18n} = useDocusaurusContext();
  const isZh = i18n.currentLocale === 'zh';

  return (
    <Layout
      title="AtomGradient Edge"
      description={isZh ? '构建在设备上持续学习的 Agent' : 'Build device Agents that learn locally'}
    >
      <header className={styles.heroBanner}>
        <div className={`${styles.heroLayout} ${styles.heroSingle}`}>
          <div className={styles.heroCopy}>
            <div className={styles.previewBadge}>{isZh ? '开发者预览' : 'Developer Preview'}</div>
            <h1 className={styles.heroTitle}>
              {isZh
                ? '把这个文件扔给你的 Code Agent'
                : 'Drop this file into your Code Agent'}
            </h1>
            <p className={styles.heroSubtitle}>
              {isZh
                ? '一个 markdown 文件。你的 AI 编程助手读完它，就能引导你完成从安装到真机部署的全部流程——模型在设备上学习用户偏好、学习使用工具，数据不离端，基础模型不被替换。'
                : 'One markdown file. Your AI coding assistant reads it and guides you through everything — from install to deploying a learning agent on your iPhone. Models learn user preferences and tool policy on-device. Data never leaves. Base model stays intact.'}
            </p>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>{isZh ? '最快路径' : 'Fastest path'}</div>
            <h2>{isZh ? '下载 → 扔给 Agent → 开始' : 'Download → Drop into Agent → Go'}</h2>
          </div>

          <div className={styles.heroCode}>
            <CodeBlock language="bash" title={isZh ? '给你的 Code Agent' : 'For your Code Agent'}>
              {isZh ? ZH_QUICK : EN_QUICK}
            </CodeBlock>
          </div>

          <div className={styles.buttons} style={{marginTop: '1.5rem'}}>
            <a href={isZh ? GUIDE_ZH : GUIDE_EN} download className={styles.primaryButton}>
              {isZh ? '下载 EDGE_AGENT_GUIDE.md' : 'Download EDGE_AGENT_GUIDE.md'}
            </a>
            <Link to="/docs/get-started/minute-demo" className={styles.secondaryButton}>
              {isZh ? '我更想自己读文档' : 'I prefer reading docs myself'}
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>{isZh ? '它会引导你完成' : 'Your Agent will walk you through'}</div>
            <h2>{isZh ? '三个 Aha Moment' : 'Three Aha Moments'}</h2>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <h3>{isZh ? '模型学会了用户偏好' : 'The model learns user preferences'}</h3>
                <p>{isZh
                  ? '理财助手学会"保守、关注现金流"。同一个模型，同一个问题，回答变了。不是 LoRA，不是 prompt stuffing。'
                  : 'A finance assistant learns "conservative, cash-flow first." Same model, same question, different answer. Not LoRA. Not prompt stuffing.'}</p>
              </div>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <h3>{isZh ? '模型学会了使用工具' : 'The model learns tool policy'}</h3>
                <p>{isZh
                  ? 'Agent 学会什么时候该调用现金流查询工具、什么时候不该调用外部市场数据。工具由载体定义，策略由学习产生。'
                  : 'The Agent learns when to call the cashflow lookup tool and when NOT to call external market tools. Tools are defined by the carrier; policy is learned.'}</p>
              </div>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <h3>{isZh ? '在 iPhone 上跑了' : 'It runs on iPhone'}</h3>
                <p>{isZh
                  ? '同样的学习效果在手机上生效。离线。本地。可移除。设备是 Agent，App 是载体。'
                  : 'The same learning works on your phone. Offline. Local. Removable. The device is the Agent. The app is the carrier.'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>{isZh ? '兼容的 Code Agent' : 'Compatible Code Agents'}</div>
            <h2>{isZh ? '把 EDGE_AGENT_GUIDE.md 扔给任何一个' : 'Drop EDGE_AGENT_GUIDE.md into any of these'}</h2>
            <p>{isZh
              ? 'Codex、Claude Code、Cursor、OpenCode，或任何能读 markdown 上下文的 Code Agent。'
              : 'Codex, Claude Code, Cursor, OpenCode, or any Code Agent that reads markdown context.'}</p>
          </div>
        </section>

        <section className={styles.section} style={{paddingBottom: '4.5rem'}}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>{isZh ? '想自己看？' : 'Prefer to read?'}</div>
            <h2>{isZh ? '传统文档也在' : 'Traditional docs are here too'}</h2>
            <p>{isZh
              ? 'Agent Guide 覆盖了主路径。如果你想深入某个话题，这些文档随时可查。'
              : 'The Agent Guide covers the main path. Dive into these when you want details.'}</p>
          </div>
          <div className={styles.pathGrid} style={{marginTop: '1.5rem'}}>
            <Link to="/docs/get-started/minute-demo" className={styles.pathCard}>
              <div className={styles.cardEyebrow}>CLI</div>
              <h3>{isZh ? 'CLI 学习 Demo' : 'CLI Learning Demo'}</h3>
              <p>{isZh ? '在 Mac 终端里体验完整的学习机制' : 'Experience the full learning mechanism in your terminal'}</p>
            </Link>
            <Link to="/docs/get-started/device-agent-learning" className={styles.pathCard}>
              <div className={styles.cardEyebrow}>iPhone</div>
              <h3>{isZh ? '设备端 Agent 学习' : 'Device Agent Learning'}</h3>
              <p>{isZh ? '在 iPhone 上体验 Agent 持续学习' : 'Experience Agent learning on a real iPhone'}</p>
            </Link>
            <Link to="/docs/guides/neural-imprint-vs-lora" className={styles.pathCard}>
              <div className={styles.cardEyebrow}>{isZh ? '核心概念' : 'Core Concept'}</div>
              <h3>{isZh ? 'Neural Imprint vs LoRA' : 'Neural Imprint vs LoRA'}</h3>
              <p>{isZh ? '为什么 Edge 不用微调、不用 prompt stuffing' : 'Why Edge doesn\'t use fine-tuning or prompt stuffing'}</p>
            </Link>
            <Link to="/docs/overview" className={styles.pathCard}>
              <div className={styles.cardEyebrow}>{isZh ? '总览' : 'Overview'}</div>
              <h3>{isZh ? '产品架构' : 'Product Architecture'}</h3>
              <p>{isZh ? 'Edge Engine / Kit / Halo / Scaffold / Studio 全栈' : 'Edge Engine / Kit / Halo / Scaffold / Studio full stack'}</p>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
