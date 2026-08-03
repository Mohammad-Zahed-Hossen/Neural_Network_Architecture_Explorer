import type {
  PerspectiveDefinition,
  PerspectiveId,
} from './registry-types';

/**
 * Canonical Perspective Registry
 * 
 * Single source of truth declaring educational viewpoints.
 * Pure metadata declarations without UI logic.
 */
export const PERSPECTIVE_REGISTRY = {
  architecture: {
    id: 'architecture',
    name: 'Architectural Topology',
    description: 'Visual analysis of structural connectivity, layer compositions, and tensor transformation flow.',
    educationalPurpose: 'Build intuitive understanding of network connectivity, depth, skip connections, and spatial feature maps.',
    supportedKnowledgeObjects: ['model', 'layer', 'pattern'],
    supportsGraph: true,
    supportsSimulation: false,
    defaultGraphBehavior: 'topology-navigation',
    defaultVisualizer: 'topology',
  },
  training: {
    id: 'training',
    name: 'Training Dynamics',
    description: 'Empirical inspection of signal propagation, gradient norms, particle physics, and optimization trajectories.',
    educationalPurpose: 'Illustrate mathematical pathologies (vanishing/exploding gradients) and stabilization mechanisms (residual links, normalization).',
    supportedKnowledgeObjects: ['concept', 'model', 'pattern'],
    supportsGraph: true,
    supportsSimulation: true,
    defaultGraphBehavior: 'topology-navigation',
    defaultVisualizer: 'gradient-flow',
  },
  mathematics: {
    id: 'mathematics',
    name: 'Mathematical Foundations',
    description: 'Formal mathematical formulation including exact equations, tensor shape calculus, and loss functions.',
    educationalPurpose: 'Ground visual models in rigorous, verifiable mathematical definitions using LaTeX formulas.',
    supportedKnowledgeObjects: ['model', 'layer', 'concept', 'paper'],
    supportsGraph: false,
    supportsSimulation: false,
    defaultVisualizer: 'node-inspector',
  },
  research: {
    id: 'research',
    name: 'Research & Literature',
    description: 'Scientific paper provenance, citation DAGs, ablation studies, and primary author notes.',
    educationalPurpose: 'Connect architectural patterns directly to peer-reviewed scientific literature and historical discoveries.',
    supportedKnowledgeObjects: ['paper', 'model', 'concept'],
    supportsGraph: true,
    supportsSimulation: false,
    defaultGraphBehavior: 'research-citation',
    defaultVisualizer: 'node-inspector',
  },
  evolution: {
    id: 'evolution',
    name: 'Historical Evolution',
    description: 'Chronological timeline mapping architectural breakthroughs, problem-solution progressions, and paradigms.',
    educationalPurpose: 'Explain WHY architectures evolved by highlighting how new models solved failure modes of prior generations.',
    supportedKnowledgeObjects: ['timeline_node', 'model', 'paper'],
    supportsGraph: true,
    supportsSimulation: false,
    defaultGraphBehavior: 'timeline-navigation',
    defaultVisualizer: 'comparison',
  },
  implementation: {
    id: 'implementation',
    name: 'Code Implementation',
    description: 'Framework specifications, executable PyTorch/TensorFlow code blocks, and hardware execution bounds.',
    educationalPurpose: 'Bridge theoretical concepts to concrete, production-grade code snippets.',
    supportedKnowledgeObjects: ['model', 'layer', 'pattern'],
    supportsGraph: true,
    supportsSimulation: false,
    defaultGraphBehavior: 'dependency-graph',
    defaultVisualizer: 'node-inspector',
  },
} as const satisfies Record<PerspectiveId, PerspectiveDefinition>;

/**
 * Retrieve a Perspective definition by ID.
 */
export function getPerspective(id: PerspectiveId): PerspectiveDefinition {
  return PERSPECTIVE_REGISTRY[id];
}

/**
 * Retrieve all registered Perspectives.
 */
export function getAllPerspectives(): PerspectiveDefinition[] {
  return Object.values(PERSPECTIVE_REGISTRY);
}
