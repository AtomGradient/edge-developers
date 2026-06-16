// Copyright (c) 2026 AtomGradient. All rights reserved.
// 版权所有 (c) 2026 质子梯度（北京）科技有限公司。保留所有权利。
//
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
        'get-started/minute-demo',
        'get-started/installation',
        'get-started/swift-cli',
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
        'guides/neural-imprint-vs-lora',
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
        'examples/artifact-reuse',
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
        'api-reference/edge-session',
        'api-reference/edge-ui',
        'api-reference/edge-data-mesh-bridge',
      ],
    },
  ],
};

export default sidebars;
