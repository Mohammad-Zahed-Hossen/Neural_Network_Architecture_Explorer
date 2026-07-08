# Codex Execution Plan — Post-Refactor Remediation

How to use this file: paste ONE step at a time into Codex, in order. After each step, run
`npm run build` and `npm run validate:data`, then manually check `/catalog`, `/compare`,
`/models/vit` (a non-CNN model — this is the one that surfaces the category/family bug),
and `/models/densenet201` (a large model — this is the one that exercises MAX_DETAILED_NODES).
Do not batch multiple steps into one Codex session — each step is a checkpoint.

Repo root for all steps: `D:\Project\Neural Network Architecture Explorer\nn_architecture`

Context for Codex, worth pasting at the top of your first session so it has the full picture:

```
This is a Next.js 16 (app router, output: 'export') static educational site covering 34
Keras pretrained CNN/Transformer architectures. A prior refactor consolidated model data
into data/models/{id}.json (canonical) and data/models.json (catalog summary), validated
by lib/schema/model.schema.ts (Zod) and scripts/validate-model-data.ts. That refactor is
done and data/models/ is trustworthy — npm run validate:data currently passes with zero
issues. What's NOT done is the type layer: lib/types/model.ts and lib/types/layer.ts are
hand-written TypeScript interfaces that duplicate lib/schema/model.schema.ts's Zod-inferred
types, and most components still import the old hand-written ones. There's also a separate
ModelMetadata interface in lib/data/model-metadata.ts duplicating the Zod ModelSummary type.
This plan fixes those gaps in order, starting with one real content bug they caused.
```

---

## STEP 0 — Safety net

```
Create a new git branch called `refactor/type-consolidation` from the current branch and
commit the working tree as-is if there are uncommitted changes, with commit message
"chore: snapshot before type consolidation".

Do not modify any files in this step. Just confirm the branch was created and stop.
```

---

## STEP 1 (Critical) — Fix the category/family content bug

```
Context: components/model-explorer/tabbed-explorer.tsx's Overview tab contains this line:

  This model is classified under the <strong>{(model as any).category || (model as any).family || 'CNN'}</strong> family.

The `model` prop here is typed as NeuralNetworkModel (from lib/types/model.ts), which has
no `category` or `family` field — those fields only exist on ModelSummary (the catalog
summary shape, defined in lib/schema/model.schema.ts and lib/data/model-metadata.ts). Because
of this, the `as any` casts always resolve to undefined, and the UI silently falls back to
the hardcoded string 'CNN' — which is factually wrong for every Transformer-category model
(vit, swin, maxvit, convnext all show "classified under the CNN family" today, which is
incorrect for at least vit, swin, and maxvit).

Task:
1. Add `category` and `family` fields to NeuralNetworkModelSchema in
   lib/schema/model.schema.ts. Use the same category enum already defined on
   ModelSummarySchema in that file (don't invent a new one). Make `family` a required
   string and `category` a required enum value, matching the type used in ModelSummarySchema.
2. Update every file in data/models/*.json (all 34 files) to include the correct `category`
   and `family` values for that model — source these values from the corresponding entry in
   data/models.json, which already has the correct category/family per model (e.g. vit.json
   should get category: "Transformer", family: "Transformer", matching data/models.json's
   "vit" entry). Do this programmatically (write a one-off script if that's easier than 34
   manual edits, but don't leave the script in the repo afterward — clean it up once it's run).
3. In components/model-explorer/tabbed-explorer.tsx, replace the `(model as any).category ||
   (model as any).family || 'CNN'` line with a direct, typed `model.category` (no cast, no
   fallback to a hardcoded string — if the schema change in step 1 was done correctly, this
   field will always be present and correctly typed).
4. Run `npm run validate:data` — it should still pass with zero issues (the schema change
   adds a new required field, so if any of the 34 model files are missing it, validate:data
   will now correctly catch that — fix any it flags).
5. Run `npm run build` and manually check /models/vit, /models/swin, /models/maxvit, and
   /models/convnext to confirm they now show the correct family/category instead of "CNN".
```

---

## STEP 2 (Critical) — Collapse the two type systems: start with layer.ts

```
Context: lib/types/layer.ts is a hand-written TypeScript file defining LayerType,
ActivationFunction, TensorShape, Conv2DConfig, PoolingConfig, DenseConfig, ActivationConfig,
BatchNormConfig, DropoutConfig, InputConfig, AddConfig, ConcatenateConfig, BottleneckConfig,
LayerConfig, CalculationStep, ParameterBreakdown, EducationalNote, Position, and Layer.
Every one of these already has a Zod-inferred equivalent exported from
lib/schema/model.schema.ts (LayerType, ActivationFunction, TensorShape, Conv2DConfig, etc. —
same names, same shapes, just inferred via z.infer<> instead of hand-written).

Task:
1. Search the codebase for every import from '@/lib/types/layer' (check
   components/model-explorer/flow-canvas.tsx, custom-node.tsx, layer-list.tsx,
   inspector-panel.tsx, and any other file that imports from it). List every file and every
   named import it pulls from lib/types/layer.
2. For each of those files, change the import to pull the same named types from
   '@/lib/schema/model.schema' instead of '@/lib/types/layer'. Do this one file at a time,
   running `npm run build` after each file, since a type shape mismatch here would be a
   compile error, not a silent bug — you want to catch that immediately per-file rather than
   after changing all four at once.
3. Once every consumer has been moved over and the build is clean, delete
   lib/types/layer.ts entirely.
4. Run `npm run build` one final time to confirm the deletion didn't break anything.
```

---

## STEP 3 (Critical) — Collapse the two type systems: model.ts

```
Context: Same situation as Step 2, but for lib/types/model.ts (ImageShape, Connection,
LayerGroup, Architecture, NeuralNetworkModel) versus lib/schema/model.schema.ts's Zod-inferred
equivalents. Note that lib/schema/model.schema.ts's ArchitectureSchema also includes a
`layout` field that lib/types/model.ts's Architecture interface does NOT have — this is
itself a small drift the previous audit found, and this step resolves it as a side effect
since only one Architecture type will exist afterward.

Task:
1. Search the codebase for every import from '@/lib/types/model' (check
   components/model-explorer/flow-canvas.tsx, tabbed-explorer.tsx, and
   app/models/[slug]/page.tsx at minimum — there may be others, search thoroughly).
2. For each file, change the import to pull NeuralNetworkModel (and Architecture, Connection,
   LayerGroup, ImageShape if imported directly anywhere) from '@/lib/schema/model.schema'
   instead. One file at a time, `npm run build` after each.
3. Once every consumer is moved over and the build is clean, delete lib/types/model.ts.
4. Run `npm run build` and manually check /models/lenet and /models/densenet201 to confirm
   the model detail pages still render identically.
```

---

## STEP 4 (High) — Collapse ModelMetadata into ModelSummary

```
Context: lib/data/model-metadata.ts still exports a hand-written ModelMetadata interface
(plus ModelCategory and EfficiencyLevel types) that duplicates ModelSummary from
lib/schema/model.schema.ts. app/catalog/page.tsx, app/compare/page.tsx,
lib/utils/filter-models.ts, and components/model-comparison/comparison-client.tsx all
currently type against ModelMetadata while actually receiving ModelSummary objects at
runtime (from getModelSummaries() in lib/data-access/models.ts) — this only works today
because the two shapes happen to overlap enough structurally.

Task:
1. Confirm ModelCategory and EfficiencyLevel are already defined identically in both
   lib/data/model-metadata.ts and lib/schema/model.schema.ts (check ModelSummarySchema's
   category enum and any efficiency-related field). If lib/schema/model.schema.ts is
   missing an EfficiencyLevel equivalent, add it there first, matching
   lib/data/model-metadata.ts's existing 'lightweight' | 'balanced' | 'powerful' union.
2. Update lib/utils/filter-models.ts to import ModelSummary (renaming references from
   ModelMetadata to ModelSummary throughout the file), and ModelCategory/EfficiencyLevel,
   from '@/lib/schema/model.schema' instead of '@/lib/data/model-metadata'.
3. Update components/model-comparison/comparison-client.tsx the same way — replace its
   ModelMetadata import and prop type with ModelSummary from the schema file.
4. Update app/catalog/page.tsx and app/compare/page.tsx's imports of ModelCategory/
   EfficiencyLevel to come from '@/lib/schema/model.schema' instead of
   '@/lib/data/model-metadata'.
5. Once nothing imports from lib/data/model-metadata.ts anymore (confirm via search),
   delete that file.
6. Run `npm run build` and manually check /catalog (filters, search, category tabs) and
   /compare (model selector, category grouping) to confirm no regressions.
```

---

## STEP 5 (High) — Extract the triplicated layer icon/style maps

```
Context: components/model-explorer/custom-node.tsx, layer-list.tsx, and inspector-panel.tsx
each independently define an `iconMap: Record<LayerType, ComponentType>` and a
`typeStylesMap` (border/text/bg/badge colors per layer type). These are near-identical
across all three files but not shared — adding a new LayerType means editing all three by
hand with no compiler check that you got all three consistent.

Task:
1. Create lib/utils/layer-styles.ts exporting:
   - `layerIconMap: Record<LayerType, ComponentType<{ className?: string }>>` — merge the
     icon choices from all three existing files (they already agree on most types; if any
     type has a different icon in different files, keep whichever one appears in
     custom-node.tsx as the canonical choice, and note the ones you had to reconcile).
   - `layerStyleMap: Record<string, { border: string; borderActive?: string; text: string;
     bg: string; badge: 'default' | 'secondary' | 'outline' | 'success' | 'indigo' |
     'primary'; glow?: string; shadow?: string; accentBg?: string }>` — merge the style
     definitions from all three files into one shape that's a superset of what each
     component needs (custom-node.tsx uses borderActive+glow, layer-list.tsx uses shadow,
     inspector-panel.tsx uses accentBg — include all of these fields so each component can
     pick the ones it uses).
2. Update custom-node.tsx, layer-list.tsx, and inspector-panel.tsx to import
   `layerIconMap` and `layerStyleMap` from lib/utils/layer-styles.ts instead of defining
   their own local copies. Each component should keep its own fallback default style object
   (for unknown/未-mapped layer types) inline, since that's a per-component rendering
   decision, not shared data.
3. Run `npm run build` and visually compare /models/resnet50's Topology tab, Layers tab, and
   Inspector panel before and after this change (open two browser tabs or use git stash to
   compare) — colors and icons per layer type should be pixel-identical to before, since
   this step only deduplicates, it doesn't restyle anything.
```

---

## STEP 6 (Medium) — Give FlowCanvas a real grouped/detailed data shape

```
Context: components/model-explorer/tabbed-explorer.tsx currently builds a `topologyModel`
via useMemo that, when showDetailedLayers is false, constructs fake Layer objects out of
graphData.groupedNodes (with placeholder empty inputShape/outputShape/config/parameters) and
casts the whole thing `as unknown as NeuralNetworkModel` to satisfy FlowCanvas's props. This
type-safety escape hatch hides a real distinction: "detailed layers" and "grouped nodes" are
different shapes, not the same shape pretending to be a model.

Task:
1. In lib/schema/model.schema.ts (or a new lib/types/graph.ts if you'd rather keep it
   separate — your call, but be consistent with where LayoutSchema already lives), define a
   proper `GroupedNode` type matching the actual shape of entries in
   graphData.groupedNodes (id, label, description, position, layerIds — check the real
   runtime shape in a sample data/models/{id}.json's architecture.layout.groupedNodes to get
   this exactly right, don't guess).
2. Change FlowCanvas's props in components/model-explorer/flow-canvas.tsx to accept a
   discriminated shape instead of always requiring a full NeuralNetworkModel:
   either `{ mode: 'detailed'; model: NeuralNetworkModel }` or
   `{ mode: 'grouped'; groupedNodes: GroupedNode[]; groupedEdges: ...; colorTheme: string }`
   (adjust field names to match whatever FlowCanvas actually reads from `model` today — it
   uses model.architecture.layers, model.architecture.connections, and model.colorTheme, so
   the grouped variant needs equivalents of exactly those three, nothing more).
3. Update FlowCanvas's internal node/edge-building logic to branch on `mode` instead of
   always reading `model.architecture.layers`.
4. Update tabbed-explorer.tsx to pass the new discriminated prop shape instead of building
   the fake `topologyModel` — delete the `as unknown as NeuralNetworkModel` cast entirely.
5. Run `npm run build` and manually toggle "Show detailed layers" on /models/resnet50 (small
   enough to toggle freely) to confirm both modes still render correctly with no visual
   change from before this step.
```

---

## STEP 7 (Medium) — Clean up data/models.json's dual field names

```
Context: Every entry in data/models.json stores both the old and new field names
permanently (e.g. "params": 25610152 AND "totalParameters": 25610152, "top1": 74.9 AND
"top1Accuracy": 0.749). lib/data-access/models.ts's getModelSummaries() normalizes this at
read time with `model.totalParameters ?? model.params` style fallbacks, but the underlying
duplication in the data file itself was never removed.

Task:
1. Confirm, by searching the codebase, that nothing reads the OLD field names (params, top1,
   top5, memory_mb, flops) directly anywhere outside of lib/data-access/models.ts's
   normalization logic and scripts/validate-model-data.ts (which also has fallback logic for
   these old names). Show me the search results.
2. If confirmed, rewrite data/models.json to drop the old field names entirely, keeping only
   totalParameters, top1Accuracy, top5Accuracy, memoryUsage, totalFLOPs (converting top1/top5
   to their /100 decimal form as part of the rewrite, matching what's already in the
   top1Accuracy/top5Accuracy fields today — don't recompute, just drop the redundant old
   keys).
3. Simplify getModelSummaries() in lib/data-access/models.ts to remove the now-unnecessary
   `?? model.params` style fallbacks, since the field will always be present under its
   canonical name.
4. Simplify the equivalent fallback logic in scripts/validate-model-data.ts's
   compareSummaryToModel and main() functions the same way.
5. Run `npm run validate:data` and `npm run build` to confirm nothing broke, then manually
   check /catalog and /compare render identically (same numbers, same sorting).
```

---

## STEP 8 (Medium) — Fix the server/client boundary in the data access layer

```
Context: lib/data-access/models.ts's getModel() explicitly throws if called from the client
(`if (typeof window !== 'undefined') throw ...`), but getModelSummaries() has no such guard
and is called directly from 'use client' files (app/catalog/page.tsx, app/compare/page.tsx).
There's no consistent convention here — a future contributor has no way to tell which
functions in this file are safe to call from a client component just by looking at it.

Task:
1. Add `import 'server-only'` — no, wait, don't do this for the whole file, since
   getModelSummaries() genuinely IS called from client components today and that works
   fine because it only reads a statically-imported JSON module, not the filesystem. Instead:
   split lib/data-access/models.ts into two files: lib/data-access/models.server.ts
   (containing only getModel(), which does filesystem reads and needs to stay server-only —
   add `import 'server-only'` at the top of this file) and lib/data-access/models.ts
   (keeping getModelSummaries() and getAllModelIds(), which are safe from both server and
   client since they only touch the statically-imported data/models.json).
2. Update app/models/[slug]/page.tsx to import getModel from
   '@/lib/data-access/models.server' and getAllModelIds from '@/lib/data-access/models'.
3. Confirm app/catalog/page.tsx and app/compare/page.tsx still import getModelSummaries
   from '@/lib/data-access/models' (unchanged).
4. While in models.server.ts, replace the `eval('require')('fs')` and
   `eval('require')('path')` calls with plain top-level `import { readFileSync } from 'fs'`
   and `import { join } from 'path'` — now that this is a dedicated server-only file with
   the `server-only` package guarding it, the eval workaround is unnecessary.
5. Run `npm run build` to confirm the split works and no client component accidentally
   pulls in the server-only file (this would now fail loudly at build time instead of
   silently at runtime, which is the point of this step).
```

---

## STEP 9 (Low) — Strengthen validate-model-data.ts

```
Context: scripts/validate-model-data.ts currently checks schema validity, missing layer
references in connections/groups/layout, and summary-vs-model field mismatches. It does not
check for duplicate model IDs across data/models.json, or for layout nodes that exist but
are never referenced by any edge (orphaned nodes that would render disconnected in the
topology graph).

Task:
1. Add a check in main() that collects all `summary.id` values from data/models.json and
   reports an error if any id appears more than once.
2. Add a check in checkLayerReferences() (or a new function called alongside it) that finds
   any node in `layout.nodes` whose id never appears as a source or target in `layout.edges`
   — report these as "orphaned layout node" warnings (a separate category from the existing
   errors, since an orphaned node might be intentional for some layouts — don't fail the
   build on these, just report them).
3. Run `npm run validate:data` and confirm the new checks pass cleanly against the current
   34 models (if any orphaned nodes turn up, show me the report before deciding whether
   they're a real bug or an intentional layout choice).
```

---

## STEP 10 — Final verification pass

```
Context: This is the final checkpoint after all type-consolidation and cleanup steps.

Task:
1. Confirm lib/types/model.ts, lib/types/layer.ts, lib/data/model-metadata.ts, and
   lib/data/model.schema.json no longer exist (the first two deleted in Steps 2–3, the
   third in Step 4, and the fourth should already be gone from the prior refactor pass —
   confirm it, since it wasn't explicitly re-verified in this plan).
2. Run `npm run validate:data` and `npm run build` one final time.
3. Manually check /catalog, /compare, /models/vit (category/family fix), /models/lenet
   (small model, detailed view), and /models/densenet201 (large model, grouped view +
   toggle disabled state).
4. Report a final list of every file deleted or created during this entire plan (Steps 0–9),
   so there's a complete changelog of what changed.
```

---

## Notes for whoever is running this

- Steps 1 is the one real bug fix — do it first regardless of what order you tackle the
  rest in, since it's user-facing incorrect content, not just a maintainability concern.
- Steps 2–4 are mechanical but need to happen one file at a time with a build check between
  each — resist letting Codex do all four component files in one shot, since a type
  mismatch is much easier to debug when it's the only change in the diff.
- Step 6 is the most structurally invasive change in this plan (it changes FlowCanvas's
  prop shape) — it's placed after the type consolidation (Steps 2–3) on purpose, since
  doing it first would mean redoing it once GroupedNode's proper type exists.
- Step 8 explicitly asks Codex NOT to blanket-apply `server-only` to the whole data-access
  file, since half of it is legitimately client-safe — read that step's reasoning before
  letting Codex "simplify" it back to one file.
