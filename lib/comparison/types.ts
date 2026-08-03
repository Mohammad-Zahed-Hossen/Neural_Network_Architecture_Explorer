import type { KnowledgeObject, KnowledgeObjectType } from '../knowledge/schema/knowledge-object.types';

export type ComparisonCategoryType =
  | 'architecture'
  | 'training'
  | 'research'
  | 'evolution'
  | 'implementation'
  | 'models'
  | 'patterns'
  | 'papers'
  | 'concepts'
  | string;

export interface ComparisonMetricValue {
  value: number | string;
  formatted: string;
  unit?: string;
  status?: 'better' | 'worse' | 'neutral';
}

export interface ComparisonMetric {
  id: string;
  label: string;
  category: string;
  unit: string;
  format: 'number' | 'percentage' | 'bytes' | 'count' | 'text';
  description: string;
  higherIsBetter?: boolean;
}

export interface ComparisonObject {
  id: string;
  slug: string;
  title: string;
  type: KnowledgeObjectType;
  domain: string;
  summary: string;
  description: string;
  metrics: Record<string, number | string>;
  relationships: {
    relatedObjects: string[];
    prerequisites: string[];
    successors: string[];
  };
  trainingParams: Record<string, unknown>;
  perspectives: Record<string, unknown>;
  researchCitations: string[];
  evolutionLineage: {
    predecessors: string[];
    successors: string[];
  };
  implementationDetails: Record<string, unknown>;
  rawObject: KnowledgeObject;
}

export interface ComparisonDifference {
  feature: string;
  category: string;
  values: Record<string, unknown>; // objectId -> value description
  impact?: string;
}

export interface ComparisonSimilarity {
  feature: string;
  category: string;
  value: unknown;
  description?: string;
}

export interface ComparisonSection {
  id: string;
  title: string;
  summary: string;
  differences: ComparisonDifference[];
  similarities: ComparisonSimilarity[];
  metadata?: Record<string, unknown>;
}

export interface ComparisonResult {
  category: ComparisonCategoryType;
  objects: ComparisonObject[];
  metrics: ComparisonMetric[];
  metricMatrix: Record<string, Record<string, ComparisonMetricValue>>; // metricId -> objectId -> value
  sections: ComparisonSection[];
  keySimilarities: ComparisonSimilarity[];
  keyDifferences: ComparisonDifference[];
  learningCurveConfig?: {
    pluginId: string;
    presets: Array<{ objectId: string; title: string; color: string; metrics: Record<string, number> }>;
  };
  comparedAt: string;
}
