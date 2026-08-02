import { SimulationState, SimulationPreset } from '../types/training-dynamics';

export interface LossModel {
  calculateNextLoss(currentEpoch: number, currentLoss: number, state: SimulationState, preset: SimulationPreset): number;
}

export class VanishingLossModel implements LossModel {
  calculateNextLoss(currentEpoch: number, currentLoss: number, state: SimulationState): number {
    // Plateaus early around 1.2 to 1.5 because early layers don't update
    const minLoss = 1.2;
    if (currentLoss <= minLoss) return minLoss + (Math.random() - 0.5) * 0.02;
    const decayRate = 0.985 - (state.networkDepth > 10 ? 0.01 : 0.0);
    return Math.max(minLoss, currentLoss * decayRate - Math.random() * 0.005);
  }
}

export class ResidualLossModel implements LossModel {
  calculateNextLoss(currentEpoch: number, currentLoss: number): number {
    // Fast stable convergence down to ~0.04
    const decayRate = 0.94;
    return Math.max(0.04, currentLoss * decayRate - Math.random() * 0.01);
  }
}

export class ExplodingLossModel implements LossModel {
  calculateNextLoss(currentEpoch: number, currentLoss: number, state: SimulationState): number {
    // Diverges rapidly upward
    if (state.gradientClipping) {
      // Gradient clipping prevents extreme divergence, keeping loss under 3.5
      return Math.min(3.5, currentLoss * 1.02 + Math.random() * 0.05);
    }
    return Math.min(999.9, currentLoss * 1.15 + Math.random() * 0.5);
  }
}

export class BatchNormLossModel implements LossModel {
  calculateNextLoss(currentEpoch: number, currentLoss: number, state: SimulationState): number {
    // Smooth decay with high learning rate stability
    const lrBoost = Math.min(1.5, state.learningRate * 50);
    const decayRate = 0.93 - lrBoost * 0.01;
    return Math.max(0.05, currentLoss * Math.max(0.88, decayRate) - Math.random() * 0.012);
  }
}

export class DenseNetLossModel implements LossModel {
  calculateNextLoss(currentEpoch: number, currentLoss: number): number {
    // Super fast feature-reuse decay down to 0.03
    const decayRate = 0.92;
    return Math.max(0.03, currentLoss * decayRate - Math.random() * 0.015);
  }
}

export class DefaultLossModel implements LossModel {
  calculateNextLoss(currentEpoch: number, currentLoss: number): number {
    return Math.max(0.1, currentLoss * 0.96 - Math.random() * 0.01);
  }
}

export class LossModelFactory {
  public static getModel(preset: SimulationPreset, state: SimulationState): LossModel {
    if (preset.connectionType === 'residual') return new ResidualLossModel();
    if (preset.connectionType === 'dense') return new DenseNetLossModel();
    if (preset.connectionType === 'batchnorm' || state.normalizationType === 'batchnorm') return new BatchNormLossModel();
    if (preset.gradientGrowthRate > 0.3) return new ExplodingLossModel();
    if (preset.gradientDecayRate > 0.2 || state.activationFunction === 'sigmoid') return new VanishingLossModel();
    return new DefaultLossModel();
  }
}
