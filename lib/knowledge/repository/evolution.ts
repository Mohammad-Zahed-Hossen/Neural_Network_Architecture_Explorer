import { knowledgeRepository } from './repository';
import type { KnowledgeObject } from '../schema/knowledge-object.types';

export interface PatternEvolutionSummary {
  predecessors: readonly KnowledgeObject[];
  successors: readonly KnowledgeObject[];
  timeline: Array<{
    year: number;
    title: string;
    event: string;
  }>;
}

export function getPatternEvolution(patternId: string): PatternEvolutionSummary {
  const pattern = knowledgeRepository.getKnowledgeObject(patternId);
  if (!pattern) {
    return { predecessors: [], successors: [], timeline: [] };
  }

  const predecessors = knowledgeRepository.getPrerequisites(pattern.identity.id);
  const successors = knowledgeRepository.getSuccessors(pattern.identity.id);

  // Derive timeline events from associated research papers and related models
  const related = knowledgeRepository.getRelatedObjects(pattern.identity.id);
  const timeline: Array<{ year: number; title: string; event: string }> = [];

  for (const obj of related) {
    if (obj.identity.type === 'paper') {
      const year = Number(obj.extensibility?.domainMetadata?.year || 2015);
      timeline.push({
        year,
        title: obj.identity.title,
        event: obj.metadata.summary || `Research publication for ${pattern.identity.title}`,
      });
    }
  }

  // Sort timeline chronologically
  timeline.sort((a, b) => a.year - b.year);

  return {
    predecessors,
    successors,
    timeline,
  };
}
