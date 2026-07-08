# Neural Network Architecture Explorer
## Comprehensive Architecture & Design Specification

**Version:** 2.0  
**Date:** Updated 2026-06-23  
**Status:** Production Ready

---

## Table of Contents
1. [Product Architecture](#1-product-architecture)
2. [Folder Structure](#2-folder-structure)
3. [Data Schema Design](#3-data-schema-design)
4. [Component Hierarchy](#4-component-hierarchy)
5. [Page Architecture](#5-page-architecture)
6. [UI Design System](#6-ui-design-system)
7. [State Management Strategy](#7-state-management-strategy)
8. [Technical Specifications](#8-technical-specifications)

---

## 1. Product Architecture

### 1.1 Application Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Neural Network Architecture Explorer                  │
│                    ─────────────────────────────────                     │
│                                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────┐    │
│  │   Home    │───▶│   Catalog    │───▶│  Model   │───▶│ Compare  │    │
│  │   Page    │    │   Page       │    │ Explorer │    │  Page    │    │
│  │           │    │              │    │  Page    │    │          │    │
│  └──────────┘    └──────────────┘    └──────────┘    └──────────┘    │
│                                         │                             │
│                                         ▼                             │
│                              ┌──────────────────┐                    │
│                              │   Layer Inspector  │                    │
│                              │   (Side Panel)     │                    │
│                              └──────────────────┘                    │
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│  │ Evolution│    │  Papers    │    │  Learn   │    │ Concepts  │       │
│  │ Timeline  │    │ Knowledge  │    │  Paths   │    │ Explorer  │       │
│  │           │    │  Center    │    │  &       │    │           │       │
│  │           │    │            │    │  Advisor  │    │           │       │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 User Flow

```
[User Lands on Homepage]
         │
         ▼
[Model Catalog Cards: 34 Models with Filters]
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
   [Model Explorer]   [Comparison Page]    [Learning Paths]
   (Tabbed View)      (Multi-model)        (Advisor + Roadmaps)
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
   [Overview]         [Charts + Table]      [3 Learning Paths]
   [Layers List]      [Stat Cards]          [Model Selection]
   [Topology Graph]   [Model Selector]      [Wizard (3 Qs)]
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                            ▼
              [Architecture Evolution Timeline]
               (9 Key Milestones 1998-2022)
```

### 1.3 Core User Journeys

| Journey | User Action | Application Response |
|---------|-------------|----------------------|
| **Browse** | Lands on homepage | Sees hero, stats bar, featured models, and how-it-works section |
| **Explore** | Clicks model card | Navigates to architecture explorer with tabbed interface |
| **Inspect** | Clicks a layer node | Side panel opens with layer details, parameters, and educational notes |
| **Compare** | Clicks "Compare Models" | Interactive charts and detailed table comparing selected models |
| **Learn** | Visits Learn page | Chooses from 3 learning paths or uses model selection advisor |
| **Research** | Visits Papers page | Searches and explores 18 research papers with structured analysis |
| **Timeline** | Visits Evolution page | Explores 9 key architecture milestones with expandable details |

---

## 2. Folder Structure

```
neural-network-architecture-explorer/
├── app/                              # Next.js App Router (App Dir)
│   ├── layout.tsx                    # Root layout with dark theme, global providers
│   ├── page.tsx                      # Homepage (Hero + Featured Models + How it Works)
│   ├── error.tsx                     # Global error boundary
│   ├── globals.css                   # Global styles, Tailwind directives, custom CSS vars
│   │
│   ├── models/
│   │   └── [slug]/                   # Dynamic route: /models/vgg16, /models/resnet50, etc.
│   │       └── page.tsx              # Model Explorer page (Tabbed: Overview/Layers/Topology)
│   │
│   ├── catalog/
│   │   └── page.tsx                  # Full model catalog with search and filters
│   │
│   ├── compare/
│   │   └── page.tsx                  # Model Comparison page (charts + table)
│   │
│   ├── evolution/
│   │   └── page.tsx                  # Architecture Evolution Timeline
│   │
│   ├── papers/
│   │   └── page.tsx                  # Paper Knowledge Center
│   │
│   ├── learn/
│   │   └── page.tsx                  # Learning Paths + Model Selection Advisor
│   │
│   └── concepts/
│       ├── receptive-field/
│       │   └── page.tsx              # Receptive Field Explorer
│       └── training-dynamics/
│           └── page.tsx              # Training Dynamics concepts
│
├── components/                       # Reusable UI Components
│   ├── ui/                           # Primitive UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   │
│   ├── model-catalog/                # Catalog components
│   │   ├── model-card.tsx            # Individual model card
│   │   ├── model-grid.tsx            # Grid layout for model cards
│   │   ├── category-tabs.tsx         # Family filter tabs
│   │   └── search-bar.tsx            # Search + efficiency + era filters
│   │
│   ├── model-explorer/               # Model detail components
│   │   ├── tabbed-explorer.tsx       # Main tabbed interface
│   │   ├── flow-canvas.tsx           # React Flow topology graph
│   │   ├── layer-list.tsx            # Sequential layer list view
│   │   ├── inspector-panel.tsx       # Desktop side panel
│   │   └── inspector-sheet.tsx       # Mobile bottom sheet
│   │
│   ├── model-comparison/             # Comparison page components
│   │   ├── comparison-client.tsx     # Main comparison layout
│   │   ├── comparison-chart.tsx      # Bar charts using Recharts
│   │   ├── comparison-table.tsx      # Detailed spec table
│   │   └── stat-card.tsx             # Winner highlight cards
│   │
│   ├── learn/
│   │   └── model-advisor.tsx         # 3-question model selection wizard
│   │
│   └── layout/                       # Shared layout components
│       ├── navbar.tsx                # Top navigation with dropdown menus
│       ├── footer.tsx                # Footer with tech stack badges
│       ├── page-transition.tsx       # Page transition animations
│       └── page-background.tsx       # Decorative background glows
│
├── data/                             # Root data directory
│   ├── models.json                   # 34 model summaries (for catalog/compare)
│   ├── models/                       # 34 complete model JSON files
│   │   ├── vgg16.json
│   │   ├── vgg19.json
│   │   ├── resnet50.json
│   │   ├── resnet50v2.json
│   │   ├── resnet101.json
│   │   ├── resnet101v2.json
│   │   ├── resnet152.json
│   │   ├── resnet152v2.json
│   │   ├── densenet121.json
│   │   ├── densenet169.json
│   │   ├── densenet201.json
│   │   ├── efficientnetb0.json
│   │   ├── efficientnetb1.json
│   │   ├── efficientnetb2.json
│   │   ├── efficientnetb3.json
│   │   ├── efficientnetb4.json
│   │   ├── efficientnetb5.json
│   │   ├── efficientnetb6.json
│   │   ├── efficientnetb7.json
│   │   ├── inceptionv3.json
│   │   ├── inceptionresnetv2.json
│   │   ├── xception.json
│   │   ├── mobilenet.json
│   │   ├── mobilenetv2.json
│   │   ├── mobilenetv3small.json
│   │   ├── mobilenetv3large.json
│   │   ├── nasnetmobile.json
│   │   ├── nasnetlarge.json
│   │   ├── convnext.json
│   │   ├── swin.json
│   │   ├── vit.json
│   │   ├── maxvit.json
│   │   ├── alexnet.json
│   │   └── lenet.json
│   ├── papers.json                   # 18 research papers with structured analysis
│   ├── evolution.json                # 9 timeline nodes
│   ├── advisor.json                  # 3 advisor questions
│   └── link_registry.json            # Static link mapping for documentation
│
├── lib/                              # Core utilities, logic, and types
│   ├── schema/                       # Zod validation schemas
│   │   └── model.schema.ts           # All model/layer type definitions
│   │
│   ├── data-access/                  # Data loading utilities
│   │   ├── models.ts                 # Client-side model summaries
│   │   └── models.server.ts          # Server-side model loading
│   │
│   ├── data/
│   │   └── model-categories.ts       # Category configurations
│   │
│   ├── hooks/
│   │   └── use-reduced-motion.ts     # Accessibility hook for motion preference
│   │
│   └── utils/
│       ├── cn.ts                     # Tailwind class merge utility
│       └── formatters.ts             # Number formatting utilities
│
├── public/                           # Static assets
│   └── diagrams/                     # SVG architecture diagrams
│
├── scripts/                          # Build and validation scripts
│   ├── validate-model-data.ts        # Data validation script
│   └── data-merge-changelog.md       # Data merge documentation
│
├── next.config.ts                    # Next.js config (static export)
├── package.json                      # Dependencies
├── tsconfig.json                       # TypeScript config
└── README.md                         # Developer documentation
```

### 2.1 Key Directory Rationale

| Directory | Purpose | Why |
|---|---|---|
| `app/models/[slug]` | Dynamic routing | One route handles all 34 models, loads JSON by slug |
| `data/models/` | Individual model JSONs | Lazy-loaded per model for performance |
| `data/models.json` | Model summaries | Lightweight catalog data for listing |
| `lib/schema/` | Zod schemas | Runtime validation for data integrity |
| `lib/data-access/` | Data access layer | Separates client/server data loading |
| `components/ui/` | Primitive components | Consistent, reusable UI primitives |

---

## 3. Data Schema Design

### 3.1 TypeScript Interfaces (Zod Schemas)

```typescript
// ============================================================
// FILE: lib/schema/model.schema.ts
// ============================================================

// Layer types
export type LayerType = 
  | 'input' | 'conv2d' | 'batch_norm' | 'layer_norm' | 'attention'
  | 'activation' | 'max_pooling2d' | 'average_pooling2d' | 'global_average_pooling2d'
  | 'flatten' | 'dense' | 'dropout' | 'add' | 'concatenate'
  | 'bottleneck' | 'dense_block' | 'transition_block' | 'output';

// Model categories
export type ModelCategory = 
  | 'VGG' | 'ResNet' | 'Inception' | 'Xception' | 'MobileNet'
  | 'EfficientNet' | 'DenseNet' | 'NASNet' | 'Foundational' | 'Transformer';

// Model summary (for catalog/compare)
export interface ModelSummary {
  id: string;
  name: string;
  fullName: string;
  family: string;
  category: ModelCategory;
  efficiency: 'lightweight' | 'balanced' | 'powerful';
  year: number;
  paperYear: number;
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

// Full model with architecture
export interface NeuralNetworkModel extends ModelSummary {
  inputShape: {
    channels: number;
    height: number;
    width: number;
  };
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

// Layer definition
export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  inputShape: {
    dimensions: (number | null)[];
    description: string;
  };
  outputShape: {
    dimensions: (number | null)[];
    description: string;
  };
  config: LayerConfig;
  parameters: {
    total: number;
    weights: number;
    biases: number;
    formula: string;
    calculationSteps: CalculationStep[];
    trainableParameters?: number;
    nonTrainableParameters?: number;
  };
  educationalNote: {
    summary: string;
    detailed?: string;
    analogy?: string;
    whyItMatters?: string;
    keyTakeaway?: string;
  };
  position?: { x: number; y: number };
  color?: string;
  icon?: string;
}
```

### 3.2 Data Sources

| Source | File | Description |
|--------|------|-------------|
| Model Summaries | `data/models.json` | 34 lightweight model summaries for catalog/compare |
| Full Models | `data/models/*.json` | Complete layer-by-layer architecture data |
| Papers | `data/papers.json` | 18 research papers with structured analysis |
| Evolution | `data/evolution.json` | 9 timeline nodes (1998-2022) |
| Advisor | `data/advisor.json` | 3-question model selection wizard |
| Link Registry | `data/link_registry.json` | Static mapping for documentation links |

---

## 4. Component Hierarchy

### 4.1 Component Tree (Homepage)

```
HomePage (app/page.tsx)
├── Navbar
│   ├── Logo
│   └── Navigation Groups (Home, Explore, Learn, Tools)
├── Hero Section
│   ├── Tagline Badge
│   ├── Heading
│   ├── Description
│   ├── Stats Bar (3 cards)
│   └── CTA Buttons
├── Featured Architectures Spotlight
│   └── ModelGrid
│       └── ModelCard (×4)
└── How it Works Section
    └── 3 Feature Cards
```

### 4.2 Component Tree (Model Explorer Page)

```
TabbedExplorer (components/model-explorer/tabbed-explorer.tsx)
├── Navigation Breadcrumb
├── Model Title & Description Header
├── 3-Card Metadata Group
│   ├── Publication Info Card
│   ├── Complexity & Depth Card
│   └── Accuracy & Footprint Card
├── Tab Controls (Overview / Layers / Topology)
├── Overview Tab
│   ├── Architecture Idea Card
│   └── Resources & References Card
│       └── Architectural Metrics Sidebar
├── Layers Tab
│   ├── Layer List
│   └── Inspector Panel (Desktop) / Inspector Sheet (Mobile)
└── Topology Tab
    ├── Controls Bar
    │   └── Show Detailed Layers Toggle
    ├── FlowCanvas (React Flow)
    └── Inspector Panel (Desktop) / Inspector Sheet (Mobile)
```

### 4.3 Component Tree (Comparison Page)

```
ComparisonClient (components/model-comparison/comparison-client.tsx)
├── Navigation Breadcrumb
├── Heading
├── Model Selector Dashboard
│   ├── Search Bar
│   ├── Preset Buttons
│   └── Models Grid (by Category)
├── Stat Cards (when models selected)
├── Metric Tabs
│   └── Tab Buttons (Parameters, Depth, Accuracy, Memory, FLOPs)
├── Comparison Charts
└── Comparison Table
```

---

## 5. Page Architecture

### 5.1 Route Map

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Homepage (Hero + Featured Models) |
| `/catalog` | `app/catalog/page.tsx` | Full model catalog with filters |
| `/models/[slug]` | `app/models/[slug]/page.tsx` | Model Explorer (Tabbed) |
| `/compare` | `app/compare/page.tsx` | Model Comparison |
| `/evolution` | `app/evolution/page.tsx` | Architecture Evolution Timeline |
| `/papers` | `app/papers/page.tsx` | Paper Knowledge Center |
| `/learn` | `app/learn/page.tsx` | Learning Paths + Model Advisor |
| `/concepts/receptive-field` | `app/concepts/receptive-field/page.tsx` | Receptive Field Explorer |
| `/concepts/training-dynamics` | `app/concepts/training-dynamics/page.tsx` | Training Dynamics |

### 5.2 Page Layout Specifications

- **Root Layout**: Dark theme with Geist fonts, navbar, footer, page transition wrapper
- **Background**: Radial gradient glows (cyan/purple) + grid pattern
- **Cards**: Solid dark background (`#020617`) with border (`#1f2937`)
- **Active State**: Cyan solid background (`#22d3ee`) with dark text

---

## 6. UI Design System

### 6.1 Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#020612` | Page background |
| Card | `rgba(9, 15, 35, 0.45)` | Cards, panels |
| Border | `rgba(255, 255, 255, 0.05)` | All borders |
| Border Hover | `rgba(34, 211, 238, 0.2)` | Hover states |
| Primary | `#22d3ee` | Active tabs, buttons, links |
| Text Primary | `#e5e7eb` | Headings, important text |
| Text Secondary | `#9ca3af` | Body text, descriptions |
| Text Muted | `#6b7280` | Labels, metadata |

### 6.2 Active State Pattern

Every active/interactive element uses:
- **Solid cyan background** (`#22d3ee`) + **dark text** (`#020617`)
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

## 7. State Management Strategy

### 7.1 State Categories

| State Category | Management | Why |
|--------------|------------|-----|
| **UI State** | React `useState` | Simple, component-local |
| **Selection State** | React `useState` + Context | Shared across components |
| **Animation State** | `useReducedMotionPreference` hook | Accessibility compliance |
| **Data State** | Static imports + Zod validation | No mutations needed |
| **URL State** | Next.js router | Shareable URLs |

### 7.2 Key Hooks

```typescript
// useReducedMotionPreference - Accessibility
const shouldReduceMotion = useReducedMotionPreference();

// Framer Motion respects this:
transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
```

---

## 8. Technical Specifications

### 8.1 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.9 | Framework, App Router, static export |
| `react` | 19.2.4 | UI library |
| `@xyflow/react` | ^12.11.0 | React Flow (node-based diagrams) |
| `framer-motion` | ^12.40.0 | Animations, transitions |
| `recharts` | ^3.9.2 | Charts for comparison page |
| `zod` | ^4.4.3 | Runtime validation |
| `tailwindcss` | ^4 | Utility-first CSS |
| `lucide-react` | ^1.21.0 | Icon library |

### 8.2 Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Rendering** | Static Export | Deployable to any static host |
| **Data Loading** | Static JSON + Zod | No API latency, validated at build |
| **Diagram Library** | React Flow | Industry standard for interactive graphs |
| **Animation** | Framer Motion | Respects `prefers-reduced-motion` |
| **Charts** | Recharts | React-native, responsive |
| **Styling** | Tailwind CSS + CSS Variables | Rapid development, consistent design |
| **State** | React Context + Hooks | No need for Redux at this scale |
| **Fonts** | Geist Sans + Mono | Modern technical typography |

### 8.3 Performance Optimizations

- **Dynamic imports**: React Flow and charts loaded client-side only
- **Lazy loading**: Model JSONs loaded per-page
- **Memoization**: `useMemo` for derived data, `useCallback` for handlers
- **Node limiting**: Detailed topology disabled for models with >100 layers
- **Static export**: All 48 pages pre-rendered
- **Error boundary**: Global error handling via `app/error.tsx`
- **Payload splitting**: Model data split at server boundary to reduce client bundle
- **Callback memoization**: Event handlers wrapped in `useCallback` to prevent unnecessary re-renders

---

## Appendix A: Model Coverage

### 34 Complete Models

| Family | Models |
|--------|--------|
| Foundational | LeNet, AlexNet |
| VGG | VGG16, VGG19 |
| ResNet | ResNet50, ResNet50V2, ResNet101, ResNet101V2, ResNet152, ResNet152V2 |
| DenseNet | DenseNet121, DenseNet169, DenseNet201 |
| Inception | InceptionV3, InceptionResNetV2 |
| Xception | Xception |
| MobileNet | MobileNet, MobileNetV2, MobileNetV3Small, MobileNetV3Large |
| EfficientNet | B0-B7 (8 models) |
| NASNet | NASNetMobile, NASNetLarge |
| Transformer | ViT, Swin, ConvNeXt, MaxViT |

---

*Document Version: 2.0*  
*Updated: 2026-06-23*