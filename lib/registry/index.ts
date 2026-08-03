/**
 * Canonical Registry System Barrel API
 * 
 * Central entry point for platform capability discovery and registry lookups.
 * Follows strict unidirectional hierarchy:
 * Domain Registry -> Perspective Registry -> Visualizer Registry -> Graph Behavior Registry
 * 
 * Architecture Layer: Shared Registry System (Layer 0 Foundation)
 */

export * from './registry-types';
export * from './graph-behavior-registry';
export * from './visualizer-registry';
export * from './perspective-registry';
export * from './domain-registry';

import { getDomain } from './domain-registry';
import type { DomainId, GraphBehaviorId, PerspectiveId, VisualizerId } from './registry-types';

/**
 * Check if a perspective is supported by a given domain.
 */
export function isPerspectiveSupported(domainId: DomainId, perspectiveId: PerspectiveId): boolean {
  const domain = getDomain(domainId);
  if (!domain) return false;
  return (domain.supportedPerspectives as readonly string[]).includes(perspectiveId);
}

/**
 * Check if a visualizer is supported by a given domain.
 */
export function isVisualizerSupported(domainId: DomainId, visualizerId: VisualizerId): boolean {
  const domain = getDomain(domainId);
  if (!domain) return false;
  return (domain.supportedVisualizers as readonly string[]).includes(visualizerId);
}

/**
 * Check if a graph behavior is supported by a given domain.
 */
export function isGraphBehaviorSupported(domainId: DomainId, graphBehaviorId: GraphBehaviorId): boolean {
  const domain = getDomain(domainId);
  if (!domain) return false;
  return (domain.supportedGraphBehaviors as readonly string[]).includes(graphBehaviorId);
}
