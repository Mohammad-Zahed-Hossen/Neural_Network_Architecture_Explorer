import { z } from 'zod';

export const FrameworkTypeSchema = z.enum([
  'pytorch',
  'tensorflow',
  'keras',
  'huggingface',
  'jax',
  'onnx',
  'bash',
  'python',
]);

export const DifficultyLevelSchema = z.enum(['Beginner', 'Intermediate', 'Advanced']);

export const ImplementationTypeSchema = z.enum([
  'Transfer Learning',
  'Fine-Tuning',
  'Image Classification',
  'Semantic Segmentation',
  'Object Detection',
  'Feature Extraction',
  'Image Generation',
  'Sequence Modeling',
  'Representation Learning',
  'Self-Supervised Learning',
  'Inference',
]);

export const ExampleCategorySchema = z.enum([
  'Minimal Example',
  'End-to-End Workflow',
  'Production Pipeline',
  'Research Example',
  'Deployment Example',
  'Benchmark',
]);

export const CalloutTypeSchema = z.enum(['why', 'mistake', 'tip', 'strategy', 'note']);

export const CodeSectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  startLine: z.number(),
  endLine: z.number(),
});

export const CodeSnippetSchema = z.object({
  id: z.string(),
  filename: z.string(),
  language: z.string(),
  framework: FrameworkTypeSchema,
  frameworkVersion: z.string().optional(),
  code: z.string(),
  highlightLines: z.array(z.number()).optional(),
  sections: z.array(CodeSectionSchema).optional(),
});

export const CodeVariantSchema = z.object({
  id: z.string(),
  label: z.string(),
  framework: FrameworkTypeSchema,
  icon: z.string().optional(),
  snippets: z.array(CodeSnippetSchema),
});

export const GpuRequirementSchema = z.enum(['Required', 'Recommended', 'Optional', 'Not Needed']);

export const TechnicalMetadataSchema = z.object({
  frameworkVersion: z.string().optional(),
  pythonVersion: z.string().optional(),
  inputResolution: z.string().optional(),
  dataset: z.string().optional(),
  gpuRequirement: GpuRequirementSchema.optional(),
  estimatedRuntime: z.string().optional(),
  mixedPrecisionSupported: z.boolean().optional(),
  fineTuningSupported: z.boolean().optional(),
  customBadges: z.array(z.string()).optional(),
});

export const EducationalCalloutSchema = z.object({
  id: z.string(),
  type: CalloutTypeSchema,
  title: z.string(),
  content: z.string(),
  defaultExpanded: z.boolean().optional(),
});

export const PrerequisitesSchema = z.object({
  minimumPythonVersion: z.string().optional(),
  frameworkVersion: z.string().optional(),
  hardwareRecommendation: z.string().optional(),
  knowledgePrerequisites: z.array(z.string()).optional(),
  expectedFamiliarity: z.array(z.string()).optional(),
});

export const VerificationMetadataSchema = z.object({
  lastVerifiedDate: z.string().optional(),
  verifiedFrameworkVersions: z.array(z.string()).optional(),
  verifiedPythonVersion: z.string().optional(),
});

export const CodeBlockFooterInfoSchema = z.object({
  exampleType: z.string().optional(),
  estimatedReadingTime: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  compatibleModels: z.array(z.string()).optional(),
  downloadUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  docsUrl: z.string().optional(),
});

export const EngineeringSummarySchema = z.object({
  bestUsedWhen: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  expectedBehavior: z.array(z.string()),
  deploymentNotes: z.array(z.string()),
});

export const ModelImplementationDataSchema = z.object({
  modelId: z.string(),
  headerTitle: z.string(),
  headerDescription: z.string(),
  subtitle: z.string().optional(),
  difficulty: DifficultyLevelSchema.default('Intermediate'),
  implementationType: ImplementationTypeSchema.optional(),
  exampleCategory: ExampleCategorySchema.optional(),
  isProductionReady: z.boolean().default(true),
  metadata: TechnicalMetadataSchema,
  prerequisites: PrerequisitesSchema.optional(),
  verification: VerificationMetadataSchema.optional(),
  variants: z.array(CodeVariantSchema),
  callouts: z.array(EducationalCalloutSchema).optional(),
  summary: EngineeringSummarySchema.optional(),
  footer: CodeBlockFooterInfoSchema.optional(),
  // Backward compatibility: keep isTransferLearning for existing data
  isTransferLearning: z.boolean().optional(),
  
  // Extension Fields for Detailed Engineering Specs
  strategy: z.object({
    rationale: z.string().optional(),
    backboneStrategy: z.string().optional(),
    fineTuningStrategy: z.string().optional(),
    trainingProgression: z.array(z.object({
      stage: z.string(),
      description: z.string(),
      lr: z.string().optional(),
      status: z.string().optional(),
    })).optional(),
  }).optional(),

  ioSpecification: z.object({
    input: z.object({
      tensorFormat: z.string().optional(),
      shape: z.string().optional(),
      colorSpace: z.string().optional(),
      normalization: z.string().optional(),
      resizeStrategy: z.string().optional(),
      valueRange: z.string().optional(),
    }).optional(),
    output: z.object({
      tensorFormat: z.string().optional(),
      predictionFormat: z.string().optional(),
      classMapping: z.string().optional(),
      confidenceOutput: z.string().optional(),
      topK: z.string().optional(),
    }).optional(),
  }).optional(),

  trainingConfig: z.object({
    optimizer: z.string().optional(),
    lossFunction: z.string().optional(),
    learningRate: z.string().optional(),
    lrScheduler: z.string().optional(),
    epochs: z.string().optional(),
    batchSize: z.string().optional(),
    weightDecay: z.string().optional(),
    mixedPrecision: z.string().optional(),
    gradientClipping: z.string().optional(),
    gradientAccumulation: z.string().optional(),
    earlyStopping: z.string().optional(),
    checkpointStrategy: z.string().optional(),
  }).optional(),

  inferencePipeline: z.array(z.object({
    step: z.number(),
    title: z.string(),
    description: z.string(),
    codeSnippet: z.string().optional(),
  })).optional(),

  performanceNotes: z.object({
    mixedPrecisionSupported: z.boolean().optional(),
    onnxExportSupported: z.boolean().optional(),
    torchScriptSupported: z.boolean().optional(),
    tensorRTCompatible: z.boolean().optional(),
    cpuInferenceLatency: z.string().optional(),
    gpuInferenceLatency: z.string().optional(),
    memoryFootprint: z.string().optional(),
    latencyCategory: z.string().optional(),
    dynamicShapesSupported: z.boolean().optional(),
    batchInferenceEfficiency: z.string().optional(),
  }).optional(),

  productionChecklist: z.object({
    batchInferenceReady: z.boolean().optional(),
    streamingInferenceReady: z.boolean().optional(),
    modelWarmupRecommended: z.boolean().optional(),
    threadSafetyVerified: z.boolean().optional(),
    quantizationSupport: z.string().optional(),
    onnxStatus: z.string().optional(),
    tensorRTStatus: z.string().optional(),
    dockerCompatible: z.boolean().optional(),
    servingRecommendations: z.array(z.string()).optional(),
    memoryOptimizationTips: z.array(z.string()).optional(),
  }).optional(),
});

export type FrameworkType = z.infer<typeof FrameworkTypeSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type ImplementationType = z.infer<typeof ImplementationTypeSchema>;
export type ExampleCategory = z.infer<typeof ExampleCategorySchema>;
export type CalloutType = z.infer<typeof CalloutTypeSchema>;
export type CodeSection = z.infer<typeof CodeSectionSchema>;
export type CodeSnippet = z.infer<typeof CodeSnippetSchema>;
export type CodeVariant = z.infer<typeof CodeVariantSchema>;
export type TechnicalMetadata = z.infer<typeof TechnicalMetadataSchema>;
export type Prerequisites = z.infer<typeof PrerequisitesSchema>;
export type VerificationMetadata = z.infer<typeof VerificationMetadataSchema>;
export type EducationalCallout = z.infer<typeof EducationalCalloutSchema>;
export type CodeBlockFooterInfo = z.infer<typeof CodeBlockFooterInfoSchema>;
export type EngineeringSummary = z.infer<typeof EngineeringSummarySchema>;
export type ModelImplementationData = z.infer<typeof ModelImplementationDataSchema>;
