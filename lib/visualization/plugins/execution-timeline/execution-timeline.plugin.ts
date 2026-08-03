/**
 * @module ExecutionTimelinePlugin
 * @purpose VisualizerPlugin displaying step history, forward pass, backward pass, and playback markers.
 * @layer Layer 7 Visualizer / Plugins
 * @dependencies VisualizerPlugin, EngineState
 * @api ExecutionTimelinePlugin
 */

import { EngineState } from '../../../training';
import { VisualizerPlugin } from '../../contracts/visualizer';
import { VisualizerMetadata } from '../../contracts/types';
import { VisualizerCapabilities } from '../../contracts/visualizer-capabilities';
import { VisualizerSnapshot } from '../../contracts/visualizer-state';

export class ExecutionTimelinePlugin implements VisualizerPlugin {
  public readonly id = 'execution-timeline';
  public readonly name = 'Execution & Compute Timeline';

  public readonly metadata: VisualizerMetadata = {
    id: 'execution-timeline',
    name: 'Execution & Compute Timeline',
    description: 'Displays step execution history, forward/backward pass markers, and training cycle timeline markers.',
    version: '1.0.0',
    priority: 5,
    mode: 'dom',
    supportedPanels: ['timeline', 'telemetry'],
    category: 'Execution Timeline',
  };

  public readonly capabilities: VisualizerCapabilities = {
    supportsTopology: true,
    supportsTelemetry: true,
    supportsHistograms: false,
    supportsTimeline: true,
    supportsInspection: false,
    supportsZoomPan: true,
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
      currentStep: state.currentStep,
      currentEpoch: state.currentEpoch,
      currentIteration: state.currentIteration,
      activeNodes: state.activeNodes,
      activeEdges: state.activeEdges,
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
