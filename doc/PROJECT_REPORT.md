# Neural Network Architecture Explorer — Project Report

**Generated:** 2026-06-23  
**Workspace:** `D:\Project\Neural Network Architecture Explorer\nn_architecture`  
**Framework:** Next.js 16.2.9 + React 19 + Tailwind CSS 4 + TypeScript 5.7  
**Build Output:** 48 static pages (SSG + static export)  

---

## 1. Executive Summary

The **Neural Network Architecture Explorer** is a production-ready interactive educational platform for exploring deep learning architectures. It features a comprehensive catalog of **34 models** with rich educational tooling, interactive topology visualization, model comparison, a recommendation advisor, an evolution timeline, and a paper knowledge center.

**Key Stats:**
- **34 complete model architectures** with full layer-by-layer JSON definitions
- **8,388 individual layers** documented across all models
- **18 research papers** with structured analysis (problem, strengths, weaknesses, legacy, relevance)
- **9 evolution timeline nodes** tracing architecture history from LeNet (1998) to ConvNeXt (2022)
- **3-question rule-based advisor** with client-side scoring engine
- **48 static pages** generated at build time for instant loading

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16.2.9 (Turbopack) | App Router, static export (`output: 'export'`), fast dev builds |
| Runtime | React 19.2.4 | UI rendering, concurrent features, hooks |
| Styling | Tailwind CSS 4 | Utility-first CSS, custom dark+cyan theme tokens |
| Type System | TypeScript 5.7 | Strict mode, path aliases (`@/*`), full type safety |
| Validation | Zod 4.4.3 | Runtime schema validation for data integrity |
| Animation | Framer Motion 12.40.0 | Page transitions, card stagger effects, timeline animations |
| Graphing | React Flow 12.11.0 | Interactive topology graphs with node filtering |
| Charts | Recharts 3.9.2 | Bar charts for model comparisons |
| Icons | Lucide React 1.21.0 | Consistent SVG iconography throughout |
| Fonts | Geist Sans + Mono | Modern technical typography |

---

## 3. Directory Structure

```
app/                          # Next.js App Router pages
├── page.tsx                  # Home: hero, featured models, how-it-works
├── layout.tsx                # Root layout with fonts, navbar, footer, page transition
├── error.tsx                 # Global error boundary
├── globals.css               # Dark + cyan theme tokens, utilities
├── catalog/
│   └── page.tsx              # Full model catalog with search and filters
├── models/
│   └── [slug]/
│       └── page.tsx          # Model detail: tabbed explorer (Overview/Layers/Topology)
├── compare/
│   └── page.tsx              # Model comparison page (charts + table)
├── evolution/
│   └── page.tsx              # Architecture Evolution Timeline
├── papers/
│   └── page.tsx              # Paper Knowledge Center
├── learn/
│   └── page.tsx              # Learning Paths + Model Selection Advisor
└── concepts/
    ├── receptive-field/
    │   └── page.tsx          # Receptive Field Explorer
    └── training-dynamics/
        └── page.tsx          # Training Dynamics concepts

components/
├── model-catalog/
│   ├── model-card.tsx        # Model card with stat bars
│   ├── model-grid.tsx        # Responsive grid layout
│   ├── category-tabs.tsx     # Family filter tabs
│   └── search-bar.tsx        # Search + efficiency + era filters
├── model-explorer/
│   ├── tabbed-explorer.tsx   # Main explorer (3 tabs, inspector)
│   ├── flow-canvas.tsx       # React Flow topology
│   ├── layer-list.tsx        # Sequential list view of layers
│   ├── inspector-panel.tsx   # Desktop side panel
│   └── inspector-sheet.tsx   # Mobile bottom sheet
├── model-comparison/
│   ├── comparison-client.tsx # Comparison layout with model selector
│   ├── comparison-chart.tsx  # Bar charts
│   ├── comparison-table.tsx  # Detailed spec table
│   └── stat-card.tsx         # Winner highlight cards
├── learn/
│   └── model-advisor.tsx     # 3-question model selection wizard
├── layout/
│   ├── navbar.tsx            # Top navigation with dropdown menus
│   ├── footer.tsx            # Footer with tech stack badges
│   ├── page-transition.tsx   # Page transition wrapper
│   └── page-background.tsx   # Decorative background glows
└── ui/
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    └── input.tsx

data/
├── models.json               # 34 model summaries
├── models/                   # 34 complete model JSON files
├── papers.json               # 18 research papers
├── evolution.json            # 9 timeline nodes
├── advisor.json              # 3 advisor questions
└── link_registry.json        # Static link mapping

lib/
├── schema/
│   └── model.schema.ts       # Zod validation schemas
├── data-access/
│   ├── models.ts             # Client-side model summaries
│   └── models.server.ts      # Server-side model loading
├── data/
│   └── model-categories.ts   # Category configurations
├── hooks/
│   └── use-reduced-motion.ts # Accessibility hook
└── utils/
    ├── cn.ts                 # Tailwind class merge
    └── formatters.ts         # Number formatting

scripts/
├── validate-model-data.ts    # Data validation script
└── data-merge-changelog.md   # Data merge documentation
```

---

## 4. Model Coverage (34 Complete Models)

### 4.1 Model Families

| Family | Models | Total Layers | Parameters |
|--------|--------|--------------|------------|
| **Foundational** | LeNet, AlexNet | 22 | ~62M |
| **VGG** | VGG16, VGG19 | 49 | ~280M |
| **ResNet** | ResNet50, ResNet50V2, ResNet101, ResNet101V2, ResNet152, ResNet152V2 | 1,264 | ~130M |
| **DenseNet** | DenseNet121, DenseNet169, DenseNet201 | 1,705 | ~42M |
| **Inception** | InceptionV3, InceptionResNetV2 | 214 | ~79M |
| **Xception** | Xception | 117 | ~23M |
| **MobileNet** | MobileNet, MobileNetV2, MobileNetV3Small, MobileNetV3Large | 440 | ~11M |
| **EfficientNet** | B0-B7 (8 models) | 2,861 | ~110M |
| **NASNet** | NASNetMobile, NASNetLarge | 437 | ~94M |
| **Transformer** | ViT, Swin, ConvNeXt, MaxViT | 75 | ~145M |

**Total layers across all models: 8,388**  
**Total parameters across all models: ~1.23B**

---

## 5. Page-by-Page Feature Breakdown

### 5.1 Home (`/`)
- Hero section with animated entrance (Framer Motion)
- Live stats bar: 34 models, 1.23B total parameters, average accuracy
- **Featured architectures**: Top performer from each family
- Category filter tabs with **cyan active state**
- Model cards with stat bars
- "How it Works" section with 3 feature cards

### 5.2 Catalog (`/catalog`)
- Full 34-model grid with all filters active
- Search + efficiency + era filters
- Direct link to individual model explorers

### 5.3 Model Explorer (`/models/[slug]`)
- **Tabbed view**: Overview / Layers List / Topology Graph
- **Overview tab**: Publication info, complexity stats, accuracy benchmarks, design philosophy, resource links
- **Layers tab**: Sequential scrollable list + inspector panel
- **Topology tab**: React Flow interactive graph with layer type filter toggle
- **Inspector panel**: Dimension visualizer, hyperparameters, parameter calculator, educational guide
- **Keyboard navigation**: Arrow keys, Space (play/pause), L (toggle view), Esc (deselect)
- **Node limiting**: Detailed view disabled for models with >100 layers

### 5.4 Comparison (`/compare`)
- **Model selector dashboard**: Collapsible, search-enabled, category-grouped
- **Stat highlight cards**: Dynamic winner cards (accuracy, parameter efficiency, memory footprint)
- **Dynamic charts**: Bar chart (raw values) — works with ANY model combination
- **Metric toggle tabs**: Parameters, Depth, Accuracy, Memory, FLOPs
- **Detailed comparison table**: General info, performance metrics, efficiency metrics, architecture design characteristics

### 5.5 Model Selection Advisor (`/learn?tab=advisor`)
- **3-question wizard** with animated progress
- Questions: Goal (accuracy/latency/memory/education), Hardware (mobile/embedded/server), Budget (low/medium/high)
- **Client-side rule-based scoring engine**
- **Results**: Top 4 recommended models with match percentage, reasons, trade-offs

### 5.6 Architecture Evolution Timeline (`/evolution`)
- **Vertical timeline** from LeNet (1998) → AlexNet (2012) → VGG (2014) → ResNet (2015) → DenseNet (2016) → MobileNet (2017) → EfficientNet (2019) → ViT (2020) → ConvNeXt (2022)
- **Alternating left/right layout** on desktop, single column on mobile
- Each node contains: year badge, problem, innovation, key intuition, advantages, limitations, legacy
- **Expandable sections** with animated height transitions
- Links to corresponding model explorers

### 5.7 Paper Knowledge Center (`/papers`)
- **18 research papers** with full structured analysis
- **Searchable** by title, author, or contribution
- **Expandable cards** with: problem statement, key strengths, trade-offs, legacy impact, modern relevance
- **Linked models**: Each paper shows associated models with direct links

### 5.8 Learning Paths (`/learn?tab=paths`)
- 3 guided curriculum tracks:
  1. **Feedforward & Homogeneous Stacks** (VGG16, VGG19)
  2. **The Residual Revolution** (ResNet50, ResNet50V2, ResNet152)
  3. **Dense Connectivity & Feature Reuse** (DenseNet121, DenseNet201)

### 5.9 Concepts (`/concepts/*`)
- Educational deep-dives into specific topics:
  - **Receptive Field**: How convolutional layers accumulate spatial context
  - **Training Dynamics**: How gradients flow, vanishing gradients, optimization

---

## 6. UI/UX Design System: Dark + Cyan

### 6.1 Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Page Background | `#020612` | All page backgrounds |
| Card Background | `rgba(9, 15, 35, 0.45)` | Cards, panels |
| Card Border | `rgba(255, 255, 255, 0.05)` | All borders |
| Primary Accent | `#22d3ee` | Active tabs, buttons, highlights |
| Primary Text | `#e5e7eb` | Headings, important labels |
| Secondary Text | `#9ca3af` | Descriptions, metadata |
| Muted Text | `#6b7280` | Labels, tracking-wider headers |

### 6.2 Active State Pattern

Every active/interactive element uses:
- **Solid cyan background** (`#22d3ee`) + **dark text** (`#020612`)
- **Cyan glow shadow**: `shadow-[0_0_12px_rgba(34,211,238,0.25)]`
- Applied to: Category tabs, nav links, metric tabs, view toggles

### 6.3 Typography Scale

| Role | Size | Usage |
|------|------|-------|
| Display | `clamp(1.8rem, 5vw + 1rem, 3.5rem)` | Page titles |
| Heading | `clamp(1.3rem, 3vw + 0.8rem, 2.2rem)` | Section titles |
| Body | `0.875rem` | Descriptions, paragraphs |
| Caption | `0.75rem` | Metadata, labels |
| Micro | `0.625rem` | Chart labels, badges |

---

## 7. Performance & Build

```bash
# Development
npm run dev

# Production build (static export)
npm run build
# Output: out/ directory with 48 static HTML pages
```

**Configuration in `next.config.ts`:**
```typescript
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  turbopack: {},
};
```

**Performance Features:**
- Static export for instant loading
- Dynamic imports for React Flow and charts
- Memoization (`useMemo`, `useCallback`) for derived data and handlers
- Node limiting for large models (>100 layers)
- `prefers-reduced-motion` support
- Global error boundary (`app/error.tsx`)
- Payload splitting at server boundary to reduce client bundle

---

## 8. Data Architecture

### 8.1 Dual Data System

**Tier 1: Root `data/` (Summaries & Educational Content)**
- `data/models.json` — 34 lightweight model summaries
- `data/papers.json` — 18 papers with structured analysis
- `data/evolution.json` — 9 timeline nodes
- `data/advisor.json` — 3 advisor questions
- `data/link_registry.json` — Static link mapping

**Tier 2: `data/models/` (Full Layer Definitions)**
- 34 complete model JSON files with every individual layer
- Used by the model explorer for deep inspection
- Each file validated against Zod schema

### 8.2 Validation

All data is validated at build time using Zod schemas:
```typescript
// lib/schema/model.schema.ts
export const NeuralNetworkModelSchema = z.object({...});
export const ModelSummarySchema = z.object({...});
```

---

## 9. File Inventory Summary

| Category | Count | Key Files |
|----------|-------|-----------|
| App routes | 9 | Home, Catalog, Models, Compare, Evolution, Papers, Learn, Concepts (2) |
| Components | ~20 | Model cards, explorer, inspector, comparison, layout, UI primitives |
| Data (root) | 5 | models.json, papers.json, evolution.json, advisor.json, link_registry.json |
| Data (models) | 34 | Individual model JSON files |
| Types | 1 | model.schema.ts (Zod schemas) |
| Utils | 2 | cn.ts, formatters.ts |
| UI primitives | 4 | badge, button, card, input |
| Styles | 1 | globals.css |
| Scripts | 2 | validate-model-data.ts, data-merge-changelog.md |

**Total source files:** ~90+  
**Total model layers defined:** 8,388  
**Total static pages:** 48

---

## 10. Accessibility

- **`prefers-reduced-motion`** support via `useReducedMotionPreference` hook
- **Keyboard navigation** in model explorer
- **ARIA labels** on interactive elements
- **Semantic HTML** with proper heading hierarchy
- **Focus management** in inspector panels

---

*Report generated: 2026-06-23*