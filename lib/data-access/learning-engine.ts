import rawRulesData from '../../data/training-dynamics-rules.json';
import rawScenariosData from '../../data/training-dynamics-scenarios.json';
import { SimulationState, SimulationPreset, PresetCategory } from '../types/training-dynamics';

export interface EducationalExplanation {
  title: string;
  outcomes: string[];
}

export interface EducationalWarning {
  title: string;
  message: string;
}

export interface ScenarioItem {
  id: string;
  name: string;
  category: PresetCategory;
  description: string;
  preset: SimulationPreset;
}

/**
 * Learning Engine evaluating live simulation states against structured rules.
 * Generates educational outcomes, contextual warnings, and comparison narratives.
 */
export function getLiveExplanation(state: SimulationState, preset: SimulationPreset): EducationalExplanation {
  const outcomes: string[] = [];

  // Activation effect
  if (state.activationFunction === 'sigmoid') {
    outcomes.push('Sigmoid activation caps maximum derivative at 0.25, accelerating vanishing gradient risk.');
  } else if (state.activationFunction === 'relu') {
    outcomes.push('ReLU derivative is 1.0 for positive inputs, avoiding gradient saturation in deep stacks.');
  } else if (state.activationFunction === 'gelu' || state.activationFunction === 'swish') {
    outcomes.push(`${state.activationFunction.toUpperCase()} provides smooth non-monotonic gradients around zero.`);
  }

  // Normalization effect
  if (state.normalizationType === 'batchnorm' || preset.connectionType === 'batchnorm') {
    outcomes.push('Batch Normalization forces zero mean and unit variance per mini-batch, eliminating Internal Covariate Shift.');
  } else if (state.normalizationType === 'layernorm') {
    outcomes.push('Layer Normalization normalizes across features independently per sample.');
  }

  // Connection topology effect
  if (preset.connectionType === 'residual') {
    outcomes.push('Identity skip shortcuts (+1 derivative term) allow backpropagation to bypass intermediate weight layers.');
  } else if (preset.connectionType === 'dense') {
    outcomes.push('Concatenation pathways transmit gradients from output directly to all preceding layers.');
  }

  // Optimizer effect
  if (state.optimizer === 'adam' || state.optimizer === 'adamw') {
    outcomes.push('Adam optimizer adapts per-parameter learning rates using exponential moving averages of first and second moments.');
  }

  return {
    title: `Dynamic Telemetry for ${preset.name}`,
    outcomes: outcomes.length > 0 ? outcomes : ['Standard feedforward backpropagation active.'],
  };
}

/**
 * Evaluates active simulation state and returns warnings if risk thresholds are exceeded.
 */
export function getEducationalWarnings(state: SimulationState, preset: SimulationPreset): EducationalWarning[] {
  const warnings: EducationalWarning[] = [];

  if (state.activationFunction === 'sigmoid' && state.networkDepth >= 8 && preset.connectionType === 'sequential') {
    warnings.push({
      title: 'High Vanishing Gradient Risk',
      message: `Network depth is ${state.networkDepth} with Sigmoid activation. Derivatives attenuate to numerical zero near input layers.`,
    });
  }

  if (state.learningRate >= 0.2 && !state.gradientClipping && preset.connectionType === 'sequential') {
    warnings.push({
      title: 'Training Instability Hazard',
      message: `Learning rate of ${state.learningRate} without gradient clipping may cause weight updates to overshoot and oscillate.`,
    });
  }

  if (state.weightInitialization === 'random_large' && state.networkDepth >= 6 && !state.gradientClipping) {
    warnings.push({
      title: 'Exploding Gradient Hazard',
      message: 'Unbounded initial weights multiply spectral radius > 1 layer-by-layer, risking NaN loss values.',
    });
  }

  return warnings;
}

/**
 * Generates a live comparative narrative between Side A and Side B.
 */
export function getComparativeNarrative(presetA: SimulationPreset, presetB: SimulationPreset): string {
  const key = `${presetA.connectionType}-vs-${presetB.connectionType}`;
  const ruleMatch = rawRulesData.comparisons.find((c) => c.key === key || c.key === `${presetB.connectionType}-vs-${presetA.connectionType}`);

  if (ruleMatch) {
    return ruleMatch.summary;
  }

  return `${presetA.name} uses ${presetA.connectionType} connectivity, whereas ${presetB.name} relies on ${presetB.connectionType} pathways. Observe how skip connections and normalizations preserve gradient magnitude across deep layers.`;
}

/**
 * Returns categorized scenario presets for 1-click educational setups.
 */
export function getCategorizedScenarios(): { architecture: ScenarioItem[]; training: ScenarioItem[]; research: ScenarioItem[] } {
  const items = rawScenariosData as ScenarioItem[];
  return {
    architecture: items.filter((s) => s.category === 'architecture'),
    training: items.filter((s) => s.category === 'training'),
    research: items.filter((s) => s.category === 'research'),
  };
}
