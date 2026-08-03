import type {
  DomainDefinition,
  DomainId,
} from './registry-types';

/**
 * Canonical Domain Registry
 * 
 * Root single source of truth describing platform domain capabilities.
 * Pure metadata declarations without domain implementation logic.
 */
export const DOMAIN_REGISTRY = {
  vision: {
    id: 'vision',
    name: 'Computer Vision & CNNs',
    description: 'Convolutional neural networks, visual backbone architectures, residual connections, and spatial feature maps.',
    status: 'active',
    icon: 'Eye',
    supportedPerspectives: ['architecture', 'training', 'mathematics', 'research', 'evolution', 'implementation'],
    supportedVisualizers: ['topology', 'gradient-flow', 'learning-curve', 'execution-timeline', 'layer-health', 'distribution', 'comparison', 'node-inspector'],
    supportedGraphBehaviors: ['topology-navigation', 'timeline-navigation', 'research-citation', 'dependency-graph', 'relationship-explorer', 'hierarchy', 'comparison', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'running', 'paused', 'converged', 'exploded', 'vanished', 'active', 'completed'],
    defaultPerspective: 'architecture',
    defaultVisualizer: 'topology',
    defaultGraphBehavior: 'topology-navigation',
  },
  transformer: {
    id: 'transformer',
    name: 'Transformers & Self-Attention',
    description: 'Sequence-to-sequence models, multi-head self-attention mechanisms, positional encodings, and vision transformers.',
    status: 'active',
    icon: 'Cpu',
    supportedPerspectives: ['architecture', 'training', 'mathematics', 'research', 'evolution', 'implementation'],
    supportedVisualizers: ['topology', 'gradient-flow', 'learning-curve', 'execution-timeline', 'distribution', 'comparison', 'node-inspector'],
    supportedGraphBehaviors: ['topology-navigation', 'timeline-navigation', 'research-citation', 'dependency-graph', 'relationship-explorer', 'comparison', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'running', 'paused', 'converged', 'active', 'completed'],
    defaultPerspective: 'architecture',
    defaultVisualizer: 'topology',
    defaultGraphBehavior: 'topology-navigation',
  },
  'reinforcement-learning': {
    id: 'reinforcement-learning',
    name: 'Reinforcement Learning',
    description: 'Markov decision processes, Q-learning, policy gradients, actor-critic networks, and environment dynamics.',
    status: 'planned',
    icon: 'Gamepad2',
    supportedPerspectives: ['architecture', 'training', 'mathematics', 'research', 'implementation'],
    supportedVisualizers: ['topology', 'gradient-flow', 'learning-curve', 'comparison', 'node-inspector'],
    supportedGraphBehaviors: ['topology-navigation', 'relationship-explorer', 'comparison', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'running', 'paused', 'active', 'completed'],
    defaultPerspective: 'training',
    defaultVisualizer: 'gradient-flow',
    defaultGraphBehavior: 'topology-navigation',
  },
  'graph-neural-network': {
    id: 'graph-neural-network',
    name: 'Graph Neural Networks',
    description: 'Message passing networks, graph convolutional layers, node embeddings, and topological graph filtering.',
    status: 'planned',
    icon: 'Network',
    supportedPerspectives: ['architecture', 'mathematics', 'research', 'implementation'],
    supportedVisualizers: ['topology', 'comparison', 'node-inspector'],
    supportedGraphBehaviors: ['topology-navigation', 'relationship-explorer', 'hierarchy', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'active', 'completed'],
    defaultPerspective: 'architecture',
    defaultVisualizer: 'topology',
    defaultGraphBehavior: 'topology-navigation',
  },
  optimization: {
    id: 'optimization',
    name: 'Optimization & Numerical Methods',
    description: 'Gradient descent variants, learning rate schedulers, second-order optimization, and loss landscapes.',
    status: 'planned',
    icon: 'TrendingUp',
    supportedPerspectives: ['training', 'mathematics', 'research', 'implementation'],
    supportedVisualizers: ['gradient-flow', 'learning-curve', 'distribution', 'comparison'],
    supportedGraphBehaviors: ['relationship-explorer', 'comparison', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'running', 'paused', 'converged', 'exploded', 'vanished'],
    defaultPerspective: 'training',
    defaultVisualizer: 'learning-curve',
    defaultGraphBehavior: 'comparison',
  },
  'graph-algorithms': {
    id: 'graph-algorithms',
    name: 'Classical Graph Algorithms',
    description: 'Traversal, shortest paths, minimum spanning trees, network flow, and topological sorting algorithms.',
    status: 'active',
    icon: 'GitFork',
    supportedPerspectives: ['architecture', 'mathematics', 'implementation'],
    supportedVisualizers: ['execution-timeline', 'comparison', 'node-inspector'],
    supportedGraphBehaviors: ['dependency-graph', 'hierarchy', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'active', 'completed'],
    defaultPerspective: 'architecture',
    defaultVisualizer: 'execution-timeline',
    defaultGraphBehavior: 'dependency-graph',
  },
  'diffusion-models': {
    id: 'diffusion-models',
    name: 'Diffusion & Generative AI',
    description: 'Score-based generative models, reverse diffusion processes, denoising UNets, and latent samplers.',
    status: 'planned',
    icon: 'Sparkles',
    supportedPerspectives: ['architecture', 'training', 'mathematics', 'research', 'implementation'],
    supportedVisualizers: ['topology', 'gradient-flow', 'layer-health', 'node-inspector'],
    supportedGraphBehaviors: ['topology-navigation', 'relationship-explorer', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'running', 'paused', 'active', 'completed'],
    defaultPerspective: 'architecture',
    defaultVisualizer: 'topology',
    defaultGraphBehavior: 'topology-navigation',
  },
  'classical-ml': {
    id: 'classical-ml',
    name: 'Classical Machine Learning',
    description: 'Decision trees, support vector machines, linear models, clustering algorithms, and dimensionality reduction.',
    status: 'planned',
    icon: 'Binary',
    supportedPerspectives: ['architecture', 'training', 'mathematics', 'implementation'],
    supportedVisualizers: ['learning-curve', 'execution-timeline', 'distribution', 'comparison', 'node-inspector'],
    supportedGraphBehaviors: ['relationship-explorer', 'comparison', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'active', 'completed'],
    defaultPerspective: 'mathematics',
    defaultVisualizer: 'distribution',
    defaultGraphBehavior: 'relationship-explorer',
  },
} as const satisfies Record<DomainId, DomainDefinition>;

/**
 * Retrieve a Domain definition by ID.
 */
export function getDomain(id: DomainId): DomainDefinition {
  return DOMAIN_REGISTRY[id];
}

/**
 * Retrieve all registered Domains.
 */
export function getAllDomains(): DomainDefinition[] {
  return Object.values(DOMAIN_REGISTRY);
}
