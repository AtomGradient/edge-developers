// SPDX-License-Identifier: LicenseRef-AtomGradient-Proprietary
// Copyright (c) 2026 AtomGradient. All rights reserved.
// 版权所有 (c) 2026 质子梯度（北京）科技有限公司。保留所有权利。
// Unauthorized copying, distribution, or use is strictly prohibited.
// 未经授权，禁止复制、分发或使用本文件。
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'overview',
    'versions',
    {
      type: 'category',
      label: 'Quickstart / Device Agent',
      collapsed: true,
      items: [
        'quickstart/install',
        'quickstart/first-agent',
        'quickstart/build-agent-carrier',
      ],
    },
    {
      type: 'category',
      label: 'Local Knowledge & Tools',
      collapsed: true,
      items: [
        'knowledge-tools/custom-python-tools',
        'knowledge-tools/domain-knowledge-workflow',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: true,
      items: [
        'concepts/architecture',
        'concepts/model-evolution',
        'concepts/neural-imprint-vs-lora',
      ],
    },
    {
      type: 'category',
      label: 'Edge Kit (Swift)',
      collapsed: true,
      items: [
        'edge-kit/installation',
        'edge-kit/first-llm',
        'edge-kit/minimal-ios-app',
        'edge-kit/text-generation',
        'edge-kit/vision',
        'edge-kit/speech-to-text',
        'edge-kit/text-to-speech',
        'edge-kit/device-mesh',
        'edge-kit/validation-cli',
      ],
    },
    {
      type: 'category',
      label: 'Edge Studio (Workbench)',
      collapsed: true,
      items: [
        'studio/studio-overview',
        'studio/optimize-and-benchmark',
        'studio/export',
        'studio/scaffold',
        'studio/studio-ui-reference',
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
      ],
    },
    {
      type: 'category',
      label: 'Preview Labs',
      collapsed: true,
      items: [
        'labs/device-learning-iphone',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        'reference/supported-models',
        'reference/model-management',
        'reference/memory-management',
        'reference/performance-tuning',
        'reference/platform-requirements',
        'reference/troubleshooting',
      ],
    },
    'changelog',
  ],

  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: true,
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
