import type { DifficultyLevel, KnowledgeObject } from '../schema/knowledge-object.types';
import { BaseKnowledgeAdapter } from './base-adapter';

export class PatternAdapter extends BaseKnowledgeAdapter<Record<string, unknown>> {
  public readonly adapterType = 'pattern-adapter';

  public supports(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;

    // Reject if object contains training-concept specific keys
    if (
      obj.causes !== undefined ||
      obj.symptoms !== undefined ||
      obj.simulationPreset !== undefined ||
      obj.intuition !== undefined
    ) {
      return false;
    }

    return (
      (typeof obj.id === 'string' || typeof obj.slug === 'string') &&
      (obj.patternType !== undefined ||
        obj.blueprint !== undefined ||
        obj.designRationale !== undefined ||
        obj.math !== undefined ||
        obj.solution !== undefined ||
        (obj.problem !== undefined && obj.models !== undefined))
    );
  }

  protected transform(data: Record<string, unknown>): Partial<KnowledgeObject> {
    const rawId = String(data.id || data.slug || 'unknown-pattern');
    const slug = String(data.slug || this.normalizeSlug(rawId));
    const title = String(data.name || data.title || rawId);
    const summary = String(data.problem || data.summary || data.description || `${title} architectural design pattern.`);
    const description = String(data.solution || data.description || summary);

    const patternRefs = this.safeStringArray(data.relatedPatterns).map((p) =>
      p.startsWith('pattern:') ? p : `pattern:${p}`
    );
    const modelRefs = this.safeStringArray(data.models).map((m) => (m.startsWith('model:') ? m : `model:${m}`));
    const rawRelated = this.safeStringArray(data.relatedObjects).map((id) => {
      if (id.includes(':')) return id;
      return `pattern:${id}`;
    });
    const relatedObjects = Array.from(new Set([...patternRefs, ...modelRefs, ...rawRelated]));

    const prerequisiteObjects = this.safeStringArray(data.prerequisiteObjects || data.prerequisites).map((id) => {
      if (id.includes(':')) return id;
      return `pattern:${id}`;
    });

    const successorObjects = this.safeStringArray(data.successorObjects || data.successors).map((id) => {
      if (id.includes(':')) return id;
      return `pattern:${id}`;
    });

    const difficulty: DifficultyLevel =
      typeof data.difficulty === 'string' && ['beginner', 'intermediate', 'advanced'].includes(data.difficulty)
        ? (data.difficulty as DifficultyLevel)
        : 'intermediate';

    return {
      identity: {
        id: `pattern:${slug}`,
        slug,
        title,
        aliases: this.safeStringArray(data.aliases),
        type: 'pattern',
        status: 'stable',
      },
      metadata: {
        summary,
        description,
        tags: this.safeStringArray(data.tags),
        keywords: this.safeStringArray(data.keywords),
        authors: this.safeStringArray(data.authors),
      },
      educational: {
        difficulty,
        estimatedReadingTime: typeof data.readingTime === 'number' ? data.readingTime : 8,
        learningStage: 'core',
        prerequisites: prerequisiteObjects,
        learningObjectives: this.safeStringArray(data.learningObjectives),
        commonMisconceptions: this.safeStringArray(data.commonMisconceptions),
      },
      registry: {
        supportedDomains: ['vision', 'transformer'],
        supportedPerspectives: ['architecture', 'implementation'],
      },
      relationships: {
        relatedObjects,
        prerequisiteObjects,
        successorObjects,
      },
      extensibility: {
        domainMetadata: {
          math: data.math || undefined,
          problem: data.problem || undefined,
          solution: data.solution || undefined,
          tradeoffs: data.tradeoffs || undefined,
          models: data.models || undefined,
          icon: data.icon || undefined,
          color: data.color || undefined,
          bgColor: data.bgColor || undefined,
          borderColor: data.borderColor || undefined,
          blueprint: data.blueprint || undefined,
          designRationale: data.designRationale || undefined,
        },
      },
    };
  }
}
