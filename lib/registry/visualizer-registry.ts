import type {
  VisualizerDefinition,
  VisualizerId,
} from './registry-types';

/**
 * Canonical Visualizer Registry
 * 
 * Single source of truth declaring visualizer plugin metadata.
 * Pure metadata declarations without rendering logic.
 */
export const VISUALIZER_REGISTRY = {
  topology: {
    id: 'topology',
    name: 'Interactive Model Topology',
    description: 'Node-and-edge visualizer rendering neural network layer graphs with interactive inspection.',
    supportedEngineStates: ['idle', 'stepping', 'active'],
    supportedPerspectives: ['architecture', 'implementation'],
    supportedDomains: ['vision', 'transformer', 'reinforcement-learning', 'graph-neural-network', 'diffusion-models'],
    supportedGraphBehaviors: ['topology-navigation', 'dependency-graph', 'hierarchy', 'knowledge-graph'],
    renderMode: 'react-flow',
    interactive: true,
    experimental: false,
    priority: 1,
  },
  'gradient-flow': {
    id: 'gradient-flow',
    name: 'Gradient Flow Simulator',
    description: 'Animated visualizer rendering gradient norm propagation, particle dynamics, and stability heatmaps.',
    supportedEngineStates: ['idle', 'running', 'paused', 'converged', 'exploded', 'vanished'],
    supportedPerspectives: ['training', 'mathematics'],
    supportedDomains: ['vision', 'transformer', 'reinforcement-learning', 'optimization', 'diffusion-models'],
    supportedGraphBehaviors: ['topology-navigation', 'comparison'],
    renderMode: 'canvas-2d',
    interactive: true,
    experimental: false,
    priority: 2,
  },
  'learning-curve': {
    id: 'learning-curve',
    name: 'Learning Curve Telemetry',
    description: 'Real-time chart rendering loss trajectories, metric history, and hyperparameter dynamics.',
    supportedEngineStates: ['idle', 'running', 'paused', 'completed'],
    supportedPerspectives: ['training', 'mathematics'],
    supportedDomains: ['vision', 'transformer', 'reinforcement-learning', 'optimization', 'classical-ml'],
    supportedGraphBehaviors: ['comparison'],
    renderMode: 'dom',
    interactive: true,
    experimental: false,
    priority: 3,
  },
  'execution-timeline': {
    id: 'execution-timeline',
    name: 'Execution & Compute Timeline',
    description: 'Gantt-style execution profile rendering layer compute latency and memory bandwidth.',
    supportedEngineStates: ['idle', 'active'],
    supportedPerspectives: ['implementation', 'architecture'],
    supportedDomains: ['vision', 'transformer', 'graph-algorithms', 'classical-ml'],
    supportedGraphBehaviors: ['timeline-navigation', 'dependency-graph'],
    renderMode: 'dom',
    interactive: true,
    experimental: false,
    priority: 4,
  },
  'layer-health': {
    id: 'layer-health',
    name: 'Layer Health Matrix',
    description: 'Diagnostic visualizer monitoring dead ReLU ratios, weight variance, and signal saturation.',
    supportedEngineStates: ['active', 'running', 'paused'],
    supportedPerspectives: ['training', 'architecture'],
    supportedDomains: ['vision', 'transformer', 'diffusion-models'],
    supportedGraphBehaviors: ['topology-navigation'],
    renderMode: 'svg',
    interactive: true,
    experimental: true,
    priority: 5,
  },
  distribution: {
    id: 'distribution',
    name: 'Weight & Activation Distribution',
    description: 'Histogram and ridge-plot visualizer tracking weight distributions across network depth.',
    supportedEngineStates: ['idle', 'running', 'paused'],
    supportedPerspectives: ['mathematics', 'training'],
    supportedDomains: ['vision', 'transformer', 'optimization', 'classical-ml'],
    supportedGraphBehaviors: ['relationship-explorer', 'knowledge-graph'],
    renderMode: 'dom',
    interactive: true,
    experimental: false,
    priority: 6,
  },
  comparison: {
    id: 'comparison',
    name: 'Synchronized Comparison View',
    description: 'Dual-panel visualizer aligning two architectures or training runs side by side.',
    supportedEngineStates: ['idle', 'running', 'paused', 'completed'],
    supportedPerspectives: ['architecture', 'training', 'evolution'],
    supportedDomains: ['vision', 'transformer', 'reinforcement-learning', 'graph-neural-network', 'optimization', 'graph-algorithms', 'diffusion-models', 'classical-ml'],
    supportedGraphBehaviors: ['comparison', 'timeline-navigation'],
    renderMode: 'dom',
    interactive: true,
    experimental: false,
    priority: 7,
  },
  'node-inspector': {
    id: 'node-inspector',
    name: 'Node & Parameter Inspector',
    description: 'Detailed inspection overlay exposing exact tensor shapes, FLOP counts, formulas, and paper references.',
    supportedEngineStates: ['idle', 'active'],
    supportedPerspectives: ['architecture', 'mathematics', 'implementation', 'research'],
    supportedDomains: ['vision', 'transformer', 'reinforcement-learning', 'graph-neural-network', 'optimization', 'graph-algorithms', 'diffusion-models', 'classical-ml'],
    supportedGraphBehaviors: ['topology-navigation', 'research-citation', 'dependency-graph', 'relationship-explorer', 'hierarchy', 'knowledge-graph'],
    renderMode: 'dom',
    interactive: true,
    experimental: false,
    priority: 8,
  },
} as const satisfies Record<VisualizerId, VisualizerDefinition>;

/**
 * Retrieve a Visualizer definition by ID.
 */
export function getVisualizer(id: VisualizerId): VisualizerDefinition {
  return VISUALIZER_REGISTRY[id];
}

/**
 * Retrieve all registered Visualizers.
 */
export function getAllVisualizers(): VisualizerDefinition[] {
  return Object.values(VISUALIZER_REGISTRY);
}
