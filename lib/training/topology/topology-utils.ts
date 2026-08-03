/**
 * @module TopologyUtils
 * @purpose Generic graph utility functions for querying and sorting DAG topologies.
 * @layer Layer 6 Engine / Topology Infrastructure
 * @dependencies topology-types
 * @api getIncomingNodes, getOutgoingNodes, findRootNodes, findLeafNodes, topologicalSort, findNode, findEdge
 * @limitations Pure, framework-independent graph algorithms.
 */

import { TopologyGraph, TopologyNode, TopologyEdge } from './topology-types';

export function findNode(graph: TopologyGraph, nodeId: string): TopologyNode | undefined {
  return graph.nodes.find((n) => n.id === nodeId);
}

export function findEdge(graph: TopologyGraph, edgeId: string): TopologyEdge | undefined {
  return graph.edges.find((e) => e.id === edgeId);
}

export function getIncomingEdges(graph: TopologyGraph, nodeId: string): TopologyEdge[] {
  return graph.edges.filter((e) => e.target === nodeId);
}

export function getOutgoingEdges(graph: TopologyGraph, nodeId: string): TopologyEdge[] {
  return graph.edges.filter((e) => e.source === nodeId);
}

export function getIncomingNodes(graph: TopologyGraph, nodeId: string): TopologyNode[] {
  const incomingEdges = getIncomingEdges(graph, nodeId);
  const sourceIds = new Set(incomingEdges.map((e) => e.source));
  return graph.nodes.filter((n) => sourceIds.has(n.id));
}

export function getOutgoingNodes(graph: TopologyGraph, nodeId: string): TopologyNode[] {
  const outgoingEdges = getOutgoingEdges(graph, nodeId);
  const targetIds = new Set(outgoingEdges.map((e) => e.target));
  return graph.nodes.filter((n) => targetIds.has(n.id));
}

export function findRootNodes(graph: TopologyGraph): TopologyNode[] {
  const nodesWithIncoming = new Set(graph.edges.map((e) => e.target));
  return graph.nodes.filter((n) => !nodesWithIncoming.has(n.id));
}

export function findLeafNodes(graph: TopologyGraph): TopologyNode[] {
  const nodesWithOutgoing = new Set(graph.edges.map((e) => e.source));
  return graph.nodes.filter((n) => !nodesWithOutgoing.has(n.id));
}

/**
 * Performs topological sort on a DAG using Kahn's algorithm.
 * Throws an Error if a cycle is detected.
 */
export function topologicalSort(graph: TopologyGraph): TopologyNode[] {
  const inDegree = new Map<string, number>();
  const graphNodeMap = new Map<string, TopologyNode>();

  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
    graphNodeMap.set(node.id, node);
  }

  for (const edge of graph.edges) {
    if (inDegree.has(edge.target)) {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [nodeId, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(nodeId);
    }
  }

  const sorted: TopologyNode[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = graphNodeMap.get(currentId);
    if (currentNode) {
      sorted.push(currentNode);
    }

    const outgoing = getOutgoingEdges(graph, currentId);
    for (const edge of outgoing) {
      const currentDeg = inDegree.get(edge.target);
      if (currentDeg !== undefined) {
        const nextDeg = currentDeg - 1;
        inDegree.set(edge.target, nextDeg);
        if (nextDeg === 0) {
          queue.push(edge.target);
        }
      }
    }
  }

  if (sorted.length !== graph.nodes.length) {
    throw new Error(`Cycle detected or disconnected node in graph "${graph.id}". Topological sort impossible.`);
  }

  return sorted;
}
