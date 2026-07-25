import { ModelSummary, ModelCategory, EfficiencyLevel } from '@/lib/schema/model.schema';

import { searchEntities } from '@/lib/search/search-engine';
import { enrichModelEntity } from '@/lib/search/metadata-enrichment';
import { SearchFilterCriteria } from '@/lib/search/types';

export interface FilterCriteria {
  searchQuery?: string;
  categories?: ModelCategory[];
  efficiencyLevels?: EfficiencyLevel[];
  patterns?: string[];
  applications?: string[];
  difficulties?: string[];
  eras?: string[];
  yearRange?: {
    min?: number;
    max?: number;
  };
}

/**
 * Filter and rank models based on deterministic relevance criteria
 */
export function filterModels(models: ModelSummary[], criteria: FilterCriteria): ModelSummary[] {
  const searchCriteria: SearchFilterCriteria = {
    searchQuery: criteria.searchQuery,
    categories: criteria.categories,
    efficiencyLevels: criteria.efficiencyLevels,
    patterns: criteria.patterns,
    applications: criteria.applications,
    difficulties: criteria.difficulties,
    eras: criteria.eras,
    yearRange: criteria.yearRange,
  };

  const results = searchEntities(models, searchCriteria, enrichModelEntity);
  return results.map(res => res.item);
}

/**
 * Get unique categories from a list of models
 */
export function getCategories(models: ModelSummary[]): ModelCategory[] {
  const categories = new Set<ModelCategory>();
  models.forEach(model => categories.add(model.category));
  return Array.from(categories);
}

/**
 * Get unique efficiency levels from a list of models
 */
export function getEfficiencyLevels(models: ModelSummary[]): EfficiencyLevel[] {
  const levels = new Set<EfficiencyLevel>();
  models.forEach(model => levels.add(model.efficiency));
  return Array.from(levels);
}

/**
 * Get year range from a list of models
 */
export function getYearRange(models: ModelSummary[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  models.forEach(model => {
    const year = model.releaseYear || model.paperYear;
    min = Math.min(min, year);
    max = Math.max(max, year);
  });

  return {
    min: min === Infinity ? 2010 : min,
    max: max === -Infinity ? 2025 : max,
  };
}

/**
 * Get era/decade for a given year
 */
export function getEra(year: number): string {
  if (year < 2015) return 'pre-2015';
  if (year < 2018) return '2015-2017';
  if (year < 2020) return '2018-2019';
  return '2020+';
}

/**
 * Get models grouped by era
 */
export function getEras(models: ModelSummary[]): Set<string> {
  const eras = new Set<string>();
  models.forEach(model => {
    const year = model.releaseYear || model.paperYear;
    eras.add(getEra(year));
  });
  return eras;
}
