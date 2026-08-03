/**
 * @module VisualizerRegistry
 * @purpose In-memory registry storing, filtering, and ordering visualizer plugins.
 * @layer Layer 7 Visualizer / Registry
 * @dependencies VisualizerPlugin, EngineState
 * @api VisualizerRegistryImpl, visualizerRegistry
 * @limitations Framework-agnostic registry singleton.
 */

import { EngineState } from '../../training';
import { VisualizerPlugin } from '../contracts/visualizer';

class VisualizerRegistryImpl {
  private plugins: Map<string, VisualizerPlugin> = new Map();

  public register(plugin: VisualizerPlugin): void {
    if (!plugin.id) {
      throw new Error('Cannot register visualizer plugin without a valid ID.');
    }
    this.plugins.set(plugin.id, plugin);
  }

  public unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  public get(id: string): VisualizerPlugin | undefined {
    return this.plugins.get(id);
  }

  public getAll(): readonly VisualizerPlugin[] {
    return Array.from(this.plugins.values()).sort(
      (a, b) => a.metadata.priority - b.metadata.priority
    );
  }

  public supports(engineState: EngineState): VisualizerPlugin[] {
    return this.getAll().filter((p) => p.supports(engineState));
  }

  public clear(): void {
    this.plugins.clear();
  }
}

export const visualizerRegistry = new VisualizerRegistryImpl();
