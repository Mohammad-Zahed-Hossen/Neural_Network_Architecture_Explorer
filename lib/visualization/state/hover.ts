/**
 * @module HoverState
 * @purpose Hover state helper for nodes and edges in visualizers.
 * @layer Layer 7 Visualizer / State
 * @dependencies None
 * @api HoverStateManager
 */

export class HoverStateManager {
  private hoveredNodeId: string | null = null;
  private hoveredEdgeId: string | null = null;

  public setHoveredNode(nodeId: string | null): void {
    this.hoveredNodeId = nodeId;
  }

  public setHoveredEdge(edgeId: string | null): void {
    this.hoveredEdgeId = edgeId;
  }

  public getHoveredNodeId(): string | null {
    return this.hoveredNodeId;
  }

  public getHoveredEdgeId(): string | null {
    return this.hoveredEdgeId;
  }

  public clear(): void {
    this.hoveredNodeId = null;
    this.hoveredEdgeId = null;
  }
}
