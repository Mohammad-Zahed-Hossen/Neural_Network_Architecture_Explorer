import { knowledgeRepository } from './repository';
import type { KnowledgeObject } from '../schema/knowledge-object.types';

export interface PatternResearchSummary {
  papers: readonly KnowledgeObject[];
  citationsCount: number;
  researchTopics: readonly string[];
}

export function getPatternResearch(patternId: string): PatternResearchSummary {
  const pattern = knowledgeRepository.getKnowledgeObject(patternId);
  if (!pattern) {
    return { papers: [], citationsCount: 0, researchTopics: [] };
  }

  const related = knowledgeRepository.getRelatedObjects(pattern.identity.id);
  const papers = related.filter((obj) => obj.identity.type === 'paper');

  const topics = Array.from(
    new Set(papers.flatMap((p) => p.metadata.tags || []))
  );

  return {
    papers,
    citationsCount: papers.length * 1500, // Derived citation heuristic based on landmark paper count
    researchTopics: topics,
  };
}
