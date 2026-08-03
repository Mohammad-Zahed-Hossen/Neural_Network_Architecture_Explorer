import type { z } from 'zod';
import type {
  EducationalMetadataSchema,
  ExtensibilitySchema,
  IdentitySchema,
  KnowledgeObjectSchema,
  MetadataSchema,
  RegistryIntegrationSchema,
  RelationshipMetadataSchema,
} from './knowledge-object.schema';

export type {
  DifficultyLevel,
  KnowledgeObjectStatus,
  KnowledgeObjectType,
  LearningStage,
} from './knowledge-object.constants';

export type Identity = z.infer<typeof IdentitySchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type EducationalMetadata = z.infer<typeof EducationalMetadataSchema>;
export type RegistryIntegration = z.infer<typeof RegistryIntegrationSchema>;
export type RelationshipMetadata = z.infer<typeof RelationshipMetadataSchema>;
export type Extensibility = z.infer<typeof ExtensibilitySchema>;
export type KnowledgeObject = z.infer<typeof KnowledgeObjectSchema>;
