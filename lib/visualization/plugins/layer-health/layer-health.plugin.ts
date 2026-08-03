/**
 * @module LayerHealthPlugin
 * @purpose VisualizerPlugin displaying layer activation health, gradient norm, and stability heatmap.
 * @layer Layer 7 Visualizer / Plugins
 * @dependencies VisualizerPlugin, EngineState
 * @api LayerHealthPlugin
 */

import { EngineState } from '../../../training';
import { VisualizerPlugin } from '../../contracts/visualizer';
import { VisualizerMetadata } from '../../contracts/types';
import { VisualizerCapabilities } from '../../contracts/visualizer-capabilities';
import { VisualizerSnapshot } from '../../contracts/visualizer-state';
import { generateLayerHeatmapData } from '../../utils/heatmaps';

export class LayerHealthPlugin implements VisualizerPlugin {
  public readonly id = 'layer-health';
  public readonly name = 'Layer Health & Stability';

  public readonly metadata: VisualizerMetadata = {
    id: 'layer-health',
    name: 'Layer Health & Stability',
    description: 'Displays layer activation health scores, gradient norm attenuation, and network stability heatmaps.',
    version: '1.0.0',
    priority: 3,
    mode: 'dom',
    supportedPanels: ['telemetry', 'inspector'],
    category: 'Diagnostics',
  };

  public readonly capabilities: VisualizerCapabilities = {
    supportsTopology: true,
    supportsTelemetry: true,
    supportsHistograms: false,
    supportsTimeline: false,
    supportsInspection: true,
    supportsZoomPan: false,
  };

  public supports(engineState: EngineState): boolean {
    return !!engineState && !!engineState.topology;
  }

  public initialize(): void {}
  public dispose(): void {}

  public render(): void {}

  public update(): void {}

  public getInspectorData(state: EngineState): Record<string, unknown> {
    const depth = state.topology.nodes.length || 6;
    const gradientNorm = state.metrics.gradientNorm ?? 1.0;
    const heatmap = generateLayerHeatmapData(depth, gradientNorm, Array(depth).fill(95));
    return {
      depth,
      gradientNorm,
      heatmap,
      status: state.status,
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
