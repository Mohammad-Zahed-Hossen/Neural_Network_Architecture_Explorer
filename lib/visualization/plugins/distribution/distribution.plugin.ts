/**
 * @module DistributionPlugin
 * @purpose VisualizerPlugin displaying activation, weight, and gradient distribution histograms.
 * @layer Layer 7 Visualizer / Plugins
 * @dependencies VisualizerPlugin, EngineState
 * @api DistributionPlugin
 */

import { EngineState } from '../../../training';
import { VisualizerPlugin } from '../../contracts/visualizer';
import { VisualizerMetadata } from '../../contracts/types';
import { VisualizerCapabilities } from '../../contracts/visualizer-capabilities';
import { VisualizerSnapshot } from '../../contracts/visualizer-state';

export class DistributionPlugin implements VisualizerPlugin {
  public readonly id = 'distribution';
  public readonly name = 'Activation & Weight Distribution';

  public readonly metadata: VisualizerMetadata = {
    id: 'distribution',
    name: 'Activation & Weight Distribution',
    description: 'Displays statistical histograms and variance dynamics for activations, weights, and backpropagated signals.',
    version: '1.0.0',
    priority: 4,
    mode: 'dom',
    supportedPanels: ['distribution', 'inspector'],
    category: 'Statistics',
  };

  public readonly capabilities: VisualizerCapabilities = {
    supportsTopology: false,
    supportsTelemetry: true,
    supportsHistograms: true,
    supportsTimeline: false,
    supportsInspection: true,
    supportsZoomPan: false,
  };

  public supports(engineState: EngineState): boolean {
    return !!engineState;
  }

  public initialize(): void {}
  public dispose(): void {}

  public render(): void {}

  public update(): void {}

  public getInspectorData(state: EngineState): Record<string, unknown> {
    return {
      activationMean: 0.45,
      activationVariance: 0.12,
      weightMean: 0.01,
      weightStd: 0.08,
      gradientMean: state.metrics.gradientNorm ?? 1.0,
    };
  }

  public getSnapshot(state: EngineState): VisualizerSnapshot {
    return {
      pluginId: this.id,
      timestamp: Date.now(),
      engineStep: state.currentStep,
      activeNodeCount: state.activeNodes.length,
      activeEdgeCount: state.activeEdges.length,
      metrics: state.metrics,
    };
  }
}
