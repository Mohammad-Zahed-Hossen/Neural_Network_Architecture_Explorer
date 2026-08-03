# Perspective Contracts Specification

**Document Version:** 1.0.0  
**Status:** Canonical Perspective Contract Specification  
**Target Path:** `doc/architecture/perspective-schemas.md`  
**Phase:** Phase 1.2 Perspective Contracts  

---

## 1. Overview & Purpose

**Perspective Contracts** establish reusable, Zod-validated data schemas for inspecting Knowledge Objects through different educational viewpoints.

Located in `lib/knowledge/perspectives/`, each perspective contract extends a shared `BasePerspectiveSchema` and composes reusable section blocks (`ReferenceSection`, `MetadataSection`, `ResourceSection`, `TimelineSection`).

---

## 2. Shared Base Contract (`BasePerspectiveSchema`)

All perspectives inherit from `BasePerspectiveSchema`:

```ts
export const BasePerspectiveSchema = z.object({
  perspective: z.string(),
  version: z.string().default('1.0.0'),
  summary: z.string(),
  sections: z.array(SectionBlockSchema),
  references: ReferenceSectionSchema,
  metadata: MetadataSectionSchema,
});
```

---

## 3. The 6 Educational Perspectives

1. **`ArchitecturePerspectiveSchema`** (`perspective: 'architecture'`):
   - Design goals, core components, information flow, advantages, limitations, tradeoffs, resource links.
2. **`TrainingPerspectiveSchema`** (`perspective: 'training'`):
   - Optimization, gradient behavior, stability, normalization, loss functions, training strategies.
3. **`ImplementationPerspectiveSchema`** (`perspective: 'implementation'`):
   - Framework support, deployment targets, hardware specs, memory bounds, code examples, resource links.
4. **`EvolutionPerspectiveSchema`** (`perspective: 'evolution'`):
   - Predecessor and successor links, historical context, timeline events.
5. **`ResearchPerspectiveSchema`** (`perspective: 'research'`):
   - Academic papers, citations, research gaps, future directions, open problems.
6. **`MathematicsPerspectiveSchema`** (`perspective: 'mathematics'`):
   - Formal equations, symbol notation dictionary, proof ideas, derivations, computational complexity, assumptions.

---

## 4. Section Composition Model

Perspectives reuse standardized section contracts (`lib/knowledge/perspectives/sections/`):
- `ReferenceSectionSchema`: Academic citations & URLs
- `MetadataSectionSchema`: Arbitrary key-value metadata
- `ResourceSectionSchema`: External code, weights, paper assets
- `TimelineSectionSchema`: Historical progression events
