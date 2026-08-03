/**
 * @module VisualizerStore
 * @purpose Combined pure TS state container for visualizer state management (selection, hover, timeline, viewport).
 * @layer Layer 7 Visualizer / State
 * @dependencies selection, hover, timeline, visualizer-state
 * @api VisualizerStoreImpl, visualizerStore
 */

import { SelectionStateManager } from './selection';
import { HoverStateManager } from './hover';
import { TimelineStateManager } from './timeline';
import { VisualizerSelectionState, VisualizerViewportState } from '../contracts/visualizer-state';

class VisualizerStoreImpl {
  public selection = new SelectionStateManager();
  public hover = new HoverStateManager();
  public timeline = new TimelineStateManager();
  private viewport: VisualizerViewportState = { zoom: 1.0, panX: 0, panY: 0 };
  private activePluginId: string | null = 'gradient-flow';

  public setActivePluginId(id: string | null): void {
    this.activePluginId = id;
  }

  public getActivePluginId(): string | null {
    return this.activePluginId;
  }

  public setViewport(zoom: number, panX: number, panY: number): void {
    this.viewport = { zoom, panX, panY };
  }

  public getViewport(): VisualizerViewportState {
    return this.viewport;
  }

  public getSelectionState(): VisualizerSelectionState {
    return {
      selectedNodeId: this.selection.getSelectedNodeId(),
      hoveredNodeId: this.hover.getHoveredNodeId(),
      selectedEdgeId: this.selection.getSelectedEdgeId(),
      selectedMetric: this.selection.getSelectedMetric(),
    };
  }
}

export const visualizerStore = new VisualizerStoreImpl();
