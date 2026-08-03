/**
 * @module RelationshipResolver
 * @purpose Centralized relationship resolution engine across the Knowledge Graph.
 * @layer Layer 5 Business Logic / Knowledge Graph
 * @dependencies KnowledgeObject, RELATIONSHIPS_MAP
 * @api RelationshipResolver
 */

import { KnowledgeObject, KnowledgeObjectType } from '../schema/knowledge-object.types';
import { RELATIONSHIPS_MAP } from '../../data/relationships';

export interface CrossDomainConnections {
  readonly architecture: readonly KnowledgeObject[];
  readonly training: readonly KnowledgeObject[];
  readonly research: readonly KnowledgeObject[];
  readonly evolution: readonly KnowledgeObject[];
  readonly implementation: readonly KnowledgeObject[];
}

export interface ResolvedRelationship {
  readonly target: KnowledgeObject;
  readonly relationshipType: string;
  readonly domain: string;
}

export class RelationshipResolver {
  /**
   * Resolves related KnowledgeObjects for a given target object from a pool of candidates.
   */
  public static resolveRelated(
    target: KnowledgeObject,
    allObjects: readonly KnowledgeObject[]
  ): readonly KnowledgeObject[] {
    const rawTargetId = target.identity.slug || target.identity.id;
    const targetNamespaceId = target.identity.id;

    const ids = new Set<string>();

    // 1. Add direct relationships declared on object
    for (const id of target.relationships.relatedObjects) {
      ids.add(id);
    }

    // 2. Add relationships from RELATIONSHIPS_MAP if target is a model/pattern
    const mapEntry = RELATIONSHIPS_MAP[rawTargetId];
    if (mapEntry) {
      if (mapEntry.relatedModels) {
        for (const m of mapEntry.relatedModels) ids.add(`model:${m.id}`);
      }
      if (mapEntry.influenced) {
        for (const m of mapEntry.influenced) ids.add(`model:${m.id}`);
      }
      if (mapEntry.influencedBy) {
        for (const m of mapEntry.influencedBy) ids.add(`model:${m.id}`);
      }
      if (mapEntry.patterns) {
        for (const p of mapEntry.patterns) ids.add(`pattern:${p.id}`);
      }
      if (mapEntry.concepts) {
        for (const c of mapEntry.concepts) ids.add(`concept:${c.id}`);
      }
    }

    // 3. Find candidates whose relatedObjects reference this target
    for (const candidate of allObjects) {
      if (candidate.identity.id === targetNamespaceId) continue;
      if (
        candidate.relationships.relatedObjects.includes(targetNamespaceId) ||
        candidate.relationships.relatedObjects.includes(rawTargetId)
      ) {
        ids.add(candidate.identity.id);
      }
    }

    return allObjects.filter(
      (obj) =>
        obj.identity.id !== targetNamespaceId &&
        (ids.has(obj.identity.id) || ids.has(obj.identity.slug))
    );
  }

  /**
   * Resolves prerequisite objects for a target KnowledgeObject.
   */
  public static resolvePrerequisites(
    target: KnowledgeObject,
    allObjects: readonly KnowledgeObject[]
  ): readonly KnowledgeObject[] {
    const rawTargetId = target.identity.slug || target.identity.id;

    const ids = new Set<string>(target.relationships.prerequisiteObjects);

    const mapEntry = RELATIONSHIPS_MAP[rawTargetId];
    if (mapEntry && mapEntry.predecessors) {
      for (const p of mapEntry.predecessors) {
        ids.add(`model:${p.id}`);
      }
    }

    return allObjects.filter(
      (obj) =>
        obj.identity.id !== target.identity.id &&
        (ids.has(obj.identity.id) || ids.has(obj.identity.slug))
    );
  }

  /**
   * Resolves successor objects for a target KnowledgeObject.
   */
  public static resolveSuccessors(
    target: KnowledgeObject,
    allObjects: readonly KnowledgeObject[]
  ): readonly KnowledgeObject[] {
    const rawTargetId = target.identity.slug || target.identity.id;

    const ids = new Set<string>(target.relationships.successorObjects);

    const mapEntry = RELATIONSHIPS_MAP[rawTargetId];
    if (mapEntry && mapEntry.successors) {
      for (const s of mapEntry.successors) {
        ids.add(`model:${s.id}`);
      }
    }

    return allObjects.filter(
      (obj) =>
        obj.identity.id !== target.identity.id &&
        (ids.has(obj.identity.id) || ids.has(obj.identity.slug))
    );
  }

  /**
   * Resolves cross-domain connected KnowledgeObjects grouped into 5 core domains:
   * Architecture, Training, Research, Evolution, Implementation.
   */
  public static resolveCrossDomain(
    target: KnowledgeObject,
    allObjects: readonly KnowledgeObject[]
  ): CrossDomainConnections {
    const related = this.resolveRelated(target, allObjects);
    const prereqs = this.resolvePrerequisites(target, allObjects);
    const successors = this.resolveSuccessors(target, allObjects);

    const combinedSet = new Set<KnowledgeObject>([...related, ...prereqs, ...successors]);
    const connected = Array.from(combinedSet);

    const architecture: KnowledgeObject[] = [];
    const training: KnowledgeObject[] = [];
    const research: KnowledgeObject[] = [];
    const evolution: KnowledgeObject[] = [];
    const implementation: KnowledgeObject[] = [];

    for (const obj of connected) {
      switch (obj.identity.type) {
        case 'model':
        case 'pattern':
          architecture.push(obj);
          break;
        case 'concept':
          training.push(obj);
          break;
        case 'paper':
          research.push(obj);
          break;
        default:
          evolution.push(obj);
          break;
      }
    }

    // Include target if relevant or candidates matching domain tags
    for (const candidate of allObjects) {
      if (candidate.identity.id === target.identity.id) continue;
      if (candidate.metadata.tags.some((tag) => target.metadata.tags.includes(tag))) {
        if (candidate.identity.type === 'paper' && !research.some((r) => r.identity.id === candidate.identity.id)) {
          research.push(candidate);
        } else if (candidate.identity.type === 'concept' && !training.some((t) => t.identity.id === candidate.identity.id)) {
          training.push(candidate);
        }
      }
    }

    return {
      architecture,
      training,
      research,
      evolution,
      implementation,
    };
  }

  /**
   * Filter candidates by specific KnowledgeObjectType.
   */
  public static filterByType(
    objects: readonly KnowledgeObject[],
    type: KnowledgeObjectType
  ): readonly KnowledgeObject[] {
    return objects.filter((obj) => obj.identity.type === type);
  }
}
