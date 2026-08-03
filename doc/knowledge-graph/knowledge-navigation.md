# Knowledge Navigation Specification (Phase 4.1)

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Specification  
**Target Path:** `doc/knowledge-graph/knowledge-navigation.md`  
**Phase:** Phase 4.1 Knowledge Navigation  

---

## 1. Overview & Purpose

**Phase 4.1 Knowledge Navigation** transforms the Neural Network Architecture Explorer into an automatically navigatable, graph-derived knowledge system.

Rather than maintaining manual array declarations inside React page components, all educational navigation—including **Related Knowledge**, **Prerequisites**, **Successors**, **Perspective Links**, and **Learning Paths**—is dynamically derived from the **Knowledge Repository & Graph**.

```text
Knowledge Repository (Layer 4)
             │
             ▼
Knowledge Graph & RelationshipResolver (Layer 5)
             │
             ▼
NavigationService & Repository Query APIs
             │
             ▼
Generic Navigation UI Components (Layer 9)
```

---

## 2. Repository & Navigation APIs

All navigation queries are executed through `IKnowledgeRepository` (`lib/knowledge/repository/repository.ts`) and `NavigationService` (`lib/knowledge/navigation/navigation-service.ts`):

- `knowledgeRepository.getPerspectiveLinks(id)`: Returns available perspective routes (Architecture, Training, Research, Evolution, Implementation).
- `knowledgeRepository.getLearningPath(id)`: Returns `{ previous, current, next }` graph step.
- `knowledgeRepository.getRelatedObjects(id)`: Returns graph-resolved related entities.
- `knowledgeRepository.getPrerequisites(id)`: Returns inferred prerequisite entities.
- `knowledgeRepository.getSuccessors(id)`: Returns inferred successor entities.
- `knowledgeRepository.findShortestLearningPath(startId, endId)`: Executes BFS graph traversal to build a learning sequence.

---

## 3. Navigation Component Hierarchy (`components/navigation/`)

| Component | Responsibility |
| :--- | :--- |
| `KnowledgeNavigation` | Container orchestrating PerspectiveSwitcher, LearningPath, and CrossDomainExplorer. |
| `PerspectiveSwitcher` | Navigates across Architecture, Training, Research, Evolution, and Implementation perspectives. |
| `LearningPath` | Renders Previous $\leftarrow$ Current $\rightarrow$ Next learning path bar. |
| `RelatedKnowledge` | Generic card grid rendering graph-derived related objects. |
| `PrerequisiteList` | Displays inferred prerequisites. |
| `SuccessorList` | Displays inferred evolutionary successors. |

---

## 4. Extension Rules

1. **Zero Manual Arrays:** Never write hardcoded `relatedModels = [...]` inside React components.
2. **Domain Independent:** Navigation components accept generic `KnowledgeObject` arrays without architecture-specific assumptions.
