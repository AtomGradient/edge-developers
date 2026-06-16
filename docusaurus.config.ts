// SPDX-License-Identifier: LicenseRef-AtomGradient-Proprietary
// Copyright (c) 2026 AtomGradient. All rights reserved.
// 版权所有 (c) 2026 质子梯度（北京）科技有限公司。保留所有权利。
// Unauthorized copying, distribution, or use is strictly prohibited.
// 未经授权，禁止复制、分发或使用本文件。
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

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

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
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
            { label: 'Text Generation', to: '/docs/build/text-generation' },
            { label: 'Vision', to: '/docs/build/vision' },
            { label: 'Speech & Voice', to: '/docs/build/speech-to-text' },
            { label: 'Model Evolution', to: '/docs/build/model-evolution' },
            { label: 'Device Mesh', to: '/docs/build/device-mesh' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'Quickstart', to: '/docs/get-started/quickstart' },
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
