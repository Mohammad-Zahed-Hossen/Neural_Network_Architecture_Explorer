/**
 * @module VisualizerPluginsBarrel
 * @purpose Registers and exports all visualizer plugins (Gradient Flow, Learning Curve, Layer Health, Distribution, Execution Timeline, Node Inspector).
 * @layer Layer 7 Visualizer / Plugins
 */

import { visualizerRegistry } from '../registry/registry';
import { GradientFlowPlugin } from './gradient-flow/gradient-flow.plugin';
import { LearningCurvePlugin } from './learning-curve/learning-curve.plugin';
import { LayerHealthPlugin } from './layer-health/layer-health.plugin';
import { DistributionPlugin } from './distribution/distribution.plugin';
import { ExecutionTimelinePlugin } from './execution-timeline/execution-timeline.plugin';
import { NodeInspectorPlugin } from './node-inspector/node-inspector.plugin';

export * from './gradient-flow';
export * from './learning-curve';
export * from './layer-health';
export * from './distribution';
export * from './execution-timeline';
export * from './node-inspector';

// Auto-register all visualizer plugins in the platform visualizer registry
visualizerRegistry.register(new GradientFlowPlugin());
visualizerRegistry.register(new LearningCurvePlugin());
visualizerRegistry.register(new LayerHealthPlugin());
visualizerRegistry.register(new DistributionPlugin());
visualizerRegistry.register(new ExecutionTimelinePlugin());
visualizerRegistry.register(new NodeInspectorPlugin());
