# Guided Learning Architecture Specification (Phase 5.2)

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Specification  
**Target Path:** `doc/guided-learning.md`  
**Phase:** Phase 5.2 Guided Learning  

---

## 1. Executive Summary & Purpose

**Phase 5.2 Guided Learning** delivers a deterministic, graph-driven walkthrough system for every knowledge object in the repository.

It replaces manual learning guides with a structured, 7-stage educational lifecycle featuring predefined prediction exercises, checkpoint status management, and local session persistence.

```text
Knowledge Graph (Layer 5)
          │
          ▼
   Learning Service
          │
          ▼
   Learning Engine
          │
          ▼
   Learning Session
          │
          ▼
  Guided UI Components
```

---

## 2. Walkthrough Stages Lifecycle

Every knowledge object exposes a deterministic sequence of 7 walkthrough stages:

1. **Introduction:** Overview, motivation, and domain positioning.
2. **Core Concept:** Mathematical formulations, blueprints, and internal transformations.
3. **Knowledge Graph:** Prerequisites, successor architectures, and cross-domain links.
4. **Training Dynamics:** Loss trajectories, gradient stability, and optimization behavior.
5. **Research & Evolution:** Academic paper literature, author citations, and timeline lineage.
6. **Implementation:** Framework code snippets, tensor dimensions, and execution blueprints.
7. **Summary & Checkpoints:** Final review, checkpoint recap, and topic mastery confirmation.

---

## 3. Educational Prediction Exercises

Before revealing key concepts or training dynamics, Guided Learning presents interactive prediction prompts.

- **Deterministic:** All prompts, options, correct indices, and explanations are predefined. No AI or LLMs are used.
- **Pedagogical Goal:** Encourages active learning by prompting the user to reason about gradient behavior, computational complexity, or architectural trade-offs before reading the solution.

---

## 4. Checkpoint Model & Session Storage

- **Checkpoint States:** `Completed`, `Reviewed`, `Needs Review`.
- **User Interaction-Driven:** States update automatically as the user progresses or when manually toggled in the UI. No scoring or adaptive recommendation algorithms.
- **LocalStorage Persistence:** Session state (`completed`, `visited`, `checkpoints`) is saved per object ID in `localStorage` under `nn_explorer_guided_learning_<id>`.

---

## 5. UI Component Hierarchy (`components/learning/`)

- `GuidedLearning`: Main orchestrator container managing session lifecycle.
- `LearningProgress`: Step counter and completion percentage indicator.
- `LearningSidebar`: Collapsible stage list drawer.
- `WalkthroughPanel`: Stage content viewer for formulas, text, and code snippets.
- `PredictionPanel`: Interactive prediction exercise component.
- `LearningCheckpoint`: Interactive checkpoint status toggle.
- `LearningNavigator`: Graph-connected step navigation bar (`Previous` $\leftarrow$ `Current` $\rightarrow$ `Next`).
- `LearningSummary`: Walkthrough completion recap panel.

---

## 6. Extension Strategy

Adding new knowledge objects automatically generates complete 7-stage walkthroughs and prediction exercises without writing custom React page components.
