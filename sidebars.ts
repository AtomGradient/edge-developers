// SPDX-License-Identifier: LicenseRef-AtomGradient-Proprietary
// Copyright (c) 2026 AtomGradient. All rights reserved.
// 版权所有 (c) 2026 质子梯度（北京）科技有限公司。保留所有权利。
// Unauthorized copying, distribution, or use is strictly prohibited.
// 未经授权，禁止复制、分发或使用本文件。
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'overview',
    {
      type: 'category',
      label: 'Quickstart',
      collapsed: false,
      items: [
        'get-started/minute-demo',
        'get-started/source-build',
        'get-started/minimal-ios-app',
        'get-started/installation',
        'get-started/swift-cli',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
      items: [
        'build/model-evolution',
        'guides/neural-imprint-vs-lora',
        'guides/model-management',
        'guides/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Build with Edge Kit',
      collapsed: true,
      items: [
        'build/text-generation',
        'build/vision',
        'build/speech-to-text',
        'build/text-to-speech',
        'build/device-mesh',
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
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        'guides/supported-models',
        'guides/memory-management',
        'guides/performance-tuning',
        'guides/platform-requirements',
        'guides/troubleshooting',
        'get-started/quickstart',
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
