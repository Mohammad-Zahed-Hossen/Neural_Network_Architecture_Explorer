import type { KnowledgeObject } from '../schema/knowledge-object.types';
import { BaseKnowledgeAdapter } from './base-adapter';

interface RawTransformerData {
  id: string;
  name: string;
  slug: string;
  type: string;
  domain?: string;
  summary: string;
  description: string;
  math?: string;
  problem?: string;
  solution?: string;
  tradeoffs?: { pros?: string[]; cons?: string[] };
  params?: number;
  flops?: number;
  accuracy?: number;
  depth?: number;
  memory?: number;
  speed?: number;
  year?: number;
  prerequisiteObjects?: string[];
  successorObjects?: string[];
  relatedObjects?: string[];
  papers?: string[];
  codeSnippet?: string;
  [key: string]: unknown;
}

export class TransformerAdapter extends BaseKnowledgeAdapter<RawTransformerData> {
  public readonly adapterType = 'TransformerAdapter';

  public supports(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const d = data as RawTransformerData;
    if (d.domain === 'transformer') return true;
    if (typeof d.id === 'string' && d.id.startsWith('transformer:')) return true;
    return false;
  }

  protected transform(data: RawTransformerData): Partial<KnowledgeObject> {
    const rawId = data.id.includes(':') ? data.id.split(':')[1] : data.id;
    const id = `transformer:${rawId}`;
    const slug = data.slug || this.normalizeSlug(rawId);

    const typeStr = data.type || 'pattern';
    const validTypes = ['model', 'paper', 'pattern', 'concept', 'algorithm', 'implementation'];
    const type = (validTypes.includes(typeStr) ? typeStr : 'pattern') as KnowledgeObject['identity']['type'];

    const pros = Array.isArray(data.tradeoffs?.pros) ? data.tradeoffs!.pros! : [];
    const cons = Array.isArray(data.tradeoffs?.cons) ? data.tradeoffs!.cons! : [];

    return {
      identity: {
        id,
        slug,
        title: data.name || rawId,
        aliases: [data.name],
        type,
        status: 'stable',
      },
      metadata: {
        summary: data.summary || data.problem || 'Transformer block concept.',
        description: data.description || data.solution || 'Transformer architecture layer.',
        tags: ['transformer', 'self-attention', 'sequence', 'deep-learning'],
        keywords: ['attention', 'transformer', 'encoder', 'decoder', 'multi-head'],
        authors: Array.isArray(data.papers) ? data.papers : ['Vaswani et al.'],
        year: data.year || 2017,
      },
      educational: {
        difficulty: 'advanced',
        estimatedReadingTime: 12,
        learningStage: 'advanced',
        prerequisites: this.safeStringArray(data.prerequisiteObjects),
        learningObjectives: ['Understand self-attention math', 'Analyze Transformer block layers'],
        commonMisconceptions: ['Transformers require recurrence for sequences'],
      },
      registry: {
        supportedDomains: ['transformer', 'vision'],
        supportedPerspectives: ['architecture', 'training', 'mathematics', 'research', 'evolution', 'implementation'],
      },
      relationships: {
        relatedObjects: this.safeStringArray(data.relatedObjects),
        prerequisiteObjects: this.safeStringArray(data.prerequisiteObjects),
        successorObjects: this.safeStringArray(data.successorObjects),
      },
      extensibility: {
        domainMetadata: {
          math: data.math || '',
          problem: data.problem || '',
          solution: data.solution || '',
          tradeoffs: { pros, cons },
          params: data.params || 0,
          flops: data.flops || 0,
          accuracy: data.accuracy || 0,
          depth: data.depth || 1,
          memory: data.memory || 50,
          speed: data.speed || 500,
          year: data.year || 2017,
          papers: data.papers || [],
          codeSnippet: data.codeSnippet || '',
        },
      },
    };
  }
}
