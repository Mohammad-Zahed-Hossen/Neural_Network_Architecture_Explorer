/**
 * @module VisualizerStateContract
 * @purpose State snapshot and interaction state interfaces for visualizer plugins.
 * @layer Layer 7 Visualizer / Contracts
 * @dependencies EngineState (Layer 6 Engine)
 * @api VisualizerSnapshot, VisualizerContext
 * @limitations Pure serializable visualizer snapshot data.
 */

import { EngineState } from '../../training';

export interface VisualizerSelectionState {
  readonly selectedNodeId: string | null;
  readonly hoveredNodeId: string | null;
  readonly selectedEdgeId: string | null;
  readonly selectedMetric: string | null;
}

export interface VisualizerViewportState {
  readonly zoom: number;
  readonly panX: number;
  readonly panY: number;
}

export interface VisualizerContext {
  readonly state: EngineState;
  readonly selection: VisualizerSelectionState;
  readonly viewport: VisualizerViewportState;
  readonly width: number;
  readonly height: number;
}

export interface VisualizerSnapshot {
  readonly pluginId: string;
  readonly timestamp: number;
  readonly engineStep: number;
  readonly activeNodeCount: number;
  readonly activeEdgeCount: number;
  readonly metrics: Readonly<Record<string, number>>;
}
