import type {
  ValidationCode,
  ValidationIssue,
  ValidationReport,
  ValidationSource,
  ValidationStats,
} from './validation-types';

/**
 * Accumulator for building structured validation reports.
 */
export class ValidationResultAccumulator {
  private readonly issues: ValidationIssue[] = [];

  /**
   * Push a generic issue.
   */
  public addIssue(issue: ValidationIssue): void {
    this.issues.push(issue);
  }

  /**
   * Helper to push an ERROR issue.
   */
  public addError(
    code: ValidationCode,
    source: ValidationSource,
    entityId: string,
    message: string,
    field?: string,
    suggestion?: string
  ): void {
    this.addIssue({
      severity: 'ERROR',
      code,
      source,
      entityId,
      message,
      field,
      suggestion,
    });
  }

  /**
   * Helper to push a WARNING issue.
   */
  public addWarning(
    code: ValidationCode,
    source: ValidationSource,
    entityId: string,
    message: string,
    field?: string,
    suggestion?: string
  ): void {
    this.addIssue({
      severity: 'WARNING',
      code,
      source,
      entityId,
      message,
      field,
      suggestion,
    });
  }

  /**
   * Helper to push an INFO issue.
   */
  public addInfo(
    code: ValidationCode,
    source: ValidationSource,
    entityId: string,
    message: string,
    field?: string,
    suggestion?: string
  ): void {
    this.addIssue({
      severity: 'INFO',
      code,
      source,
      entityId,
      message,
      field,
      suggestion,
    });
  }

  /**
   * Merge issues from another accumulator or array into this accumulator.
   */
  public merge(otherIssues: readonly ValidationIssue[]): void {
    this.issues.push(...otherIssues);
  }

  /**
   * Get accumulated issues.
   */
  public getIssues(): readonly ValidationIssue[] {
    return this.issues;
  }

  /**
   * Build final report object given custom stats counts.
   */
  public buildReport(counts: {
    domainsCount: number;
    perspectivesCount: number;
    visualizersCount: number;
    graphBehaviorsCount: number;
  }): ValidationReport {
    let errorsCount = 0;
    let warningsCount = 0;
    let infoCount = 0;

    for (const issue of this.issues) {
      if (issue.severity === 'ERROR') errorsCount++;
      else if (issue.severity === 'WARNING') warningsCount++;
      else if (issue.severity === 'INFO') infoCount++;
    }

    const stats: ValidationStats = {
      domainsCount: counts.domainsCount,
      perspectivesCount: counts.perspectivesCount,
      visualizersCount: counts.visualizersCount,
      graphBehaviorsCount: counts.graphBehaviorsCount,
      errorsCount,
      warningsCount,
      infoCount,
    };

    return {
      pass: errorsCount === 0,
      issues: [...this.issues],
      stats,
    };
  }
}
