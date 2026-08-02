import {
  SimulationState,
  SimulationPreset,
  SimulationNode,
  LayerTelemetryRaw,
  TelemetrySnapshot,
  LayerHealthStatus,
  PlaybackEvent,
  LossHistoryEntry,
} from '../types/training-dynamics';

/**
 * Pure utility function to derive layer health status from raw gradient magnitude and activation variance.
 * Never stored redundantly in state — computed on demand.
 */
export function getHealthStatus(gradient: number, activationVariance: number): LayerHealthStatus {
  if (gradient > 15.0) return 'Exploding';
  if (gradient < 0.05) return 'Vanishing';
  if (gradient < 0.35 || activationVariance < 0.1) return 'Weak';
  if (gradient >= 0.7 && gradient <= 1.4 && activationVariance >= 0.5 && activationVariance <= 2.0) {
    return 'Excellent';
  }
  return 'Healthy';
}

/**
 * Pure utility function mapping raw gradient magnitude and health status to an HSL color code.
 * Color spectrum: Blue (vanishing) -> Green (healthy) -> Orange (high) -> Red (exploding)
 */
export function getHeatmapColor(gradient: number, healthStatus: LayerHealthStatus): string {
  switch (healthStatus) {
    case 'Exploding':
      return 'hsl(0, 84%, 60%)'; // Crimson Red
    case 'Vanishing':
      return 'hsl(217, 91%, 60%)'; // Cool Blue
    case 'Weak':
      return 'hsl(199, 89%, 48%)'; // Cyan/Teal
    case 'Excellent':
      return 'hsl(142, 71%, 45%)'; // Emerald Green
    case 'Healthy':
    default:
      if (gradient > 2.0) return 'hsl(38, 92%, 50%)'; // Orange
      return 'hsl(160, 84%, 39%)'; // Soft Green
  }
}

/**
 * Pure utility function to get badge styling based on health status.
 */
export function getHealthBadgeStyle(status: LayerHealthStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Exploding':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
    case 'Vanishing':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'Weak':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'Excellent':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Healthy':
    default:
      return { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' };
  }
}

/**
 * Generates a 5-bin activation histogram centered around the layer mean.
 */
export function calculateActivationHistogram(mean: number, variance: number): number[] {
  const std = Math.sqrt(Math.max(0.01, variance));
  const bins = [0, 0, 0, 0, 0];
  const totalSamples = 100;

  for (let i = 0; i < totalSamples; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1 || 1e-6)) * Math.cos(2.0 * Math.PI * u2);
    const val = mean + z * std;

    if (val < mean - 1.2 * std) bins[0]++;
    else if (val < mean - 0.4 * std) bins[1]++;
    else if (val < mean + 0.4 * std) bins[2]++;
    else if (val < mean + 1.2 * std) bins[3]++;
    else bins[4]++;
  }

  return bins.map((count) => Math.round((count / totalSamples) * 100));
}

/**
 * Calculates raw per-layer telemetry snapshots (Educational Approximation Layer).
 */
export function generateLayerTelemetryRaw(
  state: SimulationState,
  preset: SimulationPreset,
  _nodes: SimulationNode[]
): LayerTelemetryRaw[] {
  const depth = state.networkDepth;
  const layers: LayerTelemetryRaw[] = [];

  for (let i = 0; i < depth; i++) {
    const layerName = i === 0 ? 'Input L1' : i === depth - 1 ? `Output L${depth}` : `Layer L${i + 1}`;
    
    let g = 1.0;
    const actSensitivity = state.activationFunction === 'sigmoid' ? 0.25 : state.activationFunction === 'tanh' ? 0.5 : 1.0;
    
    if (preset.connectionType === 'residual') {
      g = 0.9 + Math.sin(i + state.currentIteration * 0.1) * 0.08;
    } else if (preset.connectionType === 'dense') {
      g = 1.0 + (i / depth) * 0.35;
    } else if (preset.connectionType === 'batchnorm' || state.normalizationType === 'batchnorm') {
      g = 0.95 + (Math.random() - 0.5) * 0.06;
    } else if (preset.gradientDecayRate > 0.1 || state.activationFunction === 'sigmoid') {
      const decayFactor = 1.0 - (preset.gradientDecayRate || 0.35) * (1.1 - actSensitivity);
      g = Math.pow(Math.max(0.1, decayFactor), depth - 1 - i);
    } else if (preset.gradientGrowthRate > 0.2) {
      const growthFactor = 1.0 + preset.gradientGrowthRate * (state.learningRate * 20.0);
      g = Math.pow(growthFactor, depth - 1 - i);
    }

    if (state.gradientClipping) {
      g = Math.min(10.0, g);
    }

    const incomingGradient = Number(g.toFixed(4));
    const outgoingGradient = Number((g * (0.95 + Math.random() * 0.1)).toFixed(4));

    let optMultiplier = 1.0;
    if (state.optimizer === 'adam' || state.optimizer === 'adamw') optMultiplier = 1.4;
    if (state.optimizer === 'momentum') optMultiplier = 1.2;
    const weightUpdate = Number((incomingGradient * state.learningRate * optMultiplier).toFixed(5));

    let activationMean = 0.05;
    let activationVariance = 1.0;

    if (preset.connectionType === 'batchnorm' || state.normalizationType === 'batchnorm') {
      activationMean = Number(((Math.random() - 0.5) * 0.04).toFixed(3));
      activationVariance = Number((0.95 + Math.random() * 0.1).toFixed(3));
    } else if (state.normalizationType === 'layernorm') {
      activationMean = Number(((Math.random() - 0.5) * 0.02).toFixed(3));
      activationVariance = Number((1.0 + (Math.random() - 0.5) * 0.05).toFixed(3));
    } else {
      activationMean = Number((0.2 * (i + 1) * (state.weightInitialization === 'random_large' ? 2.5 : 1.0)).toFixed(2));
      activationVariance = Number((0.8 * Math.pow(1.3, i) * (state.weightInitialization === 'random_large' ? 4.0 : 0.5)).toFixed(2));
    }

    const activationStd = Number(Math.sqrt(Math.max(0.001, activationVariance)).toFixed(3));
    const histogram = calculateActivationHistogram(activationMean, activationVariance);

    layers.push({
      layerIndex: i,
      layerName,
      incomingGradient,
      outgoingGradient,
      weightUpdate,
      activationMean,
      activationVariance,
      activationStd,
      histogram,
    });
  }

  return layers;
}

/**
 * Creates an immutable TelemetrySnapshot for UI consumption.
 */
export function createTelemetrySnapshot(
  state: SimulationState,
  preset: SimulationPreset,
  nodes: SimulationNode[],
  lossHistory: LossHistoryEntry[],
  timelineEvents: PlaybackEvent[]
): TelemetrySnapshot {
  const layers = generateLayerTelemetryRaw(state, preset, nodes);

  const totalGrad = layers.reduce((acc, l) => acc + l.incomingGradient, 0);
  const averageGradient = Number((totalGrad / (layers.length || 1)).toFixed(4));
  const gradientNorm = Number((layers[layers.length - 1]?.incomingGradient || 1.0).toFixed(4));
  const totalVar = layers.reduce((acc, l) => acc + l.activationVariance, 0);
  const activationVariance = Number((totalVar / (layers.length || 1)).toFixed(3));

  const updateMagnitude = Number((gradientNorm * state.learningRate).toFixed(5));

  const minGrad = Math.min(...layers.map((l) => l.incomingGradient));
  const maxGrad = Math.max(...layers.map((l) => l.incomingGradient));
  const networkStability = Math.min(100, Math.max(5, Math.round((minGrad / (maxGrad || 1)) * 100)));

  let convergenceStatus: TelemetrySnapshot['convergenceStatus'] = 'Converging';
  if (gradientNorm < 0.05) convergenceStatus = 'Vanishing';
  else if (gradientNorm > 15.0) convergenceStatus = 'Diverging';
  else if (state.currentEpoch > 30 && lossHistory.length > 5 && Math.abs(lossHistory[lossHistory.length - 1].loss - lossHistory[lossHistory.length - 5].loss) < 0.005) {
    convergenceStatus = 'Stalled';
  } else if (networkStability > 70) {
    convergenceStatus = 'Stabilizing';
  }

  return Object.freeze({
    timestamp: Date.now(),
    epoch: state.currentEpoch,
    iteration: state.currentIteration,
    loss: Number(state.loss.toFixed(4)),
    gradientNorm,
    averageGradient,
    activationVariance,
    updateMagnitude,
    learningRate: state.learningRate,
    networkDepth: state.networkDepth,
    networkStability,
    convergenceStatus,
    layers,
    lossHistory: [...lossHistory],
    timelineEvents: [...timelineEvents],
  });
}
