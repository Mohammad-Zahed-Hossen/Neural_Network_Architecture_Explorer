/**
 * @module SelectionState
 * @purpose Node and edge selection state helper for visualizer plugins.
 * @layer Layer 7 Visualizer / State
 * @dependencies None
 * @api SelectionStateManager
 */

export class SelectionStateManager {
  private selectedNodeId: string | null = null;
  private selectedEdgeId: string | null = null;
  private selectedMetric: string | null = null;

  public selectNode(nodeId: string | null): void {
    this.selectedNodeId = nodeId;
  }

  public selectEdge(edgeId: string | null): void {
    this.selectedEdgeId = edgeId;
  }

  public selectMetric(metricName: string | null): void {
    this.selectedMetric = metricName;
  }

  public getSelectedNodeId(): string | null {
    return this.selectedNodeId;
  }

  public getSelectedEdgeId(): string | null {
    return this.selectedEdgeId;
  }

  public getSelectedMetric(): string | null {
    return this.selectedMetric;
  }

  public clear(): void {
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    this.selectedMetric = null;
  }
}
