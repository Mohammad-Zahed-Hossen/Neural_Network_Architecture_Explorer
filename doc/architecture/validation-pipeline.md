# Platform Validation Pipeline Specification

**Document Version:** 1.0.0  
**Status:** Canonical Engineering Gatekeeper Specification  
**Target Path:** `doc/architecture/validation-pipeline.md`  
**Phase:** 0.4 Validation Pipeline  

---

## 1. Executive Summary & Purpose

The **Platform Validation Pipeline** is a build-time, zero-runtime-overhead architectural gatekeeper for the Neural Network Architecture Explorer platform.

It guarantees platform configuration integrity by programmatically enforcing architectural contracts before static Next.js assets are generated. If any canonical registry or knowledge object violates platform rules, the validation pipeline immediately halts the build with clear, actionable diagnostics.

### Core Guarantees
1. **Build Gatekeeper:** Executes during `npm run build` prior to page collection (`scripts/validate-platform.ts`).
2. **Zero Runtime Impact:** Runs purely in Node.js during build/CI phases. No validation code or schema parsers leak into client-side JS bundles.
3. **Modular & Generic Architecture:** Organised into modular rule validators under `lib/validation/validators/`. Designed for seamless expansion in Phase 1 (Knowledge Objects), Phase 2 (Architecture Patterns), and Phase 3 (Training Dynamics).
4. **Read-Only Inspection:** Performs pure, side-effect-free analysis across registered capability definitions.
5. **Did-You-Mean Recommendations:** Employs Levenshtein distance matching to suggest corrections when invalid references or missing IDs are encountered.

---

## 2. Validation Architecture & Flow

```mermaid
graph TD
    Registries["Canonical Registries<br/>(lib/registry)"]
    Pipeline["Validation Pipeline<br/>(lib/validation)"]
    
    subgraph Rule Validators [lib/validation/validators/]
        RegVal["Registry Structural Validator<br/>(registry-validator.ts)"]
        RefVal["Referential Integrity Validator<br/>(reference-validator.ts)"]
        CapVal["Capability Consistency Validator<br/>(capability-validator.ts)"]
        GraphVal["Graph & Cycle Validator<br/>(graph-validator.ts)"]
    end
    
    Accumulator["Result Accumulator<br/>(validation-result.ts)"]
    Report["Validation Report<br/>(ValidationReport)"]
    CLI["CLI Script Gatekeeper<br/>(scripts/validate-platform.ts)"]
    Build["Build Success / Failure"]

    Registries --> Pipeline
    Pipeline --> RegVal
    Pipeline --> RefVal
    Pipeline --> CapVal
    Pipeline --> GraphVal
    
    RegVal --> Accumulator
    RefVal --> Accumulator
    CapVal --> Accumulator
    GraphVal --> Accumulator

    Accumulator --> Report
    Report --> CLI
    CLI -->|0 Errors| Build[Build Proceeds (exit code 0)]
    CLI -->|≥1 Errors| Fail[Build Halts (exit code 1)]
```

---

## 3. Severity & Issue Model

Validation issues are emitted with one of three severity levels:

| Severity | Build Effect | Purpose | Example |
| :--- | :--- | :--- | :--- |
| **`ERROR`** | **Halts Build** (Exit Code 1) | Critical architectural violations, duplicate IDs, broken references, missing defaults. | Duplicate Domain ID `"vision"`, dangling perspective reference `"non-existent"`. |
| **`WARNING`** | **Build Succeeds** (Exit Code 0) | Non-fatal architectural smells, orphan entities, capability inconsistencies. | Visualizer `"layer-health"` is declared but never referenced by any Domain or Perspective. |
| **`INFO`** | **Build Succeeds** (Exit Code 0) | Informational notices regarding optional configurations or render mode hints. | Canvas 2D Visualizer assigned to perspective with `supportsSimulation: false`. |

---

## 4. Canonical Validation Rules

The framework enforces 10 core validation rule suites:

### Rule 1: Duplicate ID Detection
Checks that every entity ID (`DomainId`, `PerspectiveId`, `VisualizerId`, `GraphBehaviorId`) is globally unique within its registry.

### Rule 2: Invalid Reference Validation
Ensures every ID referenced in array fields (`supportedPerspectives`, `supportedVisualizers`, `supportedGraphBehaviors`, `supportedDomains`) exists in the target registry.

### Rule 3: Orphan Entity Detection
Scans for declared perspectives, visualizers, or graph behaviors that are never referenced by any domain or peer registry. Emits a `WARNING`.

### Rule 4: Invalid Perspective Validation
Guarantees that all perspectives declared by domains exist in the Perspective Registry.

### Rule 5: Invalid Visualizer Validation
Guarantees that all visualizers declared by domains, perspectives, or graph behaviors exist in the Visualizer Registry.

### Rule 6: Invalid Graph Behavior Validation
Guarantees that all graph behaviors declared by domains, perspectives, or visualizers exist in the Graph Behavior Registry.

### Rule 7: Default Reference & Membership Alignment
Verifies that `defaultPerspective`, `defaultVisualizer`, and `defaultGraphBehavior` exist and are explicitly listed within the entity's `supported*` arrays.

### Rule 8: Capability Consistency Validation
Checks cross-registry compatibility:
- Bidirectional domain-visualizer declaration consistency.
- Simulation requirement alignment between default visualizers and default perspectives.

### Rule 9: Circular Dependency Detection
Performs DFS cycle detection across the global registry reference graph to guarantee an acyclic structure.

### Rule 10: Configuration Completeness
Verifies that all active domains and registry definitions provide required non-empty configuration fields.

---

## 5. Directory & File Structure

```text
lib/
    validation/
        validators/
            registry-validator.ts      # Structural & default alignment rules
            reference-validator.ts     # Cross-registry link integrity rules
            graph-validator.ts         # Orphan detection & cycle checking rules
            capability-validator.ts    # Compatibility & simulation rules
        validation-types.ts            # Severity, issue, & report interfaces
        validation-result.ts           # Result accumulator class
        validation-errors.ts           # Levenshtein distance & CLI formatters
        index.ts                       # Public barrel API & validatePlatform()

scripts/
    validate-platform.ts               # CLI runner executed during npm run build
    run-validation-tests.ts            # Regression test runner for validation framework

tests/
    validation-fixtures/               # Deterministic test scenarios
        fixtures.ts                    # Duplicate, orphan, invalid ref, and mismatch fixtures
```

---

## 6. CLI Commands & NPM Integration

| Command | Script Target | Description |
| :--- | :--- | :--- |
| `npm run validate:platform` | `scripts/validate-platform.ts` | Runs platform registry validation and outputs CLI report. |
| `npm run validate:data` | `scripts/validate-model-data.ts` | Runs Zod model JSON schema validation. |
| `npm run validate:tests` | `scripts/run-validation-tests.ts` | Runs regression test suite against validation engine. |
| `npm run validate` | `validate:data && validate:platform` | Sequentially executes all validation suites. |
| `npm run build` | `validate:platform && next build` | Automatically validates registries before building production static site. |

---

## 7. Future Extension Strategy

The validation framework is designed to scale across upcoming refactor phases:

- **Phase 1.1 (Knowledge Object Schemas):** Plug in `knowledge-object-validator.ts` under `lib/validation/validators/`.
- **Phase 2 (Architecture Patterns):** Plug in `pattern-validator.ts`.
- **Phase 3 (Training Dynamics):** Plug in `engine-state-validator.ts`.
- **Phase 4 (Paper Knowledge Base):** Plug in `paper-validator.ts`.

All future validators will emit standardized `ValidationIssue` objects into `ValidationResultAccumulator`, maintaining a unified platform build gatekeeper.
