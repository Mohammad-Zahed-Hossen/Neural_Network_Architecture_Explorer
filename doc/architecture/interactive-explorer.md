# Phase 2.3 — Interactive Explorer Framework Documentation

## Executive Summary

Phase 2.3 introduces a domain-independent, renderer-independent **Interactive Explorer Framework** under `components/explorer/`.

This framework replaces static educational SVG illustrations with interactive, declarative architecture blueprints supporting:
- **Component Hovering**: Highlights target node, connected edge paths, and temporary context tooltips.
- **Component Selection**: Persists node focus, displays comprehensive educational analysis in the **Component Inspector**, and synchronizes active component state in the **Layer Explorer**.
- **Layer Sequence Browser**: Provides a linear component index for keyboard/click focus.
- **Domain Independence**: Fully reusable across future educational modules (CNNs, Transformers, GNNs, Training Dynamics).

---

## Architecture Diagram

```text
Knowledge Repository / Structured Blueprint Data
        │
        ▼
Explorer Blueprint Model (components/explorer/blueprints/*)
        │
        ▼
Explorer State (hoveredNodeId, selectedNodeId, focusedLayerId)
        │
        ▼
ArchitectureExplorer Controller (components/explorer/ArchitectureExplorer.tsx)
        │
 ┌──────────────┼─────────────────────┼─────────────────────┐
 ▼              ▼                     ▼                     ▼
ExplorerCanvas  ExplorerNodes/Edges   LayerExplorer Browser ComponentInspector
```

---

## Explorer State & Data Schema

### 1. State Model (`ExplorerState`)
```ts
export interface ExplorerState {
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  focusedLayerId: string | null;
  expandedGroups: string[];
}
```

### 2. Declarative Blueprint Model (`ExplorerBlueprintData`)
```ts
export interface ExplorerNodeData {
  id: string;
  label: string;
  sublabel?: string;
  type: 'input' | 'weight-block' | 'operation' | 'layer' | 'output' | 'controller' | 'token';
  role: string;
  purpose: string;
  informationFlow: string;
  educationalNotes?: string[];
  relatedConcepts?: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  shape?: 'rect' | 'circle' | 'pill';
  strokeColor?: string;
  fillColor?: string;
  textColor?: string;
  badge?: string;
}

export interface ExplorerEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'sequential' | 'skip' | 'concatenation' | 'feedback' | 'projection';
  color?: string;
  dashed?: boolean;
  pathD?: string;
}
```

---

## Component Responsibilities

| Component | Responsibility |
| :--- | :--- |
| `ArchitectureExplorer` | Orchestrates explorer state and composes Canvas, Layer Browser, and Inspector. |
| `ExplorerCanvas` | SVG viewport container displaying nodes and edges with grid markings. |
| `ExplorerNode` | Renders rect/circle/pill node graphics with hover/selection glows, keyboard focus, and ARIA labels. |
| `ExplorerEdge` | Renders connecting paths, arrows, dashed styles, and highlight effects. |
| `LayerExplorer` | Educational layer sequence browser with click-to-focus and active state indicators. |
| `ComponentInspector` | Educational inspector panel revealing component role, purpose, information flow, and concepts. |

---

## Accessibility & Interaction Rules

- **Interaction Priority**: Selection > Hover. Hover effects do not clear active component selection.
- **Keyboard Navigation**: Nodes support `tabIndex={0}`, `role="button"`, and keyboard triggers (`Enter`, `Space`).
- **Focus Management**: Selecting a component via Layer Explorer or Canvas updates ARIA attributes (`aria-selected`).
