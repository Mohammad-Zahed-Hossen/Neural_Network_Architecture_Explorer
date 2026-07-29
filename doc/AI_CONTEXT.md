# Neural Network Architecture Explorer — AI Context

**Purpose:** 5-10 minute AI-readable summary for quick project understanding  
**Last Updated:** July 26, 2026  
**Full Specification:** See [CANONICAL_SPECIFICATION.md](./CANONICAL_SPECIFICATION.md)

---

## Project Overview

**What:** Interactive educational platform for exploring neural network architectures  
**Status:** Production Ready (100%)  
**Scale:** 34 models, 8,388 layers, 18 papers, 9 timeline milestones  
**Build:** Static Next.js export (48 pages)  
**Tech:** Next.js 16, React 19, TypeScript 6.0.3, Tailwind CSS 4, Zod, React Flow, Framer Motion  
**Latest work:** mission-control homepage redesign, explorer UI/UX refinement, and a local-first papers knowledge base

---

## Quick Start

```bash
# Development
npm run dev

# Build (static export)
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Validate data
npm run validate:data
```

**Output:** `out/` directory with 48 static HTML pages

---

## Architecture Summary

### Tech Stack
- **Framework:** Next.js 16 (App Router, static export)
- **UI:** React 19, Tailwind CSS 4, Framer Motion
- **Visualization:** React Flow (topology), Recharts (charts)
- **Validation:** Zod 4.4.3 (runtime schema validation)
- **Icons:** Lucide React
- **Fonts:** Geist Sans + Mono

### Key Patterns
- **Static-First:** All pages pre-rendered at build time
- **Type-Safe:** Full TypeScript + Zod runtime validation
- **Component-Driven:** Modular, reusable components
- **Data Access:** Standardized via `lib/data-access/models.ts`
- **Search:** 5-tier relevance engine with educational metadata
- **State:** URL-based for shareability, local component state for UI

### Recent Implementation Highlights
- **Mission Control Home:** redesigned into a dense dashboard with universal search, continue-learning, knowledge cards, stats, comparisons, roadmap, and spotlight content.
- **Tabbed Explorer Refinement:** added a richer topology workspace, segmented view switch, legend, sticky layer headers, canvas controls, live metrics, and a polished inspector experience.
- **Papers Knowledge Base:** introduced reading status, bookmarks, local notes, and enhanced publication search without changing the static data model.
- **Verification:** production build completed successfully with 48 static pages and zero TypeScript or lint issues.

---

## Directory Structure

```
app/                    # Next.js App Router (11 routes)
├── models/[slug]/      # Dynamic model detail pages
├── catalog/            # Model catalog with search/filters
├── compare/            # Model comparison
├── learn/              # Learning paths + advisor
├── papers/             # Paper knowledge center
├── evolution/          # Architecture timeline
├── research-map/       # Research DAG
├── architecture-patterns/  # Design patterns
└── concepts/           # Receptive field, training dynamics

components/             # UI components
├── ui/                # Primitives (badge, continue-learning)
├── model-catalog/     # Catalog components
├── model-explorer/    # Explorer components (tabbed, flow, inspector, custom-node)
├── model-comparison/  # Comparison components
├── learn/             # Advisor component
├── research-map/      # Research flow
└── layout/            # Navbar, footer, page transition, page background

data/                  # Static data
├── models.json        # 34 model summaries
├── models/*.json      # 34 complete model JSONs
├── papers.json        # 18 papers
├── evolution.json     # 9 timeline nodes
├── advisor.json       # 3 advisor questions
└── link_registry.json # Static link mapping

lib/                   # Utilities
├── schema/            # Zod schemas (model.schema.ts)
├── data-access/       # Data loading (models.ts, models.server.ts)
├── data/              # Relationships, categories
├── types/             # Type definitions (comparison.ts)
├── search/            # 5-tier search engine (Phase 4)
├── hooks/             # use-reduced-motion, use-knowledge-search
└── utils/             # cn, formatters, colors, filter-models, layer-styles, rf-math

scripts/               # Build and validation scripts
├── validate-model-data.ts        # Data validation script
├── validate-links.ts             # Link validation script
├── data-validation-report.md     # Data validation report
├── extract_keras_models.py       # Keras model extraction
├── fix_batchnorm_params.py       # BatchNorm parameter fix
├── generate_audit_package.py     # Audit package generation
├── init_data_from_lib.py         # Data initialization from library
├── merge-model-data.ts           # Model data merging
└── process_models.py             # Model processing

---

## Data Architecture

### Model Schema (Zod)

```typescript
interface ModelSummary {
  id: string;
  name: string;
  fullName: string;
  family?: string;
  category: ModelCategory;
  efficiency: 'lightweight' | 'balanced' | 'powerful';
  year?: number;
  paperYear: number;
  releaseYear?: number;
  authors: string[];
  tags: string[];
  totalParameters: number;
  trainableParameters?: number;
  nonTrainableParameters?: number;
  top1Accuracy: number;
  top5Accuracy: number;
  memoryUsage: number;
  totalFLOPs: number;
  depth: number;
  paperUrl: string;
  colorTheme: string;
  docsUrl?: string;
  description: string;
}

interface NeuralNetworkModel extends ModelSummary {
  inputShape: { channels: number; height: number; width: number };
  architecture: {
    layers: Layer[];
    connections: Connection[];
    groups: LayerGroup[];
    layout?: {
      nodes: LayoutNode[];
      edges: unknown[];
      groups: unknown[];
      groupedNodes: GroupedNode[];
      groupedEdges: GroupedEdge[];
    };
  };
}
```

### Data Access Pattern

**Standardized:** All model data goes through `lib/data-access/models.ts` (client) and `lib/data-access/models.server.ts` (server)

```typescript
// Client-side
import { getModelSummaries } from '@/lib/data-access/models';
const models = getModelSummaries();

// Server-side
import { getModel } from '@/lib/data-access/models.server';
const model = getModel(slug);
```

**Validation:** All data validated against Zod schemas at build time

---

## Search Architecture (Phase 4)

### 5-Tier Relevance Engine

```typescript
// Scoring tiers
Exact Title Match:          100 pts
Alias/Abbreviation Match:   90 pts
Keyword/Pattern/Component:  75 pts
Description Match:           50 pts
Tags/Authors Match:          25 pts

// Multi-token boost
if (allTokensMatched && queryTokens.length > 1) {
  totalScore *= 1.25;
}
```

### Search Coverage

Supports:
- Architectural concepts ("residual", "attention", "depthwise")
- Abbreviations (NAS, ViT, SE, MBConv)
- Family-level search ("ResNet" finds all variants)
- Components ("bottleneck", "skip connection")
- Characteristics ("lightweight", "efficient")
- Deployment targets ("mobile", "edge", "server")
- Patterns (residual, dense, attention)
- Papers

**Success Rate:** 100% on canonical queries

**Performance:** <5ms latency, scales to 1000+ models

---

## Educational Architecture (Phase 3)

### Knowledge Graph

**Location:** `lib/data/relationships.ts`

```typescript
interface ModelRelationships {
  modelId: string;
  family: string;
  era: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  predecessors: ModelRef[];
  successors: ModelRef[];
  influencedBy: ModelRef[];
  influenced: ModelRef[];
  relatedModels: ModelRef[];
  patterns: PatternRef[];
  concepts: ConceptRef[];
  papers: { originalUrl: string; paperPageAnchor: string; relatedPapers: RelatedPaperRef[] };
  compareShortcuts: CompareShortcut[];
  continueLearning: LearningItem[];
}
```

**Coverage:** All 34 models with deterministic relationship metadata

### Educational Components

- **ContinueLearning:** Compact recommendation grid (max 5 items)
- **ModelRelationshipsView:** 7 sections (patterns, concepts, papers, lineage, related, compare, continue)
- **Difficulty Badges:** Beginner/Intermediate/Advanced on model cards

---

## Performance Optimizations

### Phase 1B (Performance)
- Lazy-loaded Model Advisor (~15KB deferred)
- Disabled staggered animations on mobile
- Hidden MiniMap on mobile in Flow Canvas
- Converted PageBackground to server component (~2KB reduction)

**Impact:** ~17KB initial JS reduction, ~200KB deferred

### Phase 5 (Code Quality)
- Error boundary via `app/error.tsx`
- Payload splitting at server boundary
- Callback memoization with `useCallback`
- FlowCanvas memoization (removed selectedLayerId from deps)
- ComparisonTable memoization (hoisted METRICS)
- ComparisonChart memoization
- PageTransition fix (removed key={pathname})
- Navbar memoization (STATIC_NAV_GROUPS)

### General Optimizations
- Dynamic imports for React Flow, Recharts, Model Advisor, Research Flow
- Memoization with `useMemo` and `useCallback`
- Node limiting (>100 layers disables detailed view)
- Reduced motion support

---

## Mobile Strategy (Phase 2B)

### Mobile Foundations
- Typography scale (min 12px body/label text)
- 44×44px minimum touch targets
- Horizontal scroll affordance gradients
- Safe area inset helpers
- Focus-visible outlines

### Navigation
- Fixed mobile bottom navigation bar (5 destinations)
- Backdrop blur and safe area padding
- Dynamic active state

### Content Density
- Progressive disclosure with collapsed cards
- Responsive SVG diagrams
- Mobile timeline spine indicators
- Bottom sheet max height reduced to 60vh
- 44px touch targets for all interactive elements

---

## Accessibility

### Implemented
- `prefers-reduced-motion` support via `useReducedMotionPreference` hook
- ARIA labels on interactive elements
- Keyboard navigation (tab, focus indicators)
- Semantic HTML (section, nav, main)
- Color contrast meets WCAG AA

### Screen Reader
- Text content readable
- ARIA labels for visualizations (can be improved)

---

## Styling System

### Color Tokens
```css
--background: #020612;
--card: rgba(9, 15, 35, 0.45);
--border: rgba(255, 255, 255, 0.05);
--primary: #22d3ee;
--text-primary: #e5e7eb;
--text-secondary: #9ca3af;
--text-muted: #6b7280;
```

### Active State Pattern
- Solid cyan background (#22d3ee) + dark text (#020617)
- Cyan glow shadow: `shadow-[0_0_12px_rgba(34,211,238,0.25)]`

### Typography Scale
- Display: `clamp(1.8rem, 5vw + 1rem, 3.5rem)`
- Heading: `clamp(1.3rem, 3vw + 0.8rem, 2.2rem)`
- Body: `0.875rem`
- Caption: `0.75rem`
- Micro: `0.625rem`

### Utilities
- `cn()` - Class name merging (clsx + tailwind-merge)
- `.glass-card` - Backdrop blur card style
- `.min-touch-target` - 44×44px minimum
- `.scroll-fade-x` - Horizontal scroll affordance

---

## Key Files to Understand

### Core Architecture
- `app/layout.tsx` - Root layout with fonts, providers
- `app/page.tsx` - Homepage
- `next.config.ts` - Static export config
- `lib/schema/model.schema.ts` - All type definitions

### Data Layer
- `lib/data-access/models.ts` - Client data access
- `lib/data-access/models.server.ts` - Server data access
- `lib/data/relationships.ts` - Knowledge graph
- `data/models.json` - Model summaries

### Search (Phase 4)
- `lib/search/search-engine.ts` - 5-tier relevance engine
- `lib/search/metadata-enrichment.ts` - Educational metadata
- `lib/hooks/use-knowledge-search.ts` - Unified search hook

### Components
- `components/model-explorer/tabbed-explorer.tsx` - Main explorer
- `components/model-explorer/implementation-tab.tsx` - Implementation details display with engineering specifications, prerequisites, code integration, and engineering notes
- `components/model-explorer/flow-canvas.tsx` - React Flow topology
- `components/model-catalog/search-bar.tsx` - Search with filters
- `components/model-comparison/comparison-client.tsx` - Comparison logic

---

## Adding New Models

1. Create model JSON in `data/models/` (follow schema)
2. Add summary to `data/models.json`
3. Add relationships to `lib/data/relationships.ts`
4. Add search metadata to `lib/search/metadata-enrichment.ts`
5. Run `npm run validate:data`
6. Build and test

---

## Known Constraints

- **Static Export Only:** No API routes or SSR at runtime
- **No Database:** All data in JSON files
- **No Authentication:** No user accounts
- **Bundle Size:** Heavy dependencies (React Flow ~200KB, Framer Motion ~40KB)
- **Scalability:** Current architecture scales to 1000+ models
- **Dark Mode Only:** Hardcoded, no toggle
- **No Export:** No PDF/image export
- **No Bookmarking:** No favorites

---

## Production Status

**Verification:** ✅ All checks passing
- TypeScript): 0 errors
- ESLint: 0 errors, 0 warnings
- Data Validation: 34 models passed
- Static Export: 48/48 pages generated

**Deployment:** Ready for any static hosting (Vercel, Netlify, GitHub Pages)

**Build Command:** `npm run build`

**Output:** `out/` directory

---

## Model Coverage

**34 Models:**
- Foundational: LeNet, AlexNet
- VGG: VGG16, VGG19
- ResNet: 6 variants (50, 101, 152 + V2 versions)
- DenseNet: DenseNet121, DenseNet169, DenseNet201
- Inception: InceptionV3, InceptionResNetV2
- Xception: Xception
- MobileNet: 4 variants (MobileNet, V2, V3Small, V3Large)
- EfficientNet: B0-B7 (8 models)
- NASNet: NASNetMobile, NASNetLarge
- Transformer: ViT, Swin, ConvNeXt, MaxViT

**Total:** 8,388 layers, ~1.23B parameters

---

## Technical Debt

- No test infrastructure (Medium priority)
- No dark mode toggle (Low priority)
- No export functionality (Low priority)
- Chart accessibility (Medium priority)

**Status:** Non-blocking for production

---

**For complete details, see [CANONICAL_SPECIFICATION.md](./CANONICAL_SPECIFICATION.md)**
