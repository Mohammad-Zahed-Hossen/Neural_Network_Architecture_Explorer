import type { DifficultyLevel, KnowledgeObject } from '../schema/knowledge-object.types';
import { BaseKnowledgeAdapter } from './base-adapter';

export class ModelAdapter extends BaseKnowledgeAdapter<Record<string, unknown>> {
  public readonly adapterType = 'model-adapter';

  public supports(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;

    // Reject if object contains pattern, paper, or training-specific keys
    if (
      obj.blueprint !== undefined ||
      obj.designRationale !== undefined ||
      obj.causes !== undefined ||
      obj.symptoms !== undefined ||
      obj.problem !== undefined ||
      obj.paperId !== undefined
    ) {
      return false;
    }

    return (
      (typeof obj.id === 'string' || typeof obj.slug === 'string') &&
      (typeof obj.name === 'string' || typeof obj.title === 'string') &&
      (obj.category !== undefined ||
        obj.layers !== undefined ||
        obj.architecture !== undefined ||
        obj.layerCount !== undefined ||
        obj.parameterCount !== undefined)
    );
  }

  protected transform(data: Record<string, unknown>): Partial<KnowledgeObject> {
    const rawId = String(data.id || data.slug || 'unknown-model');
    const slug = String(data.slug || this.normalizeSlug(rawId));
    const title = String(data.name || data.title || rawId);
    const summary = String(data.summary || data.description || `${title} neural network architecture model.`);
    const description = String(data.description || summary);
    const year = typeof data.year === 'number' ? data.year : undefined;

    const tags = this.safeStringArray(data.tags);
    if (data.category && typeof data.category === 'string') {
      tags.push(data.category);
    }

    const prerequisites = this.safeStringArray(data.prerequisites);
    const relatedObjects = this.safeStringArray(data.relatedModels || data.relatedObjects);

    const difficulty: DifficultyLevel =
      typeof data.difficulty === 'string' && ['beginner', 'intermediate', 'advanced'].includes(data.difficulty)
        ? (data.difficulty as DifficultyLevel)
        : 'intermediate';

    return {
      identity: {
        id: `model:${slug}`,
        slug,
        title,
        aliases: this.safeStringArray(data.aliases),
        type: 'model',
        status: 'stable',
      },
      metadata: {
        summary,
        description,
        tags: Array.from(new Set(tags)),
        keywords: this.safeStringArray(data.keywords),
        authors: this.safeStringArray(data.authors),
        year,
      },
      educational: {
        difficulty,
        estimatedReadingTime: typeof data.readingTime === 'number' ? data.readingTime : 10,
        learningStage: 'core',
        prerequisites,
        learningObjectives: this.safeStringArray(data.learningObjectives),
        commonMisconceptions: this.safeStringArray(data.commonMisconceptions),
      },
      registry: {
        supportedDomains: ['vision'],
        supportedPerspectives: ['architecture', 'training', 'mathematics', 'research', 'evolution', 'implementation'],
      },
      relationships: {
        relatedObjects,
        prerequisiteObjects: prerequisites,
        successorObjects: this.safeStringArray(data.successors),
      },
      extensibility: {
        domainMetadata: {
          category: data.category || data.family || 'vision',
          family: data.family || data.category || 'vision',
          totalParameters: typeof data.totalParameters === 'number' ? data.totalParameters : (typeof data.parameterCount === 'number' ? data.parameterCount : (typeof data.params === 'number' ? data.params : undefined)),
          trainableParameters: typeof data.trainableParameters === 'number' ? data.trainableParameters : undefined,
          totalFLOPs: typeof data.totalFLOPs === 'number' ? data.totalFLOPs : (typeof data.flops === 'number' ? data.flops : undefined),
          top1Accuracy: typeof data.top1Accuracy === 'number' ? data.top1Accuracy : (typeof data.accuracy === 'number' ? data.accuracy : undefined),
          top5Accuracy: typeof data.top5Accuracy === 'number' ? data.top5Accuracy : undefined,
          memoryUsage: typeof data.memoryUsage === 'number' ? data.memoryUsage : (typeof data.memory === 'number' ? data.memory : undefined),
          depth: typeof data.depth === 'number' ? data.depth : (typeof data.layerCount === 'number' ? data.layerCount : (typeof data.layers === 'number' ? data.layers : undefined)),
          year: typeof data.year === 'number' ? data.year : (typeof data.paperYear === 'number' ? data.paperYear : undefined),
          paperUrl: typeof data.paperUrl === 'string' ? data.paperUrl : undefined,
        },
      },
    };
  }
}
