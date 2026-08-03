import type { ValidationIssue, ValidatorContext } from '../validation-types';
import type { RegistryContainer } from './reference-validator';

/**
 * Validates orphan entities (unreferenced metadata) and circular dependency loops.
 */
export function validateGraphIntegrity(
  registries: RegistryContainer,
  context?: ValidatorContext
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Rule #3: Orphan Detection
  if (!context?.allowOrphans) {
    const referencedPerspectives = new Set<string>();
    const referencedVisualizers = new Set<string>();
    const referencedBehaviors = new Set<string>();

    for (const domain of registries.domains) {
      for (const p of domain.supportedPerspectives ?? []) referencedPerspectives.add(p);
      for (const v of domain.supportedVisualizers ?? []) referencedVisualizers.add(v);
      for (const b of domain.supportedGraphBehaviors ?? []) referencedBehaviors.add(b);
    }

    for (const perspective of registries.perspectives) {
      if (perspective.defaultVisualizer) referencedVisualizers.add(perspective.defaultVisualizer);
      if (perspective.defaultGraphBehavior) referencedBehaviors.add(perspective.defaultGraphBehavior);
    }

    for (const visualizer of registries.visualizers) {
      for (const p of visualizer.supportedPerspectives ?? []) referencedPerspectives.add(p);
      for (const b of visualizer.supportedGraphBehaviors ?? []) referencedBehaviors.add(b);
    }

    for (const behavior of registries.graphBehaviors) {
      for (const v of behavior.supportedVisualizers ?? []) referencedVisualizers.add(v);
      for (const p of behavior.supportedPerspectives ?? []) referencedPerspectives.add(p);
    }

    for (const perspective of registries.perspectives) {
      if (!referencedPerspectives.has(perspective.id)) {
        issues.push({
          severity: 'WARNING',
          code: 'ORPHAN_ENTITY',
          source: 'perspective',
          entityId: perspective.id,
          message: `Perspective "${perspective.id}" is declared in Perspective Registry but never referenced by any Domain or Visualizer.`,
        });
      }
    }

    for (const visualizer of registries.visualizers) {
      if (!referencedVisualizers.has(visualizer.id)) {
        issues.push({
          severity: 'WARNING',
          code: 'ORPHAN_ENTITY',
          source: 'visualizer',
          entityId: visualizer.id,
          message: `Visualizer "${visualizer.id}" is declared in Visualizer Registry but never referenced by any Domain or Perspective.`,
        });
      }
    }

    for (const behavior of registries.graphBehaviors) {
      if (!referencedBehaviors.has(behavior.id)) {
        issues.push({
          severity: 'WARNING',
          code: 'ORPHAN_ENTITY',
          source: 'graph-behavior',
          entityId: behavior.id,
          message: `Graph Behavior "${behavior.id}" is declared in Graph Behavior Registry but never referenced by any Domain, Perspective, or Visualizer.`,
        });
      }
    }
  }

  // Rule #9: Circular Dependency Detection
  const adj = new Map<string, Set<string>>();

  const addEdge = (u: string, v: string) => {
    if (!adj.has(u)) adj.set(u, new Set());
    adj.get(u)!.add(v);
  };

  for (const domain of registries.domains) {
    const dId = `domain:${domain.id}`;
    for (const p of domain.supportedPerspectives ?? []) addEdge(dId, `perspective:${p}`);
    for (const v of domain.supportedVisualizers ?? []) addEdge(dId, `visualizer:${v}`);
    for (const b of domain.supportedGraphBehaviors ?? []) addEdge(dId, `graph-behavior:${b}`);
  }

  for (const perspective of registries.perspectives) {
    const pId = `perspective:${perspective.id}`;
    if (perspective.defaultVisualizer) addEdge(pId, `visualizer:${perspective.defaultVisualizer}`);
    if (perspective.defaultGraphBehavior) addEdge(pId, `graph-behavior:${perspective.defaultGraphBehavior}`);
  }

  for (const visualizer of registries.visualizers) {
    const vId = `visualizer:${visualizer.id}`;
    for (const b of visualizer.supportedGraphBehaviors ?? []) addEdge(vId, `graph-behavior:${b}`);
  }

  // Detect cycle using DFS
  const visited = new Set<string>();
  const recStack = new Set<string>();

  const isCyclicDFS = (node: string, path: string[]): string[] | null => {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = adj.get(node);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cycle = isCyclicDFS(neighbor, [...path]);
          if (cycle) return cycle;
        } else if (recStack.has(neighbor)) {
          path.push(neighbor);
          return path;
        }
      }
    }

    recStack.delete(node);
    return null;
  };

  for (const node of adj.keys()) {
    if (!visited.has(node)) {
      const cyclePath = isCyclicDFS(node, []);
      if (cyclePath) {
        issues.push({
          severity: 'ERROR',
          code: 'CIRCULAR_DEPENDENCY',
          source: 'graph',
          entityId: node,
          message: `Circular dependency loop detected in registry references: ${cyclePath.join(' -> ')}`,
        });
        break;
      }
    }
  }

  return issues;
}
