import type { IKnowledgeRepository } from '../knowledge/repository/repository';
import type { KnowledgeObject } from '../knowledge/schema/knowledge-object.types';
import { ComparisonAdapterRegistry, defaultComparisonAdapterRegistry } from './adapters/comparison-adapter';
import type {
  ComparisonCategoryType,
  ComparisonDifference,
  ComparisonMetric,
  ComparisonMetricValue,
  ComparisonObject,
  ComparisonResult,
  ComparisonSection,
  ComparisonSimilarity,
} from './types';

/**
 * Pure TypeScript Comparison Engine
 * Domain-independent comparison generator for any set of KnowledgeObjects.
 */
export class ComparisonEngine {
  constructor(
    private readonly registry: ComparisonAdapterRegistry = defaultComparisonAdapterRegistry
  ) {}

  /**
   * Normalizes raw KnowledgeObjects into canonical ComparisonObjects.
   */
  public normalizeObjects(
    objects: readonly KnowledgeObject[],
    repo?: IKnowledgeRepository
  ): ComparisonObject[] {
    return objects.map((obj) => {
      const adapter = this.registry.getAdapter(obj);
      return adapter.adapt(obj, repo);
    });
  }

  /**
   * Compares quantitative metrics across normalized objects.
   */
  public compareMetrics(
    objects: readonly ComparisonObject[]
  ): {
    metrics: ComparisonMetric[];
    metricMatrix: Record<string, Record<string, ComparisonMetricValue>>;
  } {
    const metricMap = new Map<string, ComparisonMetric>();

    // Collect all metric definitions from adapters
    for (const compObj of objects) {
      const adapter = this.registry.getAdapter(compObj.rawObject);
      const adapterMetrics = adapter.getComparableMetrics(compObj.rawObject);
      for (const m of adapterMetrics) {
        if (!metricMap.has(m.id)) {
          metricMap.set(m.id, m);
        }
      }
    }

    // Default fallbacks if no specific metrics defined
    if (metricMap.size === 0) {
      metricMap.set('parameters', { id: 'parameters', label: 'Parameters', category: 'Architecture', unit: 'M', format: 'number', description: 'Trainable parameters', higherIsBetter: false });
      metricMap.set('flops', { id: 'flops', label: 'FLOPs', category: 'Architecture', unit: 'GFLOPs', format: 'number', description: 'Floating point operations', higherIsBetter: false });
      metricMap.set('accuracy', { id: 'accuracy', label: 'Accuracy', category: 'Performance', unit: '%', format: 'percentage', description: 'Top-1 Accuracy', higherIsBetter: true });
    }

    const metrics = Array.from(metricMap.values());
    const metricMatrix: Record<string, Record<string, ComparisonMetricValue>> = {};

    for (const metric of metrics) {
      metricMatrix[metric.id] = {};
      const numericValues: { objectId: string; val: number }[] = [];

      for (const compObj of objects) {
        const rawVal = compObj.metrics[metric.id];
        let formatted = 'N/A';
        let val: number | string = 'N/A';

        if (typeof rawVal === 'number') {
          val = rawVal;
          formatted = `${rawVal} ${metric.unit}`.trim();
          numericValues.push({ objectId: compObj.id, val: rawVal });
        } else if (typeof rawVal === 'string') {
          val = rawVal;
          formatted = rawVal;
        }

        metricMatrix[metric.id][compObj.id] = {
          value: val,
          formatted,
        };
      }

      // Compute relative status ('better' | 'worse' | 'neutral') for numeric metrics
      if (numericValues.length > 1 && metric.higherIsBetter !== undefined) {
        const sorted = [...numericValues].sort((a, b) => a.val - b.val);
        const bestVal = metric.higherIsBetter ? sorted[sorted.length - 1].val : sorted[0].val;
        const worstVal = metric.higherIsBetter ? sorted[0].val : sorted[sorted.length - 1].val;

        for (const compObj of objects) {
          const entry = metricMatrix[metric.id][compObj.id];
          if (typeof entry.value === 'number') {
            if (entry.value === bestVal && bestVal !== worstVal) {
              entry.status = 'better';
            } else if (entry.value === worstVal && bestVal !== worstVal) {
              entry.status = 'worse';
            } else {
              entry.status = 'neutral';
            }
          }
        }
      }
    }

    return { metrics, metricMatrix };
  }

  /**
   * Compares Knowledge Graph relationships.
   */
  public compareRelationships(
    objects: readonly ComparisonObject[]
  ): ComparisonSection {
    const differences: ComparisonDifference[] = [];
    const similarities: ComparisonSimilarity[] = [];

    // Find shared vs unique related objects
    const allRelatedSets = objects.map((o) => new Set(o.relationships.relatedObjects));
    const sharedRelated: string[] = [];

    if (allRelatedSets.length > 0) {
      const firstSet = allRelatedSets[0];
      for (const item of firstSet) {
        if (allRelatedSets.every((s) => s.has(item))) {
          sharedRelated.push(item);
        }
      }
    }

    if (sharedRelated.length > 0) {
      similarities.push({
        feature: 'Shared Graph Connections',
        category: 'Relationships',
        value: sharedRelated,
        description: `All entities share connections to: ${sharedRelated.join(', ')}`,
      });
    }

    const relDiffs: Record<string, unknown> = {};
    for (const obj of objects) {
      relDiffs[obj.id] = `${obj.relationships.relatedObjects.length} related entities (${obj.relationships.relatedObjects.slice(0, 3).join(', ') || 'None'})`;
    }

    differences.push({
      feature: 'Related Entity Topology',
      category: 'Relationships',
      values: relDiffs,
      impact: 'Highlights differences in structural and domain graph positioning.',
    });

    return {
      id: 'relationships',
      title: 'Knowledge Graph Relationships',
      summary: 'Comparison of shared connections, prerequisite concepts, and evolutionary successors.',
      differences,
      similarities,
    };
  }

  /**
   * Compares Perspectives across entities.
   */
  public comparePerspectives(
    objects: readonly ComparisonObject[]
  ): ComparisonSection {
    const differences: ComparisonDifference[] = [];
    const similarities: ComparisonSimilarity[] = [];

    const persDiffs: Record<string, unknown> = {};
    for (const obj of objects) {
      persDiffs[obj.id] = obj.perspectives.architecture || obj.summary;
    }

    differences.push({
      feature: 'Architectural Blueprint / Formulation',
      category: 'Perspectives',
      values: persDiffs,
      impact: 'Contrasts underlying computational blueprints and structural equations.',
    });

    return {
      id: 'perspectives',
      title: 'Multiperspective Analysis',
      summary: 'Direct contrast of design goals, advantages, limitations, and mathematical formulation.',
      differences,
      similarities,
    };
  }

  /**
   * Compares Training Dynamics & Hyperparameters.
   */
  public compareTraining(
    objects: readonly ComparisonObject[]
  ): ComparisonSection {
    const differences: ComparisonDifference[] = [];
    const similarities: ComparisonSimilarity[] = [];

    const trainDiffs: Record<string, unknown> = {};
    for (const obj of objects) {
      const p = obj.trainingParams;
      trainDiffs[obj.id] = `Optimizer: ${p.optimizer || 'Standard'}, Stability: ${p.stability || 'Normal'}`;
    }

    differences.push({
      feature: 'Training Stability & Hyperparameters',
      category: 'Training',
      values: trainDiffs,
      impact: 'Illustrates how optimization dynamics vary between entities.',
    });

    return {
      id: 'training',
      title: 'Training Dynamics & Optimization',
      summary: 'Analysis of optimization strategies, gradient propagation, and learning dynamics.',
      differences,
      similarities,
    };
  }

  /**
   * Compares Evolutionary Lineage.
   */
  public compareEvolution(
    objects: readonly ComparisonObject[]
  ): ComparisonSection {
    const differences: ComparisonDifference[] = [];
    const similarities: ComparisonSimilarity[] = [];

    const evoDiffs: Record<string, unknown> = {};
    for (const obj of objects) {
      const pred = obj.evolutionLineage.predecessors.join(', ') || 'Ancestral baseline';
      const succ = obj.evolutionLineage.successors.join(', ') || 'Current state';
      evoDiffs[obj.id] = `Evolved from [${pred}] → Inspires [${succ}]`;
    }

    differences.push({
      feature: 'Evolutionary Trajectory',
      category: 'Evolution',
      values: evoDiffs,
      impact: 'Traces chronological improvements and architectural breakthroughs.',
    });

    return {
      id: 'evolution',
      title: 'Evolutionary Lineage & Timeline',
      summary: 'Chronological progression showing predecessors and downstream successors.',
      differences,
      similarities,
    };
  }

  /**
   * Compares Implementation Details.
   */
  public compareImplementation(
    objects: readonly ComparisonObject[]
  ): ComparisonSection {
    const differences: ComparisonDifference[] = [];
    const similarities: ComparisonSimilarity[] = [];

    const implDiffs: Record<string, unknown> = {};
    for (const obj of objects) {
      implDiffs[obj.id] = obj.implementationDetails.framework || 'Standard Framework';
    }

    differences.push({
      feature: 'Implementation Architecture',
      category: 'Implementation',
      values: implDiffs,
      impact: 'Compares practical implementation patterns and code structures.',
    });

    return {
      id: 'implementation',
      title: 'Implementation & Reference Code',
      summary: 'Code structures, code snippets, and framework implementations.',
      differences,
      similarities,
    };
  }

  /**
   * Generates a complete canonical ComparisonResult for any set of KnowledgeObjects.
   */
  public generateComparisonModel(
    objects: readonly KnowledgeObject[],
    category: ComparisonCategoryType = 'architecture',
    repo?: IKnowledgeRepository
  ): ComparisonResult {
    const compObjects = this.normalizeObjects(objects, repo);
    const { metrics, metricMatrix } = this.compareMetrics(compObjects);

    const relSection = this.compareRelationships(compObjects);
    const persSection = this.comparePerspectives(compObjects);
    const trainSection = this.compareTraining(compObjects);
    const evoSection = this.compareEvolution(compObjects);
    const implSection = this.compareImplementation(compObjects);

    const sections = [relSection, persSection, trainSection, evoSection, implSection];

    const keySimilarities: ComparisonSimilarity[] = [];
    const keyDifferences: ComparisonDifference[] = [];

    for (const sec of sections) {
      keySimilarities.push(...sec.similarities);
      keyDifferences.push(...sec.differences);
    }

    // Telemetry Learning Curve configuration for visualizer framework
    const palette = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const presets = compObjects.map((obj, i) => ({
      objectId: obj.id,
      title: obj.title,
      color: palette[i % palette.length],
      metrics: {
        loss: typeof obj.metrics.loss === 'number' ? obj.metrics.loss : 0.25 + i * 0.05,
        accuracy: typeof obj.metrics.accuracy === 'number' ? obj.metrics.accuracy : 85 + i * 2,
        learningRate: 0.001,
      },
    }));

    return {
      category,
      objects: compObjects,
      metrics,
      metricMatrix,
      sections,
      keySimilarities,
      keyDifferences,
      learningCurveConfig: {
        pluginId: 'learning-curve',
        presets,
      },
      comparedAt: new Date().toISOString(),
    };
  }
}

export const defaultComparisonEngine = new ComparisonEngine();
