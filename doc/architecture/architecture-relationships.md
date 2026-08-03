# Phase 2.4 — Architecture Relationships Technical Specification

## Executive Summary

Phase 2.4 integrates **Architecture Pattern Knowledge Objects** with the platform's existing **Knowledge Graph**, **Evolution Timeline**, and **Research Knowledge System**.

Rather than maintaining separate relationship data files (`patternEvolution.json`, `pattern-papers.json`), relationships are declared cleanly inside canonical Knowledge Objects (`data/patterns.json`) via `PatternAdapter` and queried through `IKnowledgeRepository`.

---

## Relationship Data Flow

```text
data/patterns.json (Raw Pattern Data)
        │
        ▼
PatternAdapter (lib/knowledge/adapters/pattern-adapter.ts)
        │
        ▼
IKnowledgeRepository (lib/knowledge/repository/repository.ts)
        │
 ┌──────┴───────────────┬────────────────────────┬───────────────────────┐
 ▼                      ▼                        ▼                       ▼
getRelatedObjects()   getPatternEvolution()    getPatternResearch()     getPerspective()
 (Models & Papers)     (Pre/Successors)         (Paper KOs)             (Architecture)
        │                      │                        │                       │
        └──────────────────────┴───────────┬────────────┴───────────────────────┘
                                           ▼
                            app/architecture-patterns/page.tsx
                                           │
                                           ▼
                       components/architecture/ArchitectureRelationships.tsx
```

---

## Relationship Categories & Rules

### 1. Pattern → Model Relationships
- **Declaration**: `models` array in `data/patterns.json` (e.g. `["resnet50", "densenet121"]`).
- **Resolution**: Converted into canonical `model:resnet50` IDs under `relationships.relatedObjects`.
- **Query**: `knowledgeRepository.getRelatedObjects("pattern:residual")`.

### 2. Pattern → Pattern Evolution Lineage
- **Declaration**: `prerequisiteObjects` and `successorObjects` in `data/patterns.json`.
- **Resolution**: Maps predecessor/successor pattern relationships (e.g. `residual` $\to$ `dense` $\to$ `attention`).
- **Query**: `getPatternEvolution("residual")`.

### 3. Pattern → Research Paper Links
- **Declaration**: Canonical paper IDs in `relatedObjects` in `data/patterns.json` (e.g. `["paper:resnet"]`).
- **Resolution**: Resolves matching `paper` Knowledge Objects (`id: "paper:resnet"`).
- **Query**: `getPatternResearch("residual")`.

---

## Data Ownership & Anti-Duplication Rules

1. **Single Source of Truth**: All pattern relationships originate from `data/patterns.json` via `PatternAdapter`.
2. **Forbidden**: Creating separate duplicate relationship databases or hardcoding model lists inside React UI components.
3. **Presentation-Only UI**: `components/architecture/ArchitectureRelationships.tsx` accepts prepared relationship data purely via props.
