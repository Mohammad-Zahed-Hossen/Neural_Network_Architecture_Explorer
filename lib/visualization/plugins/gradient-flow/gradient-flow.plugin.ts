/**
 * @module GradientFlowPlugin
 * @purpose VisualizerPlugin implementation for particle gradient flow Canvas 2D rendering.
 * @layer Layer 7 Visualizer / Plugins
 * @dependencies VisualizerPlugin, EngineState, SimulationRenderer, ParticleEngine
 * @api GradientFlowPlugin
 * @limitations Converts legacy canvas renderer into plugin structure with zero visual changes.
 */

import { EngineState } from '../../../training';
import { VisualizerPlugin } from '../../contracts/visualizer';
import { VisualizerMetadata } from '../../contracts/types';
import { VisualizerCapabilities } from '../../contracts/visualizer-capabilities';
import { VisualizerContext, VisualizerSnapshot } from '../../contracts/visualizer-state';
import { SimulationRenderer } from '../../../training-dynamics/renderer';
import { ParticleEngine } from '../../../training-dynamics/particle-engine';
import { calculateNodeLayout } from '../../../training-dynamics/physics';
import { SimulationPreset } from '../../../types/training-dynamics';

export class GradientFlowPlugin implements VisualizerPlugin {
  public readonly id = 'gradient-flow';
  public readonly name = 'Gradient Flow Simulator';

  public readonly metadata: VisualizerMetadata = {
    id: 'gradient-flow',
    name: 'Gradient Flow Simulator',
    description: 'Canvas 2D signal flow visualizer rendering gradient norm propagation, particle dynamics, and layer health.',
    version: '1.0.0',
    priority: 1,
    mode: 'canvas-2d',
    supportedPanels: ['canvas', 'telemetry', 'inspector'],
    category: 'Physics Simulation',
  };

  public readonly capabilities: VisualizerCapabilities = {
    supportsTopology: true,
    supportsTelemetry: true,
    supportsHistograms: false,
    supportsTimeline: true,
    supportsInspection: true,
    supportsZoomPan: false,
  };

  private renderer = new SimulationRenderer();
  private particleEngine = new ParticleEngine();

  public supports(engineState: EngineState): boolean {
    return !!engineState && !!engineState.topology;
  }

  public initialize(): void {
    this.particleEngine.clear();
  }

  public dispose(): void {
    this.particleEngine.clear();
  }

  public render(canvasCtx: CanvasRenderingContext2D | null, context: VisualizerContext): void {
    if (!canvasCtx) return;

    const { state, width, height } = context;
    const depth = state.topology.nodes.length || 6;

    // Preset configuration for Canvas 2D particle drawing
    const preset = {
      id: 'gradient-flow-preset',
      name: 'Gradient Flow Preset',
      particleSpeed: 1.8,
      particleDecay: 0.1,
      growthRate: 0.0,
      shake: 0.0,
      skipConnectionProbability: 0.3,
      parallelGradient: false,
      normalization: false,
      gradientColor: '#10B981',
      connectionStyle: 'sequential',
      nodeStyle: 'standard',
      gradientDecayRate: 0.2,
      gradientGrowthRate: 0.0,
      noiseLevel: 0.0,
      nodeShake: 0.0,
      skipProbability: 0.3,
      parallelConnections: false,
      normalizationStrength: 1.0,
      gradientClipping: 10.0,
      learningRateMultiplier: 1.0,
      activationSensitivity: 1.0,
      weightInitialization: 'xavier',
      visualTheme: 'emerald',
      connectionType: 'sequential',
      activationFunction: 'relu',
      optimizer: 'adam',
      normalizationType: 'none',
      batchSize: 32,
      dropoutRate: 0.0,
      noiseInjection: 0.0,
      presetCategory: 'research',
    } as unknown as SimulationPreset;

    const dummyState = {
      currentEpoch: state.currentEpoch,
      currentIteration: state.currentIteration,
      loss: state.metrics.loss ?? 2.302,
      gradientNorm: state.metrics.gradientNorm ?? 1.0,
      activationDistribution: [],
      weightMagnitude: 1.0,
      learningRate: state.metrics.learningRate ?? 0.01,
      networkDepth: depth,
      simulationSpeed: 1.0,
      isPaused: state.status === 'paused',
      activePresetId: preset.id,
      weightInitialization: preset.weightInitialization,
      activationFunction: preset.activationFunction!,
      optimizer: 'adam' as const,
      normalizationType: 'none' as const,
      batchSize: 32,
      gradientClipping: false,
      dropoutRate: 0.0,
      noiseInjection: 0.0,
      selectedLayerIndex: null,
    };

    const graph = calculateNodeLayout(depth, width, height, preset, Array(depth).fill(100));

    if (state.status === 'running' && Math.random() < 0.08) {
      this.particleEngine.spawnAmbientParticle(graph.nodes, preset);
    }
    this.particleEngine.update(graph.nodes, preset, 1.0);

    this.renderer.render(
      canvasCtx,
      graph,
      this.particleEngine.getParticles(),
      preset,
      dummyState
    );
  }

  public update(): void {
    // Read-only state update notification
  }

  public getInspectorData(state: EngineState, selectedNodeId?: string | null): Record<string, unknown> {
    const activeNode = state.topology.nodes.find((n) => n.id === selectedNodeId) || state.topology.nodes[0];
    return {
      nodeId: activeNode?.id ?? 'N/A',
      label: activeNode?.label ?? 'Layer',
      type: activeNode?.type ?? 'layer',
      status: state.status,
      gradientNorm: state.metrics.gradientNorm ?? 1.0,
      loss: state.metrics.loss ?? 2.302,
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
