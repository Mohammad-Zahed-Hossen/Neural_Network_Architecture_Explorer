import type { KnowledgeObject } from '../schema/knowledge-object.types';
import { BaseKnowledgeAdapter } from './base-adapter';

interface RawGraphAlgorithmData {
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
  year?: number | string;
  prerequisiteObjects?: string[];
  successorObjects?: string[];
  relatedObjects?: string[];
  papers?: string[];
  codeSnippet?: string;
  [key: string]: unknown;
}

export class GraphAlgorithmAdapter extends BaseKnowledgeAdapter<RawGraphAlgorithmData> {
  public readonly adapterType = 'GraphAlgorithmAdapter';

  public supports(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const d = data as RawGraphAlgorithmData;
    if (d.domain === 'graph-algorithms') return true;
    if (typeof d.id === 'string' && d.id.startsWith('graph:')) return true;
    return false;
  }

  protected transform(data: RawGraphAlgorithmData): Partial<KnowledgeObject> {
    const rawId = data.id.includes(':') ? data.id.split(':')[1] : data.id;
    const id = `graph:${rawId}`;
    const slug = data.slug || this.normalizeSlug(rawId);

    const typeStr = data.type || 'algorithm';
    const validTypes = ['model', 'paper', 'pattern', 'concept', 'algorithm', 'implementation'];
    const type = (validTypes.includes(typeStr) ? typeStr : 'algorithm') as KnowledgeObject['identity']['type'];

    const pros = Array.isArray(data.tradeoffs?.pros) ? data.tradeoffs!.pros! : [];
    const cons = Array.isArray(data.tradeoffs?.cons) ? data.tradeoffs!.cons! : [];
    const yearNum = typeof data.year === 'number' ? data.year : 1960;

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
        summary: data.summary || data.problem || 'Classical graph algorithm concept.',
        description: data.description || data.solution || 'Graph traversal and optimization algorithm.',
        tags: ['graph-algorithm', 'traversal', 'shortest-path', 'graph-theory'],
        keywords: ['graph', 'algorithm', 'bfs', 'dfs', 'dijkstra', 'topology'],
        authors: Array.isArray(data.papers) ? data.papers : ['Classical Computer Science'],
        year: yearNum,
      },
      educational: {
        difficulty: 'intermediate',
        estimatedReadingTime: 10,
        learningStage: 'core',
        prerequisites: this.safeStringArray(data.prerequisiteObjects),
        learningObjectives: ['Master graph traversal complexity', 'Analyze state transitions'],
        commonMisconceptions: ['BFS handles negative edge weights'],
      },
      registry: {
        supportedDomains: ['graph-algorithms', 'classical-ml'],
        supportedPerspectives: ['architecture', 'mathematics', 'research', 'implementation'],
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
          accuracy: data.accuracy || 100,
          depth: data.depth || 1,
          memory: data.memory || 20,
          speed: data.speed || 5000,
          year: yearNum,
          papers: data.papers || [],
          codeSnippet: data.codeSnippet || '',
        },
      },
    };
  }
}
