/**
 * @module StateMachine
 * @purpose Deterministic finite state machine for engine status transitions.
 * @layer Layer 6 Engine
 * @dependencies engine-types
 * @api EngineStateMachine
 * @limitations Prevents invalid state transitions (e.g. stepping uninitialized engine).
 */

import { EngineStatus } from './engine-types';

const ALLOWED_TRANSITIONS: Record<EngineStatus, readonly EngineStatus[]> = {
  idle: ['initialized', 'error'],
  initialized: ['running', 'paused', 'idle', 'error'],
  running: ['paused', 'completed', 'initialized', 'idle', 'error'],
  paused: ['running', 'initialized', 'idle', 'completed', 'error'],
  completed: ['initialized', 'idle', 'running', 'error'],
  error: ['idle', 'initialized'],
};

export class EngineStateMachine {
  private currentStatus: EngineStatus;

  constructor(initialStatus: EngineStatus = 'idle') {
    this.currentStatus = initialStatus;
  }

  public getStatus(): EngineStatus {
    return this.currentStatus;
  }

  public canTransitionTo(targetStatus: EngineStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[this.currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }

  public transitionTo(targetStatus: EngineStatus): EngineStatus {
    if (this.currentStatus === targetStatus) {
      return this.currentStatus;
    }

    if (!this.canTransitionTo(targetStatus)) {
      throw new Error(
        `Invalid EngineState transition from "${this.currentStatus}" to "${targetStatus}".`
      );
    }

    this.currentStatus = targetStatus;
    return this.currentStatus;
  }

  public reset(): void {
    this.currentStatus = 'idle';
  }
}
