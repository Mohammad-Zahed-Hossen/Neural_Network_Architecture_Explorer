import type { BaseEngineState } from './engine-state';

export interface GradientStats {
  readonly maxNorm: number;
  readonly meanNorm: number;
  readonly layerNorms: readonly number[];
}

export interface ActivationStats {
  readonly meanVariance: number;
  readonly saturationRatio: number;
  readonly deadNeuronRatio: number;
}

export interface CNNTrainingEngineState extends BaseEngineState {
  readonly engineType: 'cnn-training';
  readonly epoch: number;
  readonly iteration: number;
  readonly loss: number;
  readonly accuracy: number;
  readonly learningRate: number;
  readonly gradientStatistics: GradientStats;
  readonly activationStatistics: ActivationStats;
}
