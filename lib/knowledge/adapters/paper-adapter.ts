import type { KnowledgeObject } from '../schema/knowledge-object.types';
import { BaseKnowledgeAdapter } from './base-adapter';

export class PaperAdapter extends BaseKnowledgeAdapter<Record<string, unknown>> {
  public readonly adapterType = 'paper-adapter';

  public supports(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    const metadata = (obj.metadata || {}) as Record<string, unknown>;

    // Reject if object contains pattern, model, or training-concept specific keys
    if (
      obj.causes !== undefined ||
      obj.symptoms !== undefined ||
      obj.simulationPreset !== undefined ||
      obj.category !== undefined ||
      obj.layerCount !== undefined ||
      obj.parameterCount !== undefined ||
      obj.math !== undefined ||
      obj.patternType !== undefined ||
      obj.blueprint !== undefined
    ) {
      return false;
    }

    return (
      (typeof obj.paperId === 'string' ||
        typeof metadata.paperId === 'string' ||
        typeof obj.doi === 'string' ||
        typeof metadata.venue === 'string' ||
        typeof obj.paperUrl === 'string' ||
        typeof obj.contribution === 'string' ||
        (typeof obj.id === 'string' && Array.isArray(obj.authors))) &&
      (typeof obj.title === 'string' || typeof metadata.title === 'string')
    );
  }

  protected transform(data: Record<string, unknown>): Partial<KnowledgeObject> {
    const meta = (data.metadata || {}) as Record<string, unknown>;
    const summaryObj = (data.summary || {}) as Record<string, unknown>;
    const connections = (data.connections || {}) as Record<string, unknown>;

    const paperId = String(data.paperId || meta.paperId || data.id || 'unknown-paper');
    const slug = String(meta.paperId || data.slug || this.normalizeSlug(paperId));
    const title = String(data.title || meta.title || paperId);
    const summary = String(summaryObj.tldr || summaryObj.oneSentenceMemory || data.summary || `${title} research paper.`);
    const description = String(data.description || summary);
    const year = typeof data.year === 'number' ? data.year : typeof meta.year === 'number' ? meta.year : undefined;

    const rawAuthors = data.authors || meta.authors;
    const authors: string[] = [];
    if (Array.isArray(rawAuthors)) {
      for (const a of rawAuthors) {
        if (typeof a === 'string') {
          authors.push(a);
        } else if (typeof a === 'object' && a !== null && 'name' in a) {
          authors.push(String((a as Record<string, unknown>).name));
        }
      }
    }

    const relatedObjects = this.safeStringArray(connections.lineage || data.relatedObjects);

    return {
      identity: {
        id: `paper:${slug}`,
        slug,
        title,
        aliases: this.safeStringArray(data.aliases),
        type: 'paper',
        status: 'stable',
      },
      metadata: {
        summary,
        description,
        tags: this.safeStringArray(data.tags || meta.tags),
        keywords: this.safeStringArray(data.keywords),
        authors: authors.filter(Boolean),
        year,
      },
      educational: {
        difficulty: 'advanced',
        estimatedReadingTime: 20,
        learningStage: 'research',
        prerequisites: this.safeStringArray(data.prerequisites),
        learningObjectives: this.safeStringArray(summaryObj.keyTakeaways),
        commonMisconceptions: [],
      },
      registry: {
        supportedDomains: ['vision'],
        supportedPerspectives: ['research', 'mathematics'],
      },
      relationships: {
        relatedObjects,
        prerequisiteObjects: [],
        successorObjects: [],
      },
      extensibility: {
        domainMetadata: {
          venue: data.venue || meta.venue || undefined,
          doi: data.doi || meta.doi || undefined,
          citationCount: typeof data.citationCount === 'number' ? data.citationCount : undefined,
        },
      },
    };
  }
}
