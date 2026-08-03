# Neural Network Architecture Explorer — AI Context

**Purpose:** 5-10 minute AI-readable summary for quick project understanding  
**Last Updated:** August 4, 2026  
**Full Specification:** See [CANONICAL_SPECIFICATION.md](./CANONICAL_SPECIFICATION.md)

---

## Project Overview

**What:** Interactive educational platform for exploring neural network architectures  
**Status:** Production Ready (100%)  
**Scale:** 34 models, 8,388 layers, 18 papers (+18 canonical paper detail JSONs), 5 training dynamics concepts, 9 timeline milestones  
**Build:** Static Next.js export (48 pages)  
**Tech:** Next.js 16, React 19, TypeScript 6.0.3, Tailwind CSS 4, Zod, React Flow, Framer Motion, KaTeX, Shiki  
**Latest work:** 
- Phase 6.1 - Phase 6.2 Platform Expansion Validation (Introduced 2 pilot domains: `Transformer` with 13 objects & `Graph Algorithms` with 9 objects via `TransformerAdapter` & `GraphAlgorithmAdapter` in `lib/knowledge/adapters/`, proving 100% architectural extensibility across Repository, Graph, Navigation, Comparison Studio, and Guided Learning with 0 core framework changes. Comprehensive developer manual in `doc/platform-expansion-guide.md`)
- Phase 5.1 - Phase 5.2 Advanced Experience (Comparison Studio in `lib/comparison/` & `components/comparison/` enabling domain-independent side-by-side comparison across architectures, training concepts, papers, models, and telemetry; Guided Learning in `lib/learning/` & `components/learning/` providing 7-stage deterministic graph walkthroughs and prediction exercises with zero AI dependencies)
- Phase 4.1 - Phase 4.2 Knowledge Navigation & Cross Linking (Automated graph-derived educational navigation, `RelationshipResolver` in `lib/knowledge/graph/`, `NavigationService` in `lib/knowledge/navigation/`, repository query APIs in `lib/knowledge/repository/`, reusable navigation components in `components/navigation/`, and 5-domain cross-domain connection matrix)
- Phase 3.1 - Phase 3.5 Training Dynamics Simulation & Visualization Platform (Generic DAG topology model in `lib/training/topology/`, standalone `TrainingEngine` in `lib/training/engine/`, plugin-driven Visualizer Framework in `lib/visualization/`, `GradientFlowPlugin` Canvas 2D simulator migration, 6 host-selectable visualizer plugins, and `VisualizerHost` React component)
- Phase 2.3 Interactive Architecture Explorer (Introduced domain-independent reusable Explorer Framework in `components/explorer/` with structured blueprint models, interactive canvas, hover highlights, selection focus, Layer Explorer, and Component Inspector)
- Phase 2.2 Architecture Components Refactor (Decomposed `/architecture-patterns` into 9 modular presentation components under `components/architecture/`, isolating layout, math, SVG blueprints, tradeoffs, and relationships with zero functional or visual changes)
- Phase 2.1 Architecture Pattern Data Migration (`/architecture-patterns` data source migrated to consume `IKnowledgeRepository` via `PatternAdapter` over `data/patterns.json`, maintaining 100% UI and behavioral compatibility)
- Canonical Knowledge Layer & Repository (Phases 1.1–1.5: KnowledgeObject schema, 6 Perspective contracts, frozen Engine API, shared `BaseKnowledgeAdapter` framework in `lib/knowledge/adapters/`, and `IKnowledgeRepository` in `lib/knowledge/repository/`)
- Platform Validation Pipeline (Phase 0.4: build-time gatekeeper, reference, capability, orphan & cycle rules in `lib/validation/`)
- Shared Registries Foundation (Phase 0.3: strongly typed, declarative Domain, Perspective, Visualizer, and Graph Behavior canonical registries in `lib/registry/`)
- Training Dynamics Simulator v2.0 (Phases 1–5: data-driven engine, rich telemetry, adaptive controls, educational learning engine, synchronized comparison mode)
- Paper Details Specification (7-zone cognitive architecture with deep linking)
- Papers Knowledge Base (local-first bookmarks/reading status/notes)
- ResNet-50 Implementation Guide (Shiki code highlighting, schema-driven)
- Research-Grade Canonical Audit (`nn-audit/` Python zero-trust verification of all 34 models)

---

## Quick Start

```bash
# Development
npm run dev

# Build (static export)
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Validate platform registries
npm run validate:platform

# Run validation regression tests
npm run validate:tests

# Validate model data (Zod)
npm run validate:data

# Independent Python audit (pinned env)
cd nn-audit && .venv\Scripts\activate
python nn-audit/test_math_and_rf.py
python nn-audit/verify_canonical_database.py
python nn-audit/generate_audit_report.py
```

**Output:** `out/` directory with 48 static HTML pages

---

## Architecture Summary

### Tech Stack
- **Framework:** Next.js 16 (App Router, static export)
- **UI:** React 19, Tailwind CSS 4, Framer Motion
- **Visualization:** React Flow (topology), Recharts (charts)
- **Math:** KaTeX 0.18.1 (`MathRenderer`, `MathFormula` — SSR-safe, `htmlAndMathml` output)
- **Code Highlighting:** Shiki 4.3.1 (server-side only, 0KB client bundle)
- **Validation:** Zod 4.4.3 (models, papers, concepts, implementations)
- **Icons:** Lucide React
- **Fonts:** Geist Sans + Mono
- **Python Audit:** torch 2.13.0+cpu, torchvision 0.28.0+cpu, timm 1.0.28, tensorflow 2.21.0, keras 3.15.1, transformers 5.14.1

### Key Patterns
- **Static-First:** All pages pre-rendered at build time
- **Type-Safe:** Full TypeScript + Zod runtime validation (4 schema files)
- **Component-Driven:** Modular, reusable components (19 training-dynamics + 17 paper-details + 5 educational)
- **Data Access:** Standardized via `lib/data-access/` (models, papers, training-dynamics, learning-engine, implementations)
- **Search:** 5-tier relevance engine with educational metadata
- **State:** URL-based for shareability, local component state for UI, localStorage for paper knowledge base (`nn_explorer_paper_kb_v1`)
- **Zero Hardcoded Content:** Educational content lives in JSON; training dynamics engines are fully parameter-driven
- **Standalone Engines:** `SimulationEngine` is a React-independent TypeScript class with strongly-typed event emitter

### Recent Implementation Highlights
- **Training Dynamics Simulator v2.0:** complete data-driven refactor from monolithic page into `lib/training-dynamics/` (7 engine modules) + `components/training-dynamics/` (19 files) + `components/educational/` (5 files) + `data/concepts/training-dynamics.json` (5 presets).
- **Paper Details Specification:** `app/papers/[paperId]` route with 18 canonical paper JSONs (`data/papers/*.json`), alias slugs (`resnet50` → `resnet-2015-cvpr-he`), 7 cognitive zones, deep-linkable anchors, and persistent utility panel.
- **Papers Knowledge Base:** `/papers` now supports reading status, bookmarks, personal notes, custom tags, recently-opened tracking, BibTeX/citation copy — all localStorage-based.
- **Implementation Tab:** ResNet-50 production implementation guide with framework variants, prerequisites, engineering notes, Shiki server-side syntax highlighting, and verified metadata (`data/implementations/resnet50.json`).
- **Research-Grade Canonical Audit:** `nn-audit/` Python harness verifies all 34 models (parameter sums, tensor shapes, benchmark provenance, links, cross-repo consistency) with zero discrepancies.
- **Verification:** production build completed successfully with 48 static pages and zero TypeScript or lint issues.

---

## Directory Structure

```
app/                    # Next.js App Router (12+ routes)
├── models/[slug]/      # Dynamic model detail pages (34)
├── catalog/            # Model catalog with search/filters
├── compare/            # Model comparison
├── learn/              # Learning paths + advisor
├── papers/             # Paper knowledge center
├── papers/[paperId]/   # Paper details pages (18 canonical + aliases, 7-zone)
├── evolution/          # Architecture timeline
├── research-map/       # Research DAG
├── architecture-patterns/  # Design patterns
└── concepts/           # Receptive field, training dynamics

components/             # UI components
├── ui/                 # Primitives (badge, brand-logo, continue-learning, math-formula, math-renderer, model-selector-dropdown)
├── code-block/         # Shiki-based code display (header, copy, callouts, footer, line numbers)
├── model-catalog/      # Catalog components
├── model-explorer/     # Explorer components (tabbed, flow, inspector, custom-node, implementation-tab)
├── model-comparison/   # Comparison components
├── educational/        # Generic educational (concept-explanation, math-section, intuition-section, analogy-section, reference-section)
├── training-dynamics/  # Training Dynamics UI (14 core + 5 comparison sub-components)
├── paper-details/      # Paper Details zones (7 zones + shared + utility-panel)
├── learn/              # Advisor component
├── research-map/       # Research flow
└── layout/             # Navbar, footer, page transition, page background

data/                   # Static data
├── models.json         # 34 model summaries
├── models/*.json       # 34 complete model JSONs
├── papers.json         # 18 paper summaries
├── papers/*.json       # 18 canonical paper detail JSONs (7-zone schema)
├── evolution.json      # 9 timeline nodes
├── advisor.json        # 3 advisor questions
├── concepts/training-dynamics.json  # 5 training concepts + simulation presets
├── training-dynamics-rules.json     # Educational rule catalog
├── training-dynamics-scenarios.json # Categorized presets (Architecture/Training/Research)
├── implementations/resnet50.json    # ResNet-50 implementation guide
└── link_registry.json  # Static link mapping

doc/                    # Platform Architectural Documentation & Specifications
└── architecture/       # Technical design specifications (Phase 0.3 - Phase 1.5)
    ├── shared-registries.md        # Canonical Domain, Perspective, Visualizer & Graph registries
    ├── validation-pipeline.md      # Build-time gatekeeper, reference, capability & graph rules
    ├── knowledge-object-schema.md  # KnowledgeObject Zod schema & canonical vocabulary
    ├── perspective-schemas.md      # 6 Educational Perspective contracts
    ├── engine-state-contracts.md   # Frozen engine API & state contracts (CNN, RL, Graph, Opt)
    ├── migration-adapters.md       # Shared adapter framework (Model, Paper, Pattern, Training)
    └── knowledge-repository.md     # Read-only unified IKnowledgeRepository API

lib/                    # Utilities & Core Platform Subsystems
├── registry/           # Canonical Shared Registries (Phase 0.3: Domain, Perspective, Visualizer, GraphBehavior)
├── validation/         # Platform Validation Framework (Phase 0.4: validatePlatform() & validators/)
├── knowledge/          # Canonical Knowledge Layer (Phase 1.1-1.5: schema, perspectives, adapters, repository)
│   ├── schema/         # KnowledgeObject Zod schema & constants
│   ├── perspectives/   # 6 Perspective contracts extending BasePerspective
│   ├── adapters/       # BaseKnowledgeAdapter & 4 concrete adapters (Model, Paper, Pattern, Training)
│   └── repository/     # IKnowledgeRepository & StaticKnowledgeRepository
├── engine/             # Engine API Contracts (Phase 1.3: BaseEngineState, CNN, RL, Graph, Opt, Visualizer)
├── schema/             # Zod schemas (model.schema.ts, paper.schema.ts, training-dynamics.schema.ts, implementation.schema.ts)
├── data-access/        # Legacy data loading (models.ts, models.server.ts, papers.ts, training-dynamics.ts, learning-engine.ts, implementations.server.ts)
├── data/               # Relationships, categories
├── types/              # Type definitions (comparison.ts, training-dynamics.ts)
├── training-dynamics/  # Standalone simulation engine core (simulation-engine, particle-engine, physics, renderer, color-system, loss-models, telemetry)
├── search/             # 5-tier search engine
├── hooks/              # use-reduced-motion, use-is-mobile, use-knowledge-search, use-paper-knowledge-base
└── utils/              # cn, formatters, colors, filter-models, layer-styles, rf-math
└── shiki-highlighter.ts # Server-side Shiki code highlighting

types/
└── paper-schema.ts      # CanonicalPaperSchema + RKR interfaces (vocabulary, visualFigures, readingGuide, richDatasets)

nn-audit/               # Python audit harness (Python 3.12.9, pinned frameworks)
├── test_math_and_rf.py           # Math + RF unit tests (6 tests)
├── verify_canonical_database.py  # Zero-trust model/framework/link/cross-repo audit
├── generate_audit_report.py      # Synthesizes RESEARCH_GRADE_CANONICAL_AUDIT_REPORT.md
├── audit_full_results.json       # 6.8MB evidence artifact
└── README.md                     # Pinned env + reproduction steps

scripts/                # Build and validation scripts
├── validate-model-data.ts        # Data validation script
├── validate-links.ts             # Link validation script
├── data-validation-report.md     # Data validation report
├── data-merge-changelog.md       # Schema update changelog
├── extract_keras_models.py       # Keras model extraction
├── fix_batchnorm_params.py       # BatchNorm parameter fix
├── generate_audit_package.py     # Audit package generation
├── init_data_from_lib.py         # Data initialization from library
├── merge-model-data.ts           # Model data merging
├── process_models.py             # Model processing
└── README.md                     # Scripts documentation

tools/                  # Archived legacy data pipeline
doc/                    # Documentation (CANONICAL_SPECIFICATION, AI_CONTEXT, training-dynamics-architecture, RESEARCH_GRADE_CANONICAL_AUDIT_REPORT, platform-audit, platform-principles)
```

---

## Data Architecture

### Model Schema (Zod) — `lib/schema/model.schema.ts`

```typescript
interface ModelSummary {
  id: string;
  name: string;
  fullName: string;
  family?: string;
  category: ModelCategory;
  efficiency: 'lightweight' | 'balanced' | 'powerful';
  year?: number;
  paperYear: number;
  releaseYear?: number;
  authors: string[];
  tags: string[];
  totalParameters: number;
  trainableParameters?: number;
  nonTrainableParameters?: number;
  top1Accuracy: number;
  top5Accuracy: number;
  memoryUsage: number;
  totalFLOPs: number;
  depth: number;
  paperUrl: string;
  colorTheme: string;
  docsUrl?: string;
  description: string;
}

interface NeuralNetworkModel extends ModelSummary {
  inputShape: { channels: number; height: number; width: number };
  architecture: {
    layers: Layer[];
    connections: Connection[];
    groups: LayerGroup[];
    layout?: {
      nodes: LayoutNode[];
      edges: unknown[];
      groups: unknown[];
      groupedNodes: GroupedNode[];
      groupedEdges: GroupedEdge[];
    };
  };
}
```

### Canonical Paper Schema — `types/paper-schema.ts`

```typescript
interface CanonicalPaperSchema {
  metadata: PaperMetadata;       // paperId, title, authors, venue, year, status
  summary: PaperSummary;         // tldr, oneSentenceMemory, keyTakeaways, vocabulary, visualFigures, readingGuide
  motivation: PaperMotivation;   // problemStatement, previousLimitations, coreInsight, contributions
  innovations: TechnicalInnovation[];  // expandable cards with math + codeSnippet
  evidence: PaperEvidence;       // datasets, richDatasets, primaryResults, ablationStudies
  criticalNotes: TaggedNote[];   // strengths/weaknesses/limitations/failureCases/tradeoffs/misconceptions
  connections: PaperConnections; // lineage, researchGaps, futureExtensions
  reference: DeepReference;      // abstract, trainingDetails, equationCatalog, bibtex
}
```

### Training Dynamics Schema — `lib/schema/training-dynamics.schema.ts`

```typescript
interface TrainingConcept {
  id: string;                    // 'vanishing' | 'exploding' | 'residual' | 'dense' | 'batchnorm'
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'optimization' | 'architecture' | 'normalization' | 'regularization' | 'mathematics' | 'general_cs';
  summary: string;
  problem: string;
  intuition: string;
  analogy: string;
  visualExplanation: string;
  mathematics: { formula: string; description: string; variables?: Record<string, string> };
  causes: string[];
  symptoms: string[];
  solutions: string[];
  realWorldArchitectures: string[];
  relatedConcepts: string[];
  references: Reference[];
  tags: string[];
  simulationPreset: SimulationPreset;
}

interface SimulationPreset {
  id: string;                        // e.g. 'preset-vanishing'
  name: string;
  particleSpeed: number;             // particle velocity
  gradientDecayRate: number;         // exponential shrink (Vanishing)
  gradientGrowthRate: number;        // exponential growth (Exploding)
  skipProbability: number;           // identity skip arc chance (ResNet)
  parallelConnections: boolean;      // multi-channel connections (DenseNet)
  normalization: boolean;            // layer normalization barriers (BatchNorm)
  gradientColor: string;
  connectionType: 'sequential' | 'residual' | 'dense' | 'batchnorm';
  connectionStyle: 'sequential' | 'weak' | 'unstable' | 'residual' | 'dense' | 'batchnorm';
  weightInitialization: 'he' | 'xavier' | 'random_large' | 'random_small' | 'random_normal' | 'orthogonal' | 'ones';
  // Hyperparameters (with defaults for backward compat)
  activationFunction: 'sigmoid' | 'tanh' | 'relu' | 'gelu' | 'swish';
  optimizer: 'sgd' | 'momentum' | 'rmsprop' | 'adam' | 'adamw';
  normalizationType: 'none' | 'batchnorm' | 'layernorm';
  batchSize: number;
  dropoutRate: number;
  noiseInjection: number;
  presetCategory: 'architecture' | 'training' | 'research';
}
```

### Data Access Pattern

**Standardized:** All model data goes through `lib/data-access/`:

```typescript
// Client-side
import { getModelSummaries } from '@/lib/data-access/models';
const models = getModelSummaries();

// Server-side
import { getModel } from '@/lib/data-access/models.server';
const model = getModel(slug);

// Papers (canonical registry + alias slugs)
import { getPaperById, getAllPaperIds } from '@/lib/data-access/papers';
const paper = await getPaperById('resnet-2015-cvpr-he'); // or 'resnet50'

// Training dynamics
import { getTrainingConcepts, getSimulationPreset, getRelatedConcepts } from '@/lib/data-access/training-dynamics';

// Implementations (server-only)
import { getImplementationData } from '@/lib/data-access/implementations.server';
const impl = getImplementationData('resnet50');
```

**Validation:** All data validated against Zod schemas at build time. Python audit (`nn-audit/`) independently verifies parameter math, tensor shapes, links, and cross-repo consistency.

---

## Search Architecture

### 5-Tier Relevance Engine

```typescript
// Scoring tiers
Exact Title Match:          100 pts
Alias/Abbreviation Match:   90 pts
Keyword/Pattern/Component:  75 pts
Description Match:           50 pts
Tags/Authors Match:          25 pts

// Multi-token boost
if (allTokensMatched && queryTokens.length > 1) {
  totalScore *= 1.25;
}
```

### Search Coverage

Supports:
- Architectural concepts ("residual", "attention", "depthwise")
- Abbreviations (NAS, ViT, SE, MBConv)
- Family-level search ("ResNet" finds all variants)
- Components ("bottleneck", "skip connection")
- Characteristics ("lightweight", "efficient")
- Deployment targets ("mobile", "edge", "server")
- Patterns (residual, dense, attention)
- Papers (`enrichPaperEntity`)

**Success Rate:** 100% on canonical queries  
**Performance:** <5ms latency, scales to 1000+ models

---

## Training Dynamics Simulation Platform

### Architecture

```
data/concepts/training-dynamics.json      <- Content + Presets (5 concepts)
data/training-dynamics-rules.json         <- Rule catalog
data/training-dynamics-scenarios.json     <- Categorized presets
         │
         ▼
lib/schema/training-dynamics.schema.ts    <- Zod Validation
         │
         ▼
lib/data-access/training-dynamics.ts      <- Data Access
lib/data-access/learning-engine.ts        <- Educational Learning Engine
         │
         ▼
lib/training-dynamics/                    <- Standalone Simulation Engine (no React)
  ├── simulation-engine.ts     <- SimulationEngine class (state, events, metrics, telemetry)
  ├── particle-engine.ts       <- Particle lifecycle & trajectories
  ├── physics.ts               <- Node graph layout math
  ├── renderer.ts              <- Pure Canvas 2D rendering
  ├── color-system.ts          <- Color mapping
  ├── loss-models.ts           <- LossModelFactory (strategy pattern)
  └── telemetry.ts             <- TelemetrySnapshot + health/color helpers
         │
         ▼
app/concepts/training-dynamics/page.tsx   <- React Orchestrator
   ├── components/training-dynamics/     <- 14 core + 5 comparison components
   └── components/educational/           <- 5 reusable educational components
```

### SimulationEngine Public API

- `initialize(width, height)` / `start()` / `pause()` / `reset()`
- `loadPreset(preset)` / `update(deltaTime)` / `render(ctx, w, h)`
- `triggerBackprop()` / `seekToEpoch(epoch)`
- `getMetrics()` / `getTelemetrySnapshot()` / `getState()` / `getGraph()`
- `setNetworkDepth()` / `setLearningRate()` / `setWeightInitialization()` / `setActivationFunction()` / `setOptimizer()` / `setNormalizationType()` / `setBatchSize()` / `setGradientClipping()` / `setDropoutRate()` / `setNoiseInjection()`

### Event System

`Backpropagation` | `ForwardPass` | `EpochComplete` | `LayerUpdated` | `SimulationReset` | `PresetChanged` | `MetricsUpdated` | `StateChanged` | `TelemetrySnapshot` | `LayerSelected`

### Telemetry Snapshot

```typescript
interface TelemetrySnapshot {
  timestamp: number;
  epoch: number;
  iteration: number;
  loss: number;
  gradientNorm: number;
  averageGradient: number;
  activationVariance: number;
  updateMagnitude: number;
  learningRate: number;
  networkDepth: number;
  networkStability: number;
  convergenceStatus: 'Stabilizing' | 'Converging' | 'Stalled' | 'Diverging' | 'Vanishing';
  layers: LayerTelemetryRaw[];
  lossHistory: LossHistoryEntry[];
  timelineEvents: PlaybackEvent[];
}
```

Derived values (`healthStatus`, `heatmapColor`, `badgeColor`) are computed on-the-fly via pure helpers (`getHealthStatus`, `getHeatmapColor`, `getHealthBadgeStyle`) — never stored redundantly.

### Loss Models (Strategy Pattern)

`LossModelFactory.getModel(preset, state)` returns:
- `VanishingLossModel` (plateaus ~1.2) / `ResidualLossModel` (→0.04) / `ExplodingLossModel` (diverges) / `BatchNormLossModel` / `DenseNetLossModel` (→0.03) / `DefaultLossModel`

### Comparison Mode

`ComparisonOrchestrator` controls twin `SimulationEngine` instances (Engine A + Engine B):
- `SynchronizedControls` (play/pause/step/reset/speed)
- `ArchitectureOverlay` (block diagrams)
- `ComparativeMetrics` (side-by-side + win badges)
- `DifferenceSummary` (rule-driven narrative from `training-dynamics-rules.json`)

### Extensibility

**Add a new concept:** just append to `data/concepts/training-dynamics.json`. Zod validates, data access retrieves, tabs render, physics/renderers run from preset config — zero engine code changes.

---

## Paper Details Specification Platform

### 7 Cognitive Information Zones

1. `#quick-scan` — PaperHeader, badges, TLDR, key takeaways
2. `#motivation` — Problem, Limitations, Core Insight, Contributions grid
3. `#innovations` — Expandable InnovationCards with type badges + KaTeX math deep-dive
4. `#evidence` — MetricCard grid, dataset badges, ablation tables
5. `#critical-notes` — Tagged list with filter bar (strengths/weaknesses/tradeoffs/failures)
6. `#connections` — Lineage (predecessors/successors), research gaps, future extensions
7. `#reference` — Collapsed: original abstract, training details, equation catalog, BibTeX

### Routing & Data Flow

```
/papers/[paperId]
  ├── generateStaticParams() → getAllPaperIds() (18 canonical IDs + alias slugs)
  ├── generateMetadata() → paper.metadata.title + summary.tldr
  ├── getPaperById() → Zod-validated CanonicalPaperSchema
  └── PaperPageLayout → 7 zones + PersistentUtilityPanel
```

### Component Architecture

```
components/paper-details/
├── index.ts                      # Barrel export
├── PaperPageLayout.tsx           # Two-column master wrapper
├── PaperBreadcrumbs.tsx
├── shared/                       # SectionHeader, ExpandableCard, VerificationBadge, MetricCard, InnovationTypeBadge, TaggedList
├── utility-panel/PersistentUtilityPanel.tsx  # TOC, bookmark, citation, JSON export
└── zones/                        # Zone1_QuickScan … Zone7_Reference
```

### RKR Enhancements

`types/paper-schema.ts` adds: `ResearchVocabularyTerm[]`, `VisualMemoryFigure[]`, `ReadingGuide` (difficulty 1-5), `RichDatasetReference[]`, `NoteCategory 'misconception'`, equation catalog `name` field.

---

## Papers Knowledge Base

**Location:** `app/papers/page.tsx` (client component)  
**Persistence:** `lib/hooks/use-paper-knowledge-base.ts` → `localStorage` key `nn_explorer_paper_kb_v1`

Features:
- Reading status (`unread`/`reading`/`read`/`bookmarked`)
- Favorites (star toggle)
- Personal notes (inline editor)
- Custom tags (add/remove per paper)
- Recently opened (last 5)
- Sort modes (year desc/asc, title, starred)
- BibTeX / citation copy-to-clipboard
- Hash deep linking (`#paper-id`)
- Category filters (CNN Foundations, Residual & Dense, Mobile & Efficient, Vision Transformers, NAS & Scaling)
- Search via 5-tier engine + `enrichPaperEntity`

---

## Implementation & Code Reference

- **Data:** `data/implementations/resnet50.json` (schema-driven)
- **Schema:** `lib/schema/implementation.schema.ts` (FrameworkType, DifficultyLevel, ImplementationType, CodeSnippet, CodeVariant, CalloutType)
- **Data Access:** `lib/data-access/implementations.server.ts` (server-only, `readFileSync`, graceful null fallback)
- **Highlighting:** `lib/shiki-highlighter.ts` (server-side `codeToHtml`, theme `one-dark-pro`, line highlighting)
- **UI:** `components/code-block/` (header, copy button, callouts, footer, line numbers) + `components/model-explorer/implementation-tab.tsx`

---

## Educational Architecture

### Knowledge Graph

**Location:** `lib/data/relationships.ts`

```typescript
interface ModelRelationships {
  modelId: string;
  family: string;
  era: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  predecessors: ModelRef[];
  successors: ModelRef[];
  influencedBy: ModelRef[];
  influenced: ModelRef[];
  relatedModels: ModelRef[];
  patterns: PatternRef[];
  concepts: ConceptRef[];
  papers: { originalUrl: string; paperPageAnchor: string; relatedPapers: RelatedPaperRef[] };
  compareShortcuts: CompareShortcut[];
  continueLearning: LearningItem[];
}
```

**Coverage:** All 34 models with deterministic relationship metadata

### Educational Components

- **ContinueLearning:** Compact recommendation grid (max 5 items)
- **ModelRelationshipsView:** 7 sections (patterns, concepts, papers, lineage, related, compare, continue)
- **Difficulty Badges:** Beginner/Intermediate/Advanced on model cards
- **Generic Educational Components:** `ConceptExplanation`, `MathSection`, `IntuitionSection`, `AnalogySection`, `ReferenceSection`
- **ImplementationTab:** Engineering specs, prerequisites, Shiki code blocks, engineering notes, next steps

### Learning Pathways

- 3 Guided Paths: Feedforward & Homogeneous Stacks (VGG), Residual Revolution (ResNet), Dense Connectivity (DenseNet)
- Model Selection Advisor: 3-question rule-based wizard → top 4 recommendations

### Concept Explorers

- **Receptive Field:** `/concepts/receptive-field` — interactive RF growth visualization, `?model=`
- **Training Dynamics:** `/concepts/training-dynamics` — full simulator (see above), `?concept=`

---

## Research-Grade Canonical Audit (`nn-audit/`)

### Pinned Environment

- Python 3.12.9, torch 2.13.0+cpu, torchvision 0.28.0+cpu, timm 1.0.28, tensorflow 2.21.0, keras 3.15.1, transformers 5.14.1

### Scripts

| Script | Purpose |
|--------|---------|
| `test_math_and_rf.py` | 6 math/RF unit tests |
| `verify_canonical_database.py` | Zero-trust model/framework/link/cross-repo audit → `audit_full_results.json` |
| `generate_audit_report.py` | Builds `doc/RESEARCH_GRADE_CANONICAL_AUDIT_REPORT.md` |

### Verified Results (July 30, 2026)

- ✅ Layer parameter sum: `Σ layer.params == totalParams` (all 34 models)
- ✅ Tensor shape propagation: all 8,388 layers consistent
- ✅ Cross-repository discrepancies: 0
- ✅ TypeScript: 0 errors | ESLint: 0 errors | 48/48 static pages

---

## Performance Optimizations

### Phase 1B (Performance)
- Lazy-loaded Model Advisor (~15KB deferred)
- Disabled staggered animations on mobile
- Hidden MiniMap on mobile in Flow Canvas
- Converted PageBackground to server component (~2KB reduction)

**Impact:** ~17KB initial JS reduction, ~200KB deferred

### Phase 5 (Code Quality)
- Error boundary via `app/error.tsx`
- Payload splitting at server boundary
- Callback memoization with `useCallback`
- FlowCanvas memoization (removed selectedLayerId from deps)
- ComparisonTable memoization (hoisted METRICS)
- ComparisonChart memoization
- PageTransition fix (removed key={pathname})
- Navbar memoization (STATIC_NAV_GROUPS)

### Training Dynamics / Paper / Shiki Optimizations
- SimulationEngine decoupled from React (immutable snapshots flow to UI)
- Server-side Shiki code highlighting (0KB client)
- Per-paper JSON files (lazy per-paper loading)
- `generateStaticParams()` pre-compiles papers at build
- Zone 7 (Reference) stays collapsed; KaTeX renders only when expanded
- Loss history capped at 50 entries (ring buffer)

### General Optimizations
- Dynamic imports for React Flow, Recharts, Model Advisor, Research Flow
- Memoization with `useMemo` and `useCallback`
- Node limiting (>100 layers disables detailed view)
- Reduced motion support

---

## Mobile Strategy (Phase 2B)

### Mobile Foundations
- Typography scale (min 12px body/label text)
- 44×44px minimum touch targets
- Horizontal scroll affordance gradients
- Safe area inset helpers
- Focus-visible outlines

### Navigation
- Fixed mobile bottom navigation bar (5 destinations)
- Backdrop blur and safe area padding
- Dynamic active state

### Content Density
- Progressive disclosure with collapsed cards
- Responsive SVG diagrams
- Mobile timeline spine indicators
- Bottom sheet max height reduced to 60vh
- 44px touch targets for all interactive elements
- Training dynamics: stacks vertically; comparison mode stacks metrics in cards
- Paper details: utility panel becomes bottom action bar/drawer

---

## Accessibility

### Implemented
- `prefers-reduced-motion` support via `useReducedMotionPreference` hook
- ARIA labels on interactive elements
- Keyboard navigation (tab, focus indicators)
- Semantic HTML (section, nav, main)
- Color contrast meets WCAG AA
- Paper details: `aria-expanded`/`aria-controls` on accordions, `role="tablist"` on filters
- KaTeX `htmlAndMathml` output + `fallbackText` for screen readers

### Screen Reader
- Text content readable
- ARIA labels for visualizations (can be improved)

---

## Styling System

### Color Tokens
```css
--background: #020612;
--card: rgba(9, 15, 35, 0.45);
--border: rgba(255, 255, 255, 0.05);
--primary: #22d3ee;
--text-primary: #e5e7eb;
--text-secondary: #9ca3af;
--text-muted: #6b7280;
```

### Active State Pattern
- Solid cyan background (#22d3ee) + dark text (#020617)
- Cyan glow shadow: `shadow-[0_0_12px_rgba(34,211,238,0.25)]`

### Typography Scale
- Display: `clamp(1.8rem, 5vw + 1rem, 3.5rem)`
- Heading: `clamp(1.3rem, 3vw + 0.8rem, 2.2rem)`
- Body: `0.875rem`
- Caption: `0.75rem`
- Micro: `0.625rem`

### Utilities
- `cn()` — Class name merging (clsx + tailwind-merge)
- `.glass-card` — Backdrop blur card style
- `.min-touch-target` — 44×44px minimum
- `.scroll-fade-x` — Horizontal scroll affordance

### Training Health Badge Colors
- Excellent → emerald / Healthy → teal / Weak → amber / Vanishing → blue / Exploding → red

---

## Key Files to Understand

### Core Architecture
- `app/layout.tsx` — Root layout with fonts, providers
- `app/page.tsx` — Homepage
- `next.config.ts` — Static export config
- `lib/schema/model.schema.ts` — Model type definitions
- `lib/schema/paper.schema.ts` — Canonical paper Zod schema
- `lib/schema/training-dynamics.schema.ts` — Simulation preset + concept schema
- `lib/schema/implementation.schema.ts` — Implementation guide schema

### Canonical Knowledge Layer (Phases 0.1-1.5)
- `lib/knowledge/schema/knowledge-object.schema.ts` — Canonical Knowledge Object (CKO) schema
- `lib/knowledge/perspectives/` — Educational perspective contracts (Architecture, Training, Implementation, Evolution, Research, Mathematics)
- `lib/knowledge/repository/repository.ts` — Unified data access interface (`IKnowledgeRepository`)
- `lib/knowledge/adapters/` — Migration adapters (Model, Paper, Pattern, Training)
- `lib/engine/contracts/` — Domain-independent engine API contracts

### Platform Foundation (Phases 0.1-0.4)
- `lib/registry/domain-registry.ts` — Domain capability declarations
- `lib/registry/perspective-registry.ts` — Educational viewpoint definitions
- `lib/registry/visualizer-registry.ts` — Visualization plugin metadata
- `lib/registry/graph-behavior-registry.ts` — Graph interaction paradigms
- `lib/validation/` — Build-time validation gatekeeper
- `doc/platform-principles.md` — Canonical engineering rules
- `doc/platform-audit.md` — Repository architecture audit
- `doc/platform-expansion-guide.md` — Developer manual for platform expansion

### Data Layer
- `lib/data-access/models.ts` / `models.server.ts` — Model data access
- `lib/data-access/papers.ts` — Paper registry (18 canonical + aliases)
- `lib/data-access/training-dynamics.ts` — Concept data access
- `lib/data-access/learning-engine.ts` — Educational rules engine
- `lib/data-access/implementations.server.ts` — Server-only implementation access
- `lib/data/relationships.ts` — Knowledge graph
- `data/models.json` — Model summaries

### Training Dynamics Engine (Phases 3.1-3.5)
- `lib/training/topology/` — Generic DAG topology model
- `lib/training/engine/` — Standalone execution engine
- `lib/visualization/` — Plugin-driven visualizer framework
- `lib/training-dynamics/simulation-engine.ts` — Main simulation class
- `lib/training-dynamics/telemetry.ts` — Telemetry snapshot + derived helpers
- `lib/training-dynamics/loss-models.ts` — Pluggable loss strategy factory
- `lib/training-dynamics/renderer.ts` — Canvas 2D rendering
- `lib/training-dynamics/particle-engine.ts` — Particle lifecycle

### Knowledge Graph & Navigation (Phases 4.1-4.2)
- `lib/knowledge/graph/relationship-resolver.ts` — Relationship resolution algorithms
- `lib/knowledge/navigation/navigation-service.ts` — Graph-derived navigation routing
- `components/navigation/` — Generic navigation components

### Advanced Experience (Phases 5.1-5.2)
- `lib/comparison/` — Domain-independent comparison framework
- `components/comparison/` — Comparison Studio UI components
- `lib/learning/` — Deterministic walkthrough engine
- `components/learning/` — Guided Learning UI components

### Architecture Pattern Library (Phases 2.1-2.5)
- `data/patterns.json` — Architecture pattern data
- `lib/knowledge/adapters/pattern-adapter.ts` — Pattern to Knowledge Object adapter
- `components/architecture/` — Modular presentation components
- `components/explorer/` — Domain-independent interactive explorer framework
- `doc/architecture/architecture-pattern-library.md` — Pattern library canonical specification

### Papers & Research
- `app/papers/page.tsx` — Knowledge center (local-first)
- `app/papers/[paperId]/page.tsx` — Paper details server component
- `components/paper-details/PaperPageLayout.tsx` — 7-zone layout
- `components/paper-details/zones/` — Zone components
- `types/paper-schema.ts` — Canonical paper types + RKR
- `lib/hooks/use-paper-knowledge-base.ts` — localStorage state

### Search & Hooks
- `lib/search/search-engine.ts` — 5-tier relevance engine
- `lib/search/metadata-enrichment.ts` — Educational metadata
- `lib/hooks/use-knowledge-search.ts` — Unified search hook
- `lib/shiki-highlighter.ts` — Server-side code highlighting

### Components
- `components/model-explorer/tabbed-explorer.tsx` — Main explorer
- `components/model-explorer/implementation-tab.tsx` — Implementation details
- `components/training-dynamics/comparison/comparison-orchestrator.tsx` — Twin-engine comparison
- `components/training-dynamics/telemetry-dashboard.tsx` — Telemetry UI
- `components/code-block/` — Shiki code display
- `components/ui/math-renderer.tsx` — KaTeX rendering

### Audit
- `nn-audit/README.md` — Pinned env + reproduction
- `nn-audit/verify_canonical_database.py` — Zero-trust audit
- `doc/RESEARCH_GRADE_CANONICAL_AUDIT_REPORT.md` — Audit findings

---

## Adding New Content

### Platform Expansion (New Domains)
1. Register domain in `lib/registry/domain-registry.ts`
2. Create canonical JSON data file
3. Implement adapter extending `BaseKnowledgeAdapter` in `lib/knowledge/adapters/`
4. Register adapter in `AdapterRegistry`
5. Include JSON file in `StaticFileRawDataLoader`
6. Run `npm run validate:platform` and `npx tsc --noEmit`
7. Knowledge Repository, Graph, Navigation, Comparison, and Guided Learning automatically support the new domain

### New Model
1. Create model JSON in `data/models/` (follow schema)
2. Add summary to `data/models.json`
3. Add relationships to `lib/data/relationships.ts`
4. Add search metadata to `lib/search/metadata-enrichment.ts`
5. Run `npm run validate:data` + `python nn-audit/verify_canonical_database.py`
6. Build and test

### New Paper
1. Create canonical paper JSON in `data/papers/{paperId}.json` (`types/paper-schema.ts`)
2. Add summary to `data/papers.json`
3. Register + aliases in `lib/data-access/papers.ts` `STATIC_PAPERS_REGISTRY`
4. Add enrichment to `lib/search/metadata-enrichment.ts`

### New Training Dynamics Concept
1. Append to `data/concepts/training-dynamics.json` (concept + `simulationPreset`)
2. Done — Zod validates, tabs render, physics run from preset (zero engine changes)

### New Implementation Guide
1. Create `data/implementations/{modelId}.json` following `lib/schema/implementation.schema.ts`
2. Implementation tab auto-discovers and renders it

---

## Documentation Map

### Canonical Documentation
- `doc/CANONICAL_SPECIFICATION.md` — Single source of truth for platform architecture
- `doc/AI_CONTEXT.md` — This file (5-10 minute AI-readable summary)

### Platform Foundation
- `doc/platform-principles.md` — Canonical Engineering Rules & Platform Principles
- `doc/platform-audit.md` — Repository architecture audit
- `doc/platform-expansion-guide.md` — Developer manual for platform expansion

### Architecture Documentation (`doc/architecture/`)
- `shared-registries.md` — Domain, Perspective, Visualizer, and Graph Behavior registries
- `validation-pipeline.md` — Build-time validation gatekeeper
- `knowledge-object-schema.md` — Canonical Knowledge Object (CKO) schema
- `perspective-schemas.md` — Educational perspective contracts
- `engine-state-contracts.md` — Domain-independent engine API contracts
- `knowledge-repository.md` — Unified data access interface
- `migration-adapters.md` — Legacy data transformation framework
- `architecture-pattern-library.md` — Pattern library canonical specification
- `architecture-components.md` — Component presentation architecture
- `architecture-pattern-migration.md` — Data migration to knowledge layer
- `architecture-relationships.md` — Pattern relationship integration
- `interactive-explorer.md` — Domain-independent explorer framework

### Knowledge Graph Documentation (`doc/knowledge-graph/`)
- `knowledge-navigation.md` — Graph-derived educational navigation
- `cross-linking.md` — Cross-domain navigation specification

### Training Dynamics Documentation (`doc/training-dynamics/`)
- `training-dynamics-architecture.md` — Data-driven simulation platform architecture
- `training-topology.md` — Generic DAG topology model
- `training-engine.md` — Training engine architecture
- `visualizer-framework.md` — Plugin-driven visualization framework
- `gradient-flow-plugin.md` — Gradient Flow visualizer plugin
- `training-visualizers.md` — Training dynamics visualizer plugins

### Advanced Experience Documentation
- `doc/comparison-framework.md` — Comparison Studio architecture
- `doc/guided-learning.md` — Guided Learning architecture

---

## Known Constraints

### Architectural Constraints
- **10-Layer Stack:** Strict unidirectional data flow (Data → Schema → Validation → Data Access → Business Logic → Engine → Visualizer → Adapters → Components → Pages)
- **Registry-Driven:** All capabilities must be registered in canonical registries (Domain, Perspective, Visualizer, Graph Behavior)
- **Knowledge Layer:** All entities must be Knowledge Objects or adapted to Knowledge Objects
- **Build-Time Validation:** All validation must pass build-time gatekeeper

### Platform Constraints
- **Static Export Only:** No API routes or SSR at runtime
- **No Database:** All data in JSON files accessed through Knowledge Repository
- **No Authentication:** No user accounts
- **Bundle Size:** Heavy dependencies (React Flow ~200KB, Framer Motion ~40KB)
- **Scalability:** Current architecture scales to 1000+ models via API backend migration
- **Dark Mode Only:** Hardcoded, no toggle
- **No Export:** No PDF/image export
- **localStorage State:** Paper knowledge base doesn't sync across devices
- **Single Implementation:** Only `resnet50.json` implementation guide currently ships

### Extension Constraints
- **Forbidden:** Direct JSON imports in pages or components
- **Forbidden:** Hardcoded domain-specific logic in core infrastructure
- **Forbidden:** Circular dependencies between layers
- **Forbidden:** UI framework imports in engine or logic layers
- **Forbidden:** Runtime schema validation bypassing

---

## Production Status

**Verification:** ✅ All checks passing
- TypeScript: 0 errors
- ESLint: 0 errors, 0 warnings
- Data Validation: 34 models passed (Zod)
- Python Audit: 34 models layer-math/tensor/cross-repo/links verified
- Static Export: 48/48 pages generated

**Deployment:** Ready for any static hosting (Vercel, Netlify, GitHub Pages)

**Build Command:** `npm run build`

**Output:** `out/` directory

---

## Model Coverage

**34 Models:**
- Foundational: LeNet, AlexNet
- VGG: VGG16, VGG19
- ResNet: 6 variants (50, 101, 152 + V2 versions)
- DenseNet: DenseNet121, DenseNet169, DenseNet201
- Inception: InceptionV3, InceptionResNetV2
- Xception: Xception
- MobileNet: 4 variants (MobileNet, V2, V3Small, V3Large)
- EfficientNet: B0-B7 (8 models)
- NASNet: NASNetMobile, NASNetLarge
- Transformer: ViT, Swin, ConvNeXt, MaxViT

**Total:** 8,388 layers, ~1.23B parameters

---

## Phase History

The platform has evolved through a systematic phased approach:

**Phase 0 — Foundation:** Repository Audit, Platform Principles, Shared Registries, Validation Pipeline
**Phase 1 — Knowledge Layer:** Knowledge Object Schema, Perspective Contracts, Engine State Contracts, Migration Adapters, Knowledge Repository
**Phase 2 — Architecture Pattern Library:** Data Migration, Components Refactor, Interactive Explorer Framework, Relationships, Library Freeze
**Phase 3 — Training Dynamics:** Generic Topology Model, Training Engine, Visualizer Framework, Gradient Flow Plugin, Additional Visualizers
**Phase 4 — Navigation:** Knowledge Navigation, Cross Linking
**Phase 5 — Advanced Experience:** Comparison Studio, Guided Learning
**Phase 6 — Expansion:** New Domain Pilot (Transformer, Graph Algorithms), Platform Expansion Validation

See `doc/CANONICAL_SPECIFICATION.md` Section 32 for complete phase history.

---

## Technical Debt

- No test infrastructure in web app (Medium priority) — partially mitigated by `nn-audit/` Python suite
- No dark mode toggle (Low priority)
- No export functionality (Low priority)
- Chart accessibility (Medium priority)
- localStorage paper state doesn't sync across devices (Low priority)
- Duplicate paper metadata between `papers.json` and `papers/*.json` (Low priority — mitigated by cross-repo audit)

**Status:** Non-blocking for production

---

**For complete details, see [CANONICAL_SPECIFICATION.md](./CANONICAL_SPECIFICATION.md)**