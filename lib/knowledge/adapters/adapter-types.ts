import type { KnowledgeObject } from '../schema/knowledge-object.types';

/**
 * Common Adapter Interface for legacy data translation.
 */
export interface IKnowledgeAdapter<T = unknown> {
  readonly adapterType: string;
  supports(data: unknown): boolean;
  toKnowledgeObject(data: T): KnowledgeObject;
}

export interface AdapterConversionResult {
  readonly success: boolean;
  readonly object?: KnowledgeObject;
  readonly error?: string;
}
