# Training Dynamics Architecture & Simulation Engine Guide

## Architecture Overview

The **Training Dynamics** module is built on a **data-driven, decoupled simulation platform**. It separates educational content, simulation state, physics, graphics rendering, and UI controls into isolated, single-responsibility modules.

```
data/concepts/training-dynamics.json  <-- Educational Content & Simulation Presets
         │
         ▼
lib/schema/training-dynamics.schema.ts  <-- Zod Runtime Validation & Types
         │
         ▼
lib/data-access/training-dynamics.ts   <-- Strongly-typed Data Access Layer
         │
         ▼
app/concepts/training-dynamics/page.tsx <-- Modular React Orchestrator
   ├── components/training-dynamics/
   │     ├── concept-selector.tsx
   │     ├── explanation-panel.tsx
   │     ├── control-panel.tsx
   │     ├── metric-panel.tsx
   │     ├── legend.tsx
   │     ├── canvas.tsx
   │     └── architecture-preview.tsx
   └── components/educational/
         ├── concept-explanation.tsx
         ├── math-section.tsx
         ├── intuition-section.tsx
         ├── analogy-section.tsx
         └── reference-section.tsx
```

---

## Engine Core & Lifecycle

The simulation system is orchestrated by `SimulationEngine` (`lib/training-dynamics/simulation-engine.ts`), a standalone TypeScript class independent of React UI lifecycles.

### Simulation Lifecycle

1. **Initialization (`engine.initialize(width, height)`)**:
   - Computes node graph topology layout (`physics.ts`).
   - Resets state iteration, epoch, and metric metrics.

2. **Update Cycle (`engine.update(deltaTime)`)**:
   - Advances simulation step counter and epoch progress.
   - Spawns ambient or backprop pulse particles (`particle-engine.ts`).
   - Updates particle trajectory coordinates based on active preset parameters.
   - Re-evaluates real-time layer health, gradient magnitude, and stability metrics.

3. **Render Cycle (`engine.render(ctx, width, height)`)**:
   - Delegates drawing to `SimulationRenderer` (`renderer.ts`).
   - Consumes current `SimulationGraph`, `SimulationParticle[]`, `SimulationPreset`, and `SimulationState`.

---

## Simulation Presets System

Every concept defines a `SimulationPreset` in `data/concepts/training-dynamics.json`. The engine reads preset parameters dynamically, avoiding hardcoded `if (activeTab === 'vanishing')` logic.

### Preset Interface

| Field | Type | Description |
| :--- | :--- | :--- |
| `particleSpeed` | `number` | Velocity of gradient signal particles across layers |
| `gradientDecayRate` | `number` | Exponential shrinkage rate per layer (Vanishing) |
| `gradientGrowthRate` | `number` | Exponential expansion rate per layer (Exploding) |
| `skipProbability` | `number` | Probability of taking identity skip arc (ResNet) |
| `parallelConnections` | `boolean` | Multi-channel connection from output to all layers (DenseNet) |
| `normalization` | `boolean` | Enables layer normalization barriers (BatchNorm) |
| `gradientColor` | `string` | Primary particle and node glow color |
| `connectionType` | `string` | `'sequential' \| 'residual' \| 'dense' \| 'batchnorm'` |
| `weightInitialization` | `string` | `'he' \| 'xavier' \| 'random_large' \| 'random_small'` |

---

## Event System

`SimulationEngine` provides a strongly-typed event emitter interface (`on`, `off`):

- `Backpropagation`: Fired when a backprop pulse is manually triggered.
- `EpochComplete`: Fired when 50 training iterations complete.
- `MetricsUpdated`: Emitted every frame with updated quantitative metrics (`gradientMagnitude`, `layerHealth`, `networkStability`).
- `PresetChanged`: Fired when a new concept preset is loaded.
- `StateChanged`: Fired when pause, depth, or learning rate controls update.

---

## Renderer Responsibilities

`SimulationRenderer` (`lib/training-dynamics/renderer.ts`) is a pure Canvas 2D drawing pipeline. It performs no business logic or physics updates. It reads graph nodes, connection styles, particle locations, and renders:

- Sequential lines, skip connection curves, dense Bezier arcs.
- Normalization barrier lines and bell curve overlays.
- Glowing particles with radial gradients.
- Layer nodes with index labels and jitter effects.

---

## Step-by-Step Guide: Adding a New Concept or Simulator

To add a new concept (e.g., *Layer Normalization*, *Gradient Clipping*, or *Attention Head Signal Flow*):

1. **Add Entry to JSON (`data/concepts/training-dynamics.json`)**:
   Define the title, problem, intuition, mathematics, and a custom `simulationPreset`:
   ```json
   {
     "id": "layernorm",
     "title": "Layer Normalization",
     "difficulty": "intermediate",
     "category": "normalization",
     "summary": "Normalizes across features rather than mini-batches...",
     "simulationPreset": {
       "id": "preset-layernorm",
       "name": "Layer Normalization",
       "particleSpeed": 2.2,
       "gradientColor": "#F59E0B",
       "connectionType": "batchnorm",
       "normalization": true,
       "normalizationStrength": 1.0,
       ...
     }
   }
   ```

2. **That's it!**
   - Zod validates the new JSON entry automatically at runtime.
   - Data access layer (`getTrainingConcepts()`) includes it in tabs.
   - The renderer automatically styles connections, particles, and node graphs according to the new preset.
