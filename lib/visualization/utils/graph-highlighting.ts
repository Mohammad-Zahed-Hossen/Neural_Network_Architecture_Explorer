/**
 * @module GraphHighlighting
 * @purpose Evaluates node and edge visual highlight intensity during signal propagation.
 * @layer Layer 7 Visualizer / Utils
 * @dependencies None
 * @api isNodeActive, isEdgeActive, getNodeHighlightAlpha
 */

export function isNodeActive(nodeId: string, activeNodeIds: readonly string[]): boolean {
  return activeNodeIds.includes(nodeId);
}

export function isEdgeActive(edgeId: string, activeEdgeIds: readonly string[]): boolean {
  return activeEdgeIds.includes(edgeId);
}

export function getNodeHighlightAlpha(
  nodeId: string,
  selectedNodeId: string | null,
  activeNodeIds: readonly string[]
): number {
  if (selectedNodeId === nodeId) return 1.0;
  if (activeNodeIds.includes(nodeId)) return 0.85;
  return 0.5;
}
