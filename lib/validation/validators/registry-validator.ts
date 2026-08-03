import type {
  DomainDefinition,
  GraphBehaviorDefinition,
  PerspectiveDefinition,
  VisualizerDefinition,
} from '../../registry';
import { findClosestMatch } from '../validation-errors';
import type { ValidationIssue, ValidatorContext } from '../validation-types';

/**
 * Validates entity completeness, duplicate IDs, and default reference alignment.
 */
export function validateDomainRegistry(
  domains: readonly DomainDefinition[],
  context?: ValidatorContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const domain of domains) {
    // Rule #1: Duplicate ID check
    if (seenIds.has(domain.id)) {
      issues.push({
        severity: 'ERROR',
        code: 'DUPLICATE_ID',
        source: 'domain',
        entityId: domain.id,
        message: `Duplicate Domain ID "${domain.id}" detected in Domain Registry.`,
      });
    }
    seenIds.add(domain.id);

    // Rule #10: Registry completeness
    if (!domain.name || !domain.description || !domain.status) {
      issues.push({
        severity: 'ERROR',
        code: 'INCOMPLETE_CONFIGURATION',
        source: 'domain',
        entityId: domain.id,
        message: `Domain "${domain.id}" is missing required configuration fields (name, description, or status).`,
      });
    }

    if (domain.status === 'active' || context?.strictMode) {
      if (
        !domain.supportedPerspectives ||
        domain.supportedPerspectives.length === 0 ||
        !domain.supportedVisualizers ||
        domain.supportedVisualizers.length === 0 ||
        !domain.supportedGraphBehaviors ||
        domain.supportedGraphBehaviors.length === 0
      ) {
        issues.push({
          severity: 'ERROR',
          code: 'INCOMPLETE_CONFIGURATION',
          source: 'domain',
          entityId: domain.id,
          message: `Active domain "${domain.id}" must define non-empty supportedPerspectives, supportedVisualizers, and supportedGraphBehaviors.`,
        });
      }
    }

    // Rule #7: Default Reference Validation
    if (domain.defaultPerspective) {
      if (!(domain.supportedPerspectives as readonly string[]).includes(domain.defaultPerspective)) {
        const suggestion = findClosestMatch(domain.defaultPerspective, domain.supportedPerspectives);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_DEFAULT',
          source: 'domain',
          entityId: domain.id,
          field: 'defaultPerspective',
          message: `Domain "${domain.id}" defaultPerspective "${domain.defaultPerspective}" is not listed in supportedPerspectives.`,
          suggestion,
        });
      }
    } else {
      issues.push({
        severity: 'ERROR',
        code: 'MISSING_REQUIRED_FIELD',
        source: 'domain',
        entityId: domain.id,
        field: 'defaultPerspective',
        message: `Domain "${domain.id}" is missing defaultPerspective declaration.`,
      });
    }

    if (domain.defaultVisualizer) {
      if (!(domain.supportedVisualizers as readonly string[]).includes(domain.defaultVisualizer)) {
        const suggestion = findClosestMatch(domain.defaultVisualizer, domain.supportedVisualizers);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_DEFAULT',
          source: 'domain',
          entityId: domain.id,
          field: 'defaultVisualizer',
          message: `Domain "${domain.id}" defaultVisualizer "${domain.defaultVisualizer}" is not listed in supportedVisualizers.`,
          suggestion,
        });
      }
    } else {
      issues.push({
        severity: 'ERROR',
        code: 'MISSING_REQUIRED_FIELD',
        source: 'domain',
        entityId: domain.id,
        field: 'defaultVisualizer',
        message: `Domain "${domain.id}" is missing defaultVisualizer declaration.`,
      });
    }

    if (domain.defaultGraphBehavior) {
      if (!(domain.supportedGraphBehaviors as readonly string[]).includes(domain.defaultGraphBehavior)) {
        const suggestion = findClosestMatch(domain.defaultGraphBehavior, domain.supportedGraphBehaviors);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_DEFAULT',
          source: 'domain',
          entityId: domain.id,
          field: 'defaultGraphBehavior',
          message: `Domain "${domain.id}" defaultGraphBehavior "${domain.defaultGraphBehavior}" is not listed in supportedGraphBehaviors.`,
          suggestion,
        });
      }
    } else {
      issues.push({
        severity: 'ERROR',
        code: 'MISSING_REQUIRED_FIELD',
        source: 'domain',
        entityId: domain.id,
        field: 'defaultGraphBehavior',
        message: `Domain "${domain.id}" is missing defaultGraphBehavior declaration.`,
      });
    }
  }

  return issues;
}

export function validatePerspectiveRegistry(
  perspectives: readonly PerspectiveDefinition[],
  context?: ValidatorContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();
  if (context?.strictMode) { /* strict mode check */ }

  for (const perspective of perspectives) {
    if (seenIds.has(perspective.id)) {
      issues.push({
        severity: 'ERROR',
        code: 'DUPLICATE_ID',
        source: 'perspective',
        entityId: perspective.id,
        message: `Duplicate Perspective ID "${perspective.id}" detected in Perspective Registry.`,
      });
    }
    seenIds.add(perspective.id);

    if (!perspective.name || !perspective.description || !perspective.educationalPurpose) {
      issues.push({
        severity: 'ERROR',
        code: 'INCOMPLETE_CONFIGURATION',
        source: 'perspective',
        entityId: perspective.id,
        message: `Perspective "${perspective.id}" missing required name, description, or educationalPurpose.`,
      });
    }
  }

  return issues;
}

export function validateVisualizerRegistry(
  visualizers: readonly VisualizerDefinition[],
  context?: ValidatorContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();
  if (context?.strictMode) { /* strict mode check */ }

  for (const visualizer of visualizers) {
    if (seenIds.has(visualizer.id)) {
      issues.push({
        severity: 'ERROR',
        code: 'DUPLICATE_ID',
        source: 'visualizer',
        entityId: visualizer.id,
        message: `Duplicate Visualizer ID "${visualizer.id}" detected in Visualizer Registry.`,
      });
    }
    seenIds.add(visualizer.id);

    if (!visualizer.name || !visualizer.description || !visualizer.renderMode) {
      issues.push({
        severity: 'ERROR',
        code: 'INCOMPLETE_CONFIGURATION',
        source: 'visualizer',
        entityId: visualizer.id,
        message: `Visualizer "${visualizer.id}" missing required name, description, or renderMode.`,
      });
    }
  }

  return issues;
}

export function validateGraphBehaviorRegistry(
  behaviors: readonly GraphBehaviorDefinition[],
  context?: ValidatorContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();
  if (context?.strictMode) { /* strict mode check */ }

  for (const behavior of behaviors) {
    if (seenIds.has(behavior.id)) {
      issues.push({
        severity: 'ERROR',
        code: 'DUPLICATE_ID',
        source: 'graph-behavior',
        entityId: behavior.id,
        message: `Duplicate Graph Behavior ID "${behavior.id}" detected in Graph Behavior Registry.`,
      });
    }
    seenIds.add(behavior.id);

    if (!behavior.name || !behavior.description) {
      issues.push({
        severity: 'ERROR',
        code: 'INCOMPLETE_CONFIGURATION',
        source: 'graph-behavior',
        entityId: behavior.id,
        message: `Graph Behavior "${behavior.id}" missing required name or description.`,
      });
    }
  }

  return issues;
}
