import { IKnowledgeRepository, knowledgeRepository } from '../knowledge/repository/repository';
import type { KnowledgeObject } from '../knowledge/schema/knowledge-object.types';
import { ComparisonEngine, defaultComparisonEngine } from './comparison-engine';
import type { ComparisonCategoryType, ComparisonMetric, ComparisonResult } from './types';

/**
 * Pure TypeScript Repository-backed Comparison Service
 */
export class ComparisonService {
  constructor(
    private readonly repository: IKnowledgeRepository = knowledgeRepository,
    private readonly engine: ComparisonEngine = defaultComparisonEngine
  ) {}

  /**
   * Compares arbitrary objects by IDs.
   */
  public compareObjects(ids: string[], category: ComparisonCategoryType = 'architecture'): ComparisonResult {
    const objects: KnowledgeObject[] = [];
    for (const id of ids) {
      const obj = this.repository.getKnowledgeObject(id);
      if (obj) objects.push(obj);
    }

    // Fallback if none found or less than 2
    if (objects.length === 0) {
      const all = this.repository.getKnowledgeObjects();
      objects.push(...all.slice(0, 2));
    }

    return this.engine.generateComparisonModel(objects, category, this.repository);
  }

  /**
   * Compares architecture objects (models, patterns).
   */
  public compareArchitectures(ids: string[]): ComparisonResult {
    return this.compareObjects(ids, 'architecture');
  }

  /**
   * Compares training concepts & optimization methods.
   */
  public compareTraining(ids: string[]): ComparisonResult {
    return this.compareObjects(ids, 'training');
  }

  /**
   * Compares research papers and citation metrics.
   */
  public compareResearch(ids: string[]): ComparisonResult {
    return this.compareObjects(ids, 'research');
  }

  /**
   * Compares evolutionary lineages.
   */
  public compareEvolution(ids: string[]): ComparisonResult {
    return this.compareObjects(ids, 'evolution');
  }

  /**
   * Compares implementation details.
   */
  public compareImplementations(ids: string[]): ComparisonResult {
    return this.compareObjects(ids, 'implementation');
  }

  /**
   * Returns all comparable objects available in the repository for a given category.
   */
  public getComparableObjects(category?: ComparisonCategoryType): readonly KnowledgeObject[] {
    const all = this.repository.getKnowledgeObjects();
    if (!category || category === 'all' || category === 'architecture') {
      return all;
    }
    if (category === 'models') {
      return this.repository.getObjectsByType('model');
    }
    if (category === 'patterns') {
      return this.repository.getObjectsByType('pattern');
    }
    if (category === 'training' || category === 'concepts') {
      return this.repository.getObjectsByType('concept');
    }
    if (category === 'papers' || category === 'research') {
      return this.repository.getObjectsByType('paper');
    }
    return all;
  }

  /**
   * Returns supported metrics for a given comparison category.
   */
  public getComparisonMetrics(category?: ComparisonCategoryType): ComparisonMetric[] {
    const sampleObjects = this.getComparableObjects(category).slice(0, 2);
    if (sampleObjects.length === 0) return [];
    const normalized = this.engine.normalizeObjects(sampleObjects, this.repository);
    return this.engine.compareMetrics(normalized).metrics;
  }
}

export const comparisonService = new ComparisonService();
