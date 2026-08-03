# Canonical Engineering Audit: Neural Network Architecture Explorer

**Document Version:** 1.0.0  
**Audit Scope:** Repository Architecture, Data Flow, Schemas, Data Access, Graphs, Simulations, Technical Debt, and Long-Term Scalability  
**Target Path:** `doc/platform-audit.md`  
**Status:** Canonical & Grounded in Existing Repository Code  

---

## 1. Executive Summary

### 1.1 Platform Overview
The **Neural Network Architecture Explorer** is an interactive, static educational web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 6.0.3**, **Tailwind CSS 4**, **Zod 4.4.3**, **@xyflow/react (React Flow) 12.11.0**, and **Framer Motion 12.40.0**. The platform compiles into a 100% static export (`out/` directory with 48 HTML pages) and covers 34 deep neural network models (8,388 total layers), 18 canonical research papers, an architecture evolution timeline, dynamic training simulation engines, and a 5-tier search engine.

### 1.2 Architectural Maturity Assessment
The current system demonstrates high domain quality and strong rendering performance for its immediate scope (convolutional and foundational transformer visual models). However, from a **Platform Engineering perspective**, the codebase is currently structured as a **feature-complete single-domain web application** rather than a **decoupled multi-domain knowledge platform**.

* **Strengths:**
  * **Build & Static Export Stability:** 48/48 pages export statically with zero TypeScript (`npx tsc --noEmit`) and zero ESLint errors.
  * **Mathematical Rigor & Verification:** Automated Python audit suite (`nn-audit/`) validates layer parameter sums, shape propagation tensor math, and ImageNet-1K benchmark provenance across PyTorch, TorchVision, timm, and Keras.
  * **High UX polish:** Rich glassmorphism aesthetics, responsive React Flow graph rendering, and dark-theme Tailwind styling.
  * **Isolated Simulation Engine:** The training dynamics engine (`lib/training-dynamics/simulation-engine.ts`) effectively decouples Canvas 2D particle updates from React component state.

* **Weaknesses:**
  * **Dual Data Access Patterns & Schema Bypassing:** Several pages (`app/research-map`, `app/evolution`, `app/papers`, `app/page`) bypass `lib/data-access` and import raw JSON files directly (`import papersData from '@/data/papers.json'`).
  * **Duplicated & Unvalidated Knowledge Ownership:** Key domains (Architecture Patterns, Evolution Timeline, Research Graph relationships) exist as hardcoded TypeScript arrays or raw unvalidated JSON objects rather than normalized Zod-validated Knowledge Objects.
  * **Graph Infrastructure Duplication:** Two completely separate React Flow wrappers (`FlowCanvas` and `ResearchFlow`) re-implement graph node registration, viewport state, layout calculation, and canvas controls without a shared graph rendering core.
  * **God Components:** Large monodisciplinary components (e.g., `app/page.tsx` at 54KB, `components/model-explorer/tabbed-explorer.tsx` at 34KB, `app/architecture-patterns/page.tsx` at 39KB) mix data fetching, UI layout, layout algorithms, search indexing, and tab management.

### 1.3 Major Architectural Observations
To scale beyond classical CNNs to **Transformers, Reinforcement Learning, Graph Neural Networks, Diffusion Models, Optimization Algorithms, and General Computer Science**, the platform must transition from hardcoded, domain-specific feature views to a **registry-driven Knowledge Object Architecture**. Currently, adding a new domain requires building custom pages, custom hardcoded JSON/TS structures, and redundant visualizers.

---

## 2. Repository Structure

### 2.1 Directory Organization & Responsibilities
The repository is organized under standard Next.js App Router conventions with root-level utility and data folders:

```
nn_architecture/
├── app/                        # Next.js App Router pages & route layouts
├── components/                 # React UI components (primitives, domain visualizers)
├── data/                       # Raw static JSON datasets (models, papers, concepts)
├── doc/                        # Canonical engineering & specification documentation
├── lib/                        # Core utilities, data access, Zod schemas, search, simulation
├── nn-audit/                   # Python verification scripts & framework audit benchmarks
├── public/                     # Static media assets & vector SVGs
├── scripts/                    # Node.js data validation & preprocessing scripts
└── types/                      # Manual TypeScript interface definitions
```

### 2.2 Layer Separation Audit
| Layer | Declared Purpose | Observed Code Location | Implementation Fidelity | Key Violations |
| :--- | :--- | :--- | :--- | :--- |
| **Data Layer** | Raw data storage | `data/*.json`, `data/*/*.json` | Mixed | Raw JSON files contain pre-computed layout nodes and hardcoded UI colors. |
| **Schema Layer** | Type validation | `lib/schema/*.ts` | Incomplete | Parallel schema definition in `types/paper-schema.ts` duplicates `lib/schema/paper.schema.ts`. |
| **Data Access Layer** | Data loading API | `lib/data-access/*.ts` | Fragmented | Only covers models, papers (partially), and training concepts. Bypassed by 4 major pages. |
| **Domain Logic & Engine** | Physics & Simulation | `lib/training-dynamics/*` | High | High separation in simulation engine; low in search & relationships. |
| **UI Visualizer** | Graph & Canvas renderers | `components/model-explorer/*` | Mixed | Components directly invoke layout calculations and format raw JSON. |
| **Pages & Routes** | Next.js Page Orchestration | `app/*` | Low | Pages contain hardcoded domain data, inline SVG formulas, and inline filtering logic. |

### 2.3 Current Conventions vs. Architectural Inconsistencies
* **Good Practices:**
  * Strict distinction between server-only routines (`import 'server-only'` in `models.server.ts` and `implementations.server.ts`) and client-side data access.
  * Zod schemas infer TypeScript types (`export type NeuralNetworkModel = z.infer<typeof NeuralNetworkModelSchema>`), ensuring alignment when schemas change.
  * Modular design system primitives under `components/ui/`.

* **Architectural Inconsistencies:**
  * **Dual Schema Repositories:** Paper schemas exist in both `types/paper-schema.ts` (manual interface) and `lib/schema/paper.schema.ts` (Zod schema).
  * **Direct Data Imports:** Pages import `data/papers.json` and `data/evolution.json` directly using relative paths, ignoring `lib/data-access/`.
  * **Hardcoded UI Metadata in Data Files:** `data/models.json` and `lib/data/model-categories.ts` embed Tailwind CSS class strings (`bg-blue-500/10`, `text-blue-400`), coupling presentation styling to data storage.

---

## 3. Data Flow Audit

### 3.1 Standard Canonical Data Flow
The intended platform architecture mandates a strict unidirectional data flow:

$$\text{JSON Data} \longrightarrow \text{Zod Schema} \longrightarrow \text{Runtime Validation} \longrightarrow \text{Data Access Layer} \longrightarrow \text{Component} \longrightarrow \text{Page}$$

### 3.2 Audit of Actual Data Flows Across Pages
By auditing every route in `app/`, three distinct data access patterns were identified:

```
[Pattern A: Standard Validated Flow]
data/models/*.json ──> lib/schema/model.schema.ts ──> lib/data-access/models.server.ts ──> app/models/[slug]/page.tsx

[Pattern B: Unvalidated Direct Import Flow (VIOLATION)]
data/papers.json ────────────────────────────────────────────────────────────────────────> app/research-map/page.tsx
data/evolution.json ──────────────────────────────────────────────────────────────────────> app/evolution/page.tsx

[Pattern C: Hardcoded In-Code Data Flow (VIOLATION)]
Hardcoded TS Array (app/architecture-patterns/page.tsx) ──────────────────────────────────> Component Rendering
Hardcoded Map (lib/data/relationships.ts) ────────────────────────────────────────────────> Model Explorer UI
```

### 3.3 Identified Data Flow Deficiencies
1. **Bypassed Data Access Layer:** `app/research-map/page.tsx`, `app/papers/page.tsx`, `app/evolution/page.tsx`, `app/page.tsx`, and `components/research-map/research-flow.tsx` import raw JSON files directly without going through `lib/data-access/`.
2. **Bypassed Validation:** When importing `data/papers.json` directly into `research-flow.tsx`, Zod schema validation (`CanonicalPaperZodSchema`) is never executed at runtime. If JSON contains invalid fields or malformed links, the UI fails silently or crashes.
3. **Type Assertion Escape Hatches:** In `lib/data-access/papers.ts` (line 122), when Zod validation fails, the code logs an error but returns raw unvalidated data cast via type assertion (`return rawData as CanonicalPaperSchema`), breaking schema safety guarantees.
4. **Duplicate Scenarios Loading:** `lib/data-access/learning-engine.ts` directly imports `data/training-dynamics-rules.json` and `data/training-dynamics-scenarios.json`, type-casting raw JSON (`as ScenarioItem[]`) without Zod validation.

---

## 4. Schema Audit

### 4.1 Schema Hierarchy Overview
Runtime schemas are located in `lib/schema/` and built with Zod:

```
lib/schema/
├── model.schema.ts                # Model summary, layers, layout, connections, metrics
├── paper.schema.ts                # Canonical paper metadata, RKR, innovations, evidence
├── implementation.schema.ts       # Code snippets, engineering specs, prerequisites
└── training-dynamics.schema.ts    # Simulation presets, concepts, metric bounds
```

### 4.2 Detailed Schema Evaluation

#### `lib/schema/model.schema.ts`
* **Strengths:** Comprehensive coverage of tensor dimensions (`channels`, `height`, `width`), parameter breakdown (`weights`, `biases`), and educational notes (`summary`, `whyItMatters`).
* **Weaknesses:** Includes pre-computed React Flow layout nodes (`LayoutNode`, `GroupedNode`, `GroupedEdge`) inside the data schema itself. Layout coordinates (`x`, `y`) are bound to the data model rather than generated dynamically by a graph layout algorithm.
* **Extensibility Limitation:** Layer types are constrained to a fixed enum (`LayerType = z.enum([...])`) tailored to 2D CNNs and standard Attention heads. It cannot represent Graph Convolutional layers, Diffusion timestep embeddings, or RL environment state spaces without editing the core enum.

#### `lib/schema/paper.schema.ts` vs `types/paper-schema.ts`
* **Deficiency:** Extreme duplication. `types/paper-schema.ts` declares 168 lines of manual TypeScript interfaces (`PaperMetadata`, `PaperSummary`, `TechnicalInnovation`, etc.), while `lib/schema/paper.schema.ts` declares corresponding Zod schemas. Any modification requires updating two separate files.

#### `lib/schema/implementation.schema.ts`
* **Strengths:** Strictly validates code snippets, framework requirements (PyTorch, TensorFlow), and hardware prerequisites.
* **Weakness:** Server-only loading logic (`implementations.server.ts`) returns `null` on validation failure rather than exposing diagnostic error boundaries.

#### Missing Abstractions
* **Knowledge Object Schema:** No unified schema exists representing a generic "Knowledge Node" with generic identity, relationships, tags, and domain type.
* **Relationship System Schema:** `lib/data/relationships.ts` is an unvalidated 614-line TypeScript file. There is no `relationship.schema.ts`.

---

## 5. Data Access Audit

### 5.1 Architecture & Conventions
The data access layer resides in `lib/data-access/`:
* `models.ts`: Client-side cache for model summaries (`getModelSummaries()`).
* `models.server.ts`: Server-side file reader (`getModel(id)`).
* `papers.ts`: Hardcoded in-memory registry mapping paper IDs and slug aliases.
* `training-dynamics.ts`: Validates training concept JSON catalog (`getTrainingConcepts()`).
* `implementations.server.ts`: Server-side reader for code snippets (`getImplementationData(slug)`).
* `learning-engine.ts`: Evaluates live simulation states against training rules.

### 5.2 Consistency & Bypassing Analysis
* **Inconsistent Caching:** `models.ts` and `training-dynamics.ts` use module-level memory variables (`let modelsSummariesCache = null`) for caching. `papers.ts` creates a static record of pre-imported JSON modules.
* **Hardcoded Static Registry in `papers.ts`:**
  ```typescript
  // lib/data-access/papers.ts
  import lenetPaperData from '@/data/papers/lenet-1998-ieee-lecun.json';
  // ... 17 more static imports ...
  const STATIC_PAPERS_REGISTRY: Record<string, unknown> = {
    'lenet-1998-ieee-lecun': lenetPaperData,
    'lenet': lenetPaperData,
    // ...
  };
  ```
  This pattern forces all 18 paper JSON files to be bundled statically into the `papers.ts` module, increasing initial bundle evaluation overhead instead of lazy-loading paper records on demand.

---

## 6. Relationship System Audit

### 6.1 Current Implementation Overview
The platform's relationship graph is defined in `lib/data/relationships.ts`. It exports `RELATIONSHIPS_MAP`, a 614-line static TypeScript map defining lineage, prerequisites, successors, related papers, and concept links for all 34 models.

### 6.2 Strengths & Weaknesses
* **Strengths:** Provides rich educational context for model exploration, populating "Influenced By", "Influenced", "Related Models", and "Continue Learning" panels.
* **Weaknesses:**
  * **Dual Authoritative Maintenance:** Paper relationships exist in three places:
    1. `lib/data/relationships.ts` (Model-to-Paper anchors)
    2. `data/papers.json` (Paper-to-Paper DAG edges)
    3. `data/papers/*.json` (`connections.lineage` array inside individual paper files)
  * **No Validation:** `RELATIONSHIPS_MAP` is not validated against Zod schemas. Invalid `modelId` references in `predecessors` or `successors` degrade silently.
  * **Missing Domain Entities:** Relationships only connect Models and Papers. Concepts, Architecture Patterns, and Evolution Timeline steps are referenced as raw string URLs (`/concepts/receptive-field?model=lenet`) rather than first-class Knowledge Graph nodes.

---

## 7. Graph Infrastructure Audit

### 7.1 Existing Graph Implementations
The codebase contains two primary React Flow implementations and two custom rendering surfaces:

1. **FlowCanvas (`components/model-explorer/flow-canvas.tsx`):** Renders layer topology graphs (Detailed mode) and stage block graphs (Grouped mode).
2. **ResearchFlow (`components/research-map/research-flow.tsx`):** Renders the research paper citation DAG.
3. **SimulationRenderer (`lib/training-dynamics/renderer.ts`):** HTML5 Canvas 2D engine for particle signal flow.
4. **Evolution Timeline (`app/evolution/page.tsx`):** CSS/DOM-based vertical timeline tree.

### 7.2 Duplication & Code Smell Analysis

```
                                  [CURRENT GRAPH ARCHITECTURE]
                                                │
                ┌───────────────────────────────┴───────────────────────────────┐
                ▼                                                               ▼
   components/model-explorer/flow-canvas.tsx                    components/research-map/research-flow.tsx
   - ReactFlow initialization                                   - ReactFlow initialization
   - Viewport & Zoom state management                           - Viewport & Zoom state management
   - MiniMap / Controls config                                  - MiniMap / Controls config
   - LayerNode custom renderer                                  - PaperNode custom renderer
   - Manual layout mapping                                      - Hardcoded X/Y coordinate layout array
```

### 7.3 Identified Deficiencies & Future Risks
* **No Shared Graph Abstraction:** Every graph component manually manages `@xyflow/react` node state, edge state, zooming, minimap toggles, and canvas controls.
* **Hardcoded Graph Layouts:** `ResearchFlow` hardcodes node $(x, y)$ positions in a static array (`{ id: 'lenet', x: 260, y: 0 }, { id: 'alexnet', x: 260, y: 110 }`). Adding a new paper requires manually adjusting pixel coordinates for all surrounding nodes.
* **Risk of God Component Explosion:** `FlowCanvas` handles topology data normalization, layer type filtering, node hidden states, edge styling, canvas export reset logic, and DOM element measurements in a single 452-line file.

---

## 8. Architecture Pattern Page Audit

### 8.1 Current Implementation (`app/architecture-patterns/page.tsx`)
The Architecture Patterns page presents 5 core visual design patterns: Residual Connections, Dense Connectivity, Depthwise Separable Convolutions, Compound Scaling, and Self-Attention.

### 8.2 Audit Findings
* **Architecture:** Implemented as a single, monolithic 647-line Client Component (`'use client'`).
* **Data Model Coupling:** The entire pattern catalog (problem descriptions, solution narratives, mathematical LaTeX formulas, trade-offs, and associated model IDs) is declared as a hardcoded static array (`const PATTERNS: PatternInfo[]`) at the top of the page file.
* **Limitations:**
  * Cannot be queried programmatically by the search engine or data-access layer.
  * Adding a pattern requires modifying the page UI component file directly.
  * No Zod schema validates `PatternInfo`.

---

## 9. Training Dynamics Audit

### 9.1 Module Overview
The Training Dynamics module (`lib/training-dynamics/`) provides an interactive simulation of backpropagation, vanishing/exploding gradients, activation saturation, and normalization effects.

### 9.2 Subsystem Breakdown
```
lib/training-dynamics/
├── simulation-engine.ts   # Standalone TypeScript simulation orchestrator & event bus
├── renderer.ts            # HTML5 Canvas 2D pure drawing pipeline
├── particle-engine.ts     # Gradient pulse particle physics & trajectory updates
├── physics.ts             # Layer node layout calculation & jitter offset math
├── telemetry.ts           # Telemetry metrics calculator (gradient norm, layer health)
├── loss-models.ts         # Mathematical loss curve generators (Synthetic loss curves)
└── color-system.ts        # HSL color scale interpolators for gradient glow
```

### 9.3 Detailed Audit
* **Strengths:**
  * **Strict Decoupling:** `SimulationEngine` operates completely independently of React rendering lifecycles. It uses a clean event emitter pattern (`on`, `off`, `emit`).
  * **Pure Canvas Renderer:** `SimulationRenderer` contains zero business logic or state mutation; it renders frame state passed from the engine.
* **Weaknesses & Technical Debt:**
  * **Synthetic Math Heuristics:** `LossModelFactory` and `telemetry.ts` use simplified heuristic formulas to mock loss and gradient decay rather than actual numerical matrix multiplications. (This is appropriate for educational visualization, but must be explicitly specified as an educational non-autograd simulation).
  * **Preset Hardcoding:** `data/concepts/training-dynamics.json` contains educational content AND simulation physics parameters in a single file.

---

## 10. Evolution Page Audit

### 10.1 Purpose & Current Architecture
The Evolution page (`app/evolution/page.tsx`) renders a historical timeline of 9 architectural milestones (LeNet $\rightarrow$ AlexNet $\rightarrow$ VGG $\rightarrow$ ResNet $\rightarrow$ Inception $\rightarrow$ MobileNet $\rightarrow$ DenseNet $\rightarrow$ EfficientNet $\rightarrow$ Transformers).

### 10.2 Audit Findings
* **Data Source:** Imports `data/evolution.json` directly at the top of the file (`import evolutionData from '@/data/evolution.json'`).
* **Lack of Data Access Integration:** `evolutionData` is not exposed via `lib/data-access/`.
* **Isolated Relationship Model:** Milestone items in `evolution.json` link to models via a single `exampleModelId` string, but do not integrate with `lib/data/relationships.ts` or `data/papers.json`.

---

## 11. Research Map Audit

### 11.1 Purpose & Current Architecture
The Research Map page (`app/research-map/page.tsx`) renders an interactive paper dependency graph using React Flow (`components/research-map/research-flow.tsx`).

### 11.2 Audit Findings
* **Graph Hardcoding:** As documented in Section 7, all paper node coordinates and directed edges are hardcoded inside `research-flow.tsx`.
* **Data Bypassing:** `research-flow.tsx` imports `data/papers.json` directly.
* **Extensibility Deficiencies:** Cannot dynamically compute DAG layout based on citation or lineage data. Adding 50 new papers would result in node overlaps unless manual pixel adjustments are performed.

---

## 12. Shared Components Audit

### 12.1 Categorization of Current Components

| Category | Component Path | Responsibility | Platform Maturity |
| :--- | :--- | :--- | :--- |
| **God Component** | `app/page.tsx` | Mission Control Dashboard, universal search indexer, continue-learning preview, spotlight renderer | **Low** (Needs breaking into feature modules) |
| **God Component** | `components/model-explorer/tabbed-explorer.tsx` | Explorer tab state, topology mode, inspector integration, URL state synchronization | **Medium** (Functional, but monolithic) |
| **Platform Infra** | `components/ui/math-formula.tsx` | KaTeX mathematical rendering wrapper | **High** (Clean, reusable primitive) |
| **Platform Infra** | `components/layout/page-background.tsx` | Server-rendered background glow utility | **High** (Optimized, low footprint) |
| **Utility Component** | `components/ui/continue-learning.tsx` | Renders up to 5 recommended learning cards | **High** (Clean, props-driven) |
| **Feature Component** | `components/model-catalog/model-card.tsx` | Individual model card rendering in catalog | **High** (Modular, performant) |

---

## 13. Technical Debt

The following table categorizes all technical debt identified during the audit:

| Category | Issue | Severity | Root Cause | Impact | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Architecture** | Direct JSON Imports | **High** | Pages bypass `lib/data-access/` to import JSON directly. | Bypasses runtime schema validation; breaks layer separation. | Enforce data loading strictly via `lib/data-access/`. |
| **Architecture** | Dual Schema Definitions | **High** | `types/paper-schema.ts` duplicates `lib/schema/paper.schema.ts`. | Risk of drift between compile-time types and Zod schemas. | Eliminate manual TS interfaces; derive types from Zod schemas. |
| **Data Layer** | Hardcoded Relationships | **Medium** | `lib/data/relationships.ts` is an unvalidated 614-line TS file. | No runtime validation; silent link failures. | Move relationships into Zod-validated JSON/object schemas. |
| **Data Layer** | Styling Tokens in Data | **Medium** | JSON files contain Tailwind color strings (`text-blue-400`). | Couples data model to CSS utility classes. | Replace color strings with semantic theme identifiers. |
| **Graph Layer** | Duplicate React Flow Engines | **High** | `FlowCanvas` and `ResearchFlow` duplicate graph wrappers. | Code bloat; inconsistent canvas controls & styling. | Create unified `GraphRenderer` core component. |
| **Graph Layer** | Hardcoded Graph Coordinates | **High** | `research-flow.tsx` manually hardcodes $X, Y$ positions. | Unscalable; new papers require manual pixel layout. | Implement automatic DAG layout engine (e.g. Dagre/D3-hierarchy). |
| **Simulation Layer**| Synthetic Physics Heuristics | **Low** | `telemetry.ts` uses artificial formulas for loss curves. | Functional for basic UI; non-rigorous for advanced domains. | Document explicitly as educational non-autograd simulation. |
| **Maintainability** | In-Code Pattern Catalog | **Medium** | `PATTERNS` array hardcoded inside page UI component. | Patterns cannot be indexed by global search or data-access. | Move patterns to Zod-validated dataset. |
| **Testing** | Zero Test Infrastructure | **High** | No unit test runner (Jest/Vitest) or E2E tests (Playwright). | Regression risk during platform refactoring. | Add Vitest suite for Zod validation & data-access. |
| **Bundle Size** | Heavy Dynamic Packages | **Medium** | `@xyflow/react` (~200KB) and `shiki` (~150KB) loaded on client. | Potential page load latency if not properly code-split. | Maintain dynamic import boundaries (`next/dynamic`). |

---

## 14. Future Scaling Assessment

### 14.1 Can the Current Architecture Scale to New Domains?
**Assessment: NO, not without architectural refactoring.**

### 14.2 Domain Scaling Failure Mode Analysis
1. **Transformers & Attention Mechanisms:** The current `model.schema.ts` assumes a linear stack of 2D Convolutional layers with $(C, H, W)$ shapes. Representing Multi-Head Self-Attention, KV Caching, and Patch Embeddings requires schema extensions for sequence length $(S)$, embedding dimension $(D)$, and attention head counts $(H)$.
2. **Reinforcement Learning (RL):** RL requires visualizing Markov Decision Processes (MDPs), policy networks, value functions, replay buffers, and environment interaction loops. The current linear layer/node topology model cannot represent agent-environment feedback loops.
3. **Graph Neural Networks (GNNs):** GNNs operate on non-Euclidean graph structures (nodes, edges, adjacency matrices, message passing). The current hardcoded 2D layout engine cannot render arbitrary message-passing graphs.
4. **Diffusion Models:** Diffusion architectures involve forward noise addition processes and reverse denoising U-Nets over discrete timesteps ($t$). The current simulator assumes standard epoch-based backpropagation.
5. **Optimization & Classical CS Algorithms:** Visualizing Gradient Descent trajectories, Convex Hulls, A* Search, or Sorting Network topologies requires generalized State-Space Visualizers rather than neural network layer inspectors.

---

## 15. Final Repository Health Score

| Dimension | Score (1-10) | Detailed Justification |
| :--- | :---: | :--- |
| **Architecture** | **6.5 / 10** | Clean App Router structure and static export stability, but undermined by direct data imports, bypassed data-access layers, and unvalidated relationship files. |
| **Maintainability** | **6.0 / 10** | Well-commented codebase and clear file names, but suffering from God components, duplicated graph logic, and inline data arrays. |
| **Scalability** | **4.5 / 10** | Heavily tailored to 2D CNN visual models. Cannot scale to Transformers, RL, or GNNs without establishing a generalized Knowledge Object framework. |
| **Extensibility** | **5.0 / 10** | Adding new models within existing families is easy, but adding new domains requires writing custom pages and hardcoded layout arrays. |
| **Documentation** | **8.5 / 10** | Excellent specification docs (`CANONICAL_SPECIFICATION.md`, `AI_CONTEXT.md`) and automated mathematical verification audit reports. |
| **Testing** | **3.0 / 10** | Automated Python audit scripts verify parameter totals and ImageNet benchmarks, but zero TypeScript unit or integration tests exist in Node.js runtime. |
| **OVERALL HEALTH**| **5.6 / 10** | **Solid Feature Prototype, Needs Platform Foundation.** The app is visually polished and mathematically sound, but requires Phase 0.2 Architectural Contracts before scaling. |
