import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AtomGradient Edge',
  tagline: 'On-device AI for Apple Silicon',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://atomgradient.github.io',
  baseUrl: '/edge-developers/',

  organizationName: 'AtomGradient',
  projectName: 'edge-developers',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
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
          title: 'Products',
          items: [
            { label: 'Edge Engine', to: '/docs/edge-engine/overview' },
            { label: 'Edge Kit', to: '/docs/edge-kit/overview' },
            { label: 'Edge Halo', to: '/docs/edge-halo/overview' },
            { label: 'Edge Scaffold', to: '/docs/edge-scaffold/overview' },
            { label: 'Edge Studio', to: '/docs/edge-studio/overview' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'Getting Started', to: '/docs/getting-started' },
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
