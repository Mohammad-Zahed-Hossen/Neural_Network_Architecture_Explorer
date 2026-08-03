/**
 * @module VisualizerPluginContract
 * @purpose Canonical interface definition for all visualizer plugins in the platform.
 * @layer Layer 7 Visualizer / Contracts
 * @dependencies EngineState (Layer 6 Engine), types, visualizer-capabilities, visualizer-state
 * @api VisualizerPlugin
 * @limitations Visualizer plugins are strictly READ-ONLY observers of EngineState snapshots.
 */

import { EngineState } from '../../training';
import { VisualizerMetadata } from './types';
import { VisualizerCapabilities } from './visualizer-capabilities';
import { VisualizerContext, VisualizerSnapshot } from './visualizer-state';

export interface VisualizerPlugin {
  readonly id: string;
  readonly name: string;
  readonly metadata: VisualizerMetadata;
  readonly capabilities: VisualizerCapabilities;

  /**
   * Evaluates if this plugin supports rendering the provided EngineState snapshot.
   */
  supports(engineState: EngineState): boolean;

  /**
   * Initializes plugin resources and listeners.
   */
  initialize(context: VisualizerContext): void;

  /**
   * Disposes plugin resources, particle engines, or subscriptions.
   */
  dispose(): void;

  /**
   * Renders the frame onto Canvas 2D or updates DOM/React bindings.
   */
  render(canvasCtx: CanvasRenderingContext2D | null, context: VisualizerContext): void;

  /**
   * Called when EngineState advances or updates.
   */
  update(state: EngineState): void;

  /**
   * Returns inspection data for the currently selected node/layer under this plugin.
   */
  getInspectorData(state: EngineState, selectedNodeId?: string | null): Record<string, unknown>;

  /**
   * Returns a lightweight snapshot summary of plugin rendering telemetry.
   */
  getSnapshot(state: EngineState): VisualizerSnapshot;
}
