import modelsJson from '../../data/models.json';
import {
  ModelSummary,
  ModelSummarySchema,
} from '../schema/model.schema';

let modelsSummariesCache: ModelSummary[] | null = null;

export function getModelSummaries(): ModelSummary[] {
  if (modelsSummariesCache) {
    return modelsSummariesCache;
  }

  modelsSummariesCache = modelsJson.map((model) => ModelSummarySchema.parse(model));

  return modelsSummariesCache;
}

export function getAllModelIds(): string[] {
  const summaries = getModelSummaries();
  return summaries.map((model) => model.id);
}
