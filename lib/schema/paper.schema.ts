import { z } from 'zod';

// Legacy compatibility schemas
export const PaperTypeSchema = z.enum([
  'research',
  'thesis',
  'survey',
  'benchmark',
  'notes',
]);

export const ReadingStatusSchema = z.enum([
  'unread',
  'reading',
  'read',
  'bookmarked',
]);

export const PrioritySchema = z.enum([
  'low',
  'medium',
  'high',
]);

export type PaperType = z.infer<typeof PaperTypeSchema>;
export type ReadingStatus = z.infer<typeof ReadingStatusSchema>;
export type Priority = z.infer<typeof PrioritySchema>;

// Canonical Paper Details Schemas
export const InnovationTypeSchema = z.enum([
  'component',
  'architecture',
  'mathematics',
  'loss',
  'optimization',
]);

export const NoteCategorySchema = z.enum([
  'strength',
  'weakness',
  'limitation',
  'assumption',
  'failure_case',
  'tradeoff',
  'misconception',
]);

export const ReproducibilityTierSchema = z.enum([
  'empirical_verified',
  'community_reproduced',
  'unverified',
]);

export const PaperAuthorSchema = z.object({
  name: z.string(),
  affiliation: z.string().optional(),
  leadAuthor: z.boolean().optional(),
});

export const PaperMetadataSchema = z.object({
  paperId: z.string(),
  title: z.string(),
  authors: z.array(PaperAuthorSchema),
  venue: z.string(),
  year: z.number(),
  doi: z.string().optional(),
  arxivId: z.string().optional(),
  pdfUrl: z.string().optional(),
  primaryCategory: z.string(),
  citationCount: z.number().optional(),
  associatedModelId: z.string().optional(),
  status: z.object({
    peerReviewed: z.boolean(),
    hasPretrainedModel: z.boolean(),
    reproducibilityTier: ReproducibilityTierSchema,
  }),
});

// Research Knowledge Record (RKR) Validation Schemas
export const ResearchVocabularyTermSchema = z.object({
  term: z.string(),
  definition: z.string(),
  formalNotation: z.string().optional(),
  significance: z.string(),
});

export const VisualMemoryFigureSchema = z.object({
  figureNumber: z.string(),
  title: z.string(),
  purpose: z.string(),
  section: z.string(),
});

export const ReadingGuideSchema = z.object({
  difficultyRating: z.number().min(1).max(5).optional(),
  difficultyReason: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  mustRevisitSection: z.object({ section: z.string(), reason: z.string() }).optional(),
  quickScanSection: z.object({ section: z.string(), reason: z.string() }).optional(),
  canSkipSection: z.object({ section: z.string(), reason: z.string() }).optional(),
});

export const PaperSummarySchema = z.object({
  tldr: z.string(),
  oneSentenceMemory: z.string().optional(),
  keyTakeaways: z.array(z.string()),
  vocabulary: z.array(ResearchVocabularyTermSchema).optional(),
  visualFigures: z.array(VisualMemoryFigureSchema).optional(),
  readingGuide: ReadingGuideSchema.optional(),
});

export const PaperMotivationSchema = z.object({
  problemStatement: z.string(),
  previousLimitations: z.array(z.string()),
  coreInsight: z.string(),
  contributions: z.array(z.string()),
});

export const InnovationMathSchema = z.object({
  latexFormula: z.string(),
  explanation: z.string(),
  variables: z.array(
    z.object({
      symbol: z.string(),
      description: z.string(),
    })
  ),
  significance: z.string(),
});

export const TechnicalInnovationSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: InnovationTypeSchema,
  summary: z.string(),
  detailedDescription: z.string(),
  math: InnovationMathSchema.optional(),
  codeSnippet: z
    .object({
      language: z.string(),
      code: z.string(),
    })
    .optional(),
});

export const MetricResultSchema = z.object({
  metricName: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  baselineValue: z.union([z.string(), z.number()]).optional(),
  isSOTA: z.boolean().optional(),
});

export const AblationStudySchema = z.object({
  title: z.string(),
  description: z.string(),
  removedComponent: z.string(),
  performanceDelta: z.string(),
});

export const RichDatasetReferenceSchema = z.object({
  name: z.string(),
  description: z.string(),
  officialUrl: z.string().optional(),
  leaderboardUrl: z.string().optional(),
  codeUrl: z.string().optional(),
});

export const PaperEvidenceSchema = z.object({
  datasets: z.array(z.string()),
  richDatasets: z.array(RichDatasetReferenceSchema).optional(),
  primaryResults: z.array(MetricResultSchema),
  ablationStudies: z.array(AblationStudySchema),
  reproducibilityNotes: z.string().optional(),
});

export const TaggedNoteSchema = z.object({
  id: z.string(),
  category: NoteCategorySchema,
  title: z.string(),
  content: z.string(),
});

export const PaperRelationshipSchema = z.object({
  paperId: z.string(),
  title: z.string(),
  year: z.number(),
  authors: z.string(),
  relationshipType: z.enum([
    'predecessor',
    'successor',
    'inspired_by',
    'competing',
  ]),
  description: z.string(),
});

export const PaperConnectionsSchema = z.object({
  lineage: z.array(PaperRelationshipSchema),
  researchGaps: z.array(z.string()),
  futureExtensions: z.array(z.string()),
});

export const DeepReferenceSchema = z.object({
  originalAbstract: z.string(),
  originalConclusion: z.string().optional(),
  trainingDetails: z.object({
    optimizer: z.string().optional(),
    learningRate: z.string().optional(),
    batchSize: z.string().optional(),
    hardwareUsed: z.string().optional(),
    trainingDuration: z.string().optional(),
    hyperparameters: z.record(z.string(), z.string()).optional(),
  }),
  equationCatalog: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        latex: z.string(),
        context: z.string(),
      })
    )
    .optional(),
  bibtex: z.string(),
});

export const CanonicalPaperZodSchema = z.object({
  metadata: PaperMetadataSchema,
  summary: PaperSummarySchema,
  motivation: PaperMotivationSchema,
  innovations: z.array(TechnicalInnovationSchema),
  evidence: PaperEvidenceSchema,
  criticalNotes: z.array(TaggedNoteSchema),
  connections: PaperConnectionsSchema,
  reference: DeepReferenceSchema,
});

export type CanonicalPaperValidation = z.infer<typeof CanonicalPaperZodSchema>;
