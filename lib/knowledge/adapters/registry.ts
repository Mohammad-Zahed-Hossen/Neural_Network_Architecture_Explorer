import type { KnowledgeObject } from '../schema/knowledge-object.types';
import type { IKnowledgeAdapter } from './adapter-types';
import { ModelAdapter } from './model-adapter';
import { PaperAdapter } from './paper-adapter';
import { PatternAdapter } from './pattern-adapter';
import { TrainingAdapter } from './training-adapter';
import { TransformerAdapter } from './transformer-adapter';
import { GraphAlgorithmAdapter } from './graph-algorithm-adapter';

export class AdapterRegistry {
  private readonly adapters: IKnowledgeAdapter[] = [];

  constructor() {
    // Register canonical adapters in priority order
    this.registerAdapter(new TransformerAdapter());
    this.registerAdapter(new GraphAlgorithmAdapter());
    this.registerAdapter(new ModelAdapter());
    this.registerAdapter(new PaperAdapter());
    this.registerAdapter(new PatternAdapter());
    this.registerAdapter(new TrainingAdapter());
  }

  public registerAdapter(adapter: IKnowledgeAdapter): void {
    this.adapters.push(adapter);
  }

  public getAdapters(): readonly IKnowledgeAdapter[] {
    return this.adapters;
  }

  public findAdapterForData(data: unknown): IKnowledgeAdapter | undefined {
    return this.adapters.find((adapter) => adapter.supports(data));
  }

  public convert(data: unknown): KnowledgeObject {
    const adapter = this.findAdapterForData(data);
    if (!adapter) {
      throw new Error(`[AdapterRegistryError] No suitable adapter found for dataset object.`);
    }
    return adapter.toKnowledgeObject(data);
  }

  public convertAll(dataArray: readonly unknown[]): KnowledgeObject[] {
    const results: KnowledgeObject[] = [];
    for (const item of dataArray) {
      try {
        results.push(this.convert(item));
      } catch (err) {
        // Skip unconvertible objects or handle gracefully
        console.warn(`[AdapterRegistry] Skipping object during convertAll: ${(err as Error).message}`);
      }
    }
    return results;
  }
}

export const defaultAdapterRegistry = new AdapterRegistry();
