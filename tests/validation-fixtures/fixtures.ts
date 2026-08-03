import type {
  DomainDefinition,
  GraphBehaviorDefinition,
  PerspectiveDefinition,
  PerspectiveId,
  VisualizerDefinition,
  VisualizerId,
} from '../../lib/registry';
import type { RegistryContainer } from '../../lib/validation/validators/reference-validator';

export const basePerspectives: PerspectiveDefinition[] = [
  {
    id: 'architecture',
    name: 'Architectural Topology',
    description: 'Topology viewpoint',
    educationalPurpose: 'Understand topology',
    supportedKnowledgeObjects: ['model'],
    supportsGraph: true,
    supportsSimulation: false,
  },
  {
    id: 'training',
    name: 'Training Dynamics',
    description: 'Training viewpoint',
    educationalPurpose: 'Understand training',
    supportedKnowledgeObjects: ['concept'],
    supportsGraph: true,
    supportsSimulation: true,
  },
];

export const baseVisualizers: VisualizerDefinition[] = [
  {
    id: 'topology',
    name: 'Topology Graph',
    description: 'Topology render',
    supportedEngineStates: ['idle'],
    supportedPerspectives: ['architecture'],
    supportedDomains: ['vision'],
    supportedGraphBehaviors: ['topology-navigation'],
    renderMode: 'react-flow',
    interactive: true,
    experimental: false,
    priority: 1,
  },
  {
    id: 'gradient-flow',
    name: 'Gradient Flow',
    description: 'Gradient flow simulation',
    supportedEngineStates: ['running'],
    supportedPerspectives: ['training'],
    supportedDomains: ['vision'],
    supportedGraphBehaviors: ['topology-navigation'],
    renderMode: 'canvas-2d',
    interactive: true,
    experimental: false,
    priority: 2,
  },
];

export const baseBehaviors: GraphBehaviorDefinition[] = [
  {
    id: 'topology-navigation',
    name: 'Topology Navigation',
    description: 'Navigate graph',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: true,
    supportsFiltering: true,
    supportsGrouping: true,
    supportsCollapse: true,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['topology'],
    supportedPerspectives: ['architecture'],
  },
];

export const baseDomains: DomainDefinition[] = [
  {
    id: 'vision',
    name: 'Vision',
    description: 'Computer Vision',
    status: 'active',
    supportedPerspectives: ['architecture', 'training'],
    supportedVisualizers: ['topology', 'gradient-flow'],
    supportedGraphBehaviors: ['topology-navigation'],
    supportedEngineStates: ['idle', 'running'],
    defaultPerspective: 'architecture',
    defaultVisualizer: 'topology',
    defaultGraphBehavior: 'topology-navigation',
  },
];

/**
 * Fixture containing a Duplicate Domain ID.
 */
export const duplicateDomainFixture: RegistryContainer = {
  domains: [
    ...baseDomains,
    {
      ...baseDomains[0],
      name: 'Duplicate Vision Domain',
    },
  ],
  perspectives: basePerspectives,
  visualizers: baseVisualizers,
  graphBehaviors: baseBehaviors,
};

/**
 * Fixture containing an Invalid Reference (dangling perspective).
 */
export const invalidReferenceFixture: RegistryContainer = {
  domains: [
    {
      ...baseDomains[0],
      supportedPerspectives: ['architecture', 'non-existent-perspective' as PerspectiveId],
    },
  ],
  perspectives: basePerspectives,
  visualizers: baseVisualizers,
  graphBehaviors: baseBehaviors,
};

/**
 * Fixture containing an Invalid Default (default visualizer not in supported list).
 */
export const invalidDefaultFixture: RegistryContainer = {
  domains: [
    {
      ...baseDomains[0],
      defaultVisualizer: 'unsupported-vis' as VisualizerId,
    },
  ],
  perspectives: basePerspectives,
  visualizers: baseVisualizers,
  graphBehaviors: baseBehaviors,
};

/**
 * Fixture containing an Orphan Visualizer.
 */
export const orphanVisualizerFixture: RegistryContainer = {
  domains: baseDomains,
  perspectives: basePerspectives,
  visualizers: [
    ...baseVisualizers,
    {
      id: 'layer-health',
      name: 'Orphan Health',
      description: 'Orphan visualizer',
      supportedEngineStates: ['idle'],
      supportedPerspectives: [],
      supportedDomains: [],
      supportedGraphBehaviors: [],
      renderMode: 'svg',
      interactive: false,
      experimental: true,
      priority: 99,
    },
  ],
  graphBehaviors: baseBehaviors,
};

/**
 * Fixture containing a Capability Mismatch (simulation visualizer assigned as default when perspective supports no simulation).
 */
export const capabilityMismatchFixture: RegistryContainer = {
  domains: [
    {
      ...baseDomains[0],
      defaultPerspective: 'architecture',
      defaultVisualizer: 'gradient-flow',
    },
  ],
  perspectives: basePerspectives,
  visualizers: baseVisualizers,
  graphBehaviors: baseBehaviors,
};
