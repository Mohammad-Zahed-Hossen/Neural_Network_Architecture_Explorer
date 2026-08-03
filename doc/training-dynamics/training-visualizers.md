# Training Dynamics Visualizer Plugins Specification (Phase 3.5)

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Specification  
**Target Path:** `doc/training-dynamics/training-visualizers.md`  
**Phase:** Phase 3.5 Additional Visualizers  

---

## 1. Overview

The platform includes **6 registered visualizer plugins**, each tailored for specific educational perspectives:

| Plugin ID | Name | Mode | Category | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `gradient-flow` | Gradient Flow Simulator | `canvas-2d` | Physics | Real-time particle signal flow, layer nodes, & connection arcs. |
| `learning-curve` | Learning Curve Telemetry | `dom` | Metrics | Real-time loss trajectories, accuracy, & learning rate progression. |
| `layer-health` | Layer Health & Stability | `dom` | Diagnostics | Activation health scores, gradient norms, & stability heatmap. |
| `distribution` | Activation & Weight Distribution | `dom` | Statistics | Statistical histograms & variance for weights & activations. |
| `execution-timeline` | Execution & Compute Timeline | `dom` | Timeline | Step history, forward/backward pass execution markers. |
| `node-inspector` | Node Inspector & Details | `dom` | Inspection | Detailed node parameters, tensor shapes, & educational notes. |

---

## 2. Capabilities & Inspection

All visualizers register automatically into `visualizerRegistry` and are filtered dynamically using `visualizerRegistry.supports(engineState)`.
Users can seamlessly toggle between visualizers in the UI without interrupting or restarting the underlying simulation engine.
