import { KnowledgeObjectSchema } from '../schema/knowledge-object.schema';
import type { KnowledgeObject } from '../schema/knowledge-object.types';
import type { IKnowledgeAdapter } from './adapter-types';

/**
 * Abstract Base Class for Knowledge Adapters.
 * Enforces pure deterministic translation from legacy data structures to Canonical Knowledge Objects.
 */
export abstract class BaseKnowledgeAdapter<T = Record<string, unknown>>
  implements IKnowledgeAdapter<T>
{
  public abstract readonly adapterType: string;

  /**
   * Determine whether this adapter supports the provided input object.
   */
  public abstract supports(data: unknown): boolean;

  /**
   * Domain-specific transformation logic implemented by concrete adapters.
   */
  protected abstract transform(data: T): Partial<KnowledgeObject>;

  /**
   * Translates legacy data into a validated Canonical Knowledge Object.
   */
  public toKnowledgeObject(data: T): KnowledgeObject {
    if (!data || typeof data !== 'object') {
      throw new Error(`[AdapterError:${this.adapterType}] Invalid input data: expected object.`);
    }

    const partial = this.transform(data);

    // Validate transformed result against KnowledgeObjectSchema
    const parseResult = KnowledgeObjectSchema.safeParse(partial);

    if (!parseResult.success) {
      const issueMsgs = parseResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      throw new Error(
        `[AdapterError:${this.adapterType}] Transformation failed Zod schema validation: ${issueMsgs}`
      );
    }

    return parseResult.data;
  }

  /**
   * Helper to normalize slugs from string IDs or titles.
   */
  protected normalizeSlug(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper to safely extract string array from legacy properties.
   */
  protected safeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return [value.trim()];
    }
    return [];
  }
}
