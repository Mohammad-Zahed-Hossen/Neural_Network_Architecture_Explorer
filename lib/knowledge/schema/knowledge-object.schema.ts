import { z } from 'zod';
import {
  DIFFICULTY_LEVELS,
  KNOWLEDGE_OBJECT_TYPES,
  LEARNING_STAGES,
  OBJECT_STATUSES,
} from './knowledge-object.constants';

/**
 * Identity section for a Canonical Knowledge Object.
 */
export const IdentitySchema = z.object({
  id: z.string().min(1, 'ID must be non-empty'),
  slug: z.string().min(1, 'Slug must be non-empty'),
  title: z.string().min(1, 'Title must be non-empty'),
  aliases: z.array(z.string()).default([]),
  type: z.enum(KNOWLEDGE_OBJECT_TYPES),
  status: z.enum(OBJECT_STATUSES).default('stable'),
});

/**
 * Descriptive metadata section.
 */
export const MetadataSchema = z.object({
  summary: z.string().min(1, 'Summary must be non-empty'),
  description: z.string().min(1, 'Description must be non-empty'),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  authors: z.array(z.string()).optional(),
  year: z.number().int().optional(),
});

/**
 * Educational metadata section.
 */
export const EducationalMetadataSchema = z.object({
  difficulty: z.enum(DIFFICULTY_LEVELS).default('intermediate'),
  estimatedReadingTime: z.number().int().positive().optional(),
  learningStage: z.enum(LEARNING_STAGES).default('core'),
  prerequisites: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
  commonMisconceptions: z.array(z.string()).default([]),
});

/**
 * Registry Integration section referencing Phase 0 registry IDs.
 */
export const RegistryIntegrationSchema = z.object({
  supportedDomains: z.array(z.string()).min(1, 'At least one domain must be supported'),
  supportedPerspectives: z.array(z.string()).min(1, 'At least one perspective must be supported'),
});

/**
 * Normalized relationship metadata section.
 */
export const RelationshipMetadataSchema = z.object({
  relatedObjects: z.array(z.string()).default([]),
  prerequisiteObjects: z.array(z.string()).default([]),
  successorObjects: z.array(z.string()).default([]),
});

/**
 * Structured domain-specific extensibility metadata.
 */
export const ExtensibilitySchema = z.object({
  domainMetadata: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Complete Zod Schema for a Canonical Knowledge Object (CKO).
 */
export const KnowledgeObjectSchema = z.object({
  identity: IdentitySchema,
  metadata: MetadataSchema,
  educational: EducationalMetadataSchema,
  registry: RegistryIntegrationSchema,
  relationships: RelationshipMetadataSchema,
  extensibility: ExtensibilitySchema,
});
