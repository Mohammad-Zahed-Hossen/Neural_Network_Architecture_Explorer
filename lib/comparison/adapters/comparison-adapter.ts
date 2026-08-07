import type { IKnowledgeRepository } from '../../knowledge/repository/repository';
import type { KnowledgeObject } from '../../knowledge/schema/knowledge-object.types';
import type { ComparisonMetric, ComparisonObject } from '../types';

export interface IComparisonAdapter {
  id: string;
  name: string;
  supports(obj: KnowledgeObject): boolean;
  adapt(obj: KnowledgeObject, repo?: IKnowledgeRepository): ComparisonObject;
  getComparableMetrics(obj: KnowledgeObject): ComparisonMetric[];
}

import { metricRegistry } from '../metric-registry';

/**
 * Base Helper to extract standard metrics from domain metadata
 */
function extractStandardMetrics(obj: KnowledgeObject): Record<string, number | string> {
  const meta = obj.extensibility.domainMetadata || {};
  const metrics: Record<string, number | string> = {};

  if (typeof meta.params === 'number') metrics.parameters = meta.params;
  if (typeof meta.parameters === 'number') metrics.parameters = meta.parameters;
  if (typeof meta.totalParameters === 'number') metrics.parameters = meta.totalParameters;

  if (typeof meta.flops === 'number') metrics.flops = meta.flops;
  if (typeof meta.totalFLOPs === 'number') metrics.flops = meta.totalFLOPs;

  if (typeof meta.accuracy === 'number') metrics.accuracy = meta.accuracy;
  if (typeof meta.top1Accuracy === 'number') metrics.accuracy = meta.top1Accuracy;

  if (typeof meta.top5Accuracy === 'number') metrics.top5Accuracy = meta.top5Accuracy;

  if (typeof meta.depth === 'number') metrics.depth = meta.depth;
  if (typeof meta.layers === 'number') metrics.depth = meta.layers;
  if (typeof meta.layerCount === 'number') metrics.depth = meta.layerCount;

  if (typeof meta.memory === 'number') metrics.memory = meta.memory;
  if (typeof meta.memoryUsage === 'number') metrics.memory = meta.memoryUsage;

  if (typeof meta.speed === 'number') metrics.speed = meta.speed;
  if (typeof meta.speedFps === 'number') metrics.speed = meta.speedFps;

  if (typeof meta.year === 'number') metrics.year = meta.year;
  if (typeof meta.paperYear === 'number') metrics.year = meta.paperYear;

  return metrics;
}

/**
 * Adapter for Architecture Models & Patterns
 */
export class ModelComparisonAdapter implements IComparisonAdapter {
  public readonly id = 'model-comparison-adapter';
  public readonly name = 'Model Architecture Adapter';

  public supports(obj: KnowledgeObject): boolean {
    return obj.identity.type === 'model';
  }

  public adapt(obj: KnowledgeObject, repo?: IKnowledgeRepository): ComparisonObject {
    const meta = obj.extensibility.domainMetadata || {};
    const metrics = extractStandardMetrics(obj);

    const related = repo ? repo.getRelatedObjects(obj.identity.id).map((o) => o.identity.title) : obj.relationships.relatedObjects;
    const prereqs = repo ? repo.getPrerequisites(obj.identity.id).map((o) => o.identity.title) : obj.relationships.prerequisiteObjects;
    const succs = repo ? repo.getSuccessors(obj.identity.id).map((o) => o.identity.title) : obj.relationships.successorObjects;

    return {
      id: obj.identity.id,
      slug: obj.identity.slug,
      title: obj.identity.title,
      type: obj.identity.type,
      domain: obj.registry.supportedDomains[0] || 'vision',
      summary: obj.metadata.summary,
      description: obj.metadata.description,
      metrics,
      relationships: {
        relatedObjects: related,
        prerequisites: prereqs,
        successors: succs,
      },
      trainingParams: {
        optimizer: meta.optimizer || 'SGD / Adam',
        learningRate: meta.learningRate || 0.001,
        batchSize: meta.batchSize || 64,
        epochs: meta.epochs || 100,
      },
      perspectives: {
        architecture: meta.blueprint || meta.math || obj.metadata.summary,
      },
      researchCitations: Array.isArray(meta.papers) ? meta.papers.map(String) : [],
      evolutionLineage: {
        predecessors: prereqs,
        successors: succs,
      },
      implementationDetails: {
        framework: meta.framework || 'PyTorch / TensorFlow',
        codeSnippet: meta.codeSnippet || '',
      },
      rawObject: obj,
    };
  }

  public getComparableMetrics(): ComparisonMetric[] {
    const ids = ['parameters', 'flops', 'accuracy', 'top5Accuracy', 'depth', 'memory', 'year'];
    return ids
      .map((id) => metricRegistry.get(id))
      .filter((def): def is NonNullable<typeof def> => def !== undefined)
      .map((def) => ({
        id: def.id,
        label: def.label,
        category: def.category,
        unit: def.unit,
        format: 'number',
        description: def.description,
        higherIsBetter: def.higherIsBetter,
      }));
  }
}

/**
 * Adapter for Architecture Patterns
 */
export class ArchitectureComparisonAdapter implements IComparisonAdapter {
  public readonly id = 'architecture-comparison-adapter';
  public readonly name = 'Architecture Pattern Adapter';

  public supports(obj: KnowledgeObject): boolean {
    return obj.identity.type === 'pattern';
  }

  public adapt(obj: KnowledgeObject, repo?: IKnowledgeRepository): ComparisonObject {
    const meta = obj.extensibility.domainMetadata || {};
    const metrics = extractStandardMetrics(obj);

    const related = repo ? repo.getRelatedObjects(obj.identity.id).map((o) => o.identity.title) : obj.relationships.relatedObjects;
    const prereqs = repo ? repo.getPrerequisites(obj.identity.id).map((o) => o.identity.title) : obj.relationships.prerequisiteObjects;
    const succs = repo ? repo.getSuccessors(obj.identity.id).map((o) => o.identity.title) : obj.relationships.successorObjects;

    return {
      id: obj.identity.id,
      slug: obj.identity.slug,
      title: obj.identity.title,
      type: obj.identity.type,
      domain: obj.registry.supportedDomains[0] || 'vision',
      summary: obj.metadata.summary,
      description: obj.metadata.description,
      metrics,
      relationships: {
        relatedObjects: related,
        prerequisites: prereqs,
        successors: succs,
      },
      trainingParams: {
        gradientImpact: meta.gradientImpact || 'High stability',
        parameterEfficiency: meta.parameterEfficiency || 'High',
      },
      perspectives: {
        formula: meta.math || '',
        designRationale: meta.solution || obj.metadata.description,
      },
      researchCitations: [],
      evolutionLineage: {
        predecessors: prereqs,
        successors: succs,
      },
      implementationDetails: {
        codeSnippet: meta.math || '',
      },
      rawObject: obj,
    };
  }

  public getComparableMetrics(): ComparisonMetric[] {
    return [
      { id: 'depth', label: 'Layer Depth Impact', category: 'Structure', unit: 'layers', format: 'count', description: 'Enables deeper networks', higherIsBetter: true },
      { id: 'parameters', label: 'Parameter Overhead', category: 'Efficiency', unit: '%', format: 'percentage', description: 'Additional parameters introduced', higherIsBetter: false },
    ];
  }
}

/**
 * Adapter for Training Concepts
 */
export class TrainingComparisonAdapter implements IComparisonAdapter {
  public readonly id = 'training-comparison-adapter';
  public readonly name = 'Training Concepts Adapter';

  public supports(obj: KnowledgeObject): boolean {
    return obj.identity.type === 'concept';
  }

  public adapt(obj: KnowledgeObject, repo?: IKnowledgeRepository): ComparisonObject {
    const meta = obj.extensibility.domainMetadata || {};
    const metrics = extractStandardMetrics(obj);

    const related = repo ? repo.getRelatedObjects(obj.identity.id).map((o) => o.identity.title) : obj.relationships.relatedObjects;
    const prereqs = repo ? repo.getPrerequisites(obj.identity.id).map((o) => o.identity.title) : obj.relationships.prerequisiteObjects;
    const succs = repo ? repo.getSuccessors(obj.identity.id).map((o) => o.identity.title) : obj.relationships.successorObjects;

    return {
      id: obj.identity.id,
      slug: obj.identity.slug,
      title: obj.identity.title,
      type: obj.identity.type,
      domain: obj.registry.supportedDomains[0] || 'training-dynamics',
      summary: obj.metadata.summary,
      description: obj.metadata.description,
      metrics,
      relationships: {
        relatedObjects: related,
        prerequisites: prereqs,
        successors: succs,
      },
      trainingParams: {
        stability: meta.stability || 'Medium',
        convergenceSpeed: meta.convergence || 'Standard',
      },
      perspectives: {
        formula: meta.formula || meta.math || '',
      },
      researchCitations: [],
      evolutionLineage: {
        predecessors: prereqs,
        successors: succs,
      },
      implementationDetails: {},
      rawObject: obj,
    };
  }

  public getComparableMetrics(): ComparisonMetric[] {
    return [
      { id: 'speed', label: 'Convergence Rate', category: 'Training', unit: 'x', format: 'number', description: 'Relative training acceleration', higherIsBetter: true },
      { id: 'memory', label: 'Memory Cost', category: 'Resources', unit: 'MB', format: 'bytes', description: 'State memory required', higherIsBetter: false },
    ];
  }
}

/**
 * Adapter for Research Papers
 */
export class PaperComparisonAdapter implements IComparisonAdapter {
  public readonly id = 'paper-comparison-adapter';
  public readonly name = 'Paper Comparison Adapter';

  public supports(obj: KnowledgeObject): boolean {
    return obj.identity.type === 'paper';
  }

  public adapt(obj: KnowledgeObject, repo?: IKnowledgeRepository): ComparisonObject {
    const meta = obj.extensibility.domainMetadata || {};
    const metrics = extractStandardMetrics(obj);

    const related = repo ? repo.getRelatedObjects(obj.identity.id).map((o) => o.identity.title) : obj.relationships.relatedObjects;
    const prereqs = repo ? repo.getPrerequisites(obj.identity.id).map((o) => o.identity.title) : obj.relationships.prerequisiteObjects;
    const succs = repo ? repo.getSuccessors(obj.identity.id).map((o) => o.identity.title) : obj.relationships.successorObjects;

    if (obj.metadata.year && !metrics.year) metrics.year = obj.metadata.year;
    if (typeof meta.citations === 'number') metrics.citations = meta.citations;

    return {
      id: obj.identity.id,
      slug: obj.identity.slug,
      title: obj.identity.title,
      type: obj.identity.type,
      domain: obj.registry.supportedDomains[0] || 'research',
      summary: obj.metadata.summary,
      description: obj.metadata.description,
      metrics,
      relationships: {
        relatedObjects: related,
        prerequisites: prereqs,
        successors: succs,
      },
      trainingParams: {},
      perspectives: {},
      researchCitations: obj.metadata.authors ? [obj.metadata.authors.join(', ')] : [],
      evolutionLineage: {
        predecessors: prereqs,
        successors: succs,
      },
      implementationDetails: {
        url: meta.url || '',
      },
      rawObject: obj,
    };
  }

  public getComparableMetrics(): ComparisonMetric[] {
    return [
      { id: 'year', label: 'Publication Year', category: 'Research', unit: '', format: 'count', description: 'Year of publication', higherIsBetter: true },
      { id: 'citations', label: 'Citations', category: 'Research', unit: '', format: 'count', description: 'Approximate academic citation count', higherIsBetter: true },
    ];
  }
}

/**
 * Adapter for Telemetry & Learning Curve Comparison
 */
export class LearningCurveComparisonAdapter implements IComparisonAdapter {
  public readonly id = 'learning-curve-comparison-adapter';
  public readonly name = 'Learning Curve Telemetry Adapter';

  public supports(): boolean {
    return true; // Generic fallback adapter
  }

  public adapt(obj: KnowledgeObject, repo?: IKnowledgeRepository): ComparisonObject {
    const defaultModelAdapter = new ModelAdapterFallback();
    return defaultModelAdapter.adapt(obj, repo);
  }

  public getComparableMetrics(): ComparisonMetric[] {
    return [
      { id: 'parameters', label: 'Parameters', category: 'Architecture', unit: 'M', format: 'number', description: 'Total trainable parameters in millions', higherIsBetter: false },
      { id: 'flops', label: 'FLOPs', category: 'Architecture', unit: 'GFLOPs', format: 'number', description: 'Floating point operations', higherIsBetter: false },
      { id: 'accuracy', label: 'Accuracy', category: 'Performance', unit: '%', format: 'percentage', description: 'Accuracy rating', higherIsBetter: true },
    ];
  }
}

class ModelAdapterFallback implements IComparisonAdapter {
  public readonly id = 'fallback-adapter';
  public readonly name = 'Fallback Adapter';
  public supports(): boolean { return true; }
  public adapt(obj: KnowledgeObject, repo?: IKnowledgeRepository): ComparisonObject {
    const metrics = extractStandardMetrics(obj);

    const related = repo ? repo.getRelatedObjects(obj.identity.id).map((o) => o.identity.title) : obj.relationships.relatedObjects;
    const prereqs = repo ? repo.getPrerequisites(obj.identity.id).map((o) => o.identity.title) : obj.relationships.prerequisiteObjects;
    const succs = repo ? repo.getSuccessors(obj.identity.id).map((o) => o.identity.title) : obj.relationships.successorObjects;

    return {
      id: obj.identity.id,
      slug: obj.identity.slug,
      title: obj.identity.title,
      type: obj.identity.type,
      domain: obj.registry.supportedDomains[0] || 'vision',
      summary: obj.metadata.summary,
      description: obj.metadata.description,
      metrics,
      relationships: {
        relatedObjects: related,
        prerequisites: prereqs,
        successors: succs,
      },
      trainingParams: {},
      perspectives: {},
      researchCitations: [],
      evolutionLineage: {
        predecessors: prereqs,
        successors: succs,
      },
      implementationDetails: {},
      rawObject: obj,
    };
  }
  public getComparableMetrics(): ComparisonMetric[] {
    return [];
  }
}

/**
 * Registry of Comparison Adapters
 */
export class ComparisonAdapterRegistry {
  private adapters: IComparisonAdapter[] = [];

  constructor() {
    this.register(new ModelComparisonAdapter());
    this.register(new ArchitectureComparisonAdapter());
    this.register(new TrainingComparisonAdapter());
    this.register(new PaperComparisonAdapter());
    this.register(new LearningCurveComparisonAdapter());
  }

  public register(adapter: IComparisonAdapter): void {
    this.adapters.unshift(adapter); // newest / specific adapters first
  }

  public getAdapter(obj: KnowledgeObject): IComparisonAdapter {
    const found = this.adapters.find((a) => a.supports(obj));
    return found || new LearningCurveComparisonAdapter();
  }
}

export const defaultComparisonAdapterRegistry = new ComparisonAdapterRegistry();
