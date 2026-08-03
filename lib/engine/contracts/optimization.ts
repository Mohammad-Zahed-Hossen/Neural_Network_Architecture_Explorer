import type { BaseEngineState } from './engine-state';

export interface OptimizationEngineState extends BaseEngineState {
  readonly engineType: 'optimization';
  readonly objectiveValue: number;
  readonly gradientNorm: number;
  readonly parameterState: Readonly<Record<string, number>>;
  readonly optimizerState: Readonly<Record<string, number>>;
  readonly convergence: boolean;
}
