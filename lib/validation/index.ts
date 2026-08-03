/**
 * Canonical Validation Pipeline Barrel API
 * 
 * Central entry point for platform validation, rule execution, and diagnostic reporting.
 * Modular framework supporting current registry integrity and future asset validators.
 * 
 * Architecture Layer: Validation Framework (Layer 3 Gatekeeper)
 */

export * from './validation-types';
export * from './validation-result';
export * from './validation-errors';
export * from './validators/registry-validator';
export * from './validators/reference-validator';
export * from './validators/graph-validator';
export * from './validators/capability-validator';

import {
  getAllDomains,
  getAllGraphBehaviors,
  getAllPerspectives,
  getAllVisualizers,
  type DomainDefinition,
  type GraphBehaviorDefinition,
  type PerspectiveDefinition,
  type VisualizerDefinition,
} from '../registry';
import { ValidationResultAccumulator } from './validation-result';
import type { ValidationIssue, ValidationReport, ValidatorContext } from './validation-types';
import {
  validateCapabilityConsistency,
} from './validators/capability-validator';
import {
  validateGraphIntegrity as validateGraphIntegrityImpl,
} from './validators/graph-validator';
import {
  validateDomainRegistry,
  validateGraphBehaviorRegistry,
  validatePerspectiveRegistry,
  validateVisualizerRegistry,
} from './validators/registry-validator';
import {
  validateReferentialIntegrity,
  type RegistryContainer,
} from './validators/reference-validator';

/**
 * Returns default canonical registry container if none provided.
 */
function getDefaultRegistries(): RegistryContainer {
  return {
    domains: getAllDomains(),
    perspectives: getAllPerspectives(),
    visualizers: getAllVisualizers(),
    graphBehaviors: getAllGraphBehaviors(),
  };
}

/**
 * Validates domain registry definitions.
 */
export function validateDomains(
  domains: readonly DomainDefinition[] = getAllDomains(),
  context?: ValidatorContext
): ValidationIssue[] {
  return validateDomainRegistry(domains, context);
}

/**
 * Validates perspective registry definitions.
 */
export function validatePerspectives(
  perspectives: readonly PerspectiveDefinition[] = getAllPerspectives(),
  context?: ValidatorContext
): ValidationIssue[] {
  return validatePerspectiveRegistry(perspectives, context);
}

/**
 * Validates visualizer registry definitions.
 */
export function validateVisualizers(
  visualizers: readonly VisualizerDefinition[] = getAllVisualizers(),
  context?: ValidatorContext
): ValidationIssue[] {
  return validateVisualizerRegistry(visualizers, context);
}

/**
 * Validates graph behavior registry definitions.
 */
export function validateGraphBehaviors(
  behaviors: readonly GraphBehaviorDefinition[] = getAllGraphBehaviors(),
  context?: ValidatorContext
): ValidationIssue[] {
  return validateGraphBehaviorRegistry(behaviors, context);
}

/**
 * Validates cross-registry referential integrity.
 */
export function validateReferences(
  registries: RegistryContainer = getDefaultRegistries(),
  context?: ValidatorContext
): ValidationIssue[] {
  return validateReferentialIntegrity(registries, context);
}

/**
 * Validates capability consistency and cross-registry compatibility.
 */
export function validateCapabilities(
  registries: RegistryContainer = getDefaultRegistries(),
  context?: ValidatorContext
): ValidationIssue[] {
  return validateCapabilityConsistency(registries, context);
}

/**
 * Validates orphan entities and dependency cycles.
 */
export function validateGraph(
  registries: RegistryContainer = getDefaultRegistries(),
  context?: ValidatorContext
): ValidationIssue[] {
  return validateGraphIntegrityImpl(registries, context);
}

/**
 * Orchestrates full platform validation across all rules.
 */
export function validatePlatform(
  registries: RegistryContainer = getDefaultRegistries(),
  context?: ValidatorContext
): ValidationReport {
  const accumulator = new ValidationResultAccumulator();

  // 1. Registry structural rules (duplicates, required fields, defaults)
  accumulator.merge(validateDomainRegistry(registries.domains, context));
  accumulator.merge(validatePerspectiveRegistry(registries.perspectives, context));
  accumulator.merge(validateVisualizerRegistry(registries.visualizers, context));
  accumulator.merge(validateGraphBehaviorRegistry(registries.graphBehaviors, context));

  // 2. Referential integrity rules (dangling links)
  accumulator.merge(validateReferentialIntegrity(registries, context));

  // 3. Capability consistency rules (compatibility)
  accumulator.merge(validateCapabilityConsistency(registries, context));

  // 4. Graph rules (orphans and circular dependencies)
  accumulator.merge(validateGraphIntegrityImpl(registries, context));

  return accumulator.buildReport({
    domainsCount: registries.domains.length,
    perspectivesCount: registries.perspectives.length,
    visualizersCount: registries.visualizers.length,
    graphBehaviorsCount: registries.graphBehaviors.length,
  });
}
