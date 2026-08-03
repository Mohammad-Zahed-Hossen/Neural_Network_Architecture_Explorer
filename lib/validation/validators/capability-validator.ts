import type { ValidationIssue, ValidatorContext } from '../validation-types';
import type { RegistryContainer } from './reference-validator';

/**
 * Validates Rule #8: Capability Consistency (ensures cross-registry compatibility and alignment).
 */
export function validateCapabilityConsistency(
  registries: RegistryContainer,
  context?: ValidatorContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const perspectiveMap = new Map(registries.perspectives.map((p) => [p.id, p]));
  const visualizerMap = new Map(registries.visualizers.map((v) => [v.id, v]));

  // 1. Validate bidirectional Domain-Visualizer compatibility
  for (const domain of registries.domains) {
    for (const visualizerId of domain.supportedVisualizers ?? []) {
      const visualizer = visualizerMap.get(visualizerId);
      if (visualizer) {
        if (!(visualizer.supportedDomains as readonly string[]).includes(domain.id)) {
          issues.push({
            severity: 'WARNING',
            code: 'CAPABILITY_INCONSISTENCY',
            source: 'capability',
            entityId: domain.id,
            field: 'supportedVisualizers',
            message: `Domain "${domain.id}" supports visualizer "${visualizerId}", but visualizer "${visualizerId}" does not list domain "${domain.id}" in its supportedDomains.`,
          });
        }
      }
    }

    // 2. Validate simulation requirement consistency for default visualizer
    const defaultVis = visualizerMap.get(domain.defaultVisualizer);
    const defaultPersp = perspectiveMap.get(domain.defaultPerspective);

    if (defaultVis && defaultPersp) {
      const requiresSimulation = defaultVis.supportedEngineStates.some((state) =>
        ['running', 'paused', 'converged', 'exploded', 'vanished'].includes(state)
      );

      if (requiresSimulation && !defaultPersp.supportsSimulation) {
        issues.push({
          severity: 'WARNING',
          code: 'CAPABILITY_INCONSISTENCY',
          source: 'capability',
          entityId: domain.id,
          field: 'defaultVisualizer',
          message: `Domain "${domain.id}" defaultVisualizer "${domain.defaultVisualizer}" relies on simulation engine states, but defaultPerspective "${domain.defaultPerspective}" sets supportsSimulation: false.`,
        });
      }
    }
  }

  // 3. Validate bidirectional Visualizer-Perspective compatibility
  for (const visualizer of registries.visualizers) {
    for (const perspectiveId of visualizer.supportedPerspectives ?? []) {
      const perspective = perspectiveMap.get(perspectiveId);
      if (perspective) {
        if (visualizer.renderMode === 'canvas-2d' && perspective.id !== 'training' && !perspective.supportsSimulation) {
          issues.push({
            severity: 'INFO',
            code: 'CAPABILITY_INCONSISTENCY',
            source: 'capability',
            entityId: visualizer.id,
            field: 'renderMode',
            message: `Canvas 2D Visualizer "${visualizer.id}" supports perspective "${perspectiveId}" which does not enable simulation modes.`,
          });
        }
      }
    }
  }

  if (context?.strictMode) {
    // strict mode capability check
  }

  return issues;
}
