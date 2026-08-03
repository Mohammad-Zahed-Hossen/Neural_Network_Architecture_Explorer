/**
 * Canonical Registry System Types
 * 
 * Defines strongly-typed interfaces and literal unions for platform capabilities.
 * Core design principle: Capability declaration without implementation.
 * 
 * Architecture Layer: Shared Registry System (Layer 0 Foundation)
 */

export type DomainId =
  | 'vision'
  | 'transformer'
  | 'reinforcement-learning'
  | 'graph-neural-network'
  | 'optimization'
  | 'graph-algorithms'
  | 'diffusion-models'
  | 'classical-ml';

export type DomainStatus = 'active' | 'planned' | 'experimental' | 'deprecated';

export type PerspectiveId =
  | 'architecture'
  | 'training'
  | 'mathematics'
  | 'research'
  | 'evolution'
  | 'implementation';

export type VisualizerId =
  | 'topology'
  | 'gradient-flow'
  | 'learning-curve'
  | 'execution-timeline'
  | 'layer-health'
  | 'distribution'
  | 'comparison'
  | 'node-inspector';

export type RenderMode = 'react-flow' | 'canvas-2d' | 'webgl' | 'svg' | 'dom';

export type GraphBehaviorId =
  | 'topology-navigation'
  | 'timeline-navigation'
  | 'research-citation'
  | 'dependency-graph'
  | 'relationship-explorer'
  | 'hierarchy'
  | 'comparison'
  | 'knowledge-graph';

/**
 * Metadata declaration for graph interaction models.
 */
export interface GraphBehaviorDefinition {
  readonly id: GraphBehaviorId;
  readonly name: string;
  readonly description: string;
  readonly supportsSelection: boolean;
  readonly supportsZoom: boolean;
  readonly supportsMiniMap: boolean;
  readonly supportsFiltering: boolean;
  readonly supportsGrouping: boolean;
  readonly supportsCollapse: boolean;
  readonly supportsSearch: boolean;
  readonly supportsHighlighting: boolean;
  readonly supportedVisualizers: readonly VisualizerId[];
  readonly supportedPerspectives: readonly PerspectiveId[];
}

/**
 * Metadata declaration for visualizer plugins.
 */
export interface VisualizerDefinition {
  readonly id: VisualizerId;
  readonly name: string;
  readonly description: string;
  readonly supportedEngineStates: readonly string[];
  readonly supportedPerspectives: readonly PerspectiveId[];
  readonly supportedDomains: readonly DomainId[];
  readonly supportedGraphBehaviors: readonly GraphBehaviorId[];
  readonly renderMode: RenderMode;
  readonly interactive: boolean;
  readonly experimental: boolean;
  readonly priority: number;
}

/**
 * Metadata declaration for educational viewpoints.
 */
export interface PerspectiveDefinition {
  readonly id: PerspectiveId;
  readonly name: string;
  readonly description: string;
  readonly educationalPurpose: string;
  readonly supportedKnowledgeObjects: readonly string[];
  readonly supportsGraph: boolean;
  readonly supportsSimulation: boolean;
  readonly defaultGraphBehavior?: GraphBehaviorId;
  readonly defaultVisualizer?: VisualizerId;
}

/**
 * Metadata declaration for platform domains.
 */
export interface DomainDefinition {
  readonly id: DomainId;
  readonly name: string;
  readonly description: string;
  readonly status: DomainStatus;
  readonly icon?: string;
  readonly supportedPerspectives: readonly PerspectiveId[];
  readonly supportedVisualizers: readonly VisualizerId[];
  readonly supportedGraphBehaviors: readonly GraphBehaviorId[];
  readonly supportedEngineStates: readonly string[];
  readonly defaultPerspective: PerspectiveId;
  readonly defaultVisualizer: VisualizerId;
  readonly defaultGraphBehavior: GraphBehaviorId;
}
