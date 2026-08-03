/**
 * Validation Pipeline Types
 * 
 * Defines core interfaces, severity levels, error codes, and report models for platform validation.
 * Modular & generic design supporting present registry checks and future Knowledge Object / Engine State validators.
 * 
 * Architecture Layer: Validation Framework (Layer 3 Gatekeeper)
 */

export type ValidationSeverity = 'INFO' | 'WARNING' | 'ERROR';

export type ValidationSource =
  | 'domain'
  | 'perspective'
  | 'visualizer'
  | 'graph-behavior'
  | 'reference'
  | 'graph'
  | 'capability'
  | 'knowledge-object'
  | 'engine-state'
  | 'relationship'
  | 'paper';

export type ValidationCode =
  | 'DUPLICATE_ID'
  | 'INVALID_REFERENCE'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_DEFAULT'
  | 'ORPHAN_ENTITY'
  | 'CAPABILITY_INCONSISTENCY'
  | 'CIRCULAR_DEPENDENCY'
  | 'INCOMPLETE_CONFIGURATION';

/**
 * Individual validation issue emitted by a rule.
 */
export interface ValidationIssue {
  readonly severity: ValidationSeverity;
  readonly code: ValidationCode;
  readonly message: string;
  readonly source: ValidationSource;
  readonly entityId: string;
  readonly field?: string;
  readonly suggestion?: string;
}

/**
 * High-level counts and breakdown for validation reporting.
 */
export interface ValidationStats {
  readonly domainsCount: number;
  readonly perspectivesCount: number;
  readonly visualizersCount: number;
  readonly graphBehaviorsCount: number;
  readonly errorsCount: number;
  readonly warningsCount: number;
  readonly infoCount: number;
}

/**
 * Final validation report output.
 */
export interface ValidationReport {
  readonly pass: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly stats: ValidationStats;
}

/**
 * Contextual settings passed to validator functions.
 */
export interface ValidatorContext {
  readonly strictMode?: boolean;
  readonly allowOrphans?: boolean;
}

/**
 * Generic validator function signature.
 */
export type ValidatorFunction<T> = (data: T, context?: ValidatorContext) => ValidationIssue[];
