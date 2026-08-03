# Training Dynamics Visualizer Framework Specification (Phase 3.3)

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Specification  
**Target Path:** `doc/training-dynamics/visualizer-framework.md`  
**Phase:** Phase 3.3 Visualizer Framework  

---

## 1. Overview & Purpose

The **Visualization Framework** (`lib/visualization/`) decouples network simulation execution from visual presentation.

Instead of hardcoding rendering logic inside the simulation loop, visualization is handled by modular, plugin-driven visualizers that observe canonical `EngineState` snapshots without modifying simulation physics or scheduler state.

```text
Training Engine
       │
       ▼
 EngineState
       │
       ▼
Visualizer Registry & Manager
       │
 ┌─────┼──────────────┬──────────────┬──────────────┬──────────────┐
 ▼     ▼              ▼              ▼              ▼              ▼
Gradient Flow   Learning Curve   Layer Health   Timeline   Distribution
```

---

## 2. Dependency Rules

1. **READ-ONLY Observers:** Visualizer plugins MUST NEVER mutate `EngineState`, `TrainingEngine`, `TopologyScheduler`, or `TopologyGraph`.
2. **Framework Independence:** Plugins communicate via `VisualizerContext` and `EngineState` contracts.
3. **Registry Driven:** All plugins register with `visualizerRegistry` and are discovered dynamically based on capability matching.

---

## 3. Visualizer Contract Interface

Every visualizer plugin implements `VisualizerPlugin`:

```ts
export interface VisualizerPlugin {
  readonly id: string;
  readonly name: string;
  readonly metadata: VisualizerMetadata;
  readonly capabilities: VisualizerCapabilities;

  supports(engineState: EngineState): boolean;
  initialize(context: VisualizerContext): void;
  dispose(): void;
  render(canvasCtx: CanvasRenderingContext2D | null, context: VisualizerContext): void;
  update(state: EngineState): void;
  getInspectorData(state: EngineState, selectedNodeId?: string | null): Record<string, unknown>;
  getSnapshot(state: EngineState): VisualizerSnapshot;
}
```

---

## 4. Host Integration

React components consume plugins via `VisualizerHost` (`components/visualizers/VisualizerHost.tsx`):
- Provides plugin switching toolbar (`VisualizerSwitcher`).
- Manages canvas or DOM container lifecycles.
- Forwards updated `EngineState` snapshots frame-by-frame.
