# Phase 2.2 — Architecture Components Refactor Documentation

## Executive Summary

Phase 2.2 decomposes the monolithic **Architecture Pattern Library** (`/architecture-patterns`) page into reusable, domain-oriented presentation components under `components/architecture/`.

This refactor is a **pure presentation-layer reorganization**:
- Zero changes to UI layout, styling, Tailwind classes, or responsiveness.
- Zero changes to routing (`/architecture-patterns?pattern=...`) or search param URL sync.
- Zero changes to repository querying logic or canonical Knowledge Objects.

---

## Component Hierarchy & Organization

```text
components/
    architecture/
        ArchitecturePatternLayout.tsx        # Page composition & layout container
        ArchitecturePatternHeader.tsx        # Library header & active pattern title badge
        ArchitecturePatternNavigation.tsx    # Pattern index selector navigation
        ArchitectureMath.tsx                # Formal LaTeX math equation rendering
        ArchitectureHistory.tsx             # Problem & solution narrative boxes
        ArchitectureBlueprint.tsx           # SVG routing schema block visualizer
        ArchitectureTradeoffs.tsx           # Key advantages & tradeoffs grid
        ArchitectureRelationships.tsx       # Associated catalog model cards grid
        ArchitectureReferences.tsx          # Continue learning recommendation section
        types.ts                            # Shared interfaces & data conversion mapping
        index.ts                            # Barrel exports
```

---

## Component Responsibilities & Boundaries

| Component | Primary Responsibility | Data Source |
| :--- | :--- | :--- |
| `ArchitecturePatternLayout` | Page composition, glow backgrounds, max-w-7xl responsive wrapper | Props (`children`) |
| `ArchitecturePatternHeader` | Page title/subtitle (`variant="page"`) or pattern title & badge (`variant="pattern"`) | Props (`activePattern`) |
| `ArchitecturePatternNavigation` | Left 4-column pattern selection buttons with active styling | Props (`patterns`, `selectedPattern`, `onSelectPattern`) |
| `ArchitectureMath` | Renders KaTeX / `MathFormula` LaTeX equations | Props (`formula`) |
| `ArchitectureHistory` | Renders problem statement box and solution routing box | Props (`problem`, `solution`) |
| `ArchitectureBlueprint` | Renders SVG routing schematics (`residual`, `dense`, `depthwise`, `compound`, `nas`, `attention`) | Props (`patternId`, `patternName`) |
| `ArchitectureTradeoffs` | Key advantages (pros) and constraints (cons) grid | Props (`tradeoffs`) |
| `ArchitectureRelationships` | Catalog models employing this pattern grid | Props (`associatedModels`) |
| `ArchitectureReferences` | Continue learning recommendation links | Self-contained static |

---

## Data Flow & State Ownership Rules

1. **Unidirectional Prop Flow**:
   ```text
   Knowledge Repository (lib/knowledge/repository/repository.ts)
           │
           ▼
   Page Component (app/architecture-patterns/page.tsx)
           │
           ▼
   Presentation Components (components/architecture/*)
   ```
2. **Repository Boundary**:
   Only `app/architecture-patterns/page.tsx` interacts with `knowledgeRepository`. Child presentation components under `components/architecture/` must not import or query the repository directly.

3. **State Ownership**:
   All page-level state (`selectedPattern`, `useSearchParams`, `useRouter`) is managed inside `app/architecture-patterns/page.tsx`. Presentation components are purely functional and receive callbacks (`onSelectPattern`).

---

## Extension Guidelines

- **Adding a New Pattern Diagram**: Update `ArchitectureBlueprint.tsx` with the new SVG schematic matching the pattern slug.
- **Extending Component Sections**: Keep section components isolated to single concerns (e.g. math vs relationships).
