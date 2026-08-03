/**
 * @module NavigationService
 * @purpose High-level graph navigation and perspective routing query service.
 * @layer Layer 5 Business Logic / Navigation
 * @dependencies KnowledgeObject, IKnowledgeRepository, RelationshipResolver
 * @api NavigationService
 */

import { KnowledgeObject } from '../schema/knowledge-object.types';
import { IKnowledgeRepository } from '../repository/repository';
import { RelationshipResolver, CrossDomainConnections } from '../graph/relationship-resolver';

export interface PerspectiveLink {
  readonly perspectiveId: string;
  readonly title: string;
  readonly href: string;
  readonly isSupported: boolean;
}

export interface LearningPathStep {
  readonly previous: KnowledgeObject | null;
  readonly current: KnowledgeObject;
  readonly next: KnowledgeObject | null;
}

export class NavigationService {
  /**
   * Generates available perspective navigation links for a given KnowledgeObject.
   */
  public static getPerspectiveLinks(object: KnowledgeObject): readonly PerspectiveLink[] {
    const slug = object.identity.slug;
    const supported = new Set(object.registry.supportedPerspectives);

    const available: PerspectiveLink[] = [
      {
        perspectiveId: 'architecture',
        title: 'Architecture Blueprint',
        href: object.identity.type === 'model' ? `/models/${slug}` : `/architecture-patterns#${slug}`,
        isSupported: supported.has('architecture'),
      },
      {
        perspectiveId: 'training',
        title: 'Training Dynamics',
        href: `/concepts/training-dynamics?concept=${slug}`,
        isSupported: supported.has('training'),
      },
      {
        perspectiveId: 'research',
        title: 'Scientific Research',
        href: `/papers/${slug}`,
        isSupported: supported.has('research') || object.identity.type === 'paper',
      },
      {
        perspectiveId: 'evolution',
        title: 'Historical Evolution',
        href: `/evolution?highlight=${slug}`,
        isSupported: supported.has('evolution'),
      },
      {
        perspectiveId: 'implementation',
        title: 'Code Reference',
        href: `/models/${slug}?tab=implementation`,
        isSupported: supported.has('implementation'),
      },
    ];

    return available.filter((p) => p.isSupported);
  }

  /**
   * Generates graph-traversed Previous <- Current -> Next learning path.
   */
  public static getLearningPath(
    repository: IKnowledgeRepository,
    id: string
  ): LearningPathStep | null {
    const current = repository.getKnowledgeObject(id);
    if (!current) return null;

    const prereqs = repository.getPrerequisites(id);
    const successors = repository.getSuccessors(id);

    const previous = prereqs.length > 0 ? prereqs[0] : null;
    const next = successors.length > 0 ? successors[0] : null;

    return {
      previous,
      current,
      next,
    };
  }

  /**
   * Resolves cross-domain connected objects across Architecture, Training, Research, Evolution, and Implementation.
   */
  public static getCrossDomainConnections(
    repository: IKnowledgeRepository,
    id: string
  ): CrossDomainConnections {
    const target = repository.getKnowledgeObject(id);
    if (!target) {
      return {
        architecture: [],
        training: [],
        research: [],
        evolution: [],
        implementation: [],
      };
    }

    const allObjects = repository.getKnowledgeObjects();
    return RelationshipResolver.resolveCrossDomain(target, allObjects);
  }

  /**
   * Finds connected research papers for a Knowledge Object.
   */
  public static findResearchConnections(
    repository: IKnowledgeRepository,
    id: string
  ): readonly KnowledgeObject[] {
    const connections = this.getCrossDomainConnections(repository, id);
    return connections.research;
  }

  /**
   * Finds connected implementation references for a Knowledge Object.
   */
  public static findImplementationExamples(
    repository: IKnowledgeRepository,
    id: string
  ): readonly KnowledgeObject[] {
    const connections = this.getCrossDomainConnections(repository, id);
    return connections.implementation;
  }

  /**
   * Shortest learning path search between two Knowledge Objects using BFS graph traversal.
   */
  public static findShortestLearningPath(
    repository: IKnowledgeRepository,
    startId: string,
    endId: string
  ): readonly KnowledgeObject[] {
    const startObj = repository.getKnowledgeObject(startId);
    const endObj = repository.getKnowledgeObject(endId);
    if (!startObj || !endObj) return [];

    const queue: KnowledgeObject[][] = [[startObj]];
    const visited = new Set<string>([startObj.identity.id]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current.identity.id === endObj.identity.id) {
        return path;
      }

      const neighbors = repository.getRelatedObjects(current.identity.id);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.identity.id)) {
          visited.add(neighbor.identity.id);
          queue.push([...path, neighbor]);
        }
      }
    }

    return [startObj, endObj];
  }
}
