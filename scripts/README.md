# Repository Scripts Documentation

This directory contains maintenance, validation, and data processing utilities for the Neural Network Architecture Explorer.

---

## Active Maintenance Scripts

### 1. Data Validation
- **File:** `validate-model-data.ts`
- **Command:** `npm run validate:data` or `npx tsx scripts/validate-model-data.ts`
- **Purpose:** Validates `data/models.json` and all detailed model JSON files (`data/models/*.json`) against Zod schemas defined in `lib/schema/model.schema.ts`. Ensures total parameter counts, accuracy metrics, layer configurations, and metadata attributes comply with strict type boundaries.

### 2. Link Integrity Check
- **File:** `validate-links.ts`
- **Command:** `npx tsx scripts/validate-links.ts`
- **Purpose:** Verifies that internal model explore links, paper anchors, and external documentation URLs across `data/models.json` and `data/papers.json` resolve correctly without broken routes.

### 3. Data Merging & Standardization
- **File:** `merge-model-data.ts`
- **Command:** `npx tsx scripts/merge-model-data.ts`
- **Purpose:** Merges supplementary metadata attributes into canonical model JSON representations.

---

## Data Generation & Import Utilities (Python)

- **`extract_keras_models.py`**: Extracts raw layer parameters, activation shapes, and FLOP calculations directly from Keras application architectures (`tf.keras.applications`).
- **`process_models.py`**: Formats and normalizes extracted layer structures into the schema expected by `NeuralNetworkModelSchema`.
- **`fix_batchnorm_params.py`**: Calculates trainable vs non-trainable parameter allocations for batch normalization layers.
- **`init_data_from_lib.py`**: Generates initial model JSON structures from seed definitions.
- **`generate_audit_package.py`**: Generates system health reports and data consistency metrics.

---

## Historical Reports

- `data-validation-report.md`: Summary log of previous data validation passes.
- `data-merge-changelog.md`: Record of schema updates during data normalization passes.
