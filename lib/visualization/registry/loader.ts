/**
 * @module VisualizerLoader
 * @purpose Helper utility for loading and discovering visualizer plugins.
 * @layer Layer 7 Visualizer / Registry
 * @dependencies visualizerRegistry, VisualizerPlugin, EngineState
 * @api loadPlugin, discoverPlugins
 */

import { EngineState } from '../../training';
import { VisualizerPlugin } from '../contracts/visualizer';
import { visualizerRegistry } from './registry';

export function loadPlugin(plugin: VisualizerPlugin): void {
  visualizerRegistry.register(plugin);
}

export function discoverPlugins(plugins: readonly VisualizerPlugin[]): void {
  for (const plugin of plugins) {
    visualizerRegistry.register(plugin);
  }
}

export function getSupportedPluginsForState(state: EngineState): VisualizerPlugin[] {
  return visualizerRegistry.supports(state);
}
