import type { DifficultyLevel, KnowledgeObject } from '../schema/knowledge-object.types';
import { BaseKnowledgeAdapter } from './base-adapter';

export class TrainingAdapter extends BaseKnowledgeAdapter<Record<string, unknown>> {
  public readonly adapterType = 'training-adapter';

  public supports(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return (
      (typeof obj.id === 'string' || typeof obj.slug === 'string') &&
      (obj.causes !== undefined || obj.symptoms !== undefined || obj.simulationPreset !== undefined || obj.intuition !== undefined)
    );
  }

  protected transform(data: Record<string, unknown>): Partial<KnowledgeObject> {
    const rawId = String(data.id || data.slug || 'unknown-concept');
    const slug = String(data.slug || this.normalizeSlug(rawId));
    const title = String(data.title || data.name || rawId);
    const summary = String(data.summary || data.problem || `${title} training dynamics concept.`);
    const description = String(data.intuition || data.description || summary);

    const relatedObjects = this.safeStringArray(data.relatedConcepts || data.relatedObjects);

    const difficulty: DifficultyLevel =
      typeof data.difficulty === 'string' && ['beginner', 'intermediate', 'advanced'].includes(data.difficulty)
        ? (data.difficulty as DifficultyLevel)
        : 'intermediate';

    let presetId: string | undefined;
    if (typeof data.simulationPreset === 'object' && data.simulationPreset !== null && 'id' in data.simulationPreset) {
      presetId = String((data.simulationPreset as Record<string, unknown>).id);
    }

    return {
      identity: {
        id: `concept:${slug}`,
        slug,
        title,
        aliases: this.safeStringArray(data.aliases),
        type: 'concept',
        status: 'stable',
      },
      metadata: {
        summary,
        description,
        tags: this.safeStringArray(data.tags),
        keywords: this.safeStringArray(data.keywords),
      },
      educational: {
        difficulty,
        estimatedReadingTime: 12,
        learningStage: 'core',
        prerequisites: this.safeStringArray(data.prerequisites),
        learningObjectives: this.safeStringArray(data.solutions),
        commonMisconceptions: this.safeStringArray(data.symptoms),
      },
      registry: {
        supportedDomains: ['vision', 'optimization'],
        supportedPerspectives: ['training', 'mathematics'],
      },
      relationships: {
        relatedObjects,
        prerequisiteObjects: [],
        successorObjects: [],
      },
      extensibility: {
        domainMetadata: {
          category: data.category || 'optimization',
          causes: data.causes || [],
          symptoms: data.symptoms || [],
          solutions: data.solutions || [],
          presetId,
        },
      },
    };
  }
}
