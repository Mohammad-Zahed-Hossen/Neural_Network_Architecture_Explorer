/**
 * @module VisualizerCapabilities
 * @purpose Capability definitions and compatibility checker contracts for visualizer plugins.
 * @layer Layer 7 Visualizer / Contracts
 * @dependencies types
 * @api VisualizerCapabilities
 * @limitations Describes capabilities without binding to specific UI frameworks.
 */

import { EngineState } from '../../training';

export interface VisualizerCapabilities {
  readonly supportsTopology: boolean;
  readonly supportsTelemetry: boolean;
  readonly supportsHistograms: boolean;
  readonly supportsTimeline: boolean;
  readonly supportsInspection: boolean;
  readonly supportsZoomPan: boolean;
  readonly minDepth?: number;
  readonly maxDepth?: number;
}

export function defaultCapabilities(): VisualizerCapabilities {
  return {
    supportsTopology: true,
    supportsTelemetry: true,
    supportsHistograms: false,
    supportsTimeline: false,
    supportsInspection: true,
    supportsZoomPan: false,
  };
}

export function isStateSupportedByCapabilities(
  state: EngineState,
  capabilities: VisualizerCapabilities
): boolean {
  if (capabilities.minDepth && state.topology.nodes.length < capabilities.minDepth) {
    return false;
  }
  if (capabilities.maxDepth && state.topology.nodes.length > capabilities.maxDepth) {
    return false;
  }
  return true;
}
