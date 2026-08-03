# Canonical Engineering Rules & Platform Principles: Neural Network Architecture Explorer

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Rulebook  
**Target Path:** `doc/platform-principles.md`  
**Scope:** Architecture Standards, Layer Contracts, Knowledge Graph Rules, Simulation Protocols, and Architectural Decision Records  

---

## 1. Platform Vision

### 1.1 What the Platform Is
The **Neural Network Architecture Explorer** is a production-grade, offline-first, static educational platform designed to provide rigorous visual, mathematical, and interactive intuition for artificial intelligence and computer science concepts. It synthesizes architecture topologies, empirical benchmark results, scientific paper provenance, and deterministic signal-flow simulations into a cohesive, highly accessible knowledge space.

### 1.2 What the Platform Is Not
* **Not an Autograd Framework:** It is not PyTorch, TensorFlow, or JAX. It does not execute actual tensor backpropagation, CUDA kernels, or dynamic compute graphs at runtime.
* **Not an Unconstrained Sandbox:** It is not an open-ended code playground. Interactivity serves specific educational objectives.
* **Not an Ephemeral Wrapper:** It is not a thin UI wrapper over external APIs or live LLM services. All data is pre-validated, statically compiled, and deterministically executable offline.

### 1.3 Educational Philosophy
1. **Multi-Perspective Intuition:** Every complex concept must be approachable through multiple complementary perspectives: Intuition, Mathematics, Visual Topology, Historical Evolution, Code Implementation, and Simulated Dynamics.
2. **Empirical Grounding:** Educational narratives must be backed by canonical scientific papers, benchmark provenance, and exact mathematical equations.
3. **Instant Interactive Feedback:** Visualizations must react smoothly to user input (<16ms frame target) to reinforce cause-and-effect learning.

### 1.4 Long-Term Direction
The platform is designed to scale across diverse AI and Computer Science domains—including **Transformers**, **Reinforcement Learning**, **Graph Neural Networks**, **Diffusion Models**, **Optimization Algorithms**, **Classical Machine Learning**, **Graph Algorithms**, and **General CS Concepts**—without requiring structural architectural rewrites.

---

## 2. Knowledge Object Philosophy

### 2.1 The Canonical Knowledge Object (CKO)
All entities in the platform—whether a neural network model, a research paper, a training concept, an architectural pattern, or an algorithm—must be modeled as a **Canonical Knowledge Object (CKO)**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CANONICAL KNOWLEDGE OBJECT                      │
│                                                                        │
│  [Identity]          id, slug, name, domain, version                   │
│  [Metadata]          title, summary, difficulty, tags, authors, era    │
│  [Perspectives]      topology, math, code, simulation, paper_rkr       │
│  [Relationships]     predecessors, successors, influences, related     │
│  [Ownership]         single source of truth in Zod-validated JSON       │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Principles of Knowledge Objects
1. **Identity & Immutability:** Every CKO has a unique, globally distinct `id` (e.g., `model:resnet50`, `paper:he-2015-resnet`, `concept:vanishing-gradient`, `pattern:skip-connection`).
2. **Single Source of Truth:** A Knowledge Object's core data exists in exactly **one** JSON file, validated at build time by a Zod schema. Data must never be duplicated across hardcoded TypeScript objects or parallel JSON files.
3. **Independent Perspectives:** A Knowledge Object may expose one or more *Perspectives* (e.g., visual topology, mathematical formulation, training dynamics preset). Perspectives read from the Knowledge Object but do not mutate its core identity.
4. **Normalized Relationships:** Relationships between Knowledge Objects are directed links defined using globally unique entity IDs (`sourceId`, `targetId`, `relationshipType`).

---

## 3. Architectural Layers

The platform enforces a strict 10-layer unidirectional architectural stack. Data flows strictly from top to bottom.

```
       Layer 1: Data  (JSON Files)
             │
             ▼
       Layer 2: Schema  (Zod Schemas)
             │
             ▼
       Layer 3: Validation  (Build-time Parse & Gate)
             │
             ▼
       Layer 4: Data Access  (Typed Query API)
             │
             ▼
       Layer 5: Business Logic  (Search, Filter, Scoring)
             │
             ▼
       Layer 6: Engine  (Simulation & Math Calculators)
             │
             ▼
       Layer 7: Visualizer  (Canvas 2D, React Flow Core)
             │
             ▼
       Layer 8: Adapters  (Domain State Translation)
             │
             ▼
       Layer 9: Component  (React UI Primitives & Tabs)
             │
             ▼
       Layer 10: Page  (Next.js Route Orchestration)
```

### 3.1 Layer Responsibilities

* **Layer 1: Data (`data/`)**
  Pure static JSON files containing raw entity declarations. Contains zero UI styling, zero Tailwind classes, and zero code logic.
* **Layer 2: Schema (`lib/schema/`)**
  Zod schemas defining the canonical structure and constraint boundaries of every entity and perspective.
* **Layer 3: Validation (`scripts/validate-data.ts`)**
  Build-time execution gate. Validates 100% of JSON files against Zod schemas. Fails the build immediately if validation errors occur.
* **Layer 4: Data Access (`lib/data-access/`)**
  Strongly-typed query API (`getModel`, `getPaper`, `getConcept`). Acts as the sole gatekeeper for retrieving validated entity data.
* **Layer 5: Business Logic (`lib/search/`, `lib/data/`)**
  Pure functions for multi-tier search scoring, relationship traversal, and filter evaluation.
* **Layer 6: Engine (`lib/engine/`, `lib/training-dynamics/`)**
  Domain-specific simulation state engines, telemetry calculators, and mathematical propagation routines.
* **Layer 7: Visualizer (`components/graph-core/`, `components/visualizer/`)**
  Pure visual rendering primitives (React Flow wrapper, HTML5 Canvas 2D renderers).
* **Layer 8: Adapters (`lib/adapters/`)**
  Transformers that map generic Engine States or Knowledge Objects into Visualizer-compatible props.
* **Layer 9: Component (`components/`)**
  Interactive React UI components (buttons, panels, inspectors, code highlighters).
* **Layer 10: Page (`app/`)**
  Next.js App Router route entry points. Assembles components, handles URL parameter synchronization, and sets SEO page metadata.

---

## 4. Dependency & Import Rules

To prevent circular dependencies, layer coupling, and architectural degradation, every layer must adhere strictly to allowed and forbidden import boundaries.

### 4.1 Dependency Matrix

| Layer | MAY Import From | MUST NEVER Import From |
| :--- | :--- | :--- |
| **Layer 1: Data** | None (Raw JSON) | Schema, Data Access, Engine, UI, Pages |
| **Layer 2: Schema** | Zod (`z`) | Data, Data Access, Engine, UI, Pages |
| **Layer 3: Validation** | Data, Schema | Data Access, Engine, UI, Pages |
| **Layer 4: Data Access** | Schema, Data (via server `fs` or static import) | Engine, UI, Components, Pages |
| **Layer 5: Business Logic** | Schema, Data Access | Engine, UI, Components, Pages |
| **Layer 6: Engine** | Schema, Business Logic | UI, Components, Pages |
| **Layer 7: Visualizer** | Schema | Data Access, Engine State Mutators, Pages |
| **Layer 8: Adapters** | Schema, Engine, Visualizer | Components, Pages |
| **Layer 9: Component** | Schema, Data Access, Business Logic, Adapters, Visualizers | Pages, Direct `data/*.json` files |
| **Layer 10: Page** | Data Access, Business Logic, Components, Adapters | Direct `data/*.json` files, Low-level Canvas context |

### 4.2 Strict Import Mandates
1. **NO Direct JSON Imports in Pages/Components:**
   Pages and components must NEVER use `import data from '@/data/file.json'`. All data must be fetched through `lib/data-access/`.
2. **NO Circular Imports:**
   Higher layers (Pages, Components) may import lower layers (Data Access, Schemas). Lower layers must NEVER import higher layers.
3. **NO UI Framework Imports in Engine/Logic Layers:**
   Files in `lib/training-dynamics/`, `lib/schema/`, or `lib/data-access/` must NEVER import React (`import React from 'react'`), JSX, or DOM elements.

---

## 5. Separation of Educational Perspectives

To ensure maintainability as new domains are added, educational perspectives must remain completely independent.

```
                       ┌──────────────────────────────┐
                       │  CANONICAL KNOWLEDGE OBJECT  │
                       └──────────────┬───────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────┐             ┌───────────────┐             ┌───────────────┐
│  TOPOLOGY     │             │  MATHEMATICS  │             │  SIMULATION   │
│  PERSPECTIVE  │             │  PERSPECTIVE  │             │  PERSPECTIVE  │
└───────────────┘             └───────────────┘             └───────────────┘
        │                             │                             │
        ▼                             ▼                             ▼
React Flow Nodes              KaTeX TeX Formulas            Canvas 2D Simulator
```

* **Architecture Pattern Perspective:** Focuses on structural connection motifs (e.g., skip connection, self-attention block).
* **Training Dynamics Perspective:** Focuses on signal flow, gradient norms, convergence stability, and particle animations.
* **Research Perspective:** Focuses on scientific paper provenance, citations, ablation studies, and literature DAGs.
* **Evolution Perspective:** Focuses on historical timeline context, problem-solution pairs, and generational shifts.
* **Implementation Perspective:** Focuses on code integration, framework specs, and engineering prerequisites.

**Rule:** Modifying one perspective (e.g., updating a particle renderer) must NEVER break or alter another perspective (e.g., KaTeX formulas or paper citation lists).

---

## 6. Naming Conventions

All files, types, variables, and components must adhere to strict, unambiguous naming standards.

| Entity Type | Convention | Format | Example |
| :--- | :--- | :--- | :--- |
| **Page File** | Kebab-case | `app/<route>/page.tsx` | `app/architecture-patterns/page.tsx` |
| **Component File** | Kebab-case | `components/<domain>/<name>.tsx` | `components/model-explorer/flow-canvas.tsx` |
| **Schema File** | Kebab-case suffix | `lib/schema/<domain>.schema.ts` | `lib/schema/model.schema.ts` |
| **Data Access File** | Kebab-case | `lib/data-access/<domain>.ts` | `lib/data-access/models.ts` |
| **Engine File** | Kebab-case | `lib/engine/<name>.ts` | `lib/training-dynamics/simulation-engine.ts` |
| **Zod Schema Var** | PascalCase + 'Schema' | `<Name>Schema` | `NeuralNetworkModelSchema` |
| **Inferred Type** | PascalCase | `<Name>` | `NeuralNetworkModel` |
| **React Component** | PascalCase | `function <Name>()` | `function TabbedExplorer()` |
| **Custom Hook** | camelCase + 'use' prefix | `use<Name>` | `useKnowledgeSearch` |
| **Registry Object** | SCREAMING_SNAKE_CASE | `<NAME>_REGISTRY` | `MODEL_DOMAIN_REGISTRY` |

---

## 7. Knowledge Graph Rules

All graph visualizations across the platform (Model Topology, Research Citation DAG, Evolution Tree, Concept Map) must follow a unified graph architecture:

### 7.1 Architecture Requirements
1. **Single Rendering Core:** All node-and-edge graphs must be rendered using a single shared `GraphRenderer` component built on `@xyflow/react`.
2. **Automatic Layout Generation:** Graph layout coordinates ($X, Y$) must be calculated programmatically using layout engines (e.g., Dagre, D3-hierarchy, or custom physics layouts). Hardcoding pixel coordinates in JSON or TS arrays is strictly forbidden.
3. **Plugin-Based Interaction:** Graph behaviors (e.g., node inspection, edge highlighting, filter toggles, minimap controls) must be implemented as modular interaction plugins passed to `GraphRenderer`.
4. **State Ownership:** The graph rendering core owns viewport state (zoom, pan). Domain selection state (selected node ID) resides in URL query parameters or top-level component state.

---

## 8. Simulation Rules

The Training Dynamics simulator and future domain simulators must strictly adhere to the following rules:

### 8.1 Core Principles
1. **NO AUTOGRAD AT RUNTIME:** The simulation engine MUST NOT execute autograd engines, backpropagation tensors, or neural network training frameworks at runtime.
2. **Deterministic Educational Physics:** Simulations are deterministic, closed-form mathematical approximations designed to illustrate specific theoretical concepts (e.g., exponential gradient decay $g_l = g_0 \cdot \gamma^l$).
3. **Decoupled Lifecycle:** The simulation loop (`SimulationEngine`) must run independently of React's render loop, communicating purely through event emitters and state snapshots.
4. **60 FPS Target:** Canvas 2D renderers must maintain smooth 60 FPS animation performance using `requestAnimationFrame`.

---

## 9. Engine State Contracts

Engines and UI visualizers communicate via a strict unidirectional contract:

$$\text{EngineState} \longrightarrow \text{Adapter / Telemetry} \longrightarrow \text{Visualizer} \longrightarrow \text{React UI}$$

### 9.1 Rules of Interaction
* **Unidirectional Flow:** The UI triggers engine methods (`engine.pause()`, `engine.setLearningRate(0.01)`). The engine updates its internal state and emits a state snapshot.
* **FORBIDDEN Direct State Mutation:** Visualizers and React UI components MUST NEVER directly mutate `EngineState` properties.
* **Extensibility for New Domains:** Future domain engines (e.g., RL MDP Engine, Transformer Attention Engine) must expose standard lifecycle hooks: `initialize()`, `step(dt)`, `pause()`, `reset()`, and `getStateSnapshot()`.

---

## 10. Domain Registry Rules

To add a new domain (e.g., Transformers, Reinforcement Learning, Graph Neural Networks) to the platform, developers must follow the **Domain Registry Pattern**:

```
                               ┌───────────────────────────┐
                               │  GLOBAL DOMAIN REGISTRY   │
                               └─────────────┬─────────────┘
                                             │
        ┌────────────────────────────────────┼────────────────────────────────────┐
        ▼                                    ▼                                    ▼
┌───────────────┐                    ┌───────────────┐                    ┌───────────────┐
│ Vision Domain │                    │  Transformer  │                    │   RL Domain   │
│  (Existing)   │                    │    Domain     │                    │   (Future)    │
└───────────────┘                    └───────────────┘                    └───────────────┘
```

### 10.1 Steps to Register a New Domain
1. **Define Domain Schema:** Create `lib/schema/<domain>.schema.ts` defining the domain's Knowledge Objects.
2. **Register Domain Entry:** Add domain metadata to `lib/registry/domains.ts` specifying its identity, label, icon, and supported perspectives.
3. **Register Visualizers:** Register domain-specific visualizers in the Visualizer Registry.
4. **Add Data Access Endpoints:** Provide queries in `lib/data-access/<domain>.ts`.
5. **No Core Rewrites:** Registering a new domain must require zero modifications to existing domain schemas or core layout components.

---

## 11. Migration Strategy

The transition from current technical debt to the new Platform Principles must be **incremental and backward-compatible**.

### 11.1 Migration Principles
1. **ABSOLUTELY NO BIG-BANG REWRITES:** The application must remain 100% buildable (`npm run build`) and fully functional at every step of migration.
2. **Adapter Compatibility Layer:** Legacy data formats (e.g., existing `models.json` or `papers.json`) will be wrapped in Adapter functions (`lib/adapters/`) to present a Canonical Knowledge Object interface to new components.
3. **Single Source of Truth:** During migration, dual-authoritative models (where data is edited in two places) are strictly forbidden. The legacy JSON remains authoritative until the new schema parser is fully active.
4. **Phased Retirement:** Legacy functions are marked `@deprecated` and removed only after all consuming components have migrated to the data-access layer.

---

## 12. Documentation Standards

Every new architectural module, schema, engine, or platform utility must include a standardized header docstring containing:

```typescript
/**
 * @module ModuleName
 * @purpose Concise description of what this file accomplishes.
 * @layer Layer Number (1-10)
 * @dependencies List of primary module dependencies
 * @api Summary of public exported functions or classes
 * @limitations Known constraints or non-goals
 */
```

---

## 13. Platform Engineering Rules

1. **Performance & Bundle Budgets:**
   * Initial page JS bundle size must remain $<150\text{ KB}$ gzipped.
   * Heavy dynamic libraries (React Flow, KaTeX, Shiki) must be lazy-loaded using `next/dynamic`.
2. **Static Export First:**
   * All pages must compile cleanly to static HTML via `next build`.
   * No runtime server-side Node.js APIs (`fs`, `path`) may be invoked inside Client Components.
3. **Accessibility (a11y):**
   * All interactive controls must feature minimum 44×44px touch targets.
   * Support `prefers-reduced-motion` across all Canvas and CSS animations.
4. **Testing Thresholds:**
   * 100% of JSON files must pass Zod schema validation.
   * 100% of data-access query functions must be covered by automated unit tests.

---

## 14. Non-Goals

The platform explicitly and intentionally DOES NOT pursue the following:

1. **Live LLM Tutors or AI Chatbots:** No real-time LLM API calls or dynamic text generation inside core learning workflows.
2. **Full Autograd / Framework Runtime:** No dynamic Python runtime, PyTorch Wasm execution, or live backpropagation execution.
3. **Unconstrained Code Playgrounds:** No browser-based IDEs or Python interpreters for arbitrary code execution.
4. **CNN-Only Assumptions:** Architecture design must not assume all networks consist of 2D spatial feature maps $(C, H, W)$.
5. **Duplicate Knowledge Ownership:** No hardcoding data in UI components or maintaining parallel unvalidated TypeScript arrays.

---

## 15. Architectural Decision Records (ADRs)

### ADR-001: Adoption of Canonical Knowledge Objects (CKO)
* **Status:** Approved / Canonical
* **Context:** Repository audit revealed fragmented data access, duplicated relationships, and hardcoded pattern arrays across pages.
* **Decision:** All entities across all present and future domains will be represented as Zod-validated Canonical Knowledge Objects with unified identity, metadata, and independent educational perspectives.
* **Consequences:** Eliminates schema drift, enables global search indexing across all entities, and allows seamless addition of new domains.

### ADR-002: Deterministic Non-Autograd Educational Simulation
* **Status:** Approved / Canonical
* **Context:** Interactive simulation is required to teach vanishing gradients, layer normalization, and optimization dynamics.
* **Decision:** Simulations will use closed-form mathematical models and deterministic particle physics in Canvas 2D, operating on a decoupled event-driven `SimulationEngine`. Live autograd calculation is explicitly excluded.
* **Consequences:** Guarantees 60 FPS animation performance, zero heavy WebAssembly dependencies, and reliable offline execution.

### ADR-003: Single Shared Graph Rendering Core
* **Status:** Approved / Canonical
* **Context:** `FlowCanvas` and `ResearchFlow` duplicated React Flow setup, controls, zoom state, and node types.
* **Decision:** Build a single unified `GraphRenderer` core component with programmatic layout algorithms (Dagre/D3) and plugin-based interaction behaviors.
* **Consequences:** Eliminates manual $X, Y$ coordinate hardcoding, reduces bundle size, and standardizes graph UI across all pages.

### ADR-004: Incremental Adapter-Based Migration
* **Status:** Approved / Canonical
* **Context:** Overhauling the repository data access layer risks breaking existing static export pages.
* **Decision:** All migrations will proceed incrementally using Adapter patterns to wrap existing data sources before deprecating legacy data structures. Big-bang rewrites are forbidden.
* **Consequences:** Ensures zero downtime, continuous build stability, and low-risk architectural evolution.
