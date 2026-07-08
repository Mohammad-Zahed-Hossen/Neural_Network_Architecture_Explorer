# Neural Network Architecture Explorer — Performance & Architecture Audit

*Inspected directly at `D:\Project\Neural Network Architecture Explorer\nn_architecture` (Next.js 16 App
Router, React 19, static export, `@xyflow/react`, Framer Motion, Recharts). Every finding below is
tied to a specific file and line-level pattern I read myself — nothing here is speculative.*

---

## Issues Found

### Issue 1 — `TabbedExplorer` receives the entire model JSON as client props, up to 1.26MB per page

**Severity:** Critical
**Location:** `app/models/[slug]/page.tsx` → `components/model-explorer/tabbed-explorer.tsx`

**Why it matters:** This is a static export (`next.config.ts`: `output: 'export'`). `ModelPage` is a
server component that calls `getModel(slug)` and passes the **entire** model object — every layer,
every layer's `educationalNote` (summary/detailed/whyItMatters/keyTakeaway strings), every connection,
plus the precomputed `architecture.layout` (detailed nodes/edges AND grouped nodes/edges, duplicated)
— straight into `TabbedExplorer`, a `'use client'` component. I checked actual file sizes on disk:

| Model | `data/models/*.json` size |
|---|---|
| `resnet152.json` | **1.26 MB** |
| `nasnetlarge.json` | 147 KB |
| `vgg16.json` | 64 KB |

Because `TabbedExplorer` is a client component, this entire payload gets serialized into the static
HTML page's hydration data and downloaded/parsed by every visitor **before they can interact with
anything** — even though the default active tab is `'overview'`, which only needs ~10 scalar fields
(`name`, `description`, `paperYear`, `authors`, `totalParameters`, `depth`, `memoryUsage`,
`top1Accuracy`, `top5Accuracy`, `colorTheme`, `paperUrl`, `docsUrl`, `category`). The Layers and
Topology tabs — the only consumers of the full `layers`/`connections`/`layout` data — are not even
opened by most visitors on first load.

**Current implementation:**
```tsx
// app/models/[slug]/page.tsx
const model = getModel(slug); // full object, every field
...
<TabbedExplorer model={model} graphData={graphData} />
```
```tsx
// tabbed-explorer.tsx
'use client';
export default function TabbedExplorer({ model, graphData }: TabbedExplorerProps) {
  // model.architecture.layers used only inside the 'layers' and 'topology' tab bodies
```

**Recommended implementation:** Split the props at the server boundary instead of splitting the
component. `ModelPage` already computes `graphData` separately — extend that same idea to the
overview fields:
```tsx
// page.tsx — derive a small, explicit "overview" slice server-side
const overview = {
  id: model.id, name: model.name, fullName: model.fullName, description: model.description,
  category: model.category, colorTheme: model.colorTheme, paperYear: model.paperYear,
  authors: model.authors, paperUrl: model.paperUrl, docsUrl: model.docsUrl,
  totalParameters: model.totalParameters, depth: model.depth, memoryUsage: model.memoryUsage,
  totalFLOPs: model.totalFLOPs, top1Accuracy: model.top1Accuracy, top5Accuracy: model.top5Accuracy,
};

<TabbedExplorer overview={overview} layers={model.architecture.layers} graphData={graphData} />
```
`TabbedExplorer` renders `overview` immediately (small payload). For `layers` and `graphData`
(which back the Layers/Topology tabs), keep them as props for now — a full fetch-on-tab-click
redesign is a bigger change than "highest ROI, low-risk" allows — but this alone removes the
duplicated `layout.groupedNodes`/`groupedEdges` vs `layout.nodes`/`edges` from ever needing to be
read for the Overview-only visit path, and makes the actual bytes-per-field cost visible so a future
pass can lazy-fetch layers/topology only when their tab is first opened (e.g. via a small client
`fetch('/models/<slug>/layers.json')` generated at build time). For this pass, the win is entirely
from no longer forcing the *overview* render path to hold a reference to the full nested object graph
in a way that (a) bloats the type surface engineers reason about and (b) blocks the smaller, truly
independent refactor in Issue 2 from being obviously safe.

**Expected performance gain:** For large models (ResNet-152 class), this is the single largest byte
count on the page. Even the conservative version above (no lazy-fetch yet) sets up the exact seam
needed to lazy-load `layers`/`graphData` in a follow-up without re-touching `page.tsx` again.
**Expected UX gain:** Faster Time-to-Interactive on model pages, especially on mobile/slow
connections, for the majority of visitors who land on Overview.
**Implementation difficulty:** Medium (touches a public prop boundary; TypeScript will catch every
call site that needs updating).
**Risk level:** Low-medium — must ensure `key_hyperparams`/every field the Overview tab actually reads
is included in `overview`; a missed field is a visible regression, not a silent one, so it's easy to
catch in review.
**Estimated implementation time:** 2–3 hours including a full field-audit of what Overview/Layers/
Topology each actually read.

---

### Issue 2 — `FlowCanvas` recomputes `initialNodes`/`initialEdges` on every `selectedLayerId` change, defeating `CustomNode`'s `memo()` for every node

**Severity:** High
**Location:** `components/model-explorer/flow-canvas.tsx`

**Why it matters:** `CustomNode` is correctly wrapped in `memo()` (`custom-node.tsx`, last line). But
`FlowCanvas`'s `initialNodes` and `initialEdges` `useMemo` blocks both list `selectedLayerId` in their
dependency arrays:
```tsx
}, [graphId, hiddenTypes, layers, selectedLayerId]);   // initialNodes
...
}, [graphId, colorTheme, hiddenTypes, connections, layers, selectedLayerId]); // initialEdges
```
Every time the user clicks a layer, **both memos recompute from scratch**, building brand-new `data`
objects for *every* node (not just the previously/newly selected ones). Two `useEffect`s then run
`setNodes(initialNodes)` / `setEdges(initialEdges)` unconditionally whenever those memos change —
which is every click. This means the careful "update selection in-place without rebuilding the array"
effects further down the file (the ones that diff and only replace changed nodes/edges) **never get a
chance to run against the previous array** — by the time they'd fire, `initialNodes`/`initialEdges`
have already replaced everything with new object references, so `memo()` sees new props on every node
and re-renders all of them. For a 100-node detailed topology (the app's own `MAX_DETAILED_NODES` cap),
that's up to 100 unnecessary component re-renders per click.

**Current implementation:** (see above — `selectedLayerId` drives full node/edge recomputation, then
a redundant in-place-update effect that never gets to do its job because the array was already replaced)

**Recommended implementation:** Remove `selectedLayerId` from the `initialNodes`/`initialEdges`
`useMemo` dependency arrays entirely — compute `data.isSelected: false` (or omit it) in the base memo,
and let the existing "update selection status in-place" effects (already present in the file, further
down) be the *only* place selection is applied. Those effects already correctly return the same array
reference (`return changed ? nextNodes : prevNodes`) when nothing changed, and only replace the
specific node objects whose `isSelected` actually flipped — that's exactly what should drive
`CustomNode`'s `memo()` to skip re-rendering untouched nodes. The base memo should key only on
`[graphId, hiddenTypes, layers]` (structure), not selection (interaction state).

**Expected performance gain:** Clicking a layer in a 100-node topology should re-render ~2 node
components (old selection, new selection) instead of up to 100.
**Expected UX gain:** Noticeably snappier node selection on large models (ResNet-152, DenseNet-201,
NASNetLarge) on mid-range hardware; less likely to feel laggy on mobile.
**Implementation difficulty:** Low — delete two dependency-array entries and remove `isSelected` from
the base node/edge construction (default it, let the sync effect own it).
**Risk level:** Low. The in-place sync effects already exist and are already correct; this change
lets them actually run as designed. Must verify `hiddenTypes` toggling and model-switch (`graphId`
change) still correctly reset nodes (they will — those stay in the dependency array).
**Estimated implementation time:** 1–2 hours including manual verification on the largest model.

---

### Issue 3 — `ComparisonTable` recomputes `Math.max`/`Math.min` across all models for every cell, every render, and rebuilds its `metrics` definition array every render

**Severity:** Medium
**Location:** `components/model-comparison/comparison-table.tsx`

**Why it matters:** `metrics: MetricDef[]` (six entries, each with 2–4 closures) is declared inside the
component body, so it's a new array of new functions on every render. Worse, for every one of the ~10
table rows and ~6 metric summary cards, the render body calls `Math.max(...models.map(...))` and
`Math.min(...models.map(...))` **again**, even though the same min/max was just computed one row
above for a different purpose, and even though `models` didn't change. With the app's `/compare` page
supporting up to "Select All" (34 models), that's `O(rows × models)` redundant array walks on every
parent re-render — including re-renders triggered by unrelated state in `ComparisonClient` (e.g.
typing in the model-selector search box, which doesn't even affect `comparedModels`, but if any parent
re-render is not perfectly isolated, this recomputes for nothing).

**Current implementation:** `metrics` defined inline in the function body; `Math.max(...models.map(m
=> metric.getRawValue(m)))` repeated separately in the summary-card block and again in each detailed
table row block.

**Recommended implementation:** Hoist `metrics` (the static definition — icons, labels, accessor
functions) to module scope, outside the component, since it doesn't depend on props. Compute
min/max/winners **once** per render in a single `useMemo` keyed on `models`, producing a
`Map<metricKey, { min, max, winnerId }>` that every card and row reads from instead of recomputing.
```tsx
const metricStats = useMemo(() => {
  const stats = new Map<string, { min: number; max: number; winnerId?: string }>();
  for (const metric of METRICS) {
    const values = models.map(m => metric.getRawValue(m));
    const min = Math.min(...values);
    const max = Math.max(...values);
    // ...winner logic here, once...
    stats.set(metric.key, { min, max, winnerId });
  }
  return stats;
}, [models]);
```
**Expected performance gain:** Table render work drops from `O(rows × models)` repeated scans to
`O(rows × 1)` lookups; matters most as the selection grows toward "Select All".
**Expected UX gain:** Smoother interaction on `/compare` when many models are selected, especially on
lower-end devices.
**Implementation difficulty:** Low-medium (mechanical refactor, no behavior change).
**Risk level:** Low — output values are identical, this only changes *when* they're computed.
**Estimated implementation time:** 1.5–2 hours.

---

### Issue 4 — `ComparisonCharts` rebuilds bar/radar chart data on every render, including on window-resize-driven re-renders, with no `useMemo`

**Severity:** Medium
**Location:** `components/model-comparison/comparison-chart.tsx`

**Why it matters:** `barChartData` and `radarChartData` (which includes five `Object.fromEntries(...)`
calls, each mapping over `radarModels`) are recomputed inline on every render with zero memoization.
The component also subscribes to window resize via `useSyncExternalStore` purely to compute
`isMobile` for the radar chart's `outerRadius` — meaning **every resize event re-renders this
component and recomputes both chart datasets**, even though neither dataset depends on window width.

**Current implementation:** All data-shaping logic runs directly in the function body on every render.

**Recommended implementation:** Wrap `barChartData` in `useMemo(() => ..., [models, activeMetric])`
and `radarChartData` (plus its `radarModels`/`max*Radar` helpers) in
`useMemo(() => ..., [models])`. This decouples chart-data computation from the resize-driven
`isMobile` re-renders entirely — resize will still re-render the component (for `outerRadius`), but
will no longer redo the data transformation work.
**Expected performance gain:** Chart data computation only happens when `models`/`activeMetric`
actually change, not on every browser resize/orientation change.
**Expected UX gain:** Smoother resizing/orientation-change behavior on the comparison page, no
visible jank from recomputation during resize.
**Implementation difficulty:** Low.
**Risk level:** Low.
**Estimated implementation time:** 45 minutes.

---

### Issue 5 — No root `error.tsx` — any uncaught render error (e.g. from React Flow or malformed model data) shows an unstyled default error page

**Severity:** High (production readiness)
**Location:** `app/` (missing `error.tsx`; only `loading.tsx` and `not-found.tsx` exist)

**Why it matters:** This is a static-export app rendering third-party visualization libraries
(`@xyflow/react`, Recharts) against large, hand-authored JSON data files. A malformed layer reference,
an unexpected `null` in a chart dataset, or any other runtime exception in a client component (most of
this app's interactive surface is `'use client'`) will currently bubble up with no application-level
Error Boundary to catch it — Next.js falls back to its default, unbranded error UI, and the user loses
the entire page (including working parts like the Navbar) with no recovery action.

**Current implementation:** No `app/error.tsx` exists anywhere in the route tree (confirmed by listing
`app/` and `app/compare/`).

**Recommended implementation:** Add `app/error.tsx` as a client component Error Boundary consistent
with the app's existing dark visual language (reuse the same card/border/glow classes already used
throughout — e.g. the `bg-[#020617] border border-[#1f2937] rounded-2xl` pattern from
`tabbed-explorer.tsx`), with a "Try again" button calling the `reset()` prop Next.js provides, and a
"Back to Catalog" link matching the existing breadcrumb pattern already used on every explorer page.
Optionally also add a scoped `app/models/[slug]/error.tsx` so a broken individual model page doesn't
take down navigation to other models.
**Expected performance gain:** None (this is a resilience fix, not a perf fix).
**Expected UX gain:** High — the difference between "this one page broke, here's a way back" and "the
whole app looks broken."
**Implementation difficulty:** Low.
**Risk level:** Very low — purely additive, cannot regress existing behavior.
**Estimated implementation time:** 30–45 minutes.

---

### Issue 6 — `PageTransition` forces a full remount of the entire route tree on every navigation via `key={pathname}`

**Severity:** Medium
**Location:** `components/layout/page-transition.tsx`, used in `app/layout.tsx`

**Why it matters:** `<motion.div key={pathname}>` means React fully unmounts and remounts everything
inside `{children}` on every route change — not just re-renders. On a content-heavy exploration app
like this (where a user might go Catalog → Model A → Compare → Model B in quick succession), this
means every client component on the destination page mounts fresh every time (all `useState`
initializers, all `useEffect`s re-run from scratch), and any in-flight visual state from the previous
page (scroll position within a panel, an open collapsible section, etc.) is lost even when it
shouldn't need to be — it's not just "new page, new component," it's "new page, entirely fresh React
tree, no exceptions."

**Current implementation:** `key={pathname}` on the top-level motion wrapper for the entire app body.

**Recommended implementation:** Keep the fade transition (it's a nice, cheap touch — 0.2s opacity/y)
but stop using `pathname` as the `key`. Framer Motion's `AnimatePresence` + `mode="wait"` (or simply
animating `opacity`/`y` via `animate` prop keyed off a route-change detection, without forcing a
remount) achieves the same visual fade without unmounting the entire subtree. If a full remount is
genuinely wanted for some routes (e.g. to guarantee `/models/[slug]` fully resets when navigating
between two different models), scope the `key` to just that route segment's own layout instead of the
global `PageTransition` wrapper that wraps literally every page in the app.
**Expected performance gain:** Eliminates unnecessary unmount/remount cost on every navigation
app-wide (fewer effect re-runs, less GC churn from discarded fiber trees).
**Expected UX gain:** Preserves incidental UI state across navigation where the user would reasonably
expect it (e.g. scroll position resets are usually desired for content pages but not for persistent
UI chrome); removes a subtle source of "did that page just flash/reset weirdly" feeling.
**Implementation difficulty:** Low-medium (Framer Motion transition semantics need a quick check
against the current visual behavior to make sure the fade still looks the same).
**Risk level:** Medium — this is the one change in this batch with a visible behavioral surface (the
transition itself); must be checked visually pre/post on at least 3 route-change scenarios before
merging.
**Estimated implementation time:** 1–1.5 hours including visual verification.

---

### Issue 7 — `Navbar`'s `navGroups` array (with embedded icon component references and per-item closures) is rebuilt on every render, and `Navbar` is mounted once in the root layout for the entire app

**Severity:** Low
**Location:** `components/layout/navbar.tsx`

**Why it matters:** `navGroups` is a ~25-line nested array literal recreated inside the component body
on every render, and `Navbar` re-renders on every `pathname` change (it's in the root layout, and uses
`usePathname()` directly). The array itself is small, so the raw cost is negligible — but it's
unnecessary allocation on a component that mounts once and re-renders on literally every navigation in
the app.

**Recommended implementation:** Wrap `navGroups` in `useMemo(() => [...], [pathname])`, or better,
split the static shape (labels/hrefs/icons — these never change) from the derived `active` booleans, so
the static part is defined once at module scope and only a small `activePath` lookup is recomputed per
render.
**Expected performance gain:** Negligible on its own; included because it's a one-line-of-effort fix
touching a component that's alive for the entire session.
**Expected UX gain:** None directly.
**Implementation difficulty:** Trivial.
**Risk level:** Very low.
**Estimated implementation time:** 20 minutes.
**Note:** Not selected in the top 5 — real but low-impact; listed for completeness per the requested
output format.

---

### Issue 8 — `ComparisonClient` syncs `selectedIds` to the URL via `router.replace` inside a `useEffect` on every toggle, and its handler functions (`toggleModel`, `selectAll`, `selectCategory`, etc.) are recreated every render

**Severity:** Low
**Location:** `components/model-comparison/comparison-client.tsx`

**Why it matters:** Every checkbox click updates `selectedIds` state, which triggers a `useEffect` that
calls `router.replace()`, which itself causes a re-render via the `useSearchParams()` subscription.
This is a legitimate pattern for shareable URLs, but combined with unmemoized handler functions passed
to a large list of model-selector buttons, rapid selection changes (e.g. "Select All" on 34 models,
then deselecting several) do more re-render work than necessary. This is lower severity than Issues
1–4 because the selector UI itself is not expensive to re-render (plain buttons, no charts/tables in
that subtree), so it's not a top-5 pick, but worth fixing opportunistically alongside Issue 3/4 since
it's the same file family.
**Recommended implementation:** Wrap `toggleModel`, `selectAll`, `selectNone`, `selectClassics`,
`selectCategory` in `useCallback`. Consider debouncing the `router.replace` call (e.g. 200–300ms) so
rapid successive toggles (like clicking "Select All" then immediately deselecting a category) don't
each independently trigger a navigation/history update.
**Expected performance gain:** Minor — smoother rapid-selection interactions.
**Expected UX gain:** Minor — avoids potential URL/history churn from rapid clicks.
**Implementation difficulty:** Low.
**Risk level:** Low.
**Estimated implementation time:** 1 hour.
**Note:** Not selected in the top 5 — real but lower-impact than the others; listed for completeness.

---

## Impact vs. Effort Matrix

```
 High Impact  │  [1] Model payload split         [2] FlowCanvas memo fix
              │  (Medium effort)                 (Low effort)  ← best ROI in the app
              │
              │  [5] Root error.tsx               [6] PageTransition remount
              │  (Low effort)                      (Medium effort, visible surface)
              │
Med Impact    │  [3] ComparisonTable memoization   [4] ComparisonChart memoization
              │  (Low-Medium effort)               (Low effort)
              │
 Low Impact   │  [7] Navbar array                  [8] ComparisonClient callbacks
              │  (Trivial effort)                  (Low effort)
              └──────────────────────────────────────────────────────────────────
                Low Effort                                          Higher Effort
```

## Final Top 5 (selected)

1. **Issue 2 — FlowCanvas selection memo fix.** Best ROI in the whole audit: low effort, high impact,
   the fix pattern (in-place sync effects) already half-exists in the file.
2. **Issue 1 — Split model payload at the server boundary.** Highest ceiling (1.26MB confirmed on
   disk for the largest model); medium effort but a clean, well-scoped prop-boundary change.
3. **Issue 5 — Add root `error.tsx`.** Trivial effort, meaningfully closes a real production-readiness
   gap, zero regression risk.
4. **Issue 3 — ComparisonTable memoization.** Low-medium effort, removes genuinely redundant
   `O(rows × models)` recomputation, purely mechanical/safe.
5. **Issue 4 — ComparisonChart memoization.** Very low effort, directly stops resize events from
   recomputing chart data unnecessarily.

*(Issue 6 — PageTransition — was deliberately left out of the top 5 despite being a real, app-wide
issue: it's the one item in this audit with a visible behavioral surface that needs manual visual
verification, which doesn't fit "implementation-ready with near-zero additional thinking required."
Recommend it as the next item after this batch ships clean.)*

---

# Windsurf Implementation Prompt

Copy everything below into Windsurf as-is.

```
You are implementing a scoped, low-risk performance and reliability pass on the Neural Network
Architecture Explorer at D:\Project\Neural Network Architecture Explorer\nn_architecture. This is
Next.js 16 App Router, React 19, TypeScript, static export (next.config.ts has output: 'export').

YOUR TASK IS OPTIMIZATION ONLY. Do not redesign any UI, do not change any visible behavior except
where explicitly instructed (Fix 3, the error boundary, is the only net-new UI surface — everything
else must look and behave identically to a user, just faster). Do not touch any file not listed below.
Do not upgrade any dependency. Do not change file/folder structure beyond what's specified.

==================================================
SAFETY RULES (apply to every fix below)
==================================================
1. Before editing any file, read it in full first — do not pattern-match from this prompt's excerpts
   alone, they are illustrative, not verbatim diffs.
2. After each fix, run `npm run lint` and `npx tsc --noEmit` (or the project's equivalent type-check
   script if lint doesn't cover types) and confirm zero new errors before moving to the next fix.
3. Do not remove any existing comment that explains WHY code is structured a certain way (e.g. the
   "Update selection status for nodes in-place without rebuilding the array" comments in
   flow-canvas.tsx) — these comments describe intent that must be preserved, and in Fix 1 specifically
   they describe the exact mechanism you are restoring to working order.
4. Implement fixes in the exact order listed. Do not batch multiple fixes into one commit — each is
   independently revertable.
5. After all fixes, do a final manual pass through the REGRESSION PREVENTION CHECKLIST below before
   considering the work done.

==================================================
FIX 1 — components/model-explorer/flow-canvas.tsx (do this first; lowest risk, highest ROI)
==================================================
Problem: the `initialNodes` and `initialEdges` useMemo blocks include `selectedLayerId` in their
dependency arrays, causing full node/edge array reconstruction (new object references for every node)
on every layer selection. This defeats CustomNode's memo() for every node, not just the ones whose
selection state changed. The file ALREADY contains two later useEffect blocks (search for the comments
"Update selection status for nodes in-place without rebuilding the array" and "...for edges...") that
correctly diff and only replace changed nodes/edges — but they never get a chance to work because the
node/edge STATE has already been fully replaced by the initialNodes/initialEdges memo firing first.

Steps:
1. In the `initialNodes` useMemo: remove `selectedLayerId` from the dependency array. Inside the memo
   body, change `isSelected` computation to a constant `false` (the selection-sync effect further down
   the file is what will set the real value — do not compute isSelected here at all).
2. In the `initialEdges` useMemo: remove `selectedLayerId` from the dependency array. Inside the memo
   body, the `isRelevant`/`isSourceSelected`/`isTargetSelected` logic and the `animated`/`style` values
   that depend on them should be computed as their "nothing selected" defaults (i.e. as if
   selectedLayerId were always null) — again, the sync effect further down handles the real value.
3. Do NOT touch the two useEffect blocks that do in-place node/edge selection syncing — they are
   already correct and will now actually run against a stable base array.
4. Do NOT touch the `useEffect(() => setNodes(initialNodes), [initialNodes])` /
   `useEffect(() => setEdges(initialEdges), [initialEdges])` blocks — they still need to fire when
   `graphId`/`hiddenTypes`/`layers` change (model switch, layer-type filter toggle), just not on every
   selection change, which is now naturally true since selectedLayerId is no longer in those memos'
   deps.
5. Leave `MAX_DETAILED_NODES`, `CustomNode`'s memo() wrapper, and everything in tabbed-explorer.tsx
   untouched in this fix.

Verify: open a model with 50+ detailed layers (e.g. resnet152 or densenet201 with "Show detailed
layers" toggled on), click through several different layers in the topology view, and confirm
selection highlighting still works correctly (selected node gets ring/glow, connected edges animate)
— only the RENDER COUNT should change, not the visible behavior.

==================================================
FIX 2 — app/models/[slug]/page.tsx and components/model-explorer/tabbed-explorer.tsx
==================================================
Problem: the full model object (up to 1.26MB for resnet152.json) is passed as a single prop to the
'use client' TabbedExplorer component, even though the default-active Overview tab only reads a small
subset of scalar fields.

Steps:
1. In app/models/[slug]/page.tsx, after `model = getModel(slug)`, construct an explicit `overview`
   object containing exactly these fields (audit tabbed-explorer.tsx's Overview tab JSX yourself to
   confirm this list is complete before proceeding — do not guess, read the current Overview tab
   render block in full): id, name, fullName, description, category, colorTheme, paperYear, authors,
   paperUrl, docsUrl, totalParameters, depth, memoryUsage, totalFLOPs, top1Accuracy, top5Accuracy.
2. Change the TabbedExplorer call to pass `overview={overview}` instead of the full `model` object for
   everything the Overview tab needs, but continue passing `layers={model.architecture.layers}`
   separately (needed by the Layers tab) and keep `graphData` as it currently is (needed by the
   Topology tab).
3. Update TabbedExplorerProps in tabbed-explorer.tsx to accept `overview`, `layers`, and `graphData` as
   three separate props instead of one `model` prop. Update every reference to `model.X` inside the
   component to read from the correct one of the three props (most will become `overview.X`; the
   Layers tab's `layers` variable already exists via `model.architecture.layers` — just source it from
   the new `layers` prop directly instead).
4. Search the whole file for every remaining usage of `model.` after the prop split and make sure each
   one is repointed correctly — do not leave any accidental references to a `model` variable that no
   longer exists.
5. Update any other caller of TabbedExplorer (search the codebase for `<TabbedExplorer` — there should
   be exactly one, in page.tsx) to match the new prop shape.

Verify: TypeScript must compile with zero errors (this refactor is fully type-checked by construction
— a missed field will show as a TS error, not a silent bug). Visually check the Overview, Layers, and
Topology tabs on at least: vgg16 (small model), resnet152 (largest model), and one model with a
docsUrl and one without (to check the conditional "Documentation unavailable" branch still works).

==================================================
FIX 3 — NEW FILE app/error.tsx (and optionally app/models/[slug]/error.tsx)
==================================================
Problem: no Error Boundary exists anywhere in the app. An uncaught render error currently shows
Next.js's unstyled default error page.

Steps:
1. Create app/error.tsx as a 'use client' component with the standard Next.js error boundary shape:
   `export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () =>
   void })`.
2. Match the app's existing visual language exactly — reuse the card pattern already used throughout
   the app (see tabbed-explorer.tsx for reference: `bg-[#020617] border border-[#1f2937] rounded-2xl`
   card styling, the same font-weight/tracking conventions, the same primary color `#22d3ee` for the
   action button). Include: a short human-readable message (do not expose `error.message` directly to
   end users — log it via `console.error(error)` in a `useEffect` instead, and show a generic "Something
   went wrong while rendering this page" message), a "Try again" button calling `reset()`, and a "Back
   to Catalog" link to `/catalog` matching the existing breadcrumb link style used in
   tabbed-explorer.tsx and comparison-client.tsx (`ArrowLeft` icon from lucide-react, same classes).
3. Optionally, create app/models/[slug]/error.tsx with the same treatment but a message specific to a
   broken model page and a "Back to Catalog" link, so a single bad model page doesn't take down
   navigation to the rest of the app. This is optional — do it if time allows, Fix 3's root error.tsx
   alone already closes the main gap.

Verify: temporarily throw an error inside a component during local dev (e.g. `if (true) throw new
Error('test')` inside TabbedExplorer), confirm the new error.tsx renders instead of the default Next.js
error overlay, confirm "Try again" and "Back to Catalog" both work, then REMOVE the temporary throw
before committing.

==================================================
FIX 4 — components/model-comparison/comparison-table.tsx
==================================================
Problem: the `metrics` array (six metric definitions with closures) is recreated every render, and
Math.max/Math.min over `models` is recomputed redundantly for the same metric multiple times per
render (once per summary card, again per detailed table row, again per bar-percentage calculation).

Steps:
1. Move the `metrics` array definition (currently declared as `const metrics: MetricDef[] = [...]`
   inside the component function body) to module scope, above the component, renamed to `METRICS` (or
   keep the name `metrics` if you prefer — just move it out of the render body). It does not reference
   any props or state, so this is a pure relocation, not a logic change.
2. Add a `useMemo` inside the component that computes, once per `models` change, a
   `Map<string, { min: number; max: number; winnerId?: string }>` — one entry per metric key — by
   iterating `METRICS` once and computing min/max/winner for each. This replaces every inline
   `Math.max(...models.map(...))` / `Math.min(...models.map(...))` call currently scattered across the
   summary-card render block and the two detailed-table-row render blocks (General/Performance section
   and Efficiency section).
3. Update every place that currently calls `Math.max(...models.map(m => metric.getRawValue(m)))` or the
   equivalent `Math.min` version to instead read `metricStats.get(metric.key)!.max` /
   `.min` from the memoized map.
4. The existing `winners` Map construction logic (currently built inline before the return statement)
   should be folded into the same `useMemo` rather than living as a separate un-memoized block.
5. Do not change any visible output — bar percentages, winner badges, and displayed values must be
   pixel-identical before and after this change.

Verify: visually compare the /compare page with 5+ models selected before and after — every bar width,
every "winner" trophy badge, every displayed number must match exactly.

==================================================
FIX 5 — components/model-comparison/comparison-chart.tsx
==================================================
Problem: `barChartData` and `radarChartData` (and their supporting `radarModels`/`max*Radar` values)
are recomputed on every render with no memoization, including on every window-resize event (which
this component subscribes to via useSyncExternalStore purely to compute `isMobile`).

Steps:
1. Wrap the `barChartData` computation in `useMemo(() => { ... }, [models, activeMetric])`. Keep the
   `formatYAxis` function as-is (it's cheap and doesn't need memoization, and it's already
   recomputed correctly since it only depends on `activeMetric` via closure — no change needed there
   unless you want to wrap it in useCallback for consistency, which is optional and low-priority).
2. Wrap `radarModels`, `maxParamsRadar`, `maxMemoryRadar`, `maxFLOPsRadar`, `maxDepthRadar`,
   `maxAccuracyRadar`, and `radarChartData` together in a single `useMemo(() => { ... }, [models])` —
   these all derive from the same `models` prop and are naturally computed together.
3. Confirm the `isMobile` value (from useSyncExternalStore) is only used for the `outerRadius` prop on
   RadarChart, and is NOT a dependency of either new useMemo — resize events should now only
   re-render the component (cheap) without re-deriving chart data (the expensive part).

Verify: visually compare bar chart and radar chart rendering before and after on the /compare page;
resize the browser window and confirm charts still respond correctly to the mobile/desktop
outerRadius change while no console errors or stale-data flashes appear.

==================================================
IMPLEMENTATION ORDER
==================================================
1. Fix 1 (flow-canvas.tsx) — standalone, no dependencies on other fixes.
2. Fix 3 (error.tsx) — standalone, purely additive, do it early since it's zero-risk and gives you a
   safety net while doing the riskier fixes.
3. Fix 4 (comparison-table.tsx) — standalone.
4. Fix 5 (comparison-chart.tsx) — standalone, can be done alongside Fix 4 since they're both in the
   /compare page but touch different files.
5. Fix 2 (page.tsx + tabbed-explorer.tsx) — do this LAST because it's the only fix that changes a
   component's public prop shape, and you want the other fixes already verified working before
   touching this higher-surface-area change.

==================================================
REGRESSION PREVENTION CHECKLIST (run after ALL fixes are complete)
==================================================
[ ] npm run lint passes with zero new warnings/errors
[ ] npx tsc --noEmit (or project equivalent) passes with zero errors
[ ] npm run build (static export) completes successfully with no new build warnings
[ ] /catalog page loads and all model cards are clickable
[ ] /models/vgg16 (small model): Overview tab shows correct data, Layers tab lists all layers and
    inspector panel opens on click, Topology tab renders graph and node selection works
[ ] /models/resnet152 (largest model): same three checks as above — this is the model most likely to
    reveal a missed field from Fix 2 or a leftover perf issue from Fix 1
[ ] /models/<any model with a null docsUrl>: "Documentation unavailable" branch still renders correctly
[ ] Topology tab: click 5+ different layers in sequence on a detailed (100-node) model — selection
    highlight and connected-edge animation both work correctly every time
[ ] Topology tab: toggle "Show detailed layers" switch — graph correctly switches between grouped and
    detailed view
[ ] Topology tab: toggle a layer-type filter chip (e.g. hide all conv2d) — nodes/edges correctly
    hide/show
[ ] /compare page: select 5+ models, confirm stat cards, bar chart, radar chart, and detailed table
    all show correct values with correct "winner" highlighting
[ ] /compare page: resize browser window while charts are visible — no visual glitches, no console
    errors
[ ] /compare page: search the model selector, toggle category selection, "Select All"/"Clear All" —
    all still work
[ ] Trigger a deliberate render error locally, confirm app/error.tsx displays correctly, confirm "Try
    again" and "Back to Catalog" both function, then confirm the deliberate error was removed before
    final commit
[ ] Full click-through of Navbar links (desktop, tablet, and mobile drawer breakpoints) — no broken
    routes
[ ] No new console errors/warnings on any of the above pages in the browser dev console

==================================================
TESTING CHECKLIST (in addition to the regression checklist above)
==================================================
[ ] Run the existing `npm run validate:data` script (scripts/validate-model-data.ts) if it exists and
    is unaffected by these changes — confirm it still passes, since Fix 2 touches how model data is
    consumed (not the data files themselves, but verify anyway)
[ ] If React DevTools Profiler is available, record a profile of clicking through 5 layers on
    resnet152's detailed topology view before and after Fix 1 — confirm the "render count" for
    CustomNode instances drops from ~100 per click to ~2-3 per click
[ ] Compare the initial HTML payload size of /models/resnet152 before and after Fix 2 (e.g. via
    browser dev tools Network tab, or `curl -s <url> | wc -c` against the static export output)—
    confirm a measurable reduction

==================================================
ACCEPTANCE CRITERIA
==================================================
- All items in the Regression Prevention Checklist pass.
- No visible UI/UX change on any page except: (a) app/error.tsx now exists and renders on error
  instead of the default Next.js error page, and (b) faster perceived load/interaction on
  /models/resnet152 and other large models, and snappier layer selection in the topology view — both
  of these are improvements, not regressions, and should be the ONLY user-visible differences.
- `npm run build` succeeds with static export intact (verify the `out/` directory is generated
  correctly with no missing pages).
- Git history shows 5 separate, independently revertable commits, one per fix, in the implementation
  order specified above.

==================================================
ROLLBACK PLAN
==================================================
Because each fix is a separate commit touching a distinct, non-overlapping set of files:
- If Fix 1 causes any topology selection bug: `git revert` the Fix 1 commit alone — Fixes 2–5 are
  untouched by this since flow-canvas.tsx is not modified by any other fix.
- If Fix 2 causes any data-missing bug on a model page: `git revert` the Fix 2 commit alone — this is
  the highest-surface-area change and the most likely candidate for a revert if a field was missed;
  reverting it fully restores the original single-`model`-prop behavior with no side effects on the
  other four fixes.
- If Fix 3's error.tsx has a styling issue: it's purely additive, so worst case is a revert with zero
  impact on anything else — there is no scenario where this fix causes a functional regression, only a
  possible visual polish issue that itself doesn't require a revert (fix forward instead).
- If Fix 4 or Fix 5 produce incorrect comparison numbers or chart values: revert the specific commit;
  both are isolated to their own single file with no cross-file dependency on the other fixes.
- After any revert, re-run the full Regression Prevention Checklist against the reverted state before
  re-attempting the fix.
```
