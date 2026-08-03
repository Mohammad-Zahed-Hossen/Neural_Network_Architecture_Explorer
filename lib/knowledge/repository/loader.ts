import trainingJson from '@/data/concepts/training-dynamics.json';
import modelsJson from '@/data/models.json';
import papersJson from '@/data/papers.json';
import patternsJson from '@/data/patterns.json';
import transformersJson from '@/data/transformers.json';
import graphAlgorithmsJson from '@/data/graph-algorithms.json';

/**
 * Interface for loading raw legacy data files/objects.
 * Decouples file-system / network I/O from KnowledgeRepository.
 */
export interface IRawDataLoader {
  loadModelSummaries(): readonly unknown[];
  loadPaperSummaries(): readonly unknown[];
  loadTrainingConcepts(): readonly unknown[];
  loadArchitecturePatterns(): readonly unknown[];
  loadAllRawData(): readonly unknown[];
}

/**
 * Memory-backed raw data loader for testing or injected datasets.
 */
export class InMemoryRawDataLoader implements IRawDataLoader {
  constructor(private readonly rawItems: readonly unknown[] = []) {}

  public loadModelSummaries(): readonly unknown[] {
    return this.rawItems;
  }

  public loadPaperSummaries(): readonly unknown[] {
    return this.rawItems;
  }

  public loadTrainingConcepts(): readonly unknown[] {
    return this.rawItems;
  }

  public loadArchitecturePatterns(): readonly unknown[] {
    return this.rawItems;
  }

  public loadAllRawData(): readonly unknown[] {
    return this.rawItems;
  }
}

/**
 * Static file data loader reading local data files from disk.
 */
export class StaticFileRawDataLoader implements IRawDataLoader {
  private readonly projectRoot: string;

  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  private readJsonFile(relativePath: string): unknown {
    if (typeof window !== 'undefined') {
      return null;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      const fullPath = path.join(this.projectRoot, relativePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  public loadModelSummaries(): readonly unknown[] {
    const data = this.readJsonFile('data/models.json');
    if (Array.isArray(data) && data.length > 0) return data;
    return Array.isArray(modelsJson) ? modelsJson : [];
  }

  public loadPaperSummaries(): readonly unknown[] {
    const data = this.readJsonFile('data/papers.json');
    if (Array.isArray(data) && data.length > 0) return data;
    return Array.isArray(papersJson) ? papersJson : [];
  }

  public loadTrainingConcepts(): readonly unknown[] {
    const data = this.readJsonFile('data/concepts/training-dynamics.json');
    if (Array.isArray(data) && data.length > 0) return data;
    return Array.isArray(trainingJson) ? trainingJson : [];
  }

  public loadArchitecturePatterns(): readonly unknown[] {
    const data = this.readJsonFile('data/patterns.json');
    if (Array.isArray(data) && data.length > 0) return data;
    return Array.isArray(patternsJson) ? patternsJson : [];
  }

  public loadTransformers(): readonly unknown[] {
    const data = this.readJsonFile('data/transformers.json');
    if (Array.isArray(data) && data.length > 0) return data;
    return Array.isArray(transformersJson) ? transformersJson : [];
  }

  public loadGraphAlgorithms(): readonly unknown[] {
    const data = this.readJsonFile('data/graph-algorithms.json');
    if (Array.isArray(data) && data.length > 0) return data;
    return Array.isArray(graphAlgorithmsJson) ? graphAlgorithmsJson : [];
  }

  public loadAllRawData(): readonly unknown[] {
    return [
      ...this.loadModelSummaries(),
      ...this.loadPaperSummaries(),
      ...this.loadTrainingConcepts(),
      ...this.loadArchitecturePatterns(),
      ...this.loadTransformers(),
      ...this.loadGraphAlgorithms(),
    ];
  }
}
