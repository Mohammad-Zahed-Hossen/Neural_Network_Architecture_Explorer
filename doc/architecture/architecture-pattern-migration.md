# Phase 2.1 — Architecture Pattern Data Migration Documentation

## Executive Summary

Phase 2.1 migrates the underlying data flow of the **Architecture Pattern Library** (`/architecture-patterns`) to consume the **Canonical Knowledge Layer** introduced in Phase 1.

The migration preserves **100% backward compatibility** and **visual identity**. No UI layouts, styling, equations, tabs, search parameters, or component props were changed.

---

## Data Flow Architecture

### Pre-Migration Data Flow
```text
Inline Hardcoded `PATTERNS` Array (app/architecture-patterns/page.tsx)
        │
        ▼
Architecture Pattern Components
```

### Post-Migration Data Flow
```text
Legacy Pattern Data (data/patterns.json)
        │
        ▼
Pattern Adapter (lib/knowledge/adapters/pattern-adapter.ts)
        │
        ▼
Knowledge Repository (lib/knowledge/repository/repository.ts)
        │
        ▼
Existing Architecture Pattern Page (app/architecture-patterns/page.tsx)
```

---

## Key Components & Responsibilities

### 1. Raw Pattern Dataset (`data/patterns.json`)
- Serves as the single raw legacy source of truth for the 6 core architecture patterns (`residual`, `dense`, `depthwise`, `compound`, `nas`, `attention`).
- Contains formulas, problem statements, solutions, pros/cons, colors, and associated model lists.

### 2. Pattern Adapter (`lib/knowledge/adapters/pattern-adapter.ts`)
- Implements `IKnowledgeAdapter<Record<string, unknown>>`.
- Converts raw pattern items into canonical `KnowledgeObject` instances under `pattern:{slug}` namespace.
- Preserves all domain-specific extensibility metadata (`math`, `problem`, `solution`, `tradeoffs`, `models`, `color`, `bgColor`, `borderColor`, `icon`).
- Maps associated model IDs into `relationships.relatedObjects` under `model:{id}` namespace.
- Ignores extra legacy/unknown fields gracefully.

### 3. Unified Knowledge Repository (`lib/knowledge/repository/repository.ts`)
- Manages unified lazy loading and caching of all `KnowledgeObject` collections.
- Extends `getKnowledgeObject(id)` to support `pattern:${id}` lookup.
- Extends `getPerspective(id, 'architecture')` to return generic `ArchitecturePerspective` objects dynamically synthesized from pattern metadata.
- Provides `getObjectsByType('pattern')` for querying converted pattern objects.

### 4. Page Integration (`app/architecture-patterns/page.tsx`)
- Obtains pattern data dynamically via `knowledgeRepository.getObjectsByType('pattern')`.
- Maps `KnowledgeObject` instances back to `PatternInfo` view props without altering page rendering.
- Retains all state synchronization (`useSearchParams`), routing (`?pattern=...`), search indexing, and LaTeX math rendering (`MathFormula`).

---

## Compatibility Guarantees & Non-Breaking Constraints

1. **Identifiers & Slugs**: All legacy IDs (`residual`, `dense`, `depthwise`, `compound`, `nas`, `attention`) are strictly preserved.
2. **URLs & Routes**: Route `/architecture-patterns` and search parameters (`?pattern=...`) behave identically.
3. **UI & Styling**: Zero changes to visual design, tailwind classes, colors, or icons.
4. **Data Integrity**: Every legacy pattern item yields exactly one valid `KnowledgeObject`.

---

## Rollback Strategy

In the event of an unexpected issue:
1. Revert `app/architecture-patterns/page.tsx` to restore the static `PATTERNS` array.
2. The core repository and adapter infrastructure remain backward-compatible and non-disruptive to existing components.
