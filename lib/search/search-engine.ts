import { SearchableEntity, SearchFilterCriteria, SearchResult, DidYouMeanSuggestion } from './types';

/**
 * Clean, 5-tier deterministic relevance scoring function:
 * - Exact title match: 100
 * - Alias / Abbreviation match: 90
 * - Keyword / Pattern / Component match: 75
 * - Description match: 50
 * - Tags / Authors match: 25
 */
export function scoreEntity(entity: SearchableEntity, query: string): { score: number; matchedFields: string[] } {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return { score: 0, matchedFields: [] };

  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
  let totalScore = 0;
  const matchedFields = new Set<string>();

  const titleLower = entity.title.toLowerCase();
  const descriptionLower = entity.description.toLowerCase();
  const aliasesLower = entity.aliases.map(a => a.toLowerCase());
  const keywordsLower = entity.keywords.map(k => k.toLowerCase());
  const patternsLower = entity.patterns.map(p => p.toLowerCase());
  const componentsLower = entity.components.map(c => c.toLowerCase());
  const tagsLower = (entity.tags || []).map(t => t.toLowerCase());
  const authorsLower = (entity.authors || []).map(a => a.toLowerCase());

  // 1. Check exact whole title match or alias match first
  if (titleLower === cleanQuery) {
    totalScore += 100;
    matchedFields.add('title');
  } else if (aliasesLower.includes(cleanQuery)) {
    totalScore += 90;
    matchedFields.add('alias');
  }

  // 2. Tokenized evaluation across tiers
  for (const token of queryTokens) {
    let tokenMatched = false;

    // Title match
    if (titleLower.includes(token)) {
      totalScore += titleLower.startsWith(token) ? 95 : 85;
      matchedFields.add('title');
      tokenMatched = true;
    }

    // Alias / Abbreviation match
    if (aliasesLower.some(a => a.includes(token))) {
      totalScore += 90;
      matchedFields.add('alias');
      tokenMatched = true;
    }

    // Keyword / Pattern / Component match (Score: 75)
    if (
      keywordsLower.some(k => k.includes(token)) ||
      patternsLower.some(p => p.includes(token)) ||
      componentsLower.some(c => c.includes(token))
    ) {
      totalScore += 75;
      matchedFields.add('keyword/pattern/component');
      tokenMatched = true;
    }

    // Description match (Score: 50)
    if (descriptionLower.includes(token)) {
      totalScore += 50;
      matchedFields.add('description');
      tokenMatched = true;
    }

    // Tags / Authors match (Score: 25)
    if (tagsLower.some(t => t.includes(token)) || authorsLower.some(a => a.includes(token))) {
      totalScore += 25;
      matchedFields.add('tags/authors');
      tokenMatched = true;
    }

    if (!tokenMatched) {
      // Penalty if a specific token in a multi-word query doesn't match anywhere
      totalScore -= 10;
    }
  }

  // Boost if all tokens match
  const allTokensMatched = queryTokens.every(token =>
    titleLower.includes(token) ||
    aliasesLower.some(a => a.includes(token)) ||
    keywordsLower.some(k => k.includes(token)) ||
    patternsLower.some(p => p.includes(token)) ||
    componentsLower.some(c => c.includes(token)) ||
    descriptionLower.includes(token) ||
    tagsLower.some(t => t.includes(token))
  );

  if (allTokensMatched && queryTokens.length > 1) {
    totalScore *= 1.25;
  }

  return {
    score: Math.max(0, Math.round(totalScore)),
    matchedFields: Array.from(matchedFields),
  };
}

/**
 * Universal search engine function operating on any entity dataset.
 */
export function searchEntities<T>(
  items: T[],
  criteria: SearchFilterCriteria,
  toSearchableEntity: (item: T) => SearchableEntity
): SearchResult<T>[] {
  const {
    searchQuery = '',
    patterns = [],
    categories = [],
    families = [],
    applications = [],
    difficulties = [],
    efficiencyLevels = [],
    eras = [],
    yearRange,
  } = criteria;

  const results: SearchResult<T>[] = [];

  for (const item of items) {
    const entity = toSearchableEntity(item);

    // 1. Filtering Checks
    if (patterns.length > 0) {
      const hasPattern = entity.patterns.some(p => patterns.includes(p));
      if (!hasPattern) continue;
    }

    if (categories.length > 0) {
      if (!entity.category || !categories.includes(entity.category)) continue;
    }

    if (families.length > 0) {
      if (!entity.family || !families.includes(entity.family)) continue;
    }

    if (applications.length > 0) {
      const hasApp = entity.applications.some(a => applications.includes(a));
      if (!hasApp) continue;
    }

    if (difficulties.length > 0) {
      if (!entity.difficulty || !difficulties.includes(entity.difficulty)) continue;
    }

    if (efficiencyLevels.length > 0) {
      if (!entity.efficiency || !efficiencyLevels.includes(entity.efficiency)) continue;
    }

    if (eras.length > 0 && entity.year) {
      const era = getEraForYear(entity.year);
      if (!eras.includes(era)) continue;
    }

    if (yearRange && entity.year) {
      if (yearRange.min && entity.year < yearRange.min) continue;
      if (yearRange.max && entity.year > yearRange.max) continue;
    }

    // 2. Query Scoring (if searchQuery present)
    if (searchQuery.trim()) {
      const { score, matchedFields } = scoreEntity(entity, searchQuery);
      if (score > 0) {
        results.push({ item, score, matchedFields });
      }
    } else {
      // Default score when browsing without query string
      results.push({ item, score: 100, matchedFields: ['default'] });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Educational helper to get "Did you mean?" suggestions for zero-result queries.
 */
export function getSuggestions(
  query: string,
  knownAliases: { alias: string; targetName: string }[]
): DidYouMeanSuggestion[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const suggestions: DidYouMeanSuggestion[] = [];

  for (const item of knownAliases) {
    const aliasLower = item.alias.toLowerCase();
    // Prefix or partial match check
    if (aliasLower.startsWith(clean) || clean.startsWith(aliasLower) || distance(clean, aliasLower) <= 2) {
      suggestions.push({
        query,
        suggestion: item.alias,
        reason: `Matches ${item.targetName}`,
      });
      if (suggestions.length >= 3) break;
    }
  }

  return suggestions;
}

/**
 * Utility helper to determine Era string from year.
 */
export function getEraForYear(year: number): string {
  if (year < 2015) return 'pre-2015';
  if (year < 2018) return '2015-2017';
  if (year < 2020) return '2018-2019';
  return '2020+';
}

// Simple Levenshtein distance for typo suggestions
function distance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
