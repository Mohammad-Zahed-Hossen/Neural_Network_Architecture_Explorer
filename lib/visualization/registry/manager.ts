/**
 * @module VisualizerManager
 * @purpose Active visualizer lifecycle manager supervising initialization, rendering, and disposal.
 * @layer Layer 7 Visualizer / Registry
 * @dependencies VisualizerPlugin, VisualizerContext, visualizerRegistry
 * @api VisualizerManagerImpl, visualizerManager
 */

import { EngineState } from '../../training';
import { VisualizerPlugin } from '../contracts/visualizer';
import { VisualizerContext } from '../contracts/visualizer-state';
import { visualizerRegistry } from './registry';

class VisualizerManagerImpl {
  private activePlugin: VisualizerPlugin | null = null;
  private activeContext: VisualizerContext | null = null;

  public activate(id: string, context: VisualizerContext): VisualizerPlugin {
    const targetPlugin = visualizerRegistry.get(id);
    if (!targetPlugin) {
      throw new Error(`Cannot activate unregistered visualizer plugin "${id}".`);
    }

    if (this.activePlugin && this.activePlugin.id !== id) {
      this.deactivate();
    }

    this.activePlugin = targetPlugin;
    this.activeContext = context;
    this.activePlugin.initialize(context);
    return this.activePlugin;
  }

  public deactivate(): void {
    if (this.activePlugin) {
      try {
        this.activePlugin.dispose();
      } catch (err) {
        console.error(`Error disposing plugin "${this.activePlugin.id}":`, err);
      }
      this.activePlugin = null;
      this.activeContext = null;
    }
  }

  public getActivePlugin(): VisualizerPlugin | null {
    return this.activePlugin;
  }

  public update(state: EngineState): void {
    if (this.activePlugin) {
      this.activePlugin.update(state);
    }
  }

  public render(canvasCtx: CanvasRenderingContext2D | null, context: VisualizerContext): void {
    if (this.activePlugin) {
      this.activeContext = context;
      this.activePlugin.render(canvasCtx, context);
    }
  }
}

export const visualizerManager = new VisualizerManagerImpl();
