// SPDX-License-Identifier: LicenseRef-AtomGradient-Proprietary
// Copyright (c) 2026 AtomGradient. All rights reserved.
// 版权所有 (c) 2026 质子梯度（北京）科技有限公司。保留所有权利。
// Unauthorized copying, distribution, or use is strictly prohibited.
// 未经授权，禁止复制、分发或使用本文件。
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const redirectPairs = [
  ['/docs/get-started/source-build', '/docs/quickstart/install'],
  ['/docs/get-started/minute-demo', '/docs/quickstart/first-agent'],
  ['/docs/get-started/5-minute-demo', '/docs/quickstart/first-agent'],
  ['/docs/examples/build-and-ship', '/docs/quickstart/build-agent-carrier'],
  ['/docs/get-started/device-agent-learning', '/docs/labs/device-learning-iphone'],
  ['/docs/guides/custom-python-tools', '/docs/knowledge-tools/custom-python-tools'],
  ['/docs/examples/ethereum-local-facts-imprint-workflow', '/docs/knowledge-tools/domain-knowledge-workflow'],
  ['/docs/guides/architecture', '/docs/concepts/architecture'],
  ['/docs/build/model-evolution', '/docs/concepts/model-evolution'],
  ['/docs/guides/neural-imprint-vs-lora', '/docs/concepts/neural-imprint-vs-lora'],
  ['/docs/get-started/installation', '/docs/edge-kit/installation'],
  ['/docs/get-started/quickstart', '/docs/edge-kit/first-llm'],
  ['/docs/get-started/minimal-ios-app', '/docs/edge-kit/minimal-ios-app'],
  ['/docs/build/text-generation', '/docs/edge-kit/text-generation'],
  ['/docs/build/vision', '/docs/edge-kit/vision'],
  ['/docs/build/speech-to-text', '/docs/edge-kit/speech-to-text'],
  ['/docs/build/text-to-speech', '/docs/edge-kit/text-to-speech'],
  ['/docs/build/device-mesh', '/docs/edge-kit/device-mesh'],
  ['/docs/get-started/swift-cli', '/docs/edge-kit/validation-cli'],
  ['/docs/optimize-and-ship/studio-overview', '/docs/studio/studio-overview'],
  ['/docs/optimize-and-ship/optimize-and-benchmark', '/docs/studio/optimize-and-benchmark'],
  ['/docs/optimize-and-ship/export', '/docs/studio/export'],
  ['/docs/optimize-and-ship/scaffold', '/docs/studio/scaffold'],
  ['/docs/optimize-and-ship/studio-ui-reference', '/docs/studio/studio-ui-reference'],
  ['/docs/guides/supported-models', '/docs/reference/supported-models'],
  ['/docs/guides/model-management', '/docs/reference/model-management'],
  ['/docs/guides/memory-management', '/docs/reference/memory-management'],
  ['/docs/guides/performance-tuning', '/docs/reference/performance-tuning'],
  ['/docs/guides/platform-requirements', '/docs/reference/platform-requirements'],
  ['/docs/guides/troubleshooting', '/docs/reference/troubleshooting'],
] as const;

const redirects = redirectPairs.map(([from, to]) => ({from, to}));

const config: Config = {
  title: 'AtomGradient Edge',
  tagline: 'Make AI grow on every device',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://atomgradient.github.io',
  baseUrl: '/edge-developers/',

  organizationName: 'AtomGradient',
  projectName: 'edge-developers',

  onBrokenLinks: 'throw',
  markdown: {
    mdx1Compat: {
      admonitions: true,
    },
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en-US' },
      zh: { label: '中文', htmlLang: 'zh-Hans' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/AtomGradient/edge-developers/tree/main/',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects,
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'AtomGradient Edge',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          to: '/docs/examples/basic-chat',
          position: 'left',
          label: 'Examples',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://atomgradient.com/developers',
          label: 'atomgradient.com',
          position: 'right',
        },
        {
          href: 'https://github.com/AtomGradient',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Build',
          items: [
            { label: 'Text Generation', to: '/docs/edge-kit/text-generation' },
            { label: 'Vision', to: '/docs/edge-kit/vision' },
            { label: 'Speech & Voice', to: '/docs/edge-kit/speech-to-text' },
            { label: 'Model Evolution', to: '/docs/concepts/model-evolution' },
            { label: 'Device Mesh', to: '/docs/edge-kit/device-mesh' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'CLI Quickstart', to: '/docs/quickstart/first-agent' },
            { label: 'Examples', to: '/docs/examples/basic-chat' },
            { label: 'API Reference', to: '/docs/api-reference/edge-inference' },
            { label: 'GitHub', href: 'https://github.com/AtomGradient' },
          ],
        },
        {
          title: 'Company',
          items: [
            { label: 'atomgradient.com', href: 'https://atomgradient.com' },
            { label: 'Research', href: 'https://atomgradient.com/research' },
            { label: 'Contact', href: 'mailto:alex@atomgradient.com' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AtomGradient. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['swift', 'bash', 'json', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
