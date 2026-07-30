export type InnovationType = 'component' | 'architecture' | 'mathematics' | 'loss' | 'optimization';

export type NoteCategory = 'strength' | 'weakness' | 'limitation' | 'assumption' | 'failure_case' | 'tradeoff' | 'misconception';

export interface PaperAuthor {
  name: string;
  affiliation?: string;
  leadAuthor?: boolean;
}

export interface PaperMetadata {
  paperId: string; // e.g. "resnet-2015-cvpr-he"
  title: string;
  authors: PaperAuthor[];
  venue: string;
  year: number;
  doi?: string;
  arxivId?: string;
  pdfUrl?: string;
  primaryCategory: string;
  citationCount?: number;
  associatedModelId?: string;
  status: {
    peerReviewed: boolean;
    hasPretrainedModel: boolean;
    reproducibilityTier: 'empirical_verified' | 'community_reproduced' | 'unverified';
  };
}

// Research Knowledge Record (RKR) Interfaces
export interface ResearchVocabularyTerm {
  term: string;
  definition: string;
  formalNotation?: string;
  significance: string;
}

export interface VisualMemoryFigure {
  figureNumber: string;
  title: string;
  purpose: string;
  section: string;
}

export interface ReadingGuide {
  difficultyRating?: 1 | 2 | 3 | 4 | 5;
  difficultyReason?: string;
  prerequisites?: string[];
  mustRevisitSection?: { section: string; reason: string };
  quickScanSection?: { section: string; reason: string };
  canSkipSection?: { section: string; reason: string };
}

export interface PaperSummary {
  tldr: string;
  oneSentenceMemory?: string;
  keyTakeaways: string[];
  vocabulary?: ResearchVocabularyTerm[];
  visualFigures?: VisualMemoryFigure[];
  readingGuide?: ReadingGuide;
}

export interface PaperMotivation {
  problemStatement: string;
  previousLimitations: string[];
  coreInsight: string;
  contributions: string[];
}

export interface InnovationMath {
  latexFormula: string;
  explanation: string;
  variables: Array<{ symbol: string; description: string }>;
  significance: string;
}

export interface TechnicalInnovation {
  id: string;
  title: string;
  type: InnovationType;
  summary: string;
  detailedDescription: string;
  math?: InnovationMath;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export interface MetricResult {
  metricName: string;
  value: string | number;
  unit?: string;
  baselineValue?: string | number;
  isSOTA?: boolean;
}

export interface AblationStudy {
  title: string;
  description: string;
  removedComponent: string;
  performanceDelta: string;
}

export interface RichDatasetReference {
  name: string;
  description: string;
  officialUrl?: string;
  leaderboardUrl?: string;
  codeUrl?: string;
}

export interface PaperEvidence {
  datasets: string[];
  richDatasets?: RichDatasetReference[];
  primaryResults: MetricResult[];
  ablationStudies: AblationStudy[];
  reproducibilityNotes?: string;
}

export interface TaggedNote {
  id: string;
  category: NoteCategory;
  title: string;
  content: string;
}

export interface PaperRelationship {
  paperId: string;
  title: string;
  year: number;
  authors: string;
  relationshipType: 'predecessor' | 'successor' | 'inspired_by' | 'competing';
  description: string;
}

export interface PaperConnections {
  lineage: PaperRelationship[];
  researchGaps: string[];
  futureExtensions: string[];
}

export interface DeepReference {
  originalAbstract: string;
  originalConclusion?: string;
  trainingDetails: {
    optimizer?: string;
    learningRate?: string;
    batchSize?: string;
    hardwareUsed?: string;
    trainingDuration?: string;
    hyperparameters?: Record<string, string>;
  };
  equationCatalog?: Array<{ id: string; name: string; latex: string; context: string }>;
  bibtex: string;
}

export interface CanonicalPaperSchema {
  metadata: PaperMetadata;
  summary: PaperSummary;
  motivation: PaperMotivation;
  innovations: TechnicalInnovation[];
  evidence: PaperEvidence;
  criticalNotes: TaggedNote[];
  connections: PaperConnections;
  reference: DeepReference;
}
