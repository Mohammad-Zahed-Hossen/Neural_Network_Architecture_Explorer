/**
 * @module LearningCurvePlugin
 * @purpose VisualizerPlugin displaying real-time loss, accuracy, and learning rate trajectories.
 * @layer Layer 7 Visualizer / Plugins
 * @dependencies VisualizerPlugin, EngineState
 * @api LearningCurvePlugin
 */

import { EngineState } from '../../../training';
import { VisualizerPlugin } from '../../contracts/visualizer';
import { VisualizerMetadata } from '../../contracts/types';
import { VisualizerCapabilities } from '../../contracts/visualizer-capabilities';
import { VisualizerSnapshot } from '../../contracts/visualizer-state';

export class LearningCurvePlugin implements VisualizerPlugin {
  public readonly id = 'learning-curve';
  public readonly name = 'Learning Curve Telemetry';

  public readonly metadata: VisualizerMetadata = {
    id: 'learning-curve',
    name: 'Learning Curve Telemetry',
    description: 'Displays real-time loss trajectories, accuracy progression, and learning rate telemetry charts.',
    version: '1.0.0',
    priority: 2,
    mode: 'dom',
    supportedPanels: ['telemetry'],
    category: 'Metrics & Performance',
  };

  public readonly capabilities: VisualizerCapabilities = {
    supportsTopology: false,
    supportsTelemetry: true,
    supportsHistograms: false,
    supportsTimeline: true,
    supportsInspection: false,
    supportsZoomPan: true,
  };

  public supports(engineState: EngineState): boolean {
    return !!engineState && !!engineState.metrics;
  }

  public initialize(): void {}
  public dispose(): void {}

  public render(): void {}

  public update(): void {}

  public getInspectorData(state: EngineState): Record<string, unknown> {
    return {
      loss: state.metrics.loss ?? 2.302,
      accuracy: state.metrics.accuracy ?? 0.1,
      learningRate: state.metrics.learningRate ?? 0.01,
      epoch: state.currentEpoch,
      iteration: state.currentIteration,
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
