import { ModelMetadata, ModelCategory, EfficiencyLevel } from '@/lib/data/model-metadata';

export interface FilterCriteria {
  searchQuery?: string;
  categories?: ModelCategory[];
  efficiencyLevels?: EfficiencyLevel[];
  yearRange?: {
    min?: number;
    max?: number;
  };
}

/**
 * Filter models based on multiple criteria
 */
export function filterModels(models: ModelMetadata[], criteria: FilterCriteria): ModelMetadata[] {
  return models.filter(model => {
    // Search query filter (searches name, fullName, description)
    if (criteria.searchQuery) {
      const query = criteria.searchQuery.toLowerCase();
      const matchesSearch =
        model.name.toLowerCase().includes(query) ||
        model.fullName.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        model.authors.some(author => author.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    // Category filter
    if (criteria.categories && criteria.categories.length > 0) {
      if (!criteria.categories.includes(model.category)) {
        return false;
      }
    }

    // Efficiency filter
    if (criteria.efficiencyLevels && criteria.efficiencyLevels.length > 0) {
      if (!criteria.efficiencyLevels.includes(model.efficiency)) {
        return false;
      }
    }

    // Year range filter
    if (criteria.yearRange) {
      const year = model.releaseYear || model.paperYear;
      if (criteria.yearRange.min && year < criteria.yearRange.min) {
        return false;
      }
      if (criteria.yearRange.max && year > criteria.yearRange.max) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get unique categories from a list of models
 */
export function getCategories(models: ModelMetadata[]): ModelCategory[] {
  const categories = new Set<ModelCategory>();
  models.forEach(model => categories.add(model.category));
  return Array.from(categories);
}

/**
 * Get unique efficiency levels from a list of models
 */
export function getEfficiencyLevels(models: ModelMetadata[]): EfficiencyLevel[] {
  const levels = new Set<EfficiencyLevel>();
  models.forEach(model => levels.add(model.efficiency));
  return Array.from(levels);
}

/**
 * Get year range from a list of models
 */
export function getYearRange(models: ModelMetadata[]): { min: number; max: number } {
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
export function getEras(models: ModelMetadata[]): Set<string> {
  const eras = new Set<string>();
  models.forEach(model => {
    const year = model.releaseYear || model.paperYear;
    eras.add(getEra(year));
  });
  return eras;
}
