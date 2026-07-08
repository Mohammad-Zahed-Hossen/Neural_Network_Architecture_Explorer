# Windsurf Execution Prompt — Final Pre-Freeze UI/UX Fixes

Copy-paste this whole thing into Windsurf.

---

You have direct access to my complete local repository.

**Project root:** `D:\Project\Neural Network Architecture Explorer\nn_architecture`

---

## Context

This is a documentation-heavy educational Next.js application — my long-term "AI Engineer's Second Brain." It is a **freeze candidate**. This is the last implementation pass before the UI/UX is locked as stable infrastructure. After this pass, no further UI redesigns — only content additions (new models, new AI Engineering domains, new documentation).

An audit already identified the exact issues below with file-level evidence. Your job is to **fix them, not re-evaluate them.** Do not re-audit. Do not propose alternative solutions unless a fix below is factually impossible given the current code. Do not redesign anything not explicitly listed.

---

## Non-Negotiable Constraints

Do NOT:
* Redesign any component not listed below
* Change visual style, spacing, colors, animations beyond what's specified
* Introduce new dependencies unless explicitly instructed
* Refactor "while you're in there" — touch only what's specified
* Adjust padding/margins/icon sizes/gradients/shadows anywhere. This is explicitly out of scope for this pass.

Every change must be traceable to one of the tasks below. If you think something else needs fixing, list it separately at the end as a note — do not fix it unprompted.

---

## Task 1 (P0) — Resolve `/advisor` duplicate route

**Problem:** `app/advisor/page.tsx` renders `<ModelAdvisor />` standalone. `app/learn/page.tsx` also renders the identical `<ModelAdvisor />` component as its "Advisor" tab (`/learn?tab=advisor`). The navbar never links to `/advisor` — it's a dead, duplicate route.

**Fix (canonical decision: keep `/learn?tab=advisor`, kill `/advisor`):**
1. Delete `app/advisor/page.tsx` entirely.
2. Search the full codebase for any remaining reference to the string `/advisor` (links, redirects, sitemap entries, metadata) and update every one to point to `/learn?tab=advisor`.
3. Add a redirect so any external bookmark or old link to `/advisor` doesn't 404: in `next.config.ts`, add a permanent redirect:
   ```ts
   redirects: async () => [
     { source: '/advisor', destination: '/learn?tab=advisor', permanent: true },
   ]
   ```
4. Confirm the `/learn` page still works identically with the `?tab=advisor` deep link (existing `useEffect` reading `searchParams.get('tab')` should already handle this — verify, don't rewrite).

**Verification:** Visiting `/advisor` in the browser must 301-redirect to `/learn?tab=advisor` and render correctly. `grep -r "advisor" app/ components/` (excluding the `learn` page and its imports) should return nothing.

---

## Task 2 (P0) — Surface `/concepts/receptive-field` and `/concepts/training-dynamics`

**Problem:** Both pages are fully built and functional but have zero discovery path — not in the navbar, not linked from home, not linked from `/learn`, not linked from model detail pages.

**Decision:** These are permanent features (they are genuinely valuable, verified in the audit), not experiments. They must be exposed, not removed.

**Fix:**
1. Add a new navbar group called **"Tools"** (or fold into the existing "Learn" group if you'd rather keep the navbar flat for now — pick one, but Tools is preferred since it anticipates future additions like Playground/Visualizers/Benchmarks per the IA note in Task 4). Add both concept pages as items:
   * `/concepts/receptive-field` → "Receptive Field Explorer"
   * `/concepts/training-dynamics` → "Training Dynamics"
2. Additionally — because Receptive Field is specifically relevant per-model, not just as a standalone tool — add a contextual link from the model detail page (`app/models/[slug]/page.tsx` or its tabbed explorer component) pointing to `/concepts/receptive-field?model={slug}`. This requires:
   * Adding a `model` query param read in `concepts/receptive-field/page.tsx` that pre-selects `selectedModelId` from the URL param instead of defaulting to `'resnet50'` (fall back to `'resnet50'` if the param is missing or invalid).
   * Adding a small link/button in the model detail page's Layers or Topology tab, e.g. "Visualize Receptive Field Growth →".
3. Do the same discoverability check for `training-dynamics` — read that file first (it wasn't inspected in the audit) and determine the correct contextual entry point by analogy to receptive-field. If it's not model-specific, a Tools/Learn nav link alone is sufficient.

**Verification:** Both `/concepts/*` routes must be reachable via at least one visible UI link, with zero direct-URL-only access. Confirm via manual click-through from `/` with no URL typed.

---

## Task 3 (P1) — Safe-area padding on mobile bottom sheet

**Problem:** `components/model-explorer/inspector-sheet.tsx` uses `fixed bottom-0` with no `env(safe-area-inset-bottom)` handling. On iPhones with a home indicator, the sheet's bottom edge sits flush against the gesture bar.

**Fix:**
1. In `inspector-sheet.tsx`, add safe-area padding to the outer fixed container:
   ```tsx
   className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-slate-950/95 backdrop-blur-xl border-t border-border/30 rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col pb-[env(safe-area-inset-bottom)]"
   ```
2. Confirm `viewport-fit=cover` is set in the viewport meta config (check `app/layout.tsx` for the `viewport` export or `<meta name="viewport">`). If it's missing, `env(safe-area-inset-bottom)` will always resolve to `0` and this fix will silently do nothing — add `viewport: { ..., viewportFit: 'cover' }` to the Next.js metadata/viewport export if absent.

**Verification:** On a device/simulator with a home indicator (iPhone 14+ class), confirm the close button and sheet content have visible clearance above the gesture bar.

---

## Task 4 (P1) — Respect `prefers-reduced-motion`

**Problem:** `framer-motion` (`motion.div`, `AnimatePresence`) is used across the navbar mobile drawer, home page hero, learn page tabs, inspector sheet, and receptive-field visualizer. `globals.css` has no `prefers-reduced-motion` handling anywhere.

**Fix (global CSS override — apply once, works everywhere, no per-component changes needed):**

Add to `app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is a blunt instrument that works for CSS transitions/animations but **will not** stop framer-motion's JS-driven `motion.div` animations, since those aren't CSS `transition`/`animation` properties — they're computed via requestAnimationFrame. So also:

1. Create a small shared hook if one doesn't already exist, e.g. `lib/hooks/use-reduced-motion.ts`, wrapping framer-motion's built-in `useReducedMotion()`.
2. In the highest-traffic motion components — `navbar.tsx` (mobile drawer `AnimatePresence`), `inspector-sheet.tsx`, and `app/page.tsx` (hero `containerVariants`/`itemVariants`) — read `useReducedMotion()` and short-circuit the transition duration to `0` (or skip the animation variant) when true. Example pattern:
   ```tsx
   const shouldReduceMotion = useReducedMotion();
   transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [...] }}
   ```
3. Do not touch every single `motion.div` in the codebase in this pass — cover the four files above (navbar, inspector-sheet, home hero, learn tab transitions) since those are the ones confirmed in the audit. Note any other `motion.div` usage you find as a follow-up item, don't fix it now.

**Verification:** With OS-level "reduce motion" enabled, confirm the mobile nav drawer, bottom sheet, and home hero no longer animate (or animate near-instantly), while retaining full functionality.

---

## Task 5 (P2) — Real-device validation of comparison table, no code change unless it fails

**Problem:** `components/model-comparison/comparison-table.tsx` uses a raw `<table>` with `sticky left-0` first column for mobile — a defensible pattern, but unverified on a real device for touch scroll behavior and target sizing.

**Action:** This is a manual QA task, not a code task. Test on an actual phone (or accurate simulator) at 375px and 390px widths:
* Horizontal scroll is smooth with touch (momentum scrolling, no jank)
* The sticky first column doesn't overlap or clip scrolled content
* Row/cell tap targets are large enough to not mis-tap adjacent rows

**Only write code if something in this list actually fails.** If it passes, do nothing and report it as verified in your summary — do not "improve" it preemptively.

---

## Task 6 (P1, planning only — no visual changes) — Future-proof the navbar's information architecture

**Context:** The current navbar (`components/layout/navbar.tsx`) is page-centric (Catalog, Compare, Evolution, Papers, Learn). As this app grows to cover Neural Networks, Transformers, RAG, Agents, LLMs, System Design, etc., a flat/page-centric nav will not scale. Before freezing, the nav's **data structure** must be able to accommodate a deeper hierarchy without a structural rewrite later — this does not mean building out that hierarchy now.

**Fix:** Refactor `navGroups` in `navbar.tsx` so it supports **arbitrary nesting depth**, not just the current flat `{ label, items: [...] }` shape. Concretely:
1. Change the `navGroups` type so each `item` inside a group can itself optionally contain a nested `items` array (recursive type), rather than assuming exactly two levels (group → item).
2. The rendering logic (desktop dropdown, tablet dropdown, mobile drawer) must handle one additional nesting level gracefully (e.g. a "Knowledge" group containing a "Deep Learning" sub-group containing "CNN"/"Transformers" items) without breaking layout at any breakpoint.
3. Do **not** actually add the new top-level groups (Knowledge, Tools, Research) from the IA sketch below — only make the data structure capable of holding them later:
   ```
   Explore   → Catalog, Compare, Evolution
   Learn     → Papers, Concepts, Advisor
   Knowledge → (empty for now, reserved)
   Tools     → Receptive Field Explorer, Training Dynamics (moved here per Task 2)
   Research  → (empty for now, reserved)
   ```
4. If Task 2 already created a "Tools" group, make sure it's built using this new recursive-capable structure, not a one-off shape that will need redoing later.

**Verification:** Confirm the current five nav destinations still render identically to before (no visible change), and confirm — by actually adding a temporary dummy nested item locally and checking it renders without layout breakage at mobile/tablet/desktop — that the structure supports one more level of depth. Remove the dummy item before finishing.

---

## Output Required

After completing all tasks, produce a summary report with:
1. Task-by-task pass/fail status with the specific file(s) changed
2. Diff-level list of every file touched (no unlisted files should appear)
3. Confirmation that `grep -r "advisor"` cleanup was done (Task 1)
4. Confirmation of manual click-path verification for Task 2 (no direct-URL-only access remaining)
5. Result of the real-device comparison table test (Task 5) — pass, or what failed
6. Any issues discovered but explicitly NOT fixed in this pass, listed separately, with file/line reference, for a future content-only session to triage

Do not report success on any task without the corresponding verification step completed.