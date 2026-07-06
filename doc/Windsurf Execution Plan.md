# Windsurf Execution Plan — NN Architecture Explorer Remediation

How to use this file: paste ONE step at a time into Windsurf, in order. After each step,
run `npm run build` and manually click through `/catalog`, `/compare`, and one large model
(`/models/densenet201`) and one small model (`/models/lenet`) before moving to the next step.
Do not batch multiple steps into one Windsurf session — each step is a checkpoint.

Repo root for all steps: `D:\Project\Neural Network Architecture Explorer\nn_architecture`

---

## STEP 0 — Safety net (do this first, before anything else)

```
Create a new git branch called `refactor/data-architecture` from the current branch and
commit the working tree as-is if there are uncommitted changes, with commit message
"chore: snapshot before data architecture refactor".

Do not modify any files in this step. Just confirm the branch was created and the working
tree is clean, then stop.
```

---

## STEP 1 (P0) — Define the canonical Model schema

```
Context: This project has model data scattered across lib/data/*.json, data/graphs/*.json,
data/models.json, data/models_raw.json, audit-package/*, and lib/data/model-metadata.ts,
with no shared schema. lib/types/model.ts and lib/types/layer.ts already define TypeScript
interfaces (NeuralNetworkModel, Layer, Architecture, Connection, LayerGroup) — use these as
the starting point, don't invent a new shape from scratch.

Task:
1. Install zod (`npm install zod`) — this is the one new dependency needed for this whole
   refactor, do not add anything else.
2. Create a new file `lib/schema/model.schema.ts` that defines zod schemas mirroring the
   existing TypeScript interfaces in lib/types/model.ts and lib/types/layer.ts:
   - LayerSchema (matches the `Layer` interface)
   - ArchitectureSchema (matches `Architecture`: layers, connections, groups)
   - ModelSchema (matches `NeuralNetworkModel`: id, name, fullName, paperYear, authors,
     paperUrl, depth, totalParameters, totalFLOPs, inputShape, top1Accuracy, top5Accuracy,
     memoryUsage, description, tags, colorTheme, architecture)
   - ModelSummarySchema — a lighter schema for catalog/compare use, matching the actual
     current shape of entries in data/models.json (fields like id, name, params, flops,
     top1, top5, memory_mb, year, releaseYear, category, colorTheme, docsUrl — inspect
     data/models.json directly to get the exact field list right, don't guess)
3. Export TypeScript types inferred from these schemas via z.infer<>, so
   lib/types/model.ts and lib/types/layer.ts can eventually be replaced by these inferred
   types (but don't delete lib/types/* yet — that comes in a later step).
4. Do NOT touch any page, component, or data file in this step. Only create
   lib/schema/model.schema.ts and add the zod dependency.
5. Run `npm run build` to confirm nothing broke (this step is purely additive, so the
   build should pass unchanged).
```

---

## STEP 2 (P0) — Validation script to find every real inconsistency

```
Context: Before merging any data files, we need a ground-truth report of exactly where
lib/data/*.json, data/graphs/*.json, and data/models.json disagree with each other and with
the new lib/schema/model.schema.ts.

Task:
1. Create a script `scripts/validate-model-data.ts` (run with `npx tsx scripts/validate-model-data.ts`
   or add a `"validate:data": "tsx scripts/validate-model-data.ts"` entry to package.json).
2. For every model id found in data/models.json, the script should:
   - Load lib/data/{id}.json and validate it against ModelSchema from
     lib/schema/model.schema.ts, collecting every validation error (don't stop at first error).
   - Load data/graphs/{id}.json and check that every layer id referenced in its
     connections/groups exists in lib/data/{id}.json's architecture.layers.
   - Compare totalParameters, totalFLOPs, top1Accuracy/top5Accuracy, depth, colorTheme
     between data/models.json's entry (remember its field names differ: params, flops,
     top1, top5) and lib/data/{id}.json's corresponding fields, flagging any mismatch.
3. Output a clear report to the console (and optionally write it to
   `scripts/data-validation-report.md`): grouped by model id, listing schema violations,
   missing layer references, and field mismatches.
4. Do NOT modify any data files in this step — this is a read-only diagnostic. Run it and
   show me the full report before we proceed to Step 3, since the merge strategy in Step 3
   depends on what this report finds.
```

*(Stop here and read the report before continuing — if it turns up major surprises, come back to me before Step 3.)*

---

## STEP 3 (P0) — Merge the duplicate datasets into one canonical source

```
Context: We now have a validation report from scripts/data-validation-report.md showing
where lib/data/*.json, data/graphs/*.json, and data/models.json disagree. The goal is one
canonical per-model file, not three.

Task:
1. Create a new directory `data/models/` (this will replace both lib/data/*.json's model
   content and data/graphs/*.json — NOT audit-package, which is handled in Step 4).
2. For each model id in data/models.json, write `data/models/{id}.json` that merges:
   - The full architecture/layers/parameters/educationalNote content currently in
     lib/data/{id}.json
   - The node positions, groups, groupedNodes, and groupedEdges currently in
     data/graphs/{id}.json (nest these under an `architecture.layout` key so both sets of
     information live in one file, one object per model)
   - Resolve every mismatch flagged in the Step 2 validation report by preferring the value
     that matches data/models.json's summary figures (since that's what's shown to users
     first, on the catalog page) — list every resolved conflict in a short changelog at
     scripts/data-validation-report.md so we have a record of what was changed and why.
3. Validate every merged file against ModelSchema (extended to include the new `layout`
   key) from lib/schema/model.schema.ts before writing it — fail loudly if any model
   doesn't validate, don't silently write invalid data.
4. Do NOT delete lib/data/*.json or data/graphs/*.json yet — leave them in place as a
   fallback until Step 5 confirms the app works entirely off data/models/. We'll remove
   them in Step 6.
5. Run `npm run build` — this step only adds data/models/, it shouldn't change build
   behavior yet since nothing reads from it until Step 5.
```

---

## STEP 4 (P0) — Retire audit-package and models_raw.json

```
Context: audit-package/ (~37MB) and data/models_raw.json (~11.5MB) are not imported by any
application code — they were generated as a one-time export for the data-accuracy audit
documented in doc/AUDIT_REPORT.md, not as a runtime dependency.

Task:
1. Search the entire codebase (app/, components/, lib/, scripts/) for any import or
   fs.readFileSync reference to `audit-package` or `models_raw.json`. Show me every match
   before doing anything else.
2. If, and only if, no application code (outside of scripts/generate_audit_package.py
   itself) references these paths, move `audit-package/` and `data/models_raw.json` out of
   the main project tree into a sibling folder `../nn_architecture_audit_archive/` (outside
   git tracking, or add them to .gitignore if you'd rather keep them locally untracked).
3. Do not delete them outright — just move them out of the active source tree so they stop
   counting toward repo size and build scope, in case they're needed again for a future
   accuracy re-audit.
4. Run `npm run build` to confirm removing them didn't break anything.
```

---

## STEP 5 (P0/P2) — Introduce the data access layer and point pages at it

```
Context: Right now, four different files each reach into raw JSON independently:
app/models/[slug]/page.tsx (fs.readFileSync on lib/data/{slug}.json AND
data/graphs/{slug}.json), app/catalog/page.tsx (imports data/models.json and manually maps
field names), app/compare/page.tsx (imports data/models.json and duplicates the exact same
manual mapping as catalog). We're replacing all of this with one module.

Task:
1. Create `lib/data-access/models.ts` exporting three functions:
   - `getModelSummaries(): ModelSummary[]` — reads data/models.json once, returns the
     already-correctly-shaped summaries (normalize the params/flops/top1/top5/memory_mb
     field names to totalParameters/totalFLOPs/top1Accuracy/top5Accuracy/memoryUsage HERE,
     in this one function, so no page has to do it again)
   - `getModel(id: string): NeuralNetworkModel` — reads data/models/{id}.json (the new
     canonical file from Step 3), validates it against ModelSchema, throws a clear error if
     the id doesn't exist or fails validation
   - `getAllModelIds(): string[]` — returns every id in data/models.json, for use in
     generateStaticParams
2. Update `app/models/[slug]/page.tsx` to call `getModel(slug)` and `getAllModelIds()`
   instead of its current dual fs.readFileSync calls against lib/data and data/graphs.
   Since data/models/{id}.json now nests layout info under architecture.layout, update
   how graphData is derived from `model.architecture.layout` and pass it to
   TabbedExplorer in the same shape it currently expects — don't change TabbedExplorer's
   props interface in this step, just change where the data comes from.
3. Update `app/catalog/page.tsx` and `app/compare/page.tsx` to call `getModelSummaries()`
   and DELETE the duplicated inline mapping block (the `.map(m => ({...m, totalParameters:
   m.params, ...}))` code) from both files — that logic now lives once, in
   lib/data-access/models.ts.
4. Run `npm run build` and manually verify /catalog, /compare, /models/lenet, and
   /models/densenet201 all render correctly with the same data as before.
5. Do not touch lib/data/*.json, data/graphs/*.json, or lib/data/model-metadata.ts in this
   step yet — leave them as unused fallback files until the next step confirms everything
   works off the new data-access layer.
```

---

## STEP 6 (P0 cleanup) — Remove the now-dead legacy data files

```
Context: After Step 5, nothing in app/ should import lib/data/*.json or data/graphs/*.json
directly anymore — everything goes through lib/data-access/models.ts and data/models/.

Task:
1. Search the codebase again to confirm zero remaining imports or fs reads targeting
   lib/data/*.json (the per-model files, NOT model-metadata.ts, model-categories.ts,
   or model.schema.json — leave those, they're addressed separately) or data/graphs/*.json.
   Show me the search results.
2. If confirmed unused, delete lib/data/*.json (the 34 per-model files) and the
   data/graphs/ directory entirely.
3. Also delete data/models_raw.json's reference from any script that no longer needs it
   (check scripts/init_data_from_lib.py and scripts/process_models.py — these were likely
   part of the old pipeline; if they only ever fed the now-deleted files, mark them
   deprecated with a comment at the top of the file rather than deleting the scripts
   themselves, since they document how the data was originally generated).
4. Run `npm run build` and do a full manual pass over the app to confirm nothing regressed.
```

---

## STEP 7 (P1) — System-enforced rendering limit in FlowCanvas

```
Context: components/model-explorer/flow-canvas.tsx currently builds one React Flow node
per layer with no cap — for models like densenet201 or efficientnetb7 this means hundreds
of simultaneous DOM nodes. components/model-explorer/tabbed-explorer.tsx already has a
user-facing toggle (showDetailedLayers) that switches between full layers and
graphData.groupedNodes/groupedEdges, but it's opt-in and defaults based on
localStorage, not on graph size.

Task:
1. In components/model-explorer/tabbed-explorer.tsx, define a constant
   `MAX_DETAILED_NODES = 100` (adjust the number if you and I discuss a different
   threshold, but pick one explicit number, don't leave it vague).
2. Change the initial value of `showDetailedLayers` so that, on first load for a given
   model (i.e., before any localStorage preference has been saved for that specific model,
   not just "ever saved"), it defaults to `false` if `graphData.nodes.length > MAX_DETAILED_NODES`,
   and `true` otherwise. Keep respecting the user's manual toggle after that, per model —
   don't override an explicit user choice.
3. When `graphData.nodes.length > MAX_DETAILED_NODES`, disable (not hide — disable with a
   tooltip) the "Show detailed layers" toggle switch, so users can't force-render an
   excessive graph; if you want an escape hatch, make it require an explicit confirmation
   click ("This model has {N} layers — showing all of them individually may be slow.
   Show anyway?") rather than a silent toggle.
4. Do not change FlowCanvas's internal rendering logic itself in this step — this is a
   call-site guard, not a FlowCanvas rewrite. Keep the change contained to
   tabbed-explorer.tsx.
5. Run `npm run build` and manually check /models/efficientnetb7 (should default to
   grouped view with the toggle disabled or gated) and /models/lenet (should default to
   detailed view, toggle fully enabled).
```

---

## STEP 8 (P1) — Remove the dead explorer-client.tsx

```
Context: components/model-explorer/explorer-client.tsx is a full parallel implementation
of the model detail view, but app/models/[slug]/page.tsx only ever imports and renders
TabbedExplorer — explorer-client.tsx is not reachable from any route.

Task:
1. Search the entire codebase for any import of `explorer-client` to be certain it's truly
   unreferenced (check app/, components/, and any test files). Show me the result.
2. If confirmed unused, delete components/model-explorer/explorer-client.tsx.
3. Run `npm run build` to confirm removing it didn't break anything.
```

---

## STEP 9 (P2) — Consolidate model-metadata.ts and model-categories.ts into the data-access layer

```
Context: lib/data/model-metadata.ts hardcodes the same 34 models a third time, in a
different shape again, but is only actually consumed for its exported TypeScript types
(ModelCategory, EfficiencyLevel) via lib/utils/filter-models.ts — the real data it contains
is never rendered anywhere, since catalog/compare now use getModelSummaries() from Step 5.

Task:
1. Confirm via search that lib/data/model-metadata.ts's `modelsMetadata` array (the actual
   data, not the ModelCategory/EfficiencyLevel type exports) is not imported anywhere in
   app/ or components/. Show me the result.
2. If confirmed, keep the type exports (ModelCategory, EfficiencyLevel, ModelMetadata
   interface) in lib/data/model-metadata.ts or move them into lib/schema/model.schema.ts
   (your call, but pick one location and update lib/utils/filter-models.ts's import
   accordingly) — but delete the hardcoded `modelsMetadata` array itself, since
   data/models.json is now the single source for that content via getModelSummaries().
3. Cross-check that every `category` value used in data/models.json matches a key in
   lib/data/model-categories.ts — if any model's category has no matching entry, flag it
   to me rather than guessing a fix.
4. Run `npm run build` and verify /catalog's category tabs and filters still work
   identically to before.
```

---

## STEP 10 (P2) — Final verification pass

```
Context: This is the final checkpoint after all data and rendering fixes.

Task:
1. Run `npm run validate:data` (the script from Step 2) one more time against the new
   data/models/ directory to confirm zero schema violations remain.
2. Run `npm run build` and confirm the production build succeeds with no warnings related
   to missing files or unresolved imports.
3. Report the before/after size of the `data/` and `lib/data/` directories combined
   (compare against the original ~62MB figure across lib/data + data/graphs +
   data/models_raw.json + audit-package) so we have a concrete before/after number.
4. List every file you deleted or moved during this entire plan (Steps 0–9), as a final
   changelog, so I have a full record of what changed.
```

---

## Notes for whoever is running this (you, or future you)

- Steps 1–6 are the P0 data-architecture fix. Steps 7–8 are the P1 rendering/dead-code
  fix. Step 9 is P2 cleanup. Step 10 is just a report.
- Every step is designed to leave the app in a working, buildable state — if Windsurf ever
  proposes changes spanning multiple steps at once, stop it and ask it to scope down to
  just the current step.
- Steps 2 and 5 both explicitly ask Windsurf to *show you* something before proceeding
  (the validation report, and search results for remaining imports) — actually read those
  outputs. They're the checkpoints that prevent a bad merge or a premature deletion.
