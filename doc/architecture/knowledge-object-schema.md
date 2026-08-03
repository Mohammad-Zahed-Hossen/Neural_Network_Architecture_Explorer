# Canonical Knowledge Object Schema Specification

**Document Version:** 1.0.0  
**Status:** Canonical Knowledge Model Specification  
**Target Path:** `doc/architecture/knowledge-object-schema.md`  
**Phase:** Phase 1.1 Knowledge Object Schema  

---

## 1. Overview & Purpose

The **Canonical Knowledge Object (CKO)** is the unified semantic model for the Neural Network Architecture Explorer platform.

Prior to Phase 1, entity structures across models, research papers, training concepts, architecture patterns, and timeline nodes existed as disparate, un-unified Zod schemas.

The Knowledge Object abstraction unifies all educational entities under a single, strongly typed, Zod-validated schema (`lib/knowledge/schema/knowledge-object.schema.ts`).

### Core Design Guarantees
1. **Semantic Foundation Only:** Describes identity, metadata, educational objectives, registry links, and relationships. Contains zero UI components, JSX, canvas renders, or graph layout coordinates.
2. **Registry Decoupling:** References Phase 0 registries (`DomainId`, `PerspectiveId`) by string identifiers only.
3. **Structured Extensibility:** Employs a strongly typed `domainMetadata` record to accommodate future domain-specific properties without resorting to `any`.
4. **Canonical Vocabulary:** Standardizes global enums for object types, difficulty levels, status flags, and learning stages.

---

## 2. Canonical Vocabulary

Located in `lib/knowledge/schema/knowledge-object.constants.ts`:

### 2.1 Object Types (`KnowledgeObjectType`)
- `model`, `paper`, `pattern`, `concept`, `implementation`, `dataset`, `algorithm`, `loss-function`, `optimizer`, `layer`, `operation`, `training-technique`, `evaluation`, `benchmark`, `timeline-event`

### 2.2 Difficulty Levels (`DifficultyLevel`)
- `beginner`, `intermediate`, `advanced`

### 2.3 Status Flags (`KnowledgeObjectStatus`)
- `stable`, `experimental`, `deprecated`, `planned`

### 2.4 Learning Stages (`LearningStage`)
- `foundation`, `core`, `advanced`, `research`

---

## 3. Schema Structure

A Canonical Knowledge Object comprises 6 core sections:

```ts
export const KnowledgeObjectSchema = z.object({
  identity: IdentitySchema,       // id, slug, title, aliases, type, status
  metadata: MetadataSchema,       // summary, description, tags, keywords, authors, year
  educational: EducationalMetadataSchema, // difficulty, reading time, stage, objectives
  registry: RegistryIntegrationSchema,    // supportedDomains, supportedPerspectives
  relationships: RelationshipMetadataSchema, // related, prerequisites, successors
  extensibility: ExtensibilitySchema,     // domainMetadata
});
```

---

## 4. Public API & File Locations

- **Constants & Vocabulary:** `lib/knowledge/schema/knowledge-object.constants.ts`
- **Zod Schemas:** `lib/knowledge/schema/knowledge-object.schema.ts`
- **Inferred Types:** `lib/knowledge/schema/knowledge-object.types.ts`
- **Barrel Export:** `lib/knowledge/index.ts`
