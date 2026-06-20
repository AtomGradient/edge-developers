// SPDX-License-Identifier: LicenseRef-AtomGradient-Proprietary
// Copyright (c) 2026 AtomGradient. All rights reserved.
// 版权所有 (c) 2026 质子梯度（北京）科技有限公司。保留所有权利。
// Unauthorized copying, distribution, or use is strictly prohibited.
// 未经授权，禁止复制、分发或使用本文件。
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

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
              {isZh ? '构建在设备上持续学习的 Agent' : 'Build device Agents that learn locally'}
            </h1>
            <p className={styles.heroSubtitle}>
              {isZh
                ? '设备就是 Agent，App 是载体。Edge 让模型在用户设备上学习偏好、学习使用本地工具，并把学习状态恢复进兼容 session。数据不离端，基础模型包不被替换。'
                : 'The device is the Agent. The app is the carrier. Edge lets models learn user preferences, learn local tool policy, and restore that learning state into a compatible session without moving private data off device or replacing the base model package.'}
            </p>
            <p className={styles.heroNote}>
              {isZh
                ? '从一个页面开始：安装 Edge Studio，运行理财场景 demo，看到偏好学习、工具策略和 iPhone 载体导出。'
                : 'Start with one page: install Edge Studio, run the finance demo, see preference learning, inspect tool policy, and export the iPhone carrier.'}
            </p>
            <div className={styles.buttons}>
              <Link to="/docs/get-started/minute-demo" className={styles.primaryButton}>
                {isZh ? '开始构建第一个 Agent' : 'Build your first Agent'}
              </Link>
            </div>
          </div>
        </div>
      </header>
    </Layout>
  );
}
