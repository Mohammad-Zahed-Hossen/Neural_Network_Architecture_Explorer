import {
  TrainingConcept,
  SimulationPreset,
  MathSection,
  Reference,
  ConceptDifficulty,
  ConceptCategory,
  PresetCategory,
  WeightInitialization,
  ConnectionType,
  ActivationFunction,
  OptimizerType,
  NormalizationType,
} from '../schema/training-dynamics.schema';

export type {
  TrainingConcept,
  SimulationPreset,
  MathSection,
  Reference,
  ConceptDifficulty,
  ConceptCategory,
  PresetCategory,
  WeightInitialization,
  ConnectionType,
  ActivationFunction,
  OptimizerType,
  NormalizationType,
};

export type LayerHealthStatus = 'Excellent' | 'Healthy' | 'Weak' | 'Vanishing' | 'Exploding';

export interface VisualizationConfig {
  canvasWidth: number;
  canvasHeight: number;
  paddingX: number;
  nodeRadius: number;
  showLabels: boolean;
  showBarriers: boolean;
  showArcs: boolean;
  glowEffect: boolean;
}

export interface LearningContent {
  conceptId: string;
  title: string;
  summary: string;
  problem: string;
  intuition: string;
  analogy: string;
  mathematics: MathSection;
}

export interface ComparisonInfo {
  title: string;
  description: string;
  badgeColor: string;
  codeSnippet: string;
}

export interface SimulationNode {
  id: string;
  index: number;
  x: number;
  y: number;
  radius: number;
  label: string;
  color: string;
  borderColor: string;
  glow: number;
  health: number; // 0.0 to 1.0 representing gradient flow vitality
}

export interface SimulationConnection {
  id: string;
  sourceIndex: number;
  targetIndex: number;
  type: 'sequential' | 'skip' | 'dense' | 'barrier';
  strokeStyle: string;
  lineWidth: number;
}

export interface SimulationGraph {
  nodes: SimulationNode[];
  connections: SimulationConnection[];
  width: number;
  height: number;
  depth: number;
}

export interface SimulationParticle {
  id: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  targetNodeIdx: number;
  sourceNodeIdx: number;
  pathIndex: number; // 0: sequential, 1: skip arc, >1: dense curve index
  progress: number; // 0.0 to 1.0 along trajectory
}

export interface SimulationState {
  currentEpoch: number;
  currentIteration: number;
  loss: number;
  gradientNorm: number;
  activationDistribution: number[];
  weightMagnitude: number;
  learningRate: number;
  networkDepth: number;
  simulationSpeed: number;
  isPaused: boolean;
  activePresetId: string;
  weightInitialization: WeightInitialization;
  activationFunction: ActivationFunction;
  optimizer: OptimizerType;
  normalizationType: NormalizationType;
  batchSize: number;
  gradientClipping: boolean;
  dropoutRate: number;
  noiseInjection: number;
  selectedLayerIndex: number | null;
}

export interface LayerTelemetryRaw {
  layerIndex: number;
  layerName: string;
  incomingGradient: number;
  outgoingGradient: number;
  weightUpdate: number;
  activationMean: number;
  activationVariance: number;
  activationStd: number;
  histogram: number[];
}

export interface LossHistoryEntry {
  epoch: number;
  loss: number;
  gradientNorm: number;
  stability: number;
}

export interface PlaybackEvent {
  id: string;
  epoch: number;
  type: 'health_change' | 'vanishing_risk' | 'exploding_risk' | 'normalization_stabilized' | 'convergence_milestone';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface TelemetrySnapshot {
  timestamp: number;
  epoch: number;
  iteration: number;
  loss: number;
  gradientNorm: number;
  averageGradient: number;
  activationVariance: number;
  updateMagnitude: number;
  learningRate: number;
  networkDepth: number;
  networkStability: number;
  convergenceStatus: 'Stabilizing' | 'Converging' | 'Stalled' | 'Diverging' | 'Vanishing';
  layers: LayerTelemetryRaw[];
  lossHistory: LossHistoryEntry[];
  timelineEvents: PlaybackEvent[];
}

export interface SimulationMetrics {
  gradientMagnitude: number;
  averageGradient: number;
  maximumGradient: number;
  minimumGradient: number;
  updateMagnitude: number;
  layerHealth: number[];
  networkStability: number;
  trainingProgress: number;
  history: LossHistoryEntry[];
}

export type SimulationEventType =
  | 'Backpropagation'
  | 'ForwardPass'
  | 'EpochComplete'
  | 'LayerUpdated'
  | 'SimulationReset'
  | 'PresetChanged'
  | 'MetricsUpdated'
  | 'StateChanged'
  | 'TelemetrySnapshot'
  | 'LayerSelected';

export interface SimulationEvent<T = unknown> {
  type: SimulationEventType;
  timestamp: number;
  data: T;
}

export type SimulationEventHandler<T = unknown> = (event: SimulationEvent<T>) => void;

