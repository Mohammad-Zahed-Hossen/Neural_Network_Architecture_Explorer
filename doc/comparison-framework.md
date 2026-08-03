# Comparison Studio Architecture Specification (Phase 5.1)

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Specification  
**Target Path:** `doc/comparison-framework.md`  
**Phase:** Phase 5.1 Comparison Studio  

---

## 1. Executive Summary & Purpose

**Phase 5.1 Comparison Studio** introduces a unified, deterministic, domain-independent comparison framework capable of side-by-side analysis of any knowledge objects (architectures, training concepts, research papers, models, and patterns) without hardcoding domain-specific logic.

```text
Knowledge Repository (Layer 4)
             │
             ▼
    Comparison Service
             │
             ▼
    Comparison Engine
             │
             ▼
Comparison Adapters & Registry
             │
             ▼
  Comparison UI Components
```

---

## 2. Architectural Principles

1. **Strictly Deterministic (No AI):** All comparisons, metric differences, key similarities, and visualizer telemetry curves are generated from repository data and mathematical formulas.
2. **Domain-Independent:** The comparison engine operates on canonical `ComparisonObject` abstractions rather than hardcoding CNN/Transformer/ResNet assumptions.
3. **Repository Integration:** `IKnowledgeRepository` exposes `compare()`, `getComparisonData()`, `getComparableObjects()`, and `getComparisonMetrics()` as the single source of truth.
4. **Visualizer Framework Reuse:** Learning curve comparisons consume `Visualizer Plugins` (`LearningCurvePlugin`) via comparative adapters rather than creating a separate charting engine.

---

## 3. Comparison Engine Core API (`lib/comparison/comparison-engine.ts`)

```ts
export class ComparisonEngine {
  normalizeObjects(objects: readonly KnowledgeObject[], repo?: IKnowledgeRepository): ComparisonObject[];
  compareMetrics(objects: readonly ComparisonObject[]): { metrics: ComparisonMetric[]; metricMatrix: Record<string, Record<string, ComparisonMetricValue>> };
  compareRelationships(objects: readonly ComparisonObject[]): ComparisonSection;
  comparePerspectives(objects: readonly ComparisonObject[]): ComparisonSection;
  compareTraining(objects: readonly ComparisonObject[]): ComparisonSection;
  compareEvolution(objects: readonly ComparisonObject[]): ComparisonSection;
  compareImplementation(objects: readonly ComparisonObject[]): ComparisonSection;
  generateComparisonModel(objects: readonly KnowledgeObject[], category?: ComparisonCategoryType, repo?: IKnowledgeRepository): ComparisonResult;
}
```

---

## 4. Comparison Adapters & Registry (`lib/comparison/adapters/`)

| Adapter | Target Knowledge Object Type | Primary Metric Focus |
| :--- | :--- | :--- |
| `ModelComparisonAdapter` | `model` | Parameters, FLOPs, Top-1 Accuracy, Depth, Memory, Speed |
| `ArchitectureComparisonAdapter` | `pattern` | Layer Depth Impact, Parameter Efficiency, Mathematical Formulation |
| `TrainingComparisonAdapter` | `concept` | Convergence Acceleration Rate, Optimizer Stability, Memory Footprint |
| `PaperComparisonAdapter` | `paper` | Publication Year, Citation Counts, Academic Lineage |
| `LearningCurveComparisonAdapter` | Fallback / Telemetry | Telemetry trajectory comparison via `LearningCurvePlugin` |

---

## 5. UI Component Hierarchy (`components/comparison/`)

- `ComparisonStudio`: Main container orchestrating multi-category selection, tabbed comparison views, and telemetry visualization.
- `ComparisonSelector`: Domain-independent multi-entity picker supporting category filters.
- `ComparisonPanel`: Tabbed view switcher (`Summary`, `Metrics Matrix`, `Visualizer Telemetry`, `Graph Relationships`, `Evolution Timeline`, `Citations & Code`).
- `ComparisonSummary`: Key similarities and key differences callout panel.
- `ComparisonTable`: Structured matrix grid with value highlighting (min/max/neutral).
- `ComparisonMetrics`: Visual cards with relative progress bars.
- `ComparisonRelationships`: Graph topology overlap and divergence viewer.
- `ComparisonVisualizer`: Telemetry chart powered by the Visualizer Framework.
- `ComparisonTimeline`: Chronological research and evolutionary timeline.
- `ComparisonReferences`: Citations, math formulations, and code snippets side-by-side.

---

## 6. Extensibility Strategy

Future domains (e.g., Transformers, Diffusion Models, Reinforcement Learning) automatically work with the Comparison Studio by implementing `IComparisonAdapter` and registering it with `ComparisonAdapterRegistry`.
