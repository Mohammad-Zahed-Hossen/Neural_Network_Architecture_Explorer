export type EntityType = 'model' | 'paper' | 'pattern' | 'concept' | 'evolution' | 'learn';

export interface SearchableEntity {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  description: string;
  url: string;
  aliases: string[];
  keywords: string[];
  patterns: string[];     // Pattern IDs (e.g. 'residual', 'dense', 'depthwise', 'compound', 'nas', 'attention')
  components: string[];   // Component types (e.g. 'skip connection', 'bottleneck', 'depthwise conv', 'se block')
  applications: string[]; // Deployment targets / use cases (e.g. 'mobile', 'edge', 'server', 'research')
  family?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  efficiency?: 'lightweight' | 'balanced' | 'powerful';
  year?: number;
  tags?: string[];
  authors?: string[];
  colorTheme?: string;
  rawItem?: unknown;     // Reference to underlying data object if needed
}

export interface SearchFilterCriteria {
  searchQuery?: string;
  patterns?: string[];
  categories?: string[];
  families?: string[];
  applications?: string[];
  difficulties?: string[];
  efficiencyLevels?: string[];
  eras?: string[];
  yearRange?: {
    min?: number;
    max?: number;
  };
}

export interface SearchResult<T = SearchableEntity> {
  item: T;
  score: number;
  matchedFields: string[];
}

export interface DidYouMeanSuggestion {
  query: string;
  suggestion: string;
  reason: string;
}
