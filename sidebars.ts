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
      label: 'Capabilities',
      collapsed: false,
      items: [
        'capabilities/text-generation',
        'capabilities/vision',
        'capabilities/speech-to-text',
        'capabilities/text-to-speech',
        'capabilities/model-evolution',
        'capabilities/device-mesh',
      ],
    },
    {
      type: 'category',
      label: 'Edge Studio',
      collapsed: true,
      items: [
        'edge-studio/overview',
        'edge-studio/web-ui',
        'edge-studio/simple-mode',
        'edge-studio/pro-dashboard',
        'edge-studio/analysis-tools',
        'edge-studio/optimization-tools',
        'edge-studio/optimization',
        'edge-studio/chat',
        'edge-studio/export',
        'edge-studio/batch-benchmark',
        'edge-studio/personal-training',
        'edge-studio/devices',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      collapsed: true,
      items: [
        'deployment/app-scaffold',
        'deployment/scaffold-configuration',
        'deployment/building',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: true,
      items: [
        'guides/supported-models',
        'guides/performance-tuning',
        'guides/memory-management',
        'guides/model-management',
        'guides/platform-requirements',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: false,
      items: [
        'examples/basic-chat',
        'examples/vision-chat',
        'examples/voice-assistant',
        'examples/personalized-model',
        'examples/build-and-ship',
      ],
    },
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
