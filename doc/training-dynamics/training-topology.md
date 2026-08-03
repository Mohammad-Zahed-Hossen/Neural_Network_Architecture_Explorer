# Training Topology Architecture Specification (Phase 3.1)

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Specification  
**Target Path:** `doc/training-dynamics/training-topology.md`  
**Phase:** Phase 3.1 Generic Topology Model  

---

## 1. Overview & Purpose

The **Generic Topology Model** (`lib/training/topology/`) replaces all legacy sequential network assumptions with a canonical Directed Acyclic Graph (DAG) topology representation.

It establishes a framework-independent, UI-independent data layer for representing neural network architectures (CNNs, Transformers, Residual Networks, DenseNets, GNNs, MDPs, etc.).

### Core Principles
1. **Decoupled Canonical Representation:** Topology objects contain **zero** SVG/Canvas coordinates, Tailwind classes, or React UI properties.
2. **Framework Independent:** Operates purely on serializable TypeScript data structures (`TopologyGraph`, `TopologyNode`, `TopologyEdge`, `TopologyPort`).
3. **Rigorous Validation:** Enforces structural validation (duplicate checking, referential integrity, port matching) and cycle detection (DAG validation via Kahn's algorithm).
4. **Adapter Strategy:** Translates legacy preset metrics and model layers into canonical DAGs via `SequentialTopologyAdapter` and `ArchitectureTopologyAdapter`.

---

## 2. Architecture & File Structure

```text
lib/training/
├── topology/
│   ├── topology-types.ts      # Immutable TS interfaces (Node, Edge, Port, Graph)
│   ├── topology-schema.ts     # Zod runtime validation schemas
│   ├── topology-builder.ts    # Fluid TopologyBuilder construction utility
│   ├── topology-validator.ts  # Cycle detection, structural & referential validator
│   ├── topology-utils.ts      # Topological sort, root/leaf finders, node queries
│   └── repository.ts          # In-memory TopologyRepository data access
└── adapters/
    ├── sequential-topology-adapter.ts   # Preset depth & skip/dense connection converter
    └── architecture-topology-adapter.ts # NeuralNetworkModel dataset converter
```

---

## 3. Topology Data Model

### 3.1 `TopologyNode`
```ts
export interface TopologyNode {
  readonly id: string;
  readonly type: NodeType;
  readonly label: string;
  readonly inputs: readonly TopologyPort[];
  readonly outputs: readonly TopologyPort[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}
```

### 3.2 `TopologyEdge`
```ts
export interface TopologyEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly sourcePort?: string;
  readonly targetPort?: string;
  readonly type?: EdgeType;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
```

### 3.3 `TopologyGraph`
```ts
export interface TopologyGraph {
  readonly id: string;
  readonly name: string;
  readonly nodes: readonly TopologyNode[];
  readonly edges: readonly TopologyEdge[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}
```

---

## 4. Validation & Graph Algorithms

- **`topologicalSort(graph)`**: Evaluates topological order using Kahn's algorithm. Throws if a cycle is detected.
- **`validateTopology(graph)`**:
  - Checks for duplicate node/edge IDs.
  - Ensures source/target node existence for every edge.
  - Verifies port connections.
  - Warns on disconnected nodes.
  - Runs cycle detection to ensure strict DAG ordering.

---

## 5. Migration & Adapter Strategy

Legacy depth parameters (`depth: 6`, `connectionType: 'residual'`) are wrapped by `createSequentialTopology(options)`:
- Maps sequential, residual, dense, and batchnorm presets directly to canonical DAGs.
- Existing simulators consume DAGs internally without requiring visual modifications.
