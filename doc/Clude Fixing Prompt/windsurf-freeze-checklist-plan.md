# Windsurf Execution Plan — Freeze Checklist

How to use this file: paste ONE step at a time into Windsurf, in order. After each step,
run `npm run build` and `npm run validate:data`, then manually check the specific route(s)
called out in that step. Do not batch multiple steps into one Windsurf session — each step
is a checkpoint. P0 items go first since they're the ones that actually block calling this
repo frozen; P1 and P2 are ordered but lower stakes if you want to reprioritize.

Repo root for all steps: `D:\Project\Neural Network Architecture Explorer\nn_architecture`

---

## STEP 0 — Safety net

```
Create a new git branch called `chore/freeze-checklist` from the current branch and commit
the working tree as-is if there are uncommitted changes, with commit message
"chore: snapshot before freeze checklist". Do not modify any files in this step. Just
confirm the branch was created and stop.
```

---

## STEP 1 (P0) — Deduplicate layers[] vs layout.nodes[] inside each canonical model file

```
Context: Every file in data/models/{id}.json currently stores each layer's config,
parameters, and position TWICE: once in architecture.layers[] (the full version, including
educationalNote) and again in architecture.layout.nodes[] (same config/parameters/position,
plus groupId, but without educationalNote). Confirmed directly in data/models/vit.json —
e.g. the "patch_proj" layer's full parameter breakdown and calculationSteps appear
verbatim in both architecture.layers[3] and architecture.layout.nodes[1]. This roughly
doubles the size of every canonical model file for no reason, and means updating a layer's
parameter count requires remembering to update it in two places in the same file.

Task:
1. In lib/schema/model.schema.ts, change LayoutNodeSchema (or whatever the current node
   entry inside LayoutSchema.nodes is called) so it only carries what's NOT already on the
   corresponding Layer object: `id`, `groupId`, and `position`. Remove `label`, `type`,
   `outputShape`, `config`, and `parameters` from this schema, since all of those already
   exist on the matching entry in architecture.layers (matched by id).
2. Update components/model-explorer/flow-canvas.tsx (and any other consumer of
   graphData.layout.nodes — search the codebase to find every place that reads
   `.layout.nodes` and confirm you've found them all before proceeding) to look up the full
   layer data from `model.architecture.layers` by id, and pull only `groupId`/`position`
   from the layout node entry. Where the code currently reads `node.type`, `node.config`,
   `node.parameters`, or `node.outputShape` directly off a layout node, change it to look
   the layer up by id from `architecture.layers` first.
3. Write a one-off script (don't leave it in the repo afterward) that rewrites all 34 files
   in data/models/ to drop the now-redundant `label`, `type`, `outputShape`, `config`, and
   `parameters` fields from every entry in `architecture.layout.nodes`, keeping only `id`,
   `groupId`, and `position`. Run it once, verify the diff looks right on a couple of files
   (vit.json and densenet201.json are good ones to spot-check — one small, one large), then
   delete the script.
4. Update scripts/validate-model-data.ts's layer-reference checks if they currently assume
   layout.nodes entries carry full layer data — they should still validate that every
   layout.nodes[].id has a matching entry in architecture.layers[].id, just without
   comparing the now-removed duplicate fields.
5. Run `npm run validate:data` (should still pass with zero issues) and `npm run build`,
   then manually check /models/vit (small model) and /models/densenet201 (large model) —
   both the "Layers" tab and "Topology" tab should render identically to before this change,
   since nothing about what's displayed should differ, only where the data comes from.
6. Report the before/after total size of data/models/ so we have a concrete number for how
   much this saved.
```

---

## STEP 2 (P0) — Fix the hardcoded output-node detection in custom-node.tsx

```
Context: components/model-explorer/custom-node.tsx currently determines whether a node is
the graph's terminal output node via `const isOutput = data.id === 'predictions';`. This is
wrong for any model whose final layer isn't literally id'd "predictions" — confirmed today
in data/models/vit.json, whose final layer has id "output", not "predictions". This means
ViT's topology graph currently renders an outgoing connector handle on its true terminal
node, visually implying something comes after it when nothing does.

Task:
1. In components/model-explorer/custom-node.tsx, change `isOutput` to check
   `data.type === 'output'` instead of `data.id === 'predictions'` — every layer already has
   a `type` field, and the `output` type already exists in the schema (used by every model's
   final layer, including vit.json's "output" layer and presumably other models' "predictions"
   layer, which also almost certainly has `type: "output"` even though its id differs).
2. Search the codebase for any other place that checks `data.id === 'predictions'` or a
   similar hardcoded id string to detect the output/input layer (check flow-canvas.tsx and
   layer-list.tsx too, not just custom-node.tsx) and apply the same fix — key off `type`,
   not a specific id string.
3. Run `npm run build` and manually check the Topology tab on /models/vit (should now show
   no outgoing connector on its final "Output Probabilities" node), /models/vgg16 (confirm
   its "predictions"-id output node still renders correctly — this is the regression check,
   since vgg16 presumably has type: "output" on its predictions layer and should look
   identical to before), and /models/resnet50.
```

---

## STEP 3 (P0) — Remove the hardcoded evolution-to-model-slug mapping

```
Context: app/evolution/page.tsx generates its "Interactive Explorer" link via a hardcoded
ternary chain: `node.id === 'vgg' ? 'vgg16' : node.id === 'resnet' ? 'resnet50' : ...`.
Adding a new entry to data/evolution.json whose id isn't already in this chain produces a
silently broken link (it falls through to `node.id` itself, which likely isn't a valid
model slug).

Task:
1. Add a new optional field to each entry in data/evolution.json: `exampleModelId` — a
   string that's a valid slug in data/models/ (e.g. the "vgg" entry gets
   "exampleModelId": "vgg16", "resnet" gets "resnet50", "densenet" gets "densenet121",
   "mobilenet" gets "mobilenet", "efficientnet" gets "efficientnetb0"). For entries like
   "vit" and "convnext" that currently have NO explorer link (the existing code explicitly
   excludes `node.id !== 'vit' && node.id !== 'convnext'`), decide whether they should now
   get one (data/models/vit.json and data/models/convnext.json both exist, so they could) —
   if you're not sure, leave `exampleModelId` unset for those two and preserve the current
   behavior of hiding the link when it's absent.
2. Update the EvolutionNode interface in app/evolution/page.tsx to include the optional
   `exampleModelId?: string` field.
3. Replace the hardcoded ternary chain with: render the "Interactive Explorer" link only
   when `node.exampleModelId` is present, linking to `/models/${node.exampleModelId}`.
4. Run `npm run build` and manually check /evolution — every entry that previously had a
   working link should still have one pointing to the same model, and confirm whether vit/
   convnext now show a link too (per whatever you decided in step 1).
```

---

## STEP 4 (P1) — Make /learn's active tab reflect in the URL

```
Context: app/learn/page.tsx reads `?tab=advisor|paths` from `window.location.search` via a
manual useEffect on mount, but never writes it back when the user clicks a tab — so
switching tabs doesn't update the URL, making neither tab state bookmarkable or shareable.

Task:
1. Replace the manual `useEffect` + `window.location.search` parsing in app/learn/page.tsx
   with Next.js's `useSearchParams()` hook (from 'next/navigation') to read the initial tab.
2. When the user clicks a tab button, use `useRouter()`'s `router.replace()` (from
   'next/navigation') to update the `?tab=` query param to match the newly selected tab,
   without adding a new browser history entry (so back/forward doesn't step through every
   tab click).
3. Run `npm run build` and manually check: load /learn (should default to Roadmaps), click
   "Model Advisor" (URL should update to /learn?tab=advisor), refresh the page (should stay
   on Advisor), and load /learn?tab=advisor directly (should open on Advisor).
```

---

## STEP 5 (P1) — Extract a shared PageBackground component

```
Context: app/evolution/page.tsx, app/papers/page.tsx, and app/learn/page.tsx each define
their own ambient background glow divs inline (different colors, sizes, blur values, and
positions per page), on top of the one already rendered globally in app/layout.tsx. Any
future change to this effect means editing every page file individually.

Task:
1. Create components/layout/page-background.tsx exporting a `PageBackground` component
   that accepts a `variant` prop (e.g. 'cyan-purple' | 'blue-purple' | 'primary-indigo' —
   pick names that match the actual color pairs currently used across evolution, learn,
   and papers) and renders the two absolutely-positioned blurred glow divs with the
   appropriate colors/positions for that variant.
2. Update app/evolution/page.tsx, app/papers/page.tsx, and app/learn/page.tsx to render
   `<PageBackground variant="..." />` instead of their inline glow divs, choosing whichever
   variant matches each page's current look (don't change the visual appearance, just
   centralize it).
3. Run `npm run build` and visually compare /evolution, /papers, and /learn before and
   after this change (git stash the change and compare screenshots, or check in two
   browser tabs) — they should look pixel-identical, since this step only deduplicates.
```

---

## STEP 6 (P1) — Make papers' card headers keyboard-accessible

```
Context: app/papers/page.tsx renders each paper card's clickable header as a plain
`<div onClick={() => setActivePaperId(...)}>` — this works with a mouse but isn't reachable
via Tab key and isn't announced as interactive to a screen reader.

Task:
1. In app/papers/page.tsx, change the card header's `<div onClick=...>` to a `<button
   type="button" onClick=...>` wrapping the same content, OR keep it a div but add
   `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that calls the same toggle
   function when the key is Enter or Space (preventDefault on Space so the page doesn't
   scroll). Prefer the real `<button>` if the existing layout/styling allows it without
   fighting flex/width behavior — only fall back to the role="button" div approach if the
   button element causes layout issues.
2. Make sure the "Read paper PDF" external link (currently a nested `<a>` with
   `stopPropagation()`) still works correctly and doesn't get double-triggered by the new
   keyboard handler.
3. Run `npm run build` and manually verify on /papers: Tab to a paper card header, press
   Enter to expand it, Tab to the "Read paper PDF" link and confirm it still opens the PDF
   without also toggling the card, and confirm mouse click still works exactly as before.
```

---

## STEP 7 (P1) — Remove prefetch={false} from navbar links

```
Context: components/layout/navbar.tsx sets `prefetch={false}` on every Link in both the
desktop and mobile navigation. On a fully static-exported site (next.config.ts has
output: 'export'), Next.js's Link prefetching is essentially free — it just fetches the
already-generated static page ahead of time — so disabling it removes a real, free
performance win with no offsetting benefit.

Task:
1. Remove the `prefetch={false}` prop from both Link instances in
   components/layout/navbar.tsx (desktop nav and mobile drawer nav).
2. Run `npm run build` and manually click through a few nav links to confirm navigation
   still works correctly (it should feel at least as fast, likely faster on repeat visits).
```

---

## STEP 8 (P2) — Reconcile the background color hex drift

```
Context: There are currently three near-identical background color definitions in play:
`#020612` set as an inline style on both <html> and <body> in app/layout.tsx and again in
app/loading.tsx, `#020612` again in the `body { background: ... }` rule in
app/globals.css, and `--background: #030712` as the CSS variable that the `bg-background`
Tailwind utility class actually resolves to (used across many components). These are one
character apart and currently invisible, but anyone trying to change "the" background color
later will very likely miss one of the three.

Task:
1. Decide on a single canonical value (recommend keeping `#020612` since it's used in more
   places today) and update the `--background` CSS variable in app/globals.css to match it.
2. Remove the inline `style={{ backgroundColor: '#020612' }}` from the <html> and <body>
   tags in app/layout.tsx and from app/loading.tsx, relying on the `bg-background` Tailwind
   class (already applied via `className="... bg-background ..."` on body) to set the
   correct color now that the CSS variable matches.
3. Run `npm run build` and visually confirm the background color looks identical on the
   home page and during the loading screen — this should be a no-op change visually, purely
   a consolidation of where the value is defined.
```

---

## STEP 9 (P2) — Mark or relocate orphaned generator scripts

```
Context: lib/data/generate-models.js, lib/data/generate_inception_xception_nasnet.py,
lib/data/generate_mobilenet_efficientnet.py, lib/data/generate_resnet_densenet.py,
lib/data/generate_vgg.py, and lib/data/model.schema.json are not referenced by any npm
script in package.json and not imported by any application code — they're historical
artifacts from the original data-extraction pipeline.

Task:
1. Confirm via search that none of these files are imported or referenced anywhere in app/,
   components/, lib/ (outside themselves), or scripts/. Show me the results.
2. If confirmed, move all of them into a new top-level folder `tools/legacy-data-pipeline/`
   (keeping them in the repo for historical reference, just out of lib/data/ where they read
   as if they might be live), and add a short README.md in that folder noting they were used
   to originally generate the model data now living in data/models/ and are not part of the
   current build.
3. Run `npm run build` to confirm moving them didn't break anything.
```

---

## STEP 10 (P2) — Review link_registry.json's shape before it has to support more domains

```
Context: data/link_registry.json currently cross-references models and papers. Before a
second content domain (e.g. concepts, or a future AI-engineering module) starts depending
on it, it's worth deciding deliberately whether its current shape generalizes.

Task:
1. Show me the current full contents and shape of data/link_registry.json, and every place
   in the codebase that reads it.
2. Don't change anything yet — just summarize, in plain terms, whether its current
   id-to-id mapping structure would still make sense if a third or fourth content type
   (concepts, future modules) needed to participate in the same cross-linking system, or
   whether it's implicitly modeling "model ↔ paper" specifically. I'll decide from there
   whether this needs a schema change now or can wait until the next content domain
   actually exists.
```

---

## STEP 11 — Final verification pass

```
Context: This is the final checkpoint after the freeze checklist.

Task:
1. Run `npm run validate:data` and `npm run build` one final time.
2. Manually check /catalog, /compare, /models/vit, /models/vgg16, /models/densenet201,
   /evolution, /papers, and /learn (both tabs, and both via click and via direct URL with
   ?tab=advisor).
3. Report a final changelog of every file created, deleted, or moved across Steps 0–10.
```

---

## Notes for whoever is running this

- Steps 1–3 are the only ones that actually block calling this repo frozen — they're the
  ones where leaving them unfixed means future content additions require code changes,
  which defeats the point of freezing. Do these three first regardless of what order you
  take the rest in.
- Step 1 is the most mechanically involved (touches the schema, a component, and all 34
  data files) — if Windsurf wants to combine it with Step 2 or 3 in one session, don't let
  it; keep them separate so a build failure is easy to attribute to one change.
- Step 10 is deliberately a read-only investigation step, not a code change — don't let
  Windsurf "helpfully" refactor link_registry.json's schema in that step; the point is to
  get information back before deciding anything.
