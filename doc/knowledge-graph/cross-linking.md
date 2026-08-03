# Cross Linking & Cross-Domain Navigation Specification (Phase 4.2)

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Specification  
**Target Path:** `doc/knowledge-graph/cross-linking.md`  
**Phase:** Phase 4.2 Cross Linking  

---

## 1. Overview & Purpose

**Phase 4.2 Cross Linking** connects all isolated educational domains into a unified, cross-domain knowledge network:

```text
  Architecture (Models & Patterns)
              │
              ├──► Training (Dynamics & Concepts)
              │
              ├──► Research (Scientific Papers)
              │
              ├──► Evolution (Historical Lineage)
              │
              └──► Implementation (Code References)
```

---

## 2. Centralized Relationship Resolution (`lib/knowledge/graph/relationship-resolver.ts`)

`RelationshipResolver` resolves connections across entity types (`model`, `pattern`, `concept`, `paper`, `evolution`) using relationship descriptors:

- `uses`
- `implements`
- `extends`
- `inspiredBy`
- `improves`
- `dependsOn`
- `requires`
- `introduces`

`RelationshipResolver.resolveCrossDomain(target, allObjects)` groups all connected entities into a canonical `CrossDomainConnections` structure:

```ts
export interface CrossDomainConnections {
  readonly architecture: readonly KnowledgeObject[];
  readonly training: readonly KnowledgeObject[];
  readonly research: readonly KnowledgeObject[];
  readonly evolution: readonly KnowledgeObject[];
  readonly implementation: readonly KnowledgeObject[];
}
```

---

## 3. Cross-Domain UI Components (`components/navigation/`)

- `CrossDomainExplorer`: Comprehensive tabbed component allowing users to navigate between connected Architecture, Training, Research, Evolution, and Implementation objects.
- `ResearchConnections`: Scientific paper provenance links.
- `EvolutionTimelineLinks`: Historical timeline lineage nodes.
- `ImplementationExamples`: Code reference links.
- `RelationshipGraph`: Visual network node badges.

---

## 4. Guarantees

- **Offline Static Compatibility:** Fully compatible with Next.js static export build (`npm run build`).
- **No Duplicate Systems:** Reuses `IKnowledgeRepository` as the single source of truth.
