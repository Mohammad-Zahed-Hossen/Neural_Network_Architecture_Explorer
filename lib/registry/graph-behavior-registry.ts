import type {
  GraphBehaviorDefinition,
  GraphBehaviorId,
} from './registry-types';

/**
 * Canonical Graph Behavior Registry
 * 
 * Single source of truth declaring interaction models for graph-based views.
 * Pure metadata declarations without implementation.
 */
export const GRAPH_BEHAVIOR_REGISTRY = {
  'topology-navigation': {
    id: 'topology-navigation',
    name: 'Topology Navigation',
    description: 'Interactive exploration of layer-by-layer neural network architecture graphs.',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: true,
    supportsFiltering: true,
    supportsGrouping: true,
    supportsCollapse: true,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['topology', 'layer-health', 'node-inspector'],
    supportedPerspectives: ['architecture', 'implementation'],
  },
  'timeline-navigation': {
    id: 'timeline-navigation',
    name: 'Timeline Navigation',
    description: 'Chronological traversal of model evolution and architectural milestones.',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: false,
    supportsFiltering: true,
    supportsGrouping: false,
    supportsCollapse: false,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['topology', 'execution-timeline', 'comparison'],
    supportedPerspectives: ['evolution'],
  },
  'research-citation': {
    id: 'research-citation',
    name: 'Research Citation DAG',
    description: 'Directed Acyclic Graph exploring scientific paper citations and influences.',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: true,
    supportsFiltering: true,
    supportsGrouping: true,
    supportsCollapse: false,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['topology', 'node-inspector'],
    supportedPerspectives: ['research', 'mathematics'],
  },
  'dependency-graph': {
    id: 'dependency-graph',
    name: 'Dependency Graph',
    description: 'Inspection of functional prerequisites, layer dependencies, and code modules.',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: false,
    supportsFiltering: true,
    supportsGrouping: true,
    supportsCollapse: true,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['topology', 'execution-timeline', 'node-inspector'],
    supportedPerspectives: ['implementation', 'architecture'],
  },
  'relationship-explorer': {
    id: 'relationship-explorer',
    name: 'Relationship Explorer',
    description: 'Interactive discovery of connections across concepts, papers, and patterns.',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: true,
    supportsFiltering: true,
    supportsGrouping: true,
    supportsCollapse: true,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['topology', 'distribution', 'node-inspector'],
    supportedPerspectives: ['architecture', 'research', 'mathematics'],
  },
  hierarchy: {
    id: 'hierarchy',
    name: 'Hierarchical Structure',
    description: 'Nested tree visualization of multi-scale building blocks and compound layers.',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: true,
    supportsFiltering: true,
    supportsGrouping: true,
    supportsCollapse: true,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['topology', 'node-inspector'],
    supportedPerspectives: ['architecture', 'implementation'],
  },
  comparison: {
    id: 'comparison',
    name: 'Side-by-Side Comparison',
    description: 'Synchronized dual-graph inspection highlighting structural and parametric differences.',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: false,
    supportsFiltering: true,
    supportsGrouping: false,
    supportsCollapse: false,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['comparison', 'topology', 'learning-curve'],
    supportedPerspectives: ['architecture', 'training', 'evolution'],
  },
  'knowledge-graph': {
    id: 'knowledge-graph',
    name: 'Global Knowledge Graph',
    description: 'Unified network map spanning models, concepts, papers, patterns, and benchmarks.',
    supportsSelection: true,
    supportsZoom: true,
    supportsMiniMap: true,
    supportsFiltering: true,
    supportsGrouping: true,
    supportsCollapse: true,
    supportsSearch: true,
    supportsHighlighting: true,
    supportedVisualizers: ['topology', 'distribution', 'node-inspector'],
    supportedPerspectives: ['architecture', 'training', 'mathematics', 'research', 'evolution', 'implementation'],
  },
} as const satisfies Record<GraphBehaviorId, GraphBehaviorDefinition>;

/**
 * Retrieve a Graph Behavior definition by ID.
 */
export function getGraphBehavior(id: GraphBehaviorId): GraphBehaviorDefinition {
  return GRAPH_BEHAVIOR_REGISTRY[id];
}

/**
 * Retrieve all registered Graph Behaviors.
 */
export function getAllGraphBehaviors(): GraphBehaviorDefinition[] {
  return Object.values(GRAPH_BEHAVIOR_REGISTRY);
}
