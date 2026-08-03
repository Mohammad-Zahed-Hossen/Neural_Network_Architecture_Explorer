# Platform Expansion Guide — Developer Manual (Phase 6.2)

**Document Version:** 1.0.0  
**Status:** Canonical Developer & Architectural Guide  
**Target Path:** `doc/platform-expansion-guide.md`  
**Phase:** Phase 6.2 Expansion Documentation  

---

## Section 1: Platform Architecture Overview

The Neural Network Architecture Explorer is a data-driven, repository-backed, graph-derived platform for domain-independent technical education and visualization.

```text
                                 ┌─────────────────────────────────┐
                                 │   Canonical Knowledge Layer     │
                                 │   (CKO Schema & Perspectives)   │
                                 └────────────────┬────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │      Knowledge Repository       │
                                 │    (IKnowledgeRepository)       │
                                 └────────────────┬────────────────┘
                                                  │
             ┌────────────────────────────────────┼────────────────────────────────────┐
             ▼                                    ▼                                    ▼
┌─────────────────────────┐          ┌─────────────────────────┐          ┌─────────────────────────┐
│     Knowledge Graph     │          │    Training Engine      │          │ Visualizer Framework    │
│  (RelationshipResolver) │          │  (DAG Simulation Engine)│          │   (VisualizerPlugins)   │
└────────────┬────────────┘          └────────────┬────────────┘          └────────────┬────────────┘
             │                                    │                                    │
             ▼                                    ▼                                    ▼
┌─────────────────────────┐          ┌─────────────────────────┐          ┌─────────────────────────┐
│  Knowledge Navigation   │          │    Comparison Studio    │          │     Guided Learning     │
│ (PerspectiveSwitcher/   │          │ (ComparisonEngine &     │          │ (LearningEngine &       │
│  CrossDomainExplorer)   │          │  ComparisonAdapters)    │          │  Walkthrough Sessions)  │
└─────────────────────────┘          └─────────────────────────┘          └─────────────────────────┘
```

### Layer Responsibilities

1. **Knowledge Layer (`lib/knowledge/schema/`):** Zod-validated Canonical Knowledge Object (CKO) schema contracts (`Identity`, `Metadata`, `Educational`, `Registry`, `Relationships`, `Extensibility`).
2. **Knowledge Repository (`lib/knowledge/repository/`):** Single read-only data access abstraction (`IKnowledgeRepository`) isolating file I/O and data transformations via `AdapterRegistry`.
3. **Knowledge Graph (`lib/knowledge/graph/`):** Relationship resolution algorithms (`RelationshipResolver`) deriving related entities, prerequisites, successors, and cross-domain connections.
4. **Perspectives System (`lib/registry/perspective-registry.ts`):** Standard multi-perspective view declarations (`architecture`, `training`, `mathematics`, `research`, `evolution`, `implementation`).
5. **Navigation Framework (`lib/knowledge/navigation/`):** Graph-derived navigation routing (`NavigationService`) delivering automatic perspective links, learning paths, and cross-domain exploration.
6. **Training Engine (`lib/training/`):** Standalone physics, DAG topology, and execution state simulation engine.
7. **Visualizer Framework (`lib/visualization/`):** Modular plugin pipeline (`VisualizerPlugin`) rendering Canvas 2D telemetry, topologies, layer health, and distribution curves.
8. **Comparison Studio (`lib/comparison/`):** Domain-independent comparison service (`ComparisonService`) and adapters mapping arbitrary entities into comparative matrices.
9. **Guided Learning System (`lib/learning/`):** Deterministic walkthrough engine (`LearningEngine`) building 7-stage educational sessions and prediction exercises.

---

## Section 2: How to Add a New Domain

To introduce a new domain (e.g., `diffusion-models`, `reinforcement-learning`) without modifying core platform code:

### Step 1: Register Domain in Domain Registry
In `lib/registry/domain-registry.ts`:
```ts
export const DOMAIN_REGISTRY = {
  // ...
  'diffusion-models': {
    id: 'diffusion-models',
    name: 'Diffusion & Generative AI',
    description: 'Score-based generative models, reverse diffusion processes, and latent samplers.',
    status: 'active',
    icon: 'Sparkles',
    supportedPerspectives: ['architecture', 'training', 'mathematics', 'research', 'implementation'],
    supportedVisualizers: ['topology', 'gradient-flow', 'layer-health', 'node-inspector'],
    supportedGraphBehaviors: ['topology-navigation', 'relationship-explorer', 'knowledge-graph'],
    supportedEngineStates: ['idle', 'running', 'paused', 'active', 'completed'],
    defaultPerspective: 'architecture',
    defaultVisualizer: 'topology',
    defaultGraphBehavior: 'topology-navigation',
  },
};
```

### Step 2: Create Canonical Data JSON
Create `data/diffusion-models.json` containing objects with `id`, `name`, `slug`, `type`, `domain`, `summary`, `description`, `math`, `tradeoffs`, `prerequisiteObjects`, `successorObjects`, `relatedObjects`, and `papers`.

### Step 3: Implement Domain Adapter
In `lib/knowledge/adapters/diffusion-adapter.ts`:
```ts
export class DiffusionAdapter extends BaseKnowledgeAdapter<RawDiffusionData> {
  public readonly adapterType = 'DiffusionAdapter';
  public supports(data: unknown): boolean {
    return (data as any)?.domain === 'diffusion-models';
  }
  protected transform(data: RawDiffusionData): Partial<KnowledgeObject> {
    return {
      identity: { id: `diffusion:${data.id}`, slug: data.slug, title: data.name, type: 'pattern', status: 'stable' },
      metadata: { summary: data.summary, description: data.description, tags: ['diffusion'], keywords: ['unet'] },
      educational: { difficulty: 'advanced', learningStage: 'advanced', prerequisites: data.prerequisiteObjects },
      registry: { supportedDomains: ['diffusion-models'], supportedPerspectives: ['architecture', 'training'] },
      relationships: { relatedObjects: data.relatedObjects, prerequisiteObjects: data.prerequisiteObjects, successorObjects: data.successorObjects },
      extensibility: { domainMetadata: { math: data.math, tradeoffs: data.tradeoffs } },
    };
  }
}
```

### Step 4: Register Adapter & Update Loader
1. Register adapter in `lib/knowledge/adapters/registry.ts`: `this.registerAdapter(new DiffusionAdapter());`.
2. Include JSON file in `StaticFileRawDataLoader` in `lib/knowledge/repository/loader.ts`.

### Step 5: Verification & Testing
Run `npm run validate` and `npx tsc --noEmit`. The Knowledge Repository, Knowledge Graph, Navigation, Comparison Studio, and Guided Learning will instantly support the new domain.

---

## Section 3: How to Add a New Perspective

1. **Define Perspective Contract:** Add Zod schema contract in `lib/knowledge/perspectives/<name>.schema.ts`.
2. **Register in Perspective Registry:** Add perspective entry in `lib/registry/perspective-registry.ts`.
3. **Update Repository getPerspective:** Extend `IKnowledgeRepository.getPerspective(id, perspectiveId)` in `lib/knowledge/repository/repository.ts`.
4. **Integration with Navigation & UI:** `PerspectiveSwitcher` automatically discovers registered perspectives via `getPerspectiveLinks()`.

---

## Section 4: How to Add a New Visualizer Plugin

1. **Implement `VisualizerPlugin`:** Create plugin class in `lib/visualization/plugins/<plugin-name>/` implementing:
   ```ts
   export class CustomVisualizerPlugin implements VisualizerPlugin {
     public readonly id = 'custom-visualizer';
     public readonly name = 'Custom Telemetry Renderer';
     public readonly metadata = { ... };
     public readonly capabilities = { ... };
     public supports(engineState: EngineState): boolean { return true; }
     public initialize(): void {}
     public dispose(): void {}
     public render(ctx: CanvasRenderingContext2D, state: EngineState): void { ... }
     public update(delta: number, state: EngineState): void { ... }
     public getInspectorData(state: EngineState): Record<string, unknown> { return { ... }; }
     public getSnapshot(state: EngineState): VisualizerSnapshot { return { ... }; }
   }
   ```
2. **Register Plugin:** Call `visualizerRegistry.register(new CustomVisualizerPlugin())`.

---

## Section 5: How to Add Engine States

1. **Add State Identifier:** Include state string in `EngineState` type definition in `lib/registry/registry-types.ts`.
2. **Update Engine State Transition Machine:** Define valid transition inputs in `TrainingEngine` state machine.
3. **Emit Engine State Event:** Emit strongly-typed event (`StateChanged`) from `SimulationEngine`.

---

## Section 6: How to Add Graph Behaviors

1. **Declare Behavior Metadata:** Add entry to `GRAPH_BEHAVIOR_REGISTRY` in `lib/registry/graph-behavior-registry.ts`.
2. **Extend RelationshipResolver (if needed):** Implement specialized graph traversal query algorithm in `lib/knowledge/graph/relationship-resolver.ts`.
3. **Expose Repository Query API:** Add read-only method to `IKnowledgeRepository`.

---

## Section 7: Architectural Principles

- **Repository-First:** All UI views consume data through `IKnowledgeRepository`. Never import raw JSON directly inside React components.
- **Graph-First:** All navigation links, related cards, and prerequisites are derived dynamically from graph relationships. Zero manual arrays in UI code.
- **Plugin-First:** Visualizers and adapters register via declarative interfaces.
- **Perspective-First:** Content is organized across uniform canonical perspectives.
- **Deterministic:** Zero AI, zero random generators, zero unseeded dynamic mutations.
- **Static Generation:** All routes compile statically at build time (`output: 'export'`).
- **Single Source of Truth:** `CANONICAL_SPECIFICATION.md` and TypeScript types define all schemas.
- **Composition over Inheritance:** Domain behavior is composed via data schemas and adapters.

---

## Section 8: Extension Rules & Checklist

### Allowed Modifications
- Adding new data files in `data/`.
- Creating new `BaseKnowledgeAdapter` implementations in `lib/knowledge/adapters/`.
- Registering new domains, perspectives, visualizers, or graph behaviors in `lib/registry/`.
- Adding automated regression tests in `scripts/`.

### Forbidden Modifications
- Hardcoding domain-specific (`if (domain === 'transformer')`) logic inside core framework engines (`ComparisonEngine`, `LearningEngine`, `RelationshipResolver`, `NavigationService`).
- Adding manual navigation links or hardcoded model arrays inside page components.
- Introducing external AI, autograd, or dynamic runtime script generation.
- Mutating read-only collections returned by `IKnowledgeRepository`.

### Contributor Review Checklist
- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `npm run lint` passes with 0 warnings/errors.
- [ ] `npm run validate` passes all data, platform, and adapter tests.
- [ ] `npm run build` generates all static routes successfully.
- [ ] New domain objects are queryable via `IKnowledgeRepository`.
- [ ] New domain objects work automatically with Comparison Studio and Guided Learning.
