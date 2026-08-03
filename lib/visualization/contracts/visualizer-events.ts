/**
 * @module VisualizerEvents
 * @purpose Event payload types and listener interface for visualizer UI state changes.
 * @layer Layer 7 Visualizer / Contracts
 * @dependencies visualizer-state
 * @api VisualizerEventType, VisualizerEventPayloads, VisualizerEventEmitter
 * @limitations Framework-agnostic event bus for visualizers.
 */

import { VisualizerViewportState } from './visualizer-state';

export type VisualizerEventType =
  | 'PluginActivated'
  | 'PluginDeactivated'
  | 'NodeSelected'
  | 'NodeHovered'
  | 'EdgeSelected'
  | 'ViewportChanged'
  | 'RenderFrame';

export interface VisualizerEventPayloads {
  PluginActivated: { readonly pluginId: string };
  PluginDeactivated: { readonly pluginId: string };
  NodeSelected: { readonly nodeId: string | null };
  NodeHovered: { readonly nodeId: string | null };
  EdgeSelected: { readonly edgeId: string | null };
  ViewportChanged: { readonly viewport: VisualizerViewportState };
  RenderFrame: { readonly timestamp: number; readonly frameTime: number };
}

export type VisualizerEventHandler<K extends VisualizerEventType> = (
  payload: VisualizerEventPayloads[K]
) => void;

type UntypedVisualizerHandler = (payload: unknown) => void;

export class VisualizerEventEmitter {
  private listeners: Map<VisualizerEventType, Set<UntypedVisualizerHandler>> = new Map();

  public on<K extends VisualizerEventType>(event: K, handler: VisualizerEventHandler<K>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as UntypedVisualizerHandler);
  }

  public off<K extends VisualizerEventType>(event: K, handler: VisualizerEventHandler<K>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as UntypedVisualizerHandler);
    }
  }

  public emit<K extends VisualizerEventType>(event: K, payload: VisualizerEventPayloads[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of Array.from(handlers)) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`Error in VisualizerEventEmitter for "${event}":`, err);
        }
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
