# Windsurf Execution Plan — Mobile-First UI/UX Fixes

How to use this file: paste ONE step at a time into Windsurf, in order. After each step,
run `npm run build`, then manually check the specific route(s) called out in that step at
375px width (iPhone SE/standard phone), 320px width (smallest common phone), 768px width
(iPad portrait), and 1280px+ (desktop) using your browser's device toolbar. Do not batch
multiple steps into one Windsurf session — each step is a checkpoint. P0 items go first
since they affect the app's core interaction; P1 and P2 follow.

Repo root for all steps: `D:\Project\Neural Network Architecture Explorer\nn_architecture`

---

## STEP 0 — Safety net

```
Create a new git branch called `fix/mobile-ux` from the current branch and commit the
working tree as-is if there are uncommitted changes, with commit message
"chore: snapshot before mobile UX fixes". Do not modify any files in this step. Just
confirm the branch was created and stop.
```

---

## STEP 1 (P0) — Convert InspectorPanel to a bottom sheet below the lg breakpoint

```
Context: components/model-explorer/tabbed-explorer.tsx renders both the Layers tab and
Topology tab with `flex flex-col lg:flex-row` — meaning below 1024px, InspectorPanel stacks
BELOW the graph/layer-list instead of sitting beside it. On a 375x667px phone viewing the
Topology tab, that's roughly 1,300px of vertical scrolling (navbar + header + tab bar +
400px graph + InspectorPanel's own 550px minimum height) before a user can see the details
of a layer they just tapped. This is the single biggest mobile UX problem in the app.

Task:
1. Create a new component components/model-explorer/inspector-sheet.tsx that wraps the
   existing InspectorPanel component in a bottom-sheet presentation for narrow viewports:
   - It should render nothing (return null) when no layer is selected.
   - When a layer IS selected, it should render a fixed-position panel anchored to the
     bottom of the viewport (`fixed bottom-0 left-0 right-0`), sliding up with a simple
     transform/opacity transition (reuse the existing `framer-motion` dependency already in
     this codebase rather than adding a new one), covering roughly 70-85% of the viewport
     height, with its own internal scroll (the InspectorPanel content itself already
     scrolls internally via `overflow-y-auto`, so this wrapper mainly needs to constrain
     height and handle the slide-in/out).
   - Include a visible drag handle bar or a clear close button at the top (a small
     horizontal bar plus the existing X close button from InspectorPanel is fine - don't
     duplicate the close button, just make sure InspectorPanel's existing `onClose` prop
     triggers this sheet's dismissal too).
   - Add a semi-transparent backdrop behind the sheet that also dismisses it on click,
     consistent with how the existing mobile nav drawer or any existing overlay in this
     codebase behaves (check components/layout/navbar.tsx's AnimatePresence pattern for a
     consistent transition style to match).
   - This component should only be used below the `lg` breakpoint - prefer a CSS-only
     approach: keep the existing side-by-side InspectorPanel wrapped in `hidden lg:block`,
     and render the new InspectorSheet wrapped in `lg:hidden`, so both are conditionally
     visible via Tailwind classes rather than needing to detect viewport width in JS.
2. In tabbed-explorer.tsx's Layers tab section, change the InspectorPanel container to
   `hidden lg:block` for the existing side-by-side desktop version, and render the new
   InspectorSheet component (wrapped in `lg:hidden`) alongside it.
3. Do the same for the Topology tab section.
4. Run `npm run build` and manually test on /models/resnet50 (a mid-size model) at 375px
   width: switch to the Layers tab, tap a layer in the list, confirm the InspectorSheet
   slides up from the bottom showing that layer's details without requiring any scrolling
   past the layer list. Repeat on the Topology tab, tapping a node in the graph. Then widen
   to 1280px and confirm the original side-by-side desktop layout is unchanged.
```

---

## STEP 2 (P0) — Add unconditional aria-labels to the tab buttons

```
Context: In components/model-explorer/tabbed-explorer.tsx, the Overview/Layers/Topology tab
buttons wrap their text labels in `hidden min-[380px]:inline` spans with no `aria-label` on
the `<button>` itself. Below 380px viewport width, `display: none` removes that text from
the accessibility tree entirely (not just visually), so a user on a phone narrower than
380px sees three icon-only buttons with no way to know what they do, and this can't be
relied on to be picked up correctly by all assistive tech at all widths either.

Task:
1. In tabbed-explorer.tsx, add an explicit `aria-label="Overview"`, `aria-label="Layers
   List"`, and `aria-label="Topology Graph"` to the three tab `<button>` elements
   respectively - unconditionally, regardless of the viewport-dependent visible text.
2. Run `npm run build` and verify with a screen reader (or browser dev tools' accessibility
   tree inspector) at both 320px and 1280px widths that each tab button announces its
   correct name.
```

---

## STEP 3 (P0) — Enlarge the "Show detailed layers" toggle's touch target

```
Context: The toggle switch in tabbed-explorer.tsx's Topology tab controls bar is
`h-5 w-9` (roughly 20x36px visually) - well under the ~44x44px minimum recommended touch
target size, making it easy to miss-tap on a phone.

Task:
1. In tabbed-explorer.tsx, wrap the existing toggle `<button>` (the one with
   `h-5 w-9 rounded-full`) in additional padding so the actual clickable/tappable area is
   at least 44x44px, without changing the visual size of the switch itself - for example,
   add `p-2.5` (or similar) to the button so its visual track stays h-5 w-9 but its
   click/tap region extends beyond it. Keep the switch's visual appearance identical.
2. Run `npm run build` and manually verify at 375px width that the toggle is comfortably
   tappable with a thumb, and that the visual switch still looks the same size as before.
```

---

## STEP 4 (P1) — Increase mobile nav drawer touch target size

```
Context: components/layout/navbar.tsx's mobile navigation drawer renders 8 links in a
2-column grid with `px-3.5 py-2.5` padding and `text-xs` - roughly 36-40px tall buttons,
under the 44px guideline.

Task:
1. In navbar.tsx's mobile drawer `<Link>` elements, increase the vertical padding from
   `py-2.5` to `py-3.5` (or add `min-h-11` as a floor, whichever fits better with the
   existing 2-column grid layout without causing awkward wrapping).
2. Run `npm run build` and manually verify at 375px width that each mobile nav link is
   comfortably tappable, and that the 2-column grid of 8 items still looks visually
   balanced (no excessive empty space or cramped wrapping).
```

---

## STEP 5 (P1) — Card-based layout for comparison table's narrative rows on mobile

```
Context: components/model-comparison/comparison-table.tsx's detailed table includes three
text-heavy rows - "Architectural Paradigm," "Key Breakthrough," and "Description" - each
rendered as `min-w-[160px]` columns inside a horizontally-scrolling table. This works on
desktop but is hard to read on mobile, since a full paragraph is squeezed into 160px while
the user is also scrolling horizontally to see which model's column they're in. The numeric
metrics already have a card-based summary above the table (the "Metric Cards Grid" section)
- this step extends that same pattern to these three narrative rows specifically, without
touching the numeric metric rows or the sticky-column table itself.

Task:
1. In comparison-table.tsx, add a new section, rendered only below `md` (i.e. wrapped in a
   `md:hidden` container), that presents the "Architectural Paradigm," "Key Breakthrough,"
   and "Description" content as one card per model - each card showing the model's name/
   color swatch, then the three narrative fields stacked vertically in full-width readable
   text (reuse the existing `getArchitecturalParadigm`, `getBlockPrimitive`, and
   `getBreakthrough` helper functions already in this file - don't duplicate their logic).
2. Wrap the existing "Architecture Design Characteristics" table rows (Architectural
   Paradigm, Primary Block Primitive, Key Breakthrough, Description) so they only render in
   the table form at `md` and above, with the new card version taking over below `md`.
   Leave every other section of the table (General Information, Performance Metrics,
   Efficiency & Resource Overhead, Quick Actions) exactly as they are today, in both the
   table and the metric-cards-grid forms - only the three narrative rows get the new mobile
   card treatment.
3. Run `npm run build` and manually verify on /compare (select 3 models) at 375px width:
   confirm the narrative content now reads as full-width stacked cards instead of a cramped
   horizontally-scrolling table, and confirm the rest of the comparison table (metrics,
   general info) is unchanged. Then check at 1280px width to confirm the original table
   layout for these rows is unchanged there.
```

---

## STEP 6 (P1) — Add an intermediate tablet navigation state

```
Context: components/layout/navbar.tsx currently shows the full desktop nav only at
`lg:flex` (1024px+) and falls back to the hamburger menu for everything below that,
including full iPad-portrait width (768-1023px), which has enough room for at least an
abbreviated persistent nav.

Task:
1. In navbar.tsx, add a `md:flex lg:hidden` nav variant between the existing mobile-drawer
   button (now `md:hidden`) and the full desktop nav (`lg:flex`) - this tablet variant
   should show the same nav links but icon-only (no text labels, relying on the icon plus a
   native `title` attribute or `aria-label` for accessibility), in a single row, to fit
   comfortably in the 768-1023px range without wrapping.
2. Update the existing mobile hamburger button's visibility from `lg:hidden` to `md:hidden`
   so it only appears below 768px, now that the new tablet variant handles the 768-1023px
   range.
3. Run `npm run build` and manually verify at 768px, 900px, and 1023px widths that the
   icon-only tablet nav renders correctly and every link still navigates correctly, and that
   the hamburger menu correctly reappears below 768px.
```

---

## STEP 7 (P1) — Consolidate the duplicated per-page background glow effects

```
Context: app/evolution/page.tsx, app/papers/page.tsx, and app/learn/page.tsx each define
their own ambient background glow divs inline with different colors/positions, in addition
to the one already rendered globally in app/layout.tsx.

Task:
1. Create components/layout/page-background.tsx exporting a `PageBackground` component
   accepting a `variant` prop matching the color pairs currently used across evolution,
   learn, and papers pages.
2. Update app/evolution/page.tsx, app/papers/page.tsx, and app/learn/page.tsx to render
   `<PageBackground variant="..." />` instead of their inline glow divs, matching each
   page's current visual appearance exactly (no visual change, just deduplication).
3. Run `npm run build` and visually compare /evolution, /papers, and /learn before and after
   this change - they should look pixel-identical.
```

---

## STEP 8 (P2) — Reconcile the background color hex drift

```
Context: `#020612` (inline styles in app/layout.tsx and app/loading.tsx, and the `body`
rule in app/globals.css) and `--background: #030712` (the CSS variable `bg-background`
utility classes resolve to) are two slightly different values for what's meant to be one
"background color."

Task:
1. Update the `--background` CSS variable in app/globals.css to `#020612` (matching the
   more widely-used value).
2. Remove the inline `style={{ backgroundColor: '#020612' }}` from <html>/<body> in
   app/layout.tsx and from app/loading.tsx, relying on the now-corrected `bg-background`
   Tailwind class already applied via className.
3. Run `npm run build` and visually confirm the background color is unchanged on the home
   page and the loading screen.
```

---

## STEP 9 (P2) — Plan navbar grouping ahead of future AI-engineering modules

```
Context: navbar.tsx currently has 8 flat top-level links, already tightened with
`xl:gap-2` spacing specifically because it's getting close to fitting comfortably. Before
future modules (Prompt Engineering, RAG, Agents, etc.) are added, it's worth deciding the
grouping mechanism now rather than retrofitting after 15+ items exist.

Task:
1. Don't add any new nav items yet - this step is about capacity, not new content. In
   navbar.tsx, restructure the `navLinks` array into a small number of logical groups (e.g.
   "Explore": Catalog, Compare, Evolution, Research Map, Patterns; "Learn": Papers, Learn;
   keep "Home" standalone) - show me the proposed grouping before changing any rendering
   logic, since this is a categorization decision I should confirm.
2. Once confirmed, implement the grouped structure as a dropdown/flyout for each group in
   the desktop nav (keeping the same visual style as the existing nav links), and as
   collapsible sections in the mobile drawer instead of a flat 2-column grid.
3. Run `npm run build` and manually verify all 8 existing links still navigate correctly
   from their new grouped locations, at 375px, 768px, and 1280px widths.
```

---

## STEP 10 — Final verification pass

```
Context: This is the final checkpoint after all mobile UX fixes.

Task:
1. Run `npm run build`.
2. At each of 320px, 375px, 768px, and 1280px viewport widths, manually check: /catalog,
   /compare (with 3 models selected), /models/resnet50 (Layers tab and Topology tab - tap a
   layer/node and confirm the inspector appears without excessive scrolling on narrow
   widths), /evolution, /papers, /learn.
3. Confirm via browser dev tools' accessibility tree inspector that the Overview/Layers/
   Topology tab buttons on a model detail page have accessible names at 320px width.
4. Report a final changelog of every file created or modified across Steps 0-9.
```

---

## Notes for whoever is running this

- Steps 1-3 are the ones that matter most - they're all contained in
  tabbed-explorer.tsx/inspector-panel.tsx/custom-node.tsx and don't touch the data layer or
  add any new dependency. Do these three before anything else.
- Step 1 is the most involved - resist letting Windsurf combine it with Step 2 or 3, since
  it's the one most likely to need a visual back-and-forth to get the slide-up animation
  feeling right.
- Step 9 deliberately asks Windsurf to show you the proposed nav grouping before
  implementing it - don't skip that checkpoint, since this is a categorization decision
  worth confirming rather than letting Windsurf guess your mental model of the groups.
