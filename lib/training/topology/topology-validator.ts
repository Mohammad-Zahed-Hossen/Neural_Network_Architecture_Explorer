/**
 * @module TopologyValidator
 * @purpose Structural, referential, and cycle validation for network topologies.
 * @layer Layer 3 Validation / Layer 6 Engine
 * @dependencies topology-types, topology-utils
 * @api validateTopology, TopologyValidationResult, TopologyValidationError
 * @limitations Pure graph validation. Reusable across CLI and runtime repositories.
 */

import { TopologyGraph } from './topology-types';
import { topologicalSort } from './topology-utils';

export interface TopologyValidationError {
  readonly code: string;
  readonly message: string;
  readonly path?: string[];
  readonly severity: 'error' | 'warning';
}

export interface TopologyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TopologyValidationError[];
  readonly warnings: readonly TopologyValidationError[];
}

export function validateTopology(graph: TopologyGraph): TopologyValidationResult {
  const errors: TopologyValidationError[] = [];
  const warnings: TopologyValidationError[] = [];

  const nodeIds = new Set<string>();
  for (const node of graph.nodes) {
    if (nodeIds.has(node.id)) {
      errors.push({
        code: 'DUPLICATE_NODE_ID',
        message: `Duplicate node ID "${node.id}" found in graph "${graph.id}".`,
        path: ['nodes', node.id],
        severity: 'error',
      });
    }
    nodeIds.add(node.id);
  }

  const edgeIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) {
      errors.push({
        code: 'DUPLICATE_EDGE_ID',
        message: `Duplicate edge ID "${edge.id}" found in graph "${graph.id}".`,
        path: ['edges', edge.id],
        severity: 'error',
      });
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.source)) {
      errors.push({
        code: 'MISSING_SOURCE_NODE',
        message: `Edge "${edge.id}" references non-existent source node "${edge.source}".`,
        path: ['edges', edge.id, 'source'],
        severity: 'error',
      });
    }

    if (!nodeIds.has(edge.target)) {
      errors.push({
        code: 'MISSING_TARGET_NODE',
        message: `Edge "${edge.id}" references non-existent target node "${edge.target}".`,
        path: ['edges', edge.id, 'target'],
        severity: 'error',
      });
    }

    if (edge.sourcePort) {
      const sourceNode = graph.nodes.find((n) => n.id === edge.source);
      if (sourceNode && sourceNode.outputs.length > 0) {
        const hasPort = sourceNode.outputs.some((p) => p.id === edge.sourcePort);
        if (!hasPort) {
          warnings.push({
            code: 'INVALID_SOURCE_PORT',
            message: `Edge "${edge.id}" references sourcePort "${edge.sourcePort}" not declared on node "${edge.source}".`,
            path: ['edges', edge.id, 'sourcePort'],
            severity: 'warning',
          });
        }
      }
    }

    if (edge.targetPort) {
      const targetNode = graph.nodes.find((n) => n.id === edge.target);
      if (targetNode && targetNode.inputs.length > 0) {
        const hasPort = targetNode.inputs.some((p) => p.id === edge.targetPort);
        if (!hasPort) {
          warnings.push({
            code: 'INVALID_TARGET_PORT',
            message: `Edge "${edge.id}" references targetPort "${edge.targetPort}" not declared on node "${edge.target}".`,
            path: ['edges', edge.id, 'targetPort'],
            severity: 'warning',
          });
        }
      }
    }
  }

  // Check for disconnected nodes (nodes with 0 incoming AND 0 outgoing edges, unless graph has 1 node)
  if (graph.nodes.length > 1) {
    const connectedNodes = new Set<string>();
    for (const edge of graph.edges) {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    }
    for (const node of graph.nodes) {
      if (!connectedNodes.has(node.id)) {
        warnings.push({
          code: 'DISCONNECTED_NODE',
          message: `Node "${node.id}" has no incoming or outgoing edges in graph "${graph.id}".`,
          path: ['nodes', node.id],
          severity: 'warning',
        });
      }
    }
  }

  // Cycle check using topological sort
  if (errors.length === 0) {
    try {
      topologicalSort(graph);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({
        code: 'CYCLE_DETECTED',
        message: `Graph "${graph.id}" contains a cycle or illegal loop: ${message}`,
        path: ['graph'],
        severity: 'error',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
