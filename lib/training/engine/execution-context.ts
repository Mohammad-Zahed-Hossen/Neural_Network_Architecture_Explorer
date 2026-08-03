/**
 * @module ExecutionContext
 * @purpose Execution context metadata container for single simulation update cycles.
 * @layer Layer 6 Engine
 * @dependencies engine-types
 * @api ExecutionContextManager
 * @limitations Framework-agnostic execution metadata container.
 */

import { EngineContext } from './engine-types';

export class ExecutionContextManager {
  private context: EngineContext;

  constructor() {
    this.context = {
      step: 0,
      epoch: 1,
      iteration: 0,
      elapsedTime: 0,
      deltaTime: 0,
      flags: Object.freeze({}),
      metadata: Object.freeze({}),
    };
  }

  public getContext(): EngineContext {
    return this.context;
  }

  public reset(): void {
    this.context = {
      step: 0,
      epoch: 1,
      iteration: 0,
      elapsedTime: 0,
      deltaTime: 0,
      flags: Object.freeze({}),
      metadata: Object.freeze({}),
    };
  }

  public advanceStep(deltaTime: number, epoch: number, iteration: number): EngineContext {
    this.context = {
      step: this.context.step + 1,
      epoch,
      iteration,
      elapsedTime: this.context.elapsedTime + deltaTime,
      deltaTime,
      flags: this.context.flags,
      metadata: this.context.metadata,
    };
    return this.context;
  }

  public setFlag(key: string, value: boolean): void {
    this.context = {
      ...this.context,
      flags: Object.freeze({
        ...this.context.flags,
        [key]: value,
      }),
    };
  }
}
