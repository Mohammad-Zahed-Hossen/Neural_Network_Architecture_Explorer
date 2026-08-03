import type {
  DomainDefinition,
  GraphBehaviorDefinition,
  PerspectiveDefinition,
  VisualizerDefinition,
} from '../../registry';
import { findClosestMatch } from '../validation-errors';
import type { ValidationIssue, ValidatorContext } from '../validation-types';

/**
 * Interface container holding all registry datasets for referential integrity checks.
 */
export interface RegistryContainer {
  readonly domains: readonly DomainDefinition[];
  readonly perspectives: readonly PerspectiveDefinition[];
  readonly visualizers: readonly VisualizerDefinition[];
  readonly graphBehaviors: readonly GraphBehaviorDefinition[];
}

/**
 * Validates cross-registry referential integrity (ensures zero dangling references).
 */
export function validateReferentialIntegrity(
  registries: RegistryContainer,
  context?: ValidatorContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const validDomainIds: readonly string[] = registries.domains.map((d) => d.id);
  const validPerspectiveIds: readonly string[] = registries.perspectives.map((p) => p.id);
  const validVisualizerIds: readonly string[] = registries.visualizers.map((v) => v.id);
  const validBehaviorIds: readonly string[] = registries.graphBehaviors.map((b) => b.id);

  // 1. Validate Domain references
  for (const domain of registries.domains) {
    for (const perspectiveId of domain.supportedPerspectives ?? []) {
      if (!validPerspectiveIds.includes(perspectiveId)) {
        const suggestion = findClosestMatch(perspectiveId, validPerspectiveIds);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
          source: 'domain',
          entityId: domain.id,
          field: 'supportedPerspectives',
          message: `Domain "${domain.id}" references perspective "${perspectiveId}" which does not exist in Perspective Registry.`,
          suggestion,
        });
      }
    }

    for (const visualizerId of domain.supportedVisualizers ?? []) {
      if (!validVisualizerIds.includes(visualizerId)) {
        const suggestion = findClosestMatch(visualizerId, validVisualizerIds);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
          source: 'domain',
          entityId: domain.id,
          field: 'supportedVisualizers',
          message: `Domain "${domain.id}" references visualizer "${visualizerId}" which does not exist in Visualizer Registry.`,
          suggestion,
        });
      }
    }

    for (const behaviorId of domain.supportedGraphBehaviors ?? []) {
      if (!validBehaviorIds.includes(behaviorId)) {
        const suggestion = findClosestMatch(behaviorId, validBehaviorIds);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
          source: 'domain',
          entityId: domain.id,
          field: 'supportedGraphBehaviors',
          message: `Domain "${domain.id}" references graph behavior "${behaviorId}" which does not exist in Graph Behavior Registry.`,
          suggestion,
        });
      }
    }

    if (domain.defaultPerspective && !validPerspectiveIds.includes(domain.defaultPerspective)) {
      const suggestion = findClosestMatch(domain.defaultPerspective, validPerspectiveIds);
      issues.push({
        severity: 'ERROR',
        code: 'INVALID_REFERENCE',
        source: 'domain',
        entityId: domain.id,
        field: 'defaultPerspective',
        message: `Domain "${domain.id}" defaultPerspective "${domain.defaultPerspective}" does not exist in Perspective Registry.`,
        suggestion,
      });
    }

    if (domain.defaultVisualizer && !validVisualizerIds.includes(domain.defaultVisualizer)) {
      const suggestion = findClosestMatch(domain.defaultVisualizer, validVisualizerIds);
      issues.push({
        severity: 'ERROR',
        code: 'INVALID_REFERENCE',
        source: 'domain',
        entityId: domain.id,
        field: 'defaultVisualizer',
        message: `Domain "${domain.id}" defaultVisualizer "${domain.defaultVisualizer}" does not exist in Visualizer Registry.`,
        suggestion,
      });
    }

    if (domain.defaultGraphBehavior && !validBehaviorIds.includes(domain.defaultGraphBehavior)) {
      const suggestion = findClosestMatch(domain.defaultGraphBehavior, validBehaviorIds);
      issues.push({
        severity: 'ERROR',
        code: 'INVALID_REFERENCE',
        source: 'domain',
        entityId: domain.id,
        field: 'defaultGraphBehavior',
        message: `Domain "${domain.id}" defaultGraphBehavior "${domain.defaultGraphBehavior}" does not exist in Graph Behavior Registry.`,
        suggestion,
      });
    }
  }

  // 2. Validate Perspective references
  for (const perspective of registries.perspectives) {
    if (perspective.defaultVisualizer && !validVisualizerIds.includes(perspective.defaultVisualizer)) {
      const suggestion = findClosestMatch(perspective.defaultVisualizer, validVisualizerIds);
      issues.push({
        severity: 'ERROR',
        code: 'INVALID_REFERENCE',
        source: 'perspective',
        entityId: perspective.id,
        field: 'defaultVisualizer',
        message: `Perspective "${perspective.id}" defaultVisualizer "${perspective.defaultVisualizer}" does not exist in Visualizer Registry.`,
        suggestion,
      });
    }

    if (perspective.defaultGraphBehavior && !validBehaviorIds.includes(perspective.defaultGraphBehavior)) {
      const suggestion = findClosestMatch(perspective.defaultGraphBehavior, validBehaviorIds);
      issues.push({
        severity: 'ERROR',
        code: 'INVALID_REFERENCE',
        source: 'perspective',
        entityId: perspective.id,
        field: 'defaultGraphBehavior',
        message: `Perspective "${perspective.id}" defaultGraphBehavior "${perspective.defaultGraphBehavior}" does not exist in Graph Behavior Registry.`,
        suggestion,
      });
    }
  }

  // 3. Validate Visualizer references
  for (const visualizer of registries.visualizers) {
    for (const perspectiveId of visualizer.supportedPerspectives ?? []) {
      if (!validPerspectiveIds.includes(perspectiveId)) {
        const suggestion = findClosestMatch(perspectiveId, validPerspectiveIds);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
          source: 'visualizer',
          entityId: visualizer.id,
          field: 'supportedPerspectives',
          message: `Visualizer "${visualizer.id}" references perspective "${perspectiveId}" which does not exist in Perspective Registry.`,
          suggestion,
        });
      }
    }

    for (const domainId of visualizer.supportedDomains ?? []) {
      if (!validDomainIds.includes(domainId)) {
        const suggestion = findClosestMatch(domainId, validDomainIds);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
          source: 'visualizer',
          entityId: visualizer.id,
          field: 'supportedDomains',
          message: `Visualizer "${visualizer.id}" references domain "${domainId}" which does not exist in Domain Registry.`,
          suggestion,
        });
      }
    }

    for (const behaviorId of visualizer.supportedGraphBehaviors ?? []) {
      if (!validBehaviorIds.includes(behaviorId)) {
        const suggestion = findClosestMatch(behaviorId, validBehaviorIds);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
          source: 'visualizer',
          entityId: visualizer.id,
          field: 'supportedGraphBehaviors',
          message: `Visualizer "${visualizer.id}" references graph behavior "${behaviorId}" which does not exist in Graph Behavior Registry.`,
          suggestion,
        });
      }
    }
  }

  // 4. Validate Graph Behavior references
  for (const behavior of registries.graphBehaviors) {
    for (const visualizerId of behavior.supportedVisualizers ?? []) {
      if (!validVisualizerIds.includes(visualizerId)) {
        const suggestion = findClosestMatch(visualizerId, validVisualizerIds);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
          source: 'graph-behavior',
          entityId: behavior.id,
          field: 'supportedVisualizers',
          message: `Graph Behavior "${behavior.id}" references visualizer "${visualizerId}" which does not exist in Visualizer Registry.`,
          suggestion,
        });
      }
    }

    for (const perspectiveId of behavior.supportedPerspectives ?? []) {
      if (!validPerspectiveIds.includes(perspectiveId)) {
        const suggestion = findClosestMatch(perspectiveId, validPerspectiveIds);
        issues.push({
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
          source: 'graph-behavior',
          entityId: behavior.id,
          field: 'supportedPerspectives',
          message: `Graph Behavior "${behavior.id}" references perspective "${perspectiveId}" which does not exist in Perspective Registry.`,
          suggestion,
        });
      }
    }
  }

  if (context?.strictMode) {
    // optional strict mode handling if needed
  }

  return issues;
}
