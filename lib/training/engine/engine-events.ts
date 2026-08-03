/**
 * @module EngineEvents
 * @purpose Event payload types and listener emitter interfaces for TrainingEngine lifecycle events.
 * @layer Layer 6 Engine
 * @dependencies engine-state, engine-types
 * @api EngineEventType, EngineEventPayloads, EngineEventEmitter
 * @limitations Pure TypeScript event emitter without DOM/Node.js EventEmitter dependencies.
 */

import { EngineState } from './engine-state';
import { EngineStatus } from './engine-types';

export type EngineEventType =
  | 'EngineInitialized'
  | 'EngineStarted'
  | 'EnginePaused'
  | 'EngineStopped'
  | 'EngineReset'
  | 'EngineCompleted'
  | 'NodeExecuted'
  | 'EdgeTraversed'
  | 'MetricsUpdated'
  | 'StateChanged';

export interface EngineEventPayloads {
  EngineInitialized: { readonly state: EngineState };
  EngineStarted: { readonly state: EngineState };
  EnginePaused: { readonly state: EngineState };
  EngineStopped: { readonly state: EngineState };
  EngineReset: { readonly state: EngineState };
  EngineCompleted: { readonly state: EngineState };
  NodeExecuted: { readonly nodeId: string; readonly state: EngineState };
  EdgeTraversed: { readonly edgeId: string; readonly state: EngineState };
  MetricsUpdated: { readonly metrics: Readonly<Record<string, number>>; readonly state: EngineState };
  StateChanged: { readonly previousStatus: EngineStatus; readonly currentStatus: EngineStatus; readonly state: EngineState };
}

export type EngineEventHandler<K extends EngineEventType> = (
  payload: EngineEventPayloads[K]
) => void;

type UntypedHandler = (payload: unknown) => void;

export class EngineEventEmitter {
  private listeners: Map<EngineEventType, Set<UntypedHandler>> = new Map();

  public on<K extends EngineEventType>(event: K, handler: EngineEventHandler<K>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as UntypedHandler);
  }

  public off<K extends EngineEventType>(event: K, handler: EngineEventHandler<K>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as UntypedHandler);
    }
  }

  public emit<K extends EngineEventType>(event: K, payload: EngineEventPayloads[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of Array.from(handlers)) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`Error in EngineEventEmitter for event "${event}":`, err);
        }
      }
    }
  }

  public removeAllListeners(): void {
    this.listeners.clear();
  }
}
