# Data Access Layer Architecture

This directory provides centralized, standardized data access for neural network architecture definitions, model summaries, and relationship metadata across the application.

---

## Architecture & Responsibilities

### 1. Client & Universal Data Access (`lib/data-access/models.ts`)
- **Primary API:** `getModelSummaries(): ModelSummary[]`
- **Utility API:** `getAllModelIds(): string[]`
- **Behavior:** Returns light, parsed model summary objects validated against `ModelSummarySchema`. Caches parsed summaries in-memory after first call to minimize parsing overhead on client renders.
- **Usage:** Preferred data access method for components (`ModelCard`, `ModelAdvisor`) and client pages (`/catalog`, `/concepts/receptive-field`, `/architecture-patterns`, `/research-map`, `/papers`).

### 2. Server-Only Detailed Model Fetcher (`lib/data-access/models.server.ts`)
- **Primary API:** `getModel(id: string): NeuralNetworkModel`
- **Boundary:** Enforces `import 'server-only'` to guarantee filesystem operations (`readFileSync`) never compile into client bundles.
- **Behavior:** Reads `data/models/{id}.json`, parses JSON, and validates complete layer topologies against `NeuralNetworkModelSchema`. Throws explanatory error messages if validation fails.
- **Usage:** Used by Next.js Server Components and dynamic route parameters (`app/models/[slug]/page.tsx`).

---

## Schema Validation & Integrity (`lib/schema/model.schema.ts`)
- **`ModelSummarySchema`**: Validates summary attributes (id, name, family, category, params, FLOPs, top1Accuracy, depth, memory, tags).
- **`NeuralNetworkModelSchema`**: Validates full model specifications, including detailed layer stacks (`architecture.layers`), tensor dimensions, receptive fields, parameters, and paper metadata.

---

## Metadata Enrichment & Search (`lib/search/metadata-enrichment.ts`)
- Enriches model and paper entities with search aliases, keywords, architectural patterns, and execution complexity tags.
- Power search indexing in `lib/search/search-engine.ts`.
