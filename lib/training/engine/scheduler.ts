/**
 * @module Scheduler
 * @purpose Topology execution scheduler based on strict Topological Order (Kahn's DAG sort).
 * @layer Layer 6 Engine
 * @dependencies topology-types, topology-utils
 * @api TopologyScheduler
 * @limitations Schedules node execution in valid DAG topological sequence rather than array indices.
 */

import { TopologyGraph, TopologyNode, TopologyEdge } from '../topology/topology-types';
import { topologicalSort, getOutgoingEdges } from '../topology/topology-utils';

export interface SchedulerStepResult {
  readonly activeNodeIds: readonly string[];
  readonly activeEdgeIds: readonly string[];
  readonly completedCycle: boolean;
}

export class TopologyScheduler {
  private topology: TopologyGraph;
  private orderedNodes: TopologyNode[] = [];
  private currentOrderIndex: number = 0;

  constructor(topology: TopologyGraph) {
    this.topology = topology;
    this.reset();
  }

  public reset(newTopology?: TopologyGraph): void {
    if (newTopology) {
      this.topology = newTopology;
    }
    this.orderedNodes = topologicalSort(this.topology);
    this.currentOrderIndex = 0;
  }

  public getOrderedNodes(): readonly TopologyNode[] {
    return this.orderedNodes;
  }

  public getCurrentNode(): TopologyNode | undefined {
    return this.orderedNodes[this.currentOrderIndex];
  }

  public stepNext(): SchedulerStepResult {
    if (this.orderedNodes.length === 0) {
      return { activeNodeIds: [], activeEdgeIds: [], completedCycle: true };
    }

    const currentNode = this.orderedNodes[this.currentOrderIndex];
    const activeNodeIds = [currentNode.id];

    // Find outgoing edges from current node
    const outgoing: TopologyEdge[] = getOutgoingEdges(this.topology, currentNode.id);
    const activeEdgeIds = outgoing.map((e) => e.id);

    this.currentOrderIndex = (this.currentOrderIndex + 1) % this.orderedNodes.length;
    const completedCycle = this.currentOrderIndex === 0;

    return {
      activeNodeIds,
      activeEdgeIds,
      completedCycle,
    };
  }

  public executeAll(): SchedulerStepResult {
    const activeNodeIds = this.orderedNodes.map((n) => n.id);
    const activeEdgeIds = this.topology.edges.map((e) => e.id);
    this.currentOrderIndex = 0;

    return {
      activeNodeIds,
      activeEdgeIds,
      completedCycle: true,
    };
  }
}
