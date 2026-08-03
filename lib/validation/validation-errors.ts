import type { ValidationIssue } from './validation-types';

/**
 * Calculates Levenshtein Distance between two strings to generate actionable recommendations.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Finds the closest candidate string matching the target input if distance <= maxDistance.
 */
export function findClosestMatch(target: string, candidates: readonly string[], maxDistance = 3): string | undefined {
  let closest: string | undefined;
  let minDistance = maxDistance + 1;

  for (const candidate of candidates) {
    const dist = levenshteinDistance(target.toLowerCase(), candidate.toLowerCase());
    if (dist < minDistance) {
      minDistance = dist;
      closest = candidate;
    }
  }

  return closest;
}

/**
 * Formats a validation issue into an actionable CLI human-readable string.
 */
export function formatValidationIssue(issue: ValidationIssue): string {
  const badge = `[${issue.severity}]`;
  const location = issue.field ? `${issue.source}:${issue.entityId}.${issue.field}` : `${issue.source}:${issue.entityId}`;
  const codeStr = `(${issue.code})`;
  let result = `${badge} ${location} ${codeStr} - ${issue.message}`;

  if (issue.suggestion) {
    result += ` Did you mean "${issue.suggestion}"?`;
  }

  return result;
}
