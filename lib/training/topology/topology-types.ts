/**
 * @module TopologyTypes
 * @purpose Defines immutable, framework-independent interfaces for network DAG topologies.
 * @layer Layer 6 Engine / Topology Infrastructure
 * @dependencies None
 * @api TopologyNode, TopologyEdge, TopologyPort, TopologyGraph, NodeType, EdgeType
 * @limitations Pure data interfaces. Contains zero SVG/Canvas rendering coordinates or UI properties.
 */

export type NodeType =
  | 'input'
  | 'output'
  | 'layer'
  | 'conv'
  | 'linear'
  | 'attention'
  | 'residual'
  | 'dense'
  | 'norm'
  | 'activation'
  | 'pooling'
  | 'custom'
  | string;

export type EdgeType =
  | 'sequential'
  | 'skip'
  | 'dense'
  | 'branch'
  | 'feedback'
  | 'custom'
  | string;

export interface TopologyPort {
  readonly id: string;
  readonly name?: string;
  readonly type?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface TopologyNode {
  readonly id: string;
  readonly type: NodeType;
  readonly label: string;
  readonly inputs: readonly TopologyPort[];
  readonly outputs: readonly TopologyPort[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface TopologyEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly sourcePort?: string;
  readonly targetPort?: string;
  readonly type?: EdgeType;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface TopologyGraph {
  readonly id: string;
  readonly name: string;
  readonly nodes: readonly TopologyNode[];
  readonly edges: readonly TopologyEdge[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}
