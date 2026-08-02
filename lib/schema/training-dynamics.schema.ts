import { z } from "zod";

export const ConnectionTypeSchema = z.enum([
  'sequential',
  'residual',
  'dense',
  'batchnorm',
]);

export const ConnectionStyleSchema = z.enum([
  'sequential',
  'weak',
  'unstable',
  'residual',
  'dense',
  'batchnorm',
]);

export const ActivationFunctionSchema = z.enum([
  'sigmoid',
  'tanh',
  'relu',
  'gelu',
  'swish',
]);

export const OptimizerSchema = z.enum([
  'sgd',
  'momentum',
  'rmsprop',
  'adam',
  'adamw',
]);

export const NormalizationTypeSchema = z.enum([
  'none',
  'batchnorm',
  'layernorm',
]);

export const WeightInitializationSchema = z.enum([
  'he',
  'xavier',
  'random_large',
  'random_small',
  'random_normal',
  'orthogonal',
  'ones',
]);

export const ConceptDifficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

export const ConceptCategorySchema = z.enum([
  'optimization',
  'architecture',
  'normalization',
  'regularization',
  'mathematics',
  'general_cs',
]);

export const PresetCategorySchema = z.enum([
  'architecture',
  'training',
  'research',
]);

export const SimulationPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  particleSpeed: z.number(),
  particleDecay: z.number(),
  growthRate: z.number(),
  shake: z.number(),
  skipConnectionProbability: z.number(),
  parallelGradient: z.boolean(),
  normalization: z.boolean(),
  gradientColor: z.string(),
  connectionStyle: ConnectionStyleSchema,
  nodeStyle: z.string(),
  gradientDecayRate: z.number(),
  gradientGrowthRate: z.number(),
  noiseLevel: z.number(),
  nodeShake: z.number(),
  skipProbability: z.number(),
  parallelConnections: z.boolean(),
  normalizationStrength: z.number(),
  gradientClipping: z.number(),
  learningRateMultiplier: z.number(),
  activationSensitivity: z.number(),
  weightInitialization: WeightInitializationSchema,
  visualTheme: z.string(),
  connectionType: ConnectionTypeSchema,

  // Hyperparameters with fallback defaults for backward compatibility
  activationFunction: ActivationFunctionSchema.default('relu'),
  optimizer: OptimizerSchema.default('adam'),
  normalizationType: NormalizationTypeSchema.default('none'),
  batchSize: z.number().default(32),
  dropoutRate: z.number().default(0.0),
  noiseInjection: z.number().default(0.0),
  presetCategory: PresetCategorySchema.default('research'),
});

export const MathSectionSchema = z.object({
  formula: z.string(),
  description: z.string(),
  variables: z.record(z.string(), z.string()).optional(),
});

export const ReferenceSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  year: z.number().optional(),
  url: z.string().optional(),
  type: z.string().optional(),
});

export const TrainingConceptSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: ConceptDifficultySchema,
  category: ConceptCategorySchema,
  summary: z.string(),
  problem: z.string(),
  intuition: z.string(),
  analogy: z.string(),
  visualExplanation: z.string(),
  mathematics: MathSectionSchema,
  causes: z.array(z.string()),
  symptoms: z.array(z.string()),
  solutions: z.array(z.string()),
  realWorldArchitectures: z.array(z.string()),
  relatedConcepts: z.array(z.string()),
  references: z.array(ReferenceSchema),
  tags: z.array(z.string()),
  simulationPreset: SimulationPresetSchema,
});

export const TrainingConceptCatalogSchema = z.array(TrainingConceptSchema);

export type ConnectionType = z.infer<typeof ConnectionTypeSchema>;
export type ConnectionStyle = z.infer<typeof ConnectionStyleSchema>;
export type ActivationFunction = z.infer<typeof ActivationFunctionSchema>;
export type OptimizerType = z.infer<typeof OptimizerSchema>;
export type NormalizationType = z.infer<typeof NormalizationTypeSchema>;
export type WeightInitialization = z.infer<typeof WeightInitializationSchema>;
export type ConceptDifficulty = z.infer<typeof ConceptDifficultySchema>;
export type ConceptCategory = z.infer<typeof ConceptCategorySchema>;
export type PresetCategory = z.infer<typeof PresetCategorySchema>;
export type SimulationPreset = z.infer<typeof SimulationPresetSchema>;
export type MathSection = z.infer<typeof MathSectionSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type TrainingConcept = z.infer<typeof TrainingConceptSchema>;

