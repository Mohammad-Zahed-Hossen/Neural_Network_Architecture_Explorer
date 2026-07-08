import { z } from "zod";

// Layer types
export const LayerTypeSchema = z.enum([
  'input',
  'conv2d',
  'batch_norm',
  'layer_norm',
  'attention',
  'activation',
  'max_pooling2d',
  'average_pooling2d',
  'global_average_pooling2d',
  'flatten',
  'dense',
  'dropout',
  'add',
  'concatenate',
  'bottleneck',
  'dense_block',
  'transition_block',
  'output',
]);

export const ActivationFunctionSchema = z.enum([
  'relu',
  'softmax',
  'sigmoid',
  'tanh',
  'linear',
  'leaky_relu',
  'gelu',
]);

export const ModelCategorySchema = z.enum([
  'VGG',
  'ResNet',
  'Inception',
  'Xception',
  'MobileNet',
  'EfficientNet',
  'DenseNet',
  'NASNet',
  'Foundational',
  'Transformer',
]);

export const EfficiencyLevelSchema = z.enum(['lightweight', 'balanced', 'powerful']);

export const TensorShapeSchema = z.object({
  dimensions: z.array(z.union([z.number(), z.null()])),
  description: z.string(),
});

export const Conv2DConfigSchema = z.object({
  filters: z.number(),
  kernelSize: z.tuple([z.number(), z.number()]),
  strides: z.tuple([z.number(), z.number()]),
  padding: z.enum(['same', 'valid']),
  dilationRate: z.tuple([z.number(), z.number()]).optional(),
  useBias: z.boolean(),
  activation: ActivationFunctionSchema,
});

export const PoolingConfigSchema = z.object({
  poolSize: z.tuple([z.number(), z.number()]),
  strides: z.tuple([z.number(), z.number()]),
  padding: z.enum(['same', 'valid']),
});

export const DenseConfigSchema = z.object({
  units: z.number(),
  activation: ActivationFunctionSchema,
  useBias: z.boolean(),
});

export const ActivationConfigSchema = z.object({
  activation: ActivationFunctionSchema,
});

export const BatchNormConfigSchema = z.object({
  axis: z.number(),
  momentum: z.number(),
  epsilon: z.number(),
});

export const DropoutConfigSchema = z.object({
  rate: z.number(),
});

export const InputConfigSchema = z.object({
  shape: z.array(z.number()),
});

export const AddConfigSchema = z.object({});

export const ConcatenateConfigSchema = z.object({
  axis: z.number(),
});

export const BottleneckConfigSchema = z.object({
  expansion: z.number(),
  subLayers: z.array(z.any()).optional(),
});

export const LayerConfigSchema = z.union([
  Conv2DConfigSchema,
  PoolingConfigSchema,
  DenseConfigSchema,
  ActivationConfigSchema,
  BatchNormConfigSchema,
  DropoutConfigSchema,
  InputConfigSchema,
  AddConfigSchema,
  ConcatenateConfigSchema,
  BottleneckConfigSchema,
]);

export const CalculationStepSchema = z.object({
  label: z.string(),
  expression: z.string(),
  result: z.number(),
  explanation: z.string(),
});

export const ParameterBreakdownSchema = z.object({
  total: z.number(),
  weights: z.number(),
  biases: z.number(),
  formula: z.string(),
  calculationSteps: z.array(CalculationStepSchema),
  trainableParameters: z.number().optional(),
  nonTrainableParameters: z.number().optional(),
  gamma: z.number().optional(),
  beta: z.number().optional(),
  movingMean: z.number().optional(),
  movingVariance: z.number().optional(),
});

export const EducationalNoteSchema = z.object({
  summary: z.string(),
  detailed: z.string().optional(),
  analogy: z.string().optional(),
  whyItMatters: z.string().optional(),
  keyTakeaway: z.string().optional(),
});

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const GroupedNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string().optional(),
  description: z.string(),
  color: z.string().optional(),
  position: PositionSchema,
  layerIds: z.array(z.string()),
});

export const GroupedEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
});

export const LayerSchema = z.object({
  id: z.string(),
  type: LayerTypeSchema,
  name: z.string(),
  inputShape: TensorShapeSchema,
  outputShape: TensorShapeSchema,
  config: LayerConfigSchema,
  parameters: ParameterBreakdownSchema,
  educationalNote: EducationalNoteSchema,
  position: PositionSchema.optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  layerIds: z.array(z.string()).optional(),
});

// Architecture types
export const ConnectionSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(['sequential', 'skip', 'concatenate', 'add']),
  label: z.string().optional(),
});

export const LayerGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  layerIds: z.array(z.string()),
  color: z.string(),
});

export const LayoutNodeSchema = z.object({
  id: z.string(),
  groupId: z.string().nullable(),
  position: PositionSchema,
});

export const LayoutSchema = z.object({
  nodes: z.array(LayoutNodeSchema).optional(),
  edges: z.array(z.any()).optional(),
  groups: z.array(z.any()).optional(),
  groupedNodes: z.array(GroupedNodeSchema).optional(),
  groupedEdges: z.array(GroupedEdgeSchema).optional(),
});

export const ArchitectureSchema = z.object({
  layers: z.array(LayerSchema),
  connections: z.array(ConnectionSchema),
  groups: z.array(LayerGroupSchema),
  layout: LayoutSchema.optional(),
});

// Model types
export const ImageShapeSchema = z.object({
  channels: z.number(),
  height: z.number(),
  width: z.number(),
});

export const NeuralNetworkModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  fullName: z.string(),
  family: z.string(),
  category: ModelCategorySchema,
  paperYear: z.number(),
  authors: z.array(z.string()),
  paperUrl: z.string(),
  docsUrl: z.string().optional(),
  depth: z.number(),
  totalParameters: z.number(),
  trainableParameters: z.number().optional(),
  nonTrainableParameters: z.number().optional(),
  totalFLOPs: z.number(),
  inputShape: ImageShapeSchema,
  top1Accuracy: z.number(),
  top5Accuracy: z.number(),
  memoryUsage: z.number(),
  description: z.string(),
  tags: z.array(z.string()),
  colorTheme: z.string(),
  architecture: ArchitectureSchema,
});

// Model summary schema (for catalog/compare use)
// Based on the actual field names in data/models.json
export const ModelSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  fullName: z.string(),
  family: z.string().optional(),
  category: ModelCategorySchema,
  efficiency: EfficiencyLevelSchema,
  year: z.number().optional(),
  paperYear: z.number(),
  releaseYear: z.number().optional(),
  authors: z.array(z.string()),
  tags: z.array(z.string()),
  totalParameters: z.number(),
  trainableParameters: z.number().optional(),
  nonTrainableParameters: z.number().optional(),
  top1Accuracy: z.number(),
  top5Accuracy: z.number(),
  memoryUsage: z.number(),
  totalFLOPs: z.number(),
  depth: z.number(),
  paperUrl: z.string(),
  colorTheme: z.string(),
  docsUrl: z.string().optional(),
  description: z.string(),
});

// TypeScript types inferred from schemas
export type LayerType = z.infer<typeof LayerTypeSchema>;
export type ActivationFunction = z.infer<typeof ActivationFunctionSchema>;
export type ModelCategory = z.infer<typeof ModelCategorySchema>;
export type EfficiencyLevel = z.infer<typeof EfficiencyLevelSchema>;
export type TensorShape = z.infer<typeof TensorShapeSchema>;
export type Conv2DConfig = z.infer<typeof Conv2DConfigSchema>;
export type PoolingConfig = z.infer<typeof PoolingConfigSchema>;
export type DenseConfig = z.infer<typeof DenseConfigSchema>;
export type ActivationConfig = z.infer<typeof ActivationConfigSchema>;
export type BatchNormConfig = z.infer<typeof BatchNormConfigSchema>;
export type DropoutConfig = z.infer<typeof DropoutConfigSchema>;
export type InputConfig = z.infer<typeof InputConfigSchema>;
export type AddConfig = z.infer<typeof AddConfigSchema>;
export type ConcatenateConfig = z.infer<typeof ConcatenateConfigSchema>;
export type BottleneckConfig = z.infer<typeof BottleneckConfigSchema>;
export type LayerConfig = z.infer<typeof LayerConfigSchema>;
export type CalculationStep = z.infer<typeof CalculationStepSchema>;
export type ParameterBreakdown = z.infer<typeof ParameterBreakdownSchema>;
export type EducationalNote = z.infer<typeof EducationalNoteSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type GroupedNode = z.infer<typeof GroupedNodeSchema>;
export type GroupedEdge = z.infer<typeof GroupedEdgeSchema>;
export type Layer = z.infer<typeof LayerSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type LayerGroup = z.infer<typeof LayerGroupSchema>;
export type Layout = z.infer<typeof LayoutSchema>;
export type Architecture = z.infer<typeof ArchitectureSchema>;
export type ImageShape = z.infer<typeof ImageShapeSchema>;
export type NeuralNetworkModel = z.infer<typeof NeuralNetworkModelSchema>;
export type ModelSummary = z.infer<typeof ModelSummarySchema>;
