# Phase 2 — Architecture Pattern Library Canonical Specification & Freeze

## Status: COMPLETE / FROZEN

The **Architecture Pattern Library** (`/architecture-patterns`) is a completed, production-ready core educational module of the **Neural Network Architecture Explorer** platform.

This specification documents the complete architectural foundation, canonical knowledge model, presentation layer decomposition, interactive explorer framework, and relationship system.

---

## 1. Module Overview & Educational Goals

The Architecture Pattern Library enables deep learning students, researchers, and engineers to shift from memorizing isolated model names to mastering reusable architectural routing motifs (Residual Skip Connections, Dense Concatenation, Depthwise Separable Convolutions, Compound Model Scaling, Neural Architecture Search, and Self-Attention).

---

## 2. System Architecture

```text
Raw Datasets (data/patterns.json)
        │
        ▼
PatternAdapter (lib/knowledge/adapters/pattern-adapter.ts)
        │
        ▼
Knowledge Repository (lib/knowledge/repository/repository.ts)
        │
        ▼
Architecture Page Orchestration (app/architecture-patterns/page.tsx)
        │
 ┌──────┴───────────────┬────────────────────────┬───────────────────────┐
 ▼                      ▼                        ▼                       ▼
ArchitectureLayout    ArchitectureHeader       ArchitectureNavigation  ArchitectureMath
                        ArchitectureHistory      ArchitectureBlueprint   ArchitectureTradeoffs
                                                 (ArchitectureExplorer)  ArchitectureRelationships
```

---

## 3. Canonical Knowledge Model

Every architecture pattern Knowledge Object conforms to `KnowledgeObjectSchema`:
- **Identity**: `id` (`pattern:residual`), `slug` (`residual`), `type` (`pattern`), `status` (`stable`).
- **Metadata**: `summary` (problem statement), `description` (solution routing rationale), `keywords`.
- **Architecture Perspective**: `getPerspective(id, 'architecture')` synthesizing design goals, core components, information flow, advantages, and limitations.
- **Relationships**: `relatedObjects` (models & papers), `prerequisiteObjects`, `successorObjects`.
- **Domain Metadata**: LaTeX math formulas, color schemes, icon names, tradeoff pros/cons arrays.

---

## 4. Interactive Explorer Framework (`components/explorer/`)

- **Domain Independence**: Fully decoupled from pattern-specific code. Consumes declarative node/edge graphs (`ExplorerBlueprintData`).
- **Interactive Viewport (`ExplorerCanvas`)**: Renders SVG nodes (`rect`, `circle`, `pill`) and edges (`ExplorerEdge`) with responsive scaling and markers.
- **Interaction Priority**: Selection > Hover. Selecting a node highlights connected paths, opens the **Component Inspector**, and synchronizes the **Layer Explorer**.
- **Accessibility**: Keyboard navigation (`Tab`, `Enter`, `Space`), `aria-pressed`, and ARIA role descriptions.

---

## 5. Relationship Integration

- **Pattern $\to$ Models**: Resolves models employing the pattern (e.g. ResNet-50 for Residual connections).
- **Pattern $\to$ Evolution**: Resolves predecessor and successor patterns via `getPatternEvolution()`.
- **Pattern $\to$ Research**: Resolves landmark primary research papers via `getPatternResearch()`.

---

## 6. Component Presentation Architecture (`components/architecture/`)

- `ArchitecturePatternLayout.tsx`: Page layout & glowing background wrapper.
- `ArchitecturePatternHeader.tsx`: Title & math pattern badge.
- `ArchitecturePatternNavigation.tsx`: Left 4-column pattern index selector.
- `ArchitectureMath.tsx`: LaTeX formal equation box (`MathFormula`).
- `ArchitectureHistory.tsx`: Problem and solution narrative boxes.
- `ArchitectureBlueprint.tsx`: Interactive blueprint explorer wrapper.
- `ArchitectureTradeoffs.tsx`: Key advantages and constraints split grid.
- `ArchitectureRelationships.tsx`: Models, research papers, evolution lineage, and related patterns grid.
- `ArchitectureReferences.tsx`: Continue learning recommendation links.

---

## 7. Data Ownership & Extension Rules

- **Allowed**: `Knowledge Object -> Knowledge Repository -> Page -> Props -> Presentation Components`.
- **Forbidden**: Direct JSON imports inside React components, duplicate relationship files, or hardcoded model lists.
- **Reusability**: Future domains (Training Dynamics, GNNs, Transformers, Graph Algorithms) MUST reuse the `Explorer Framework` and `Knowledge Repository`.
