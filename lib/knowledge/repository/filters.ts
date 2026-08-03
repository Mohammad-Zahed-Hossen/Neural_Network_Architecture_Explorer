import type { DifficultyLevel, KnowledgeObject, KnowledgeObjectType, LearningStage } from '../schema/knowledge-object.types';

export function filterByDomain(
  objects: readonly KnowledgeObject[],
  domainId: string
): readonly KnowledgeObject[] {
  return objects.filter((obj) => obj.registry.supportedDomains.includes(domainId));
}

export function filterByType(
  objects: readonly KnowledgeObject[],
  type: KnowledgeObjectType
): readonly KnowledgeObject[] {
  return objects.filter((obj) => obj.identity.type === type);
}

export function filterByDifficulty(
  objects: readonly KnowledgeObject[],
  difficulty: DifficultyLevel
): readonly KnowledgeObject[] {
  return objects.filter((obj) => obj.educational.difficulty === difficulty);
}

export function filterByLearningStage(
  objects: readonly KnowledgeObject[],
  stage: LearningStage
): readonly KnowledgeObject[] {
  return objects.filter((obj) => obj.educational.learningStage === stage);
}
