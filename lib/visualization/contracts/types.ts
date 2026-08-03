/**
 * @module VisualizationContracts
 * @purpose Core types and primitive interfaces for the Visualizer Framework (Phase 3.3).
 * @layer Layer 7 Visualizer / Contracts
 * @dependencies EngineState (Layer 6 Engine)
 * @api VisualizerMode, VisualizerPanel, VisualizerMetadata
 * @limitations Pure serializable contract types. Visualizers are READ-ONLY observers of EngineState.
 */

export type VisualizerMode = 'canvas-2d' | 'react-flow' | 'dom' | 'svg' | 'custom';

export type VisualizerPanel = 'canvas' | 'telemetry' | 'inspector' | 'timeline' | 'distribution';

export interface VisualizerMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly priority: number;
  readonly mode: VisualizerMode;
  readonly supportedPanels: readonly VisualizerPanel[];
  readonly category?: string;
  readonly iconName?: string;
}
