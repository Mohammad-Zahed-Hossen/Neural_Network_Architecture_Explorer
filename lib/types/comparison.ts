export interface ComparisonMetric {
  id: string;
  label: string;
  unit: string;
  format: 'number' | 'percentage' | 'bytes' | 'count';
  description: string;
}

export interface ModelComparisonEntry {
  modelId: string;
  modelName: string;
  color: string;
  values: Record<string, number>;     // metricId -> numeric value
}

export interface ComparisonCategory {
  id: string;
  label: string;
  metrics: string[];                  // metric IDs in this category
}

export interface ComparisonData {
  models: ModelComparisonEntry[];
  metrics: ComparisonMetric[];
  categories: ComparisonCategory[];
}
