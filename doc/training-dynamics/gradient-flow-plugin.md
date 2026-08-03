# Gradient Flow Visualizer Plugin Specification (Phase 3.4)

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Specification  
**Target Path:** `doc/training-dynamics/gradient-flow-plugin.md`  
**Phase:** Phase 3.4 Simulator Migration  

---

## 1. Overview & Purpose

The **Gradient Flow Plugin** (`lib/visualization/plugins/gradient-flow/`) migrates the legacy Canvas 2D simulator renderer into a standard `VisualizerPlugin`.

It preserves 100% pixel-identical visual behavior, animation timing, particle counts, and node glow effects while operating within the plugin architecture.

---

## 2. Component Structure

```text
lib/visualization/plugins/gradient-flow/
├── gradient-flow.plugin.ts   # Plugin lifecycle & Canvas 2D render loop
├── GradientFlowRenderer.tsx  # React canvas wrapper
├── GradientFlowLegend.tsx    # Connection color key overlay
├── GradientFlowOverlay.tsx   # Loss & epoch metric telemetry overlay
├── GradientFlowInspector.tsx # Selected layer details inspector
└── index.ts                  # Plugin barrel export
```

---

## 3. Compatibility Guarantees

- **No Visual Shifts:** Consumes exact color scales, particle speeds, and jitter formulas from `SimulationRenderer` and `ParticleEngine`.
- **Read-Only Inspection:** Reads layer health and stability metrics directly from `EngineState`.
- **Zero Simulation Code:** Contains no physics or engine step logic.
