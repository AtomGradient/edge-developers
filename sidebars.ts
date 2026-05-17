import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'overview',
    'getting-started',
    {
      type: 'category',
      label: 'Edge Engine',
      collapsed: false,
      items: [
        'edge-engine/overview',
        'edge-engine/installation',
      ],
    },
    {
      type: 'category',
      label: 'Edge Kit',
      collapsed: false,
      items: [
        'edge-kit/overview',
        'edge-kit/installation',
        'edge-kit/llm',
        'edge-kit/vlm',
        'edge-kit/speech-to-text',
        'edge-kit/text-to-speech',
        'edge-kit/model-management',
        'edge-kit/memory-management',
      ],
    },
    {
      type: 'category',
      label: 'Edge Halo',
      collapsed: false,
      items: [
        'edge-halo/overview',
        'edge-halo/profiling',
        'edge-halo/adapters',
        'edge-halo/steering',
      ],
    },
    {
      type: 'category',
      label: 'Edge Mesh',
      collapsed: true,
      items: [
        'edge-mesh/overview',
        'edge-mesh/discovery',
        'edge-mesh/routing',
      ],
    },
    {
      type: 'category',
      label: 'Edge Scaffold',
      collapsed: true,
      items: [
        'edge-scaffold/overview',
        'edge-scaffold/configuration',
        'edge-scaffold/building',
      ],
    },
    {
      type: 'category',
      label: 'Edge Studio',
      collapsed: true,
      items: [
        'edge-studio/overview',
        'edge-studio/optimization',
        'edge-studio/export',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: true,
      items: [
        'guides/supported-models',
        'guides/performance-tuning',
        'guides/platform-requirements',
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
