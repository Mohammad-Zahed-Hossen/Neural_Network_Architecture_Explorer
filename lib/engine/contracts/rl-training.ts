import type { BaseEngineState } from './engine-state';

export interface EnvironmentStateSummary {
  readonly stateDim: number;
  readonly actionDim: number;
  readonly lastAction: number | readonly number[];
  readonly terminal: boolean;
}

export interface RLTrainingEngineState extends BaseEngineState {
  readonly engineType: 'rl-training';
  readonly episode: number;
  readonly reward: number;
  readonly policyLoss: number;
  readonly valueLoss: number;
  readonly explorationRate: number;
  readonly environmentState: EnvironmentStateSummary;
}
