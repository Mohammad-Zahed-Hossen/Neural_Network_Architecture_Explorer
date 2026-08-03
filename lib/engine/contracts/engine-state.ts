/**
 * Shared Base Engine State Contract
 * 
 * Defines serializable state interface for domain engines.
 * Contains zero React, framework, autograd, or knowledge object dependencies.
 */
export interface BaseEngineState {
  readonly engineType: string;
  readonly version: string;
  readonly timestamp: number;
  readonly running: boolean;
  readonly paused: boolean;
  readonly completed: boolean;
  readonly metadata: Readonly<Record<string, string | number | boolean>>;
}
