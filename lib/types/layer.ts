export type LayerType =
  | 'input'
  | 'conv2d'
  | 'batch_norm'
  | 'layer_norm'        // Transformer Layer Normalization
  | 'attention'         // Transformer Self-Attention (or Multi-Head Attention)
  | 'activation'
  | 'max_pooling2d'
  | 'average_pooling2d'
  | 'global_average_pooling2d'
  | 'flatten'
  | 'dense'
  | 'dropout'
  | 'add'               // ResNet residual add
  | 'concatenate'       // DenseNet dense concatenation
  | 'bottleneck'        // ResNet bottleneck block (composite)
  | 'dense_block'       // DenseNet dense block (composite)
  | 'transition_block'  // DenseNet transition block (composite)
  | 'output';

export type ActivationFunction =
  | 'relu'
  | 'softmax'
  | 'sigmoid'
  | 'tanh'
  | 'linear'
  | 'leaky_relu'
  | 'gelu';

export interface TensorShape {
  dimensions: (number | null)[];      // [batch, height, width, channels] — null for dynamic batch
  description: string;                // "224×224×3 RGB Image"
}

export interface Conv2DConfig {
  filters: number;
  kernelSize: [number, number];       // [3, 3]
  strides: [number, number];          // [1, 1]
  padding: 'same' | 'valid';
  dilationRate?: [number, number];
  useBias: boolean;
  activation: ActivationFunction;
}

export interface PoolingConfig {
  poolSize: [number, number];         // [2, 2]
  strides: [number, number];          // [2, 2]
  padding: 'same' | 'valid';
}

export interface DenseConfig {
  units: number;
  activation: ActivationFunction;
  useBias: boolean;
}

export interface ActivationConfig {
  activation: ActivationFunction;
}

export interface BatchNormConfig {
  axis: number;
  momentum: number;
  epsilon: number;
}

export interface DropoutConfig {
  rate: number;
}

export interface InputConfig {
  shape: number[];                    // [224, 224, 3]
}

export type AddConfig = Record<string, never>;

export interface ConcatenateConfig {
  axis: number;
}

export interface BottleneckConfig {
  expansion: number;                  // e.g. 4 for ResNet50
  subLayers?: Layer[];                // Optional detailed sub-layers
}

export type LayerConfig =
  | Conv2DConfig
  | PoolingConfig
  | DenseConfig
  | ActivationConfig
  | BatchNormConfig
  | DropoutConfig
  | InputConfig
  | AddConfig
  | ConcatenateConfig
  | BottleneckConfig;

export interface CalculationStep {
  label: string;                      // "Kernel weights"
  expression: string;                 // "3 × 3 × 3 × 64"
  result: number;
  explanation: string;                // "Each of the 64 filters has a 3×3 kernel across 3 input channels"
}

export interface ParameterBreakdown {
  total: number;
  weights: number;
  biases: number;
  formula: string;                    // Human-readable formula
  calculationSteps: CalculationStep[];
  trainableParameters?: number;
  nonTrainableParameters?: number;
  gamma?: number;
  beta?: number;
  movingMean?: number;
  movingVariance?: number;
}

export interface EducationalNote {
  summary: string;                    // One-line summary
  detailed: string;                   // Detailed educational explanation
  analogy?: string;                   // Real-world analogy for intuition
  whyItMatters: string;               // Why this layer is important
  keyTakeaway: string;                // Single key takeaway
}

export interface Position {
  x: number;
  y: number;
}

export interface Layer {
  id: string;                         // Unique layer ID (e.g., "conv1_1")
  type: LayerType;
  name: string;                       // Human-readable name (e.g., "Conv 1-1")
  inputShape: TensorShape;
  outputShape: TensorShape;
  config: LayerConfig;
  parameters: ParameterBreakdown;
  educationalNote: EducationalNote;
  position?: Position;                // Visual positioning for diagram
  color?: string;                     // Tailwind color or hex code
  icon?: string;                      // Name of Lucide icon to display
  layerIds?: string[];                // Layer IDs if this is a grouped layer block
}

