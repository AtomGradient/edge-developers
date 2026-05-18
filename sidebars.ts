import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'overview',
    {
      type: 'category',
      label: 'Get Started',
      collapsed: false,
      items: [
        'get-started/quickstart',
        'get-started/installation',
      ],
    },
    {
      type: 'category',
      label: 'Build with Edge Kit',
      collapsed: false,
      items: [
        'build/text-generation',
        'build/vision',
        'build/speech-to-text',
        'build/text-to-speech',
        'build/model-evolution',
        'build/device-mesh',
      ],
    },
    {
      type: 'category',
      label: 'Optimize & Ship',
      collapsed: true,
      items: [
        'optimize-and-ship/studio-overview',
        'optimize-and-ship/optimize-and-benchmark',
        'optimize-and-ship/export',
        'optimize-and-ship/scaffold',
        'optimize-and-ship/studio-ui-reference',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: true,
      items: [
        'guides/supported-models',
        'guides/model-management',
        'guides/memory-management',
        'guides/performance-tuning',
        'guides/platform-requirements',
        'guides/architecture',
        'guides/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: true,
      items: [
        'examples/basic-chat',
        'examples/vision-chat',
        'examples/voice-assistant',
        'examples/personalized-model',
        'examples/build-and-ship',
      ],
    },
    'changelog',
  ],

  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api-reference/edge-inference',
        'api-reference/edge-model-kit',
        'api-reference/edge-voice',
        'api-reference/edge-mesh',
        'api-reference/edge-halo',
        'api-reference/edge-data',
      ],
    },
  ],
};

export default sidebars;
