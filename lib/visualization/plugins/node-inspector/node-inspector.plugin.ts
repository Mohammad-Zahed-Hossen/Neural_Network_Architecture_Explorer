/**
 * @module NodeInspectorPlugin
 * @purpose VisualizerPlugin inspecting selected layer details, parameters, tensor shapes, and educational notes.
 * @layer Layer 7 Visualizer / Plugins
 * @dependencies VisualizerPlugin, EngineState
 * @api NodeInspectorPlugin
 */

import { EngineState } from '../../../training';
import { VisualizerPlugin } from '../../contracts/visualizer';
import { VisualizerMetadata } from '../../contracts/types';
import { VisualizerCapabilities } from '../../contracts/visualizer-capabilities';
import { VisualizerSnapshot } from '../../contracts/visualizer-state';

export class NodeInspectorPlugin implements VisualizerPlugin {
  public readonly id = 'node-inspector';
  public readonly name = 'Node Inspector & Details';

  public readonly metadata: VisualizerMetadata = {
    id: 'node-inspector',
    name: 'Node Inspector & Details',
    description: 'Detailed inspector panel rendering node parameters, layer types, tensor shapes, and educational descriptions.',
    version: '1.0.0',
    priority: 6,
    mode: 'dom',
    supportedPanels: ['inspector'],
    category: 'Inspection',
  };

  public readonly capabilities: VisualizerCapabilities = {
    supportsTopology: true,
    supportsTelemetry: false,
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

  public getInspectorData(state: EngineState, selectedNodeId?: string | null): Record<string, unknown> {
    const node = state.topology.nodes.find((n) => n.id === selectedNodeId) || state.topology.nodes[0];
    return {
      nodeId: node?.id ?? 'N/A',
      label: node?.label ?? 'Layer',
      type: node?.type ?? 'layer',
      inputs: node?.inputs ?? [],
      outputs: node?.outputs ?? [],
      metadata: node?.metadata ?? {},
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
