import type { KnowledgeObject } from '../schema/knowledge-object.types';

export function getRelatedObjectIds(object: KnowledgeObject): readonly string[] {
  return object.relationships.relatedObjects;
}

export function getPrerequisiteObjectIds(object: KnowledgeObject): readonly string[] {
  return object.relationships.prerequisiteObjects;
}

export function getSuccessorObjectIds(object: KnowledgeObject): readonly string[] {
  return object.relationships.successorObjects;
}
