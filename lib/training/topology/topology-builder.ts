/**
 * @module TopologyBuilder
 * @purpose Reusable builder class for programmatically constructing and validating topology DAGs.
 * @layer Layer 6 Engine / Topology Infrastructure
 * @dependencies topology-types, topology-validator, topology-schema
 * @api TopologyBuilder
 * @limitations Pure data construction utility.
 */

import {
  TopologyGraph,
  TopologyNode,
  TopologyEdge,
  TopologyPort,
  NodeType,
  EdgeType,
} from './topology-types';
import { validateTopology } from './topology-validator';
import { TopologyGraphSchema } from './topology-schema';

export class TopologyBuilder {
  private id: string;
  private name: string;
  private nodesMap: Map<string, TopologyNode> = new Map();
  private edgesMap: Map<string, TopologyEdge> = new Map();
  private metadata: Record<string, unknown> = {};

  constructor(id: string = 'topology-graph', name: string = 'Topology Graph') {
    this.id = id;
    this.name = name;
  }

  public setId(id: string): this {
    this.id = id;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setMetadata(key: string, value: unknown): this {
    this.metadata[key] = value;
    return this;
  }

  public addNode(node: TopologyNode): this {
    this.nodesMap.set(node.id, node);
    return this;
  }

  public createNode(
    id: string,
    type: NodeType,
    label: string,
    inputs: TopologyPort[] = [],
    outputs: TopologyPort[] = [],
    metadata?: Record<string, unknown>
  ): this {
    const node: TopologyNode = {
      id,
      type,
      label,
      inputs,
      outputs,
      metadata,
    };
    return this.addNode(node);
  }

  public addEdge(edge: TopologyEdge): this {
    this.edgesMap.set(edge.id, edge);
    return this;
  }

  public connect(
    source: string,
    target: string,
    options?: {
      id?: string;
      sourcePort?: string;
      targetPort?: string;
      type?: EdgeType;
      metadata?: Record<string, unknown>;
    }
  ): this {
    const edgeId = options?.id || `edge-${source}-to-${target}`;
    const edge: TopologyEdge = {
      id: edgeId,
      source,
      target,
      sourcePort: options?.sourcePort,
      targetPort: options?.targetPort,
      type: options?.type || 'sequential',
      metadata: options?.metadata,
    };
    return this.addEdge(edge);
  }

  public build(validate: boolean = true): TopologyGraph {
    const graph: TopologyGraph = {
      id: this.id,
      name: this.name,
      nodes: Array.from(this.nodesMap.values()),
      edges: Array.from(this.edgesMap.values()),
      metadata: Object.keys(this.metadata).length > 0 ? { ...this.metadata } : undefined,
    };

    if (validate) {
      // Validate schema
      TopologyGraphSchema.parse(graph);

      // Validate topology structure & DAG rules
      const result = validateTopology(graph);
      if (!result.valid) {
        const errorMsgs = result.errors.map((e) => e.message).join(' | ');
        throw new Error(`Topology build failed for "${graph.id}": ${errorMsgs}`);
      }
    }

    return Object.freeze(graph);
  }
}
