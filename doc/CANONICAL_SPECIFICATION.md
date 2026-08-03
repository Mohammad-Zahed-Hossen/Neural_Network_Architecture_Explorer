# Neural Network Architecture Explorer — Canonical Project Specification

**Version:** 1.2  
**Status:** Production Ready  
**Last Updated:** August 2, 2026  
**Documentation Type:** Single Source of Truth

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Vision & Goals](#2-project-vision--goals)
3. [Architecture Overview](#3-architecture-overview)
4. [Technology Stack](#4-technology-stack)
5. [Directory Structure](#5-directory-structure)
6. [Core System Architecture](#6-core-system-architecture)
7. [Data Architecture](#7-data-architecture)
8. [Search Architecture](#8-search-architecture)
9. [UI/UX Architecture](#9-uiux-architecture)
10. [Educational Architecture](#10-educational-architecture)
11. [Training Dynamics Simulation Platform](#11-training-dynamics-simulation-platform)
12. [Paper Details Specification Platform](#12-paper-details-specification-platform)
13. [Papers Knowledge Base](#13-papers-knowledge-base)
14. [Implementation & Code Reference Architecture](#14-implementation--code-reference-architecture)
15. [Research-Grade Canonical Audit Harness](#15-research-grade-canonical-audit-harness)
16. [Routing & Navigation](#16-routing--navigation)
17. [Component Architecture](#17-component-architecture)
18. [Performance Architecture](#18-performance-architecture)
19. [Mobile Strategy](#19-mobile-strategy)
20. [Accessibility Strategy](#20-accessibility-strategy)
21. [Styling System](#21-styling-system)
22. [Static Export Strategy](#22-static-export-strategy)
23. [Build Pipeline](#23-build-pipeline)
24. [Data Validation Pipeline](#24-data-validation-pipeline)
25. [Engineering Principles](#25-engineering-principles)
26. [Design Decisions & Trade-offs](#26-design-decisions--trade-offs)
27. [Coding Standards](#27-coding-standards)
28. [Performance Optimizations](#28-performance-optimizations)
29. [Known Constraints](#29-known-constraints)
30. [Future Extension Guidelines](#30-future-extension-guidelines)
31. [Production Readiness Status](#31-production-readiness-status)
32. [Appendix](#32-appendix)

---

## 1. Executive Summary

### 1.1 Project Overview

The **Neural Network Architecture Explorer** is a production-ready interactive educational platform for exploring deep learning architectures. It provides comprehensive inspection, comparison, and learning capabilities for 34 classic neural network architectures with rich educational tooling, interactive topology visualization, model comparison, a recommendation advisor, an evolution timeline, a paper knowledge center, and advanced training dynamics simulation.

### 1.2 Key Statistics

- **34 complete model architectures** with full layer-by-layer JSON definitions
- **8,388 individual layers** documented across all models
- **18 research papers** with both structured analysis (`data/papers.json`) and canonical paper detail files (`data/papers/*.json`)
- **5 training dynamics concepts** with simulation presets (Vanishing, Exploding, Residual, Dense, BatchNorm)
- **9 evolution timeline nodes** tracing architecture history from LeNet (1998) to ConvNeXt (2022)
- **3-question rule-based advisor** with client-side scoring engine
- **1 implementation guide** (ResNet-50 production pipeline) with schema-driven validation
- **19 training dynamics components** (14 core + 5 comparison-mode)
- **17 paper-details component files** implementing the 7-zone research knowledge architecture
- **5 generic educational components** for content rendering
- **48 static pages** generated at build time for instant loading
- **Total parameters across all models:** ~1.23B
- **Python audit harness** (`nn-audit/`) for research-grade zero-trust verification of all 34 models

### 1.3 Production Readiness

**Overall Status:** 100% Production Ready

**Verification Status:**
- ✅ ESLint: 0 errors, 0 warnings
- ✅ TypeScript: 0 errors
- ✅ Data Validation: 34 models passed (Zod schema at build time)
- ✅ Layer Parameter Sum Verification: 100% passed (Σ layer.params == totalParams for all 34 models)
- ✅ Cross-Repository Consistency: 0 field mismatches across `data/models.json` and detail files
- ✅ Next.js Static Export Build: 48/48 pages compiled
- ✅ Research-Grade Canonical Audit: Independent Python harness (`nn-audit/`) verified tensor shapes, parameter math, benchmark provenance, and link validity
- ✅ Explorer UI/UX refinement complete: tabbed workspace, sticky inspector, canvas toolbar, educational helper, and mobile polish
- ✅ Homepage redesign complete: mission control hero, universal search, knowledge hub, statistics strip, roadmap, and spotlight cards
- ✅ Papers experience evolved into a local-first research knowledge base with bookmarks, reading status, personal notes, and search
- ✅ Paper Details Specification pages: 7-zone cognitive architecture with deep linking, schema validation, and persistent utility panel
- ✅ Training Dynamics Simulator v2.0: Phases 1–5 complete (data-driven engine, telemetry, adaptive controls, educational rules, synchronized comparison mode)

**Maturity Level:** Production (Post-v1.0)

### 1.4 Target Users

- **Students** learning deep learning fundamentals
- **Researchers** comparing architectural patterns
- **ML Engineers** selecting models for deployment
- **Educators** teaching CNN/Transformer concepts

---

## 2. Project Vision & Goals

### 2.1 Vision

To provide an interactive, visual learning platform that demystifies neural network architectures for students, researchers, and practitioners by enabling hands-on exploration of layer structures, parameter calculations, and architectural patterns.

### 2.2 Core Value Proposition

- Interactive topology visualization with React Flow
- Layer-by-layer parameter breakdown with mathematical formulas
- Comparative analysis across 34 architectures
- Educational content integrated into the explorer
- Knowledge graph connecting models, patterns, concepts, papers, and lineage
- Live training dynamics simulation with quantitative telemetry
- Structured research paper knowledge objects with deep linking

### 2.3 Supported Learning Workflows

1. **Exploration:** Browse catalog by category, efficiency, or era
2. **Comparison:** Side-by-side metrics and charts
3. **Deep Dive:** Layer inspector with parameter math
4. **Pattern Learning:** Architecture patterns library
5. **Historical Context:** Evolution timeline and research map
6. **Simulation:** Interactive training dynamics with gradient flow visualization, telemetry dashboards, and synchronized comparison mode
7. **Research:** Paper knowledge center with bookmarks, reading status, personal notes, and structured 7-zone paper detail pages

---

## 3. Architecture Overview

### 3.1 Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Neural Network Architecture Explorer                     │
│                     ─────────────────────────────                             │
│                                                                               │
│  ┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────┐          │
│  │   Home    │───▶│   Catalog    │───▶│  Model   │───▶│ Compare  │          │
│  │   Page    │    │   Page       │    │  Explorer │    │  Page    │          │
│  │           │    │              │    │  Page    │    │          │          │
│  └──────────┘    └──────────────┘    └──────────┘    └──────────┘          │
│                                         │                                     │
│                                         ▼                                     │
│                              ┌──────────────────┐                          │
│                              │   Layer Inspector  │                          │
│                              │   (Side Panel)     │                          │
│                              └──────────────────┘                          │
│                                                                               │
│  ┌──────────┐    ┌────────────┐    ┌──────────┐    ┌──────────────┐       │
│  │ Evolution│    │  Papers     │    │  Learn   │    │  Concepts     │       │
│  │ Timeline  │    │  Knowledge  │    │  Paths   │    │  Explorers    │       │
│  │           │    │  Center     │    │  &       │    │  (Receptive   │       │
│  │           │    │  ┌────────┐ │    │  Advisor  │    │   Field +     │       │
│  │           │    │  │Paper   │ │    │           │    │   Training    │       │
│  │           │    │  │Details │ │    │           │    │   Dynamics)   │       │
│  │           │    │  └────────┘ │    │           │    │               │       │
│  └──────────┘    └────────────┘  └──────────┘    └──────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 User Flow

```
[User Lands on Homepage]
         │
         ▼
[Model Catalog Cards: 34 Models with Filters]
         │
         ├──────────────────┬──────────────────┬─────────────────────┐
         ▼                  ▼                  ▼                     ▼
   [Model Explorer]   [Comparison Page]    [Learning Paths]      [Paper Route]
   (Tabbed View)      (Multi-model)        (Advisor + Roadmaps)  (Knowledge Center)
         │                  │                  │                     │
         ▼                  ▼                  ▼                     ▼
   [Overview]         [Charts + Table]      [3 Learning Paths]  [Papers List + Filters]
   [Implementation]   [Stat Cards]          [Model Selection]   [Bookmarks/Notes/Status]
   [Layers List]      [Model Selector]      [Wizard (3 Qs)]
   [Topology Graph]                              │
         │                                       ▼
         └─────────────────────────────►  [Paper Details /papers/[paperId]]
                                          (7-Zone Cognitive Architecture)
         │
         ▼
   [Training Dynamics /concepts/training-dynamics]
   (Single Simulation OR Synchronized Comparison)
```

### 3.3 Core User Journeys

| Journey | User Action | Application Response |
|---------|-------------|----------------------|
| **Browse** | Lands on homepage | Sees a mission-control dashboard with search, stats, featured models, knowledge cards, and guided learning pathways |
| **Explore** | Clicks model card | Navigates to architecture explorer with tabbed interface |
| **Inspect** | Clicks a layer node | Side panel opens with layer details, parameters, and educational notes |
| **Implement** | Views Implementation tab | Sees production code snippets, prerequisites, engineering notes, and next learning steps |
| **Compare** | Clicks "Compare Models" | Interactive charts and detailed table comparing selected models |
| **Learn** | Visits Learn page | Chooses from 3 learning paths or uses model selection advisor |
| **Simulate** | Visits Training Dynamics | Interactive canvas simulation of gradient flow with telemetry, adaptive controls, preset scenarios |
| **Compare Simulations** | Toggles comparison mode | Twin engines running side-by-side with synchronized controls and difference narratives |
| **Research** | Visits Papers page | Searches 18 papers, sets reading status, bookmarks favorites, writes personal notes |
| **Read Paper** | Clicks paper card | Navigates to `/papers/[paperId]` with 7-zone structured knowledge object, deep-linkable anchors |
| **Timeline** | Visits Evolution page | Explores 9 key architecture milestones with expandable details |

### 3.4 Recent Experience Enhancements

The implementation phase introduced a more professional, developer-tool-like experience across the product without changing the underlying data schema, routing model, or React Flow architecture:

- **Explorer workspace refinement:** a higher-density tabbed workspace, segmented view switch, topology legend, sticky layer headers, and a dismissible first-use helper improve scanning and orientation.
- **Inspector and canvas polish:** sticky inspector headers, tensor-shape flow formatting, calculation ledgers, educational callouts, canvas controls, and live visualization metrics make the topology experience feel like an interactive analysis environment.
- **Implementation tab:** production-ready code reference section with framework variants, prerequisites, engineering notes, Shiki syntax highlighting, and verified metadata.
- **Homepage redesign:** the landing experience now functions as a mission-control hub with universal search, continue-learning recommendations, knowledge cards, family filters, comparisons, roadmap, and spotlight content.
- **Training Dynamics Simulator v2.0:** complete data-driven refactor (Phases 1–5) with standalone simulation engine, rich telemetry, adaptive controls, learning engine rules, playback timeline, and synchronized comparison mode.
- **Paper Details Specification:** static papers transformed into interactive, structured knowledge objects with 7 cognitive information zones, deep linking anchors, and a persistent utility panel.
- **Research knowledge base:** the papers experience now supports reading status, bookmarks, personal notes, and instant publication search in a local-first workflow (`localStorage`).
- **Research-Grade Canonical Audit:** dedicated Python harness in `nn-audit/` verifying all 34 models against torch, timm, keras, tensorflow, and transformers with pinned versions.

---

## 4. Technology Stack

### 4.1 Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.2.9 | App Router, static export (`output: 'export'`) |
| **Runtime** | React | 19.2.4 | UI rendering, concurrent features, hooks |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS, custom dark+cyan theme tokens |
| **Type System** | TypeScript | 6.0.3 | Strict mode, path aliases (`@/*`), full type safety |
| **Validation** | Zod | 4.4.3 | Runtime schema validation for data integrity |
| **Animation** | Framer Motion | 12.40.0 | Page transitions, card stagger effects, timeline animations |
| **Graphing** | React Flow | 12.11.0 | Interactive topology graphs with node filtering |
| **Charts** | Recharts | 3.9.2 | Bar charts for model comparisons |
| **Math Rendering** | KaTeX | 0.18.1 | Server/client-safe LaTeX formula rendering (`MathRenderer`, `MathFormula`) |
| **Code Highlighting** | Shiki | 4.3.1 | Server-side code syntax highlighting with theme support |
| **Icons** | Lucide React | 1.21.0 | Consistent SVG iconography throughout |
| **Fonts** | Geist Sans + Mono | Latest | Modern technical typography |

### 4.2 Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Rendering** | Static Export | Deployable to any static host, instant loading |
| **Data Loading** | Static JSON + Zod | No API latency, validated at build time |
| **Diagram Library** | React Flow | Industry standard for interactive graphs |
| **Animation** | Framer Motion | Respects `prefers-reduced-motion` |
| **Charts** | Recharts | React-native, responsive |
| **Math Rendering** | KaTeX | Lightweight (~50KB), SSR-safe, `output: 'htmlAndMathml'` for accessibility |
| **Code Highlighting** | Shiki | Server-side only (no client bundle), theme-consistent, transformer support |
| **Styling** | Tailwind CSS + CSS Variables | Rapid development, consistent design |
| **State** | React Context + Hooks | No need for Redux at this scale |
| **User Data** | localStorage (`nn_explorer_paper_kb_v1`) | Local-first bookmarks/notes/reading status, no backend required |
| **Simulation Engine** | Standalone TypeScript class | Decoupled from React, framework-agnostic physics/particle/telemetry engine |
| **Fonts** | Geist Sans + Mono | Modern technical typography |

---

## 5. Directory Structure

### 5.1 Full Directory Tree

```
neural-network-architecture-explorer/
├── app/                              # Next.js App Router (App Dir)
│   ├── layout.tsx                    # Root layout with dark theme, global providers
│   ├── page.tsx                      # Homepage (Hero + Featured Models + How it Works)
│   ├── error.tsx                     # Global error boundary
│   ├── loading.tsx                   # Loading state
│   ├── not-found.tsx                 # 404 page
│   ├── sitemap.ts                    # Sitemap generation (10 static + 34 model routes)
│   ├── globals.css                   # Global styles, Tailwind directives, custom CSS vars
│   │
│   ├── models/
│   │   └── [slug]/                   # Dynamic route: /models/vgg16, /models/resnet50, etc.
│   │       └── page.tsx              # Model Explorer page (Tabbed: Overview/Implementation/Layers/Topology)
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
│   │   ├── page.tsx                  # Paper Knowledge Center (bookmarks, status, notes, search)
│   │   └── [paperId]/                # Dynamic route: /papers/resnet-2015-cvpr-he, /papers/resnet50
│   │       ├── page.tsx              # Paper Details page (7-zone cognitive layout)
│   │       ├── loading.tsx           # Skeleton fallback for async chunk loading
│   │       ├── error.tsx             # Error boundary for paper rendering errors
│   │       └── not-found.tsx         # 404 handler for invalid paper IDs
│   │
│   ├── learn/
│   │   └── page.tsx                  # Learning Paths + Model Selection Advisor
│   │
│   ├── research-map/
│   │   └── page.tsx                  # Research DAG visualization
│   │
│   ├── architecture-patterns/
│   │   └── page.tsx                  # Design Patterns Library
│   │
│   └── concepts/
│       ├── receptive-field/
│       │   └── page.tsx              # Receptive Field Explorer
│       └── training-dynamics/
│           └── page.tsx              # Training Dynamics Simulator v2.0
│
├── components/                       # Reusable UI Components
│   ├── ui/                           # Primitive UI components
│   │   ├── badge.tsx
│   │   ├── brand-logo.tsx
│   │   ├── continue-learning.tsx     # Educational recommendation component
│   │   ├── math-formula.tsx          # LaTeX display component (KaTeX)
│   │   ├── math-renderer.tsx         # Runtime KaTeX renderer with error fallback
│   │   └── model-selector-dropdown.tsx
│   │
│   ├── code-block/                   # Implementation code display system
│   │   ├── index.tsx                 # Server component orchestrating Shiki highlight
│   │   ├── code-block-callouts.tsx   # why/mistake/tip/strategy/note callouts
│   │   ├── code-block-copy-button.tsx
│   │   ├── code-block-footer.tsx
│   │   ├── code-block-header.tsx
│   │   └── code-block-line-numbers.tsx
│   │
│   ├── model-catalog/                # Catalog components
│   │   ├── model-card.tsx            # Individual model card
│   │   ├── model-grid.tsx            # Grid layout for model cards
│   │   ├── category-tabs.tsx         # Family filter tabs
│   │   └── search-bar.tsx            # Search + efficiency + era + pattern + application + difficulty filters
│   │
│   ├── model-explorer/               # Model detail components
│   │   ├── tabbed-explorer.tsx       # Main tabbed interface
│   │   ├── flow-canvas.tsx           # React Flow topology graph
│   │   ├── layer-list.tsx            # Sequential layer list view
│   │   ├── inspector-panel.tsx       # Desktop side panel
│   │   ├── inspector-sheet.tsx       # Mobile bottom sheet
│   │   ├── implementation-tab.tsx    # Implementation details display
│   │   ├── model-relationships.tsx   # Relationship metadata display
│   │   └── custom-node.tsx           # Custom React Flow node
│   │
│   ├── model-comparison/             # Comparison page components
│   │   ├── comparison-client.tsx     # Main comparison layout
│   │   ├── comparison-chart.tsx      # Bar charts using Recharts
│   │   ├── comparison-table.tsx      # Detailed spec table
│   │   └── stat-card.tsx             # Winner highlight cards
│   │
│   ├── educational/                  # Generic educational content components
│   │   ├── concept-explanation.tsx   # Reusable concept explanation block
│   │   ├── math-section.tsx          # Mathematical formula + variable glossary
│   │   ├── intuition-section.tsx     # Plain-English intuition callout
│   │   ├── analogy-section.tsx       # Analogy card
│   │   └── reference-section.tsx     # Academic references list
│   │
│   ├── training-dynamics/            # Training Dynamics UI components
│   │   ├── concept-selector.tsx      # Concept tab selector
│   │   ├── explanation-panel.tsx     # Educational explanation panel
│   │   ├── control-panel.tsx         # Adaptive hyperparameter controls
│   │   ├── metric-panel.tsx          # Live metrics display
│   │   ├── legend.tsx                # Canvas legend
│   │   ├── canvas.tsx                # Canvas 2D render host
│   │   ├── architecture-preview.tsx  # Static architecture diagram
│   │   ├── telemetry-dashboard.tsx   # Epoch/Loss/Grad Norm/Var/ΔW/Status
│   │   ├── gradient-heatmap.tsx      # Layer bars with HSL health colors
│   │   ├── activation-stats.tsx      # Mean/variance/std + 5-bin histogram
│   │   ├── loss-curve.tsx            # Real-time SVG loss plotting
│   │   ├── layer-inspector.tsx       # Interactive node click modal
│   │   ├── playback-timeline.tsx     # Milestones + click-to-seek epochs
│   │   ├── adaptive-explanation.tsx  # Live expected outcomes & risk callouts
│   │   └── comparison/               # Comparison Mode sub-components
│   │       ├── comparison-orchestrator.tsx  # Twin engine container
│   │       ├── synchronized-controls.tsx    # Play/Pause/Step/Reset/Speed
│   │       ├── architecture-overlay.tsx     # Block diagrams & shortcut math
│   │       ├── comparative-metrics.tsx      # Side-by-side metrics & win badges
│   │       └── difference-summary.tsx       # Live comparative narrative
│   │
│   ├── paper-details/                # Paper Details Specification components
│   │   ├── index.ts                  # Public API barrel export
│   │   ├── PaperPageLayout.tsx       # Responsive grid master wrapper
│   │   ├── PaperBreadcrumbs.tsx      # Breadcrumb navigation
│   │   ├── shared/                   # Micro-components reused across zones
│   │   │   ├── SectionHeader.tsx     # Section title + anchor copy
│   │   │   ├── ExpandableCard.tsx    # Accessible collapsible container
│   │   │   ├── Badge.tsx             # System badge
│   │   │   ├── VerificationBadge.tsx # Reproducibility badge
│   │   │   ├── MetricCard.tsx        # Metric display card
│   │   │   ├── InnovationTypeBadge.tsx # Component/Architecture/Math/Loss/Optimization
│   │   │   └── TaggedList.tsx        # Categorized tag list
│   │   ├── utility-panel/
│   │   │   └── PersistentUtilityPanel.tsx # Sticky sidebar: TOC, bookmark, citation, JSON export
│   │   └── zones/                    # 7 Cognitive Information Zones (1:1 mapping)
│   │       ├── Zone1_QuickScan/QuickScanZone.tsx    # Header, badges, TL;DR
│   │       ├── Zone2_Motivation/MotivationZone.tsx  # Problem, limitations, insight, contributions
│   │       ├── Zone3_Innovations/InnovationsZone.tsx # Expandable innovation cards
│   │       ├── Zone4_Evidence/EvidenceZone.tsx      # Metrics, ablations, datasets
│   │       ├── Zone5_CriticalNotes/CriticalNotesZone.tsx # Tagged strengths/tradeoffs/failures
│   │       ├── Zone6_Connections/ConnectionsZone.tsx # Lineage, research gaps
│   │       └── Zone7_Reference/ReferenceZone.tsx    # Abstract, equations, training details
│   │
│   ├── learn/
│   │   └── model-advisor.tsx         # 3-question model selection wizard
│   │
│   ├── research-map/
│   │   └── research-flow.tsx         # Research DAG visualization
│   │
│   ├── architecture/                 # Architecture Pattern library presentation components (Phase 2.2)
│   │   ├── ArchitecturePatternLayout.tsx # Page composition layout container
│   │   ├── ArchitecturePatternHeader.tsx # Header title & pattern badge
│   │   ├── ArchitecturePatternNavigation.tsx # Left pattern selector index bar
│   │   ├── ArchitectureMath.tsx     # LaTeX formal equation box
│   │   ├── ArchitectureHistory.tsx  # Problem & solution narrative boxes
│   │   ├── ArchitectureBlueprint.tsx# SVG block routing schematic visualizer
│   │   ├── ArchitectureTradeoffs.tsx# Key advantages & constraints grid
│   │   ├── ArchitectureRelationships.tsx# Associated catalog models grid
│   │   ├── ArchitectureReferences.tsx # Continue learning recommendation links
│   │   ├── types.ts                 # Shared interfaces & data mapping
│   │   └── index.ts                 # Barrel exports
│   │
│   ├── explorer/                     # Domain-independent Interactive Explorer Framework (Phase 2.3)
│   │   ├── ArchitectureExplorer.tsx # Explorer state & layout orchestration controller
│   │   ├── ExplorerCanvas.tsx       # SVG viewport container for node/edge rendering
│   │   ├── ExplorerNode.tsx         # Interactive rect/circle/pill node component with hover/selection
│   │   ├── ExplorerEdge.tsx         # Connection path component with markers & highlight effects
│   │   ├── LayerExplorer.tsx        # Educational layer sequence browser
│   │   ├── ComponentInspector.tsx   # Detailed educational inspection panel
│   │   ├── blueprints/              # Declarative blueprint datasets (Residual, Dense, Depthwise, etc.)
│   │   ├── types.ts                 # Explorer state & blueprint schema models
│   │   └── index.ts                 # Explorer framework barrel export
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
│   │   ├── alexnet.json
│   │   ├── convnext.json
│   │   ├── densenet121.json
│   │   ├── densenet169.json
│   │   ├── densenet201.json
│   │   ├── efficientnetb0.json … efficientnetb7.json
│   │   ├── inceptionresnetv2.json
│   │   ├── inceptionv3.json
│   │   ├── lenet.json
│   │   ├── maxvit.json
│   │   ├── mobilenet.json
│   │   ├── mobilenetv2.json
│   │   ├── mobilenetv3large.json
│   │   ├── mobilenetv3small.json
│   │   ├── nasnetlarge.json
│   │   ├── nasnetmobile.json
│   │   ├── resnet50.json … resnet152v2.json (6 variants)
│   │   ├── swin.json
│   │   ├── vgg16.json
│   │   ├── vgg19.json
│   │   ├── vit.json
│   │   └── xception.json
│   ├── papers.json                   # 18 research paper summaries (Knowledge Center)
│   ├── papers/                       # 18 canonical paper detail files (Paper Details pages)
│   │   ├── alexnet-2012-nips-krizhevsky.json
│   │   ├── convnext-2022-cvpr-liu.json
│   │   ├── densenet-2016-cvpr-huang.json
│   │   ├── efficientnet-2019-icml-tan.json
│   │   ├── inceptionresnetv2-2016-aaai-szegedy.json
│   │   ├── inceptionv3-2015-cvpr-szegedy.json
│   │   ├── lenet-1998-ieee-lecun.json
│   │   ├── maxvit-2022-eccv-chen.json
│   │   ├── mobilenetv1-2017-arxiv-howard.json
│   │   ├── mobilenetv2-2018-cvpr-sandler.json
│   │   ├── mobilenetv3-2019-iccv-howard.json
│   │   ├── nasnet-2017-cvpr-zoph.json
│   │   ├── resnet-2015-cvpr-he.json
│   │   ├── resnetv2-2016-eccv-he.json
│   │   ├── swin-2021-iccv-liu.json
│   │   ├── vgg-2014-arxiv-simonyan.json
│   │   ├── vit-2020-iclr-dosovitskiy.json
│   │   └── xception-2016-cvpr-chollet.json
│   ├── evolution.json                # 9 timeline nodes
│   ├── advisor.json                  # 3 advisor questions
│   ├── concepts/
│   │   └── training-dynamics.json    # 5 concepts (vanishing, exploding, residual, dense, batchnorm) with educational content + simulation presets
│   ├── training-dynamics-rules.json  # Educational rule catalogs for learning engine
│   ├── training-dynamics-scenarios.json # Categorized presets (Architecture/Training/Research)
│   ├── implementations/
│   │   └── resnet50.json            # ResNet-50 production implementation guide
│   └── link_registry.json            # Static link mapping for documentation
│
├── doc/                              # Technical Architecture Specifications
│   └── architecture/                 # Phase 0.3 – Phase 2.5 Architecture Specifications
│       ├── shared-registries.md      # Domain, Perspective, Visualizer & Graph registries (Phase 0.3)
│       ├── validation-pipeline.md    # Build-time validation rules & diagnostic engine (Phase 0.4)
│       ├── knowledge-object-schema.md# KnowledgeObject Zod schema & canonical vocabulary (Phase 1.1)
│       ├── perspective-schemas.md    # 6 Educational Perspective contracts (Phase 1.2)
│       ├── engine-state-contracts.md # Frozen Engine API & state contracts (Phase 1.3)
│       ├── migration-adapters.md     # Shared adapter framework (Model, Paper, Pattern, Training) (Phase 1.4)
│       ├── knowledge-repository.md   # Read-only unified IKnowledgeRepository API (Phase 1.5)
│       ├── architecture-pattern-migration.md # Phase 2.1 Pattern Data Migration
│       ├── architecture-components.md # Phase 2.2 Architecture Presentation Components
│       ├── interactive-explorer.md   # Phase 2.3 Interactive Explorer Framework Specification
│       ├── architecture-relationships.md # Phase 2.4 Relationship Graph, Evolution & Research Integration
│       └── architecture-pattern-library.md # Phase 2.5 Architecture Pattern Library Frozen Specification
│
├── lib/                              # Core utilities, logic, and types
│   ├── registry/                     # Canonical Shared Registry Layer (Phase 0.3 Foundation)
│   │   ├── registry-types.ts         # Strongly-typed interfaces & literal unions
│   │   ├── graph-behavior-registry.ts# Graph interaction models metadata
│   │   ├── visualizer-registry.ts    # Visualizer plugins metadata
│   │   ├── perspective-registry.ts   # Educational perspectives metadata
│   │   ├── domain-registry.ts        # Platform domains metadata (Vision, Transformer, RL, etc.)
│   │   └── index.ts                  # Capability lookup API & re-exports
│   │
│   ├── validation/                   # Platform Validation Pipeline (Phase 0.4 Foundation)
│   │   ├── validators/               # Registry, reference, capability & graph rules
│   │   └── index.ts                  # validatePlatform() API & diagnostic tools
│   │
│   ├── knowledge/                    # Canonical Knowledge Layer (Phase 1.1-1.5 & Phase 2.1)
│   │   ├── schema/                   # KnowledgeObjectSchema, constants & types
│   │   ├── perspectives/             # 6 Perspective contracts extending BasePerspective
│   │   ├── adapters/                 # Migration adapters (Model, Pattern, Training, Paper)
│   │   ├── repository/               # Unified IKnowledgeRepository data access API (Phase 2.1 adoption)
│   │   └── index.ts                  # Knowledge layer barrel export
│   │
│   ├── engine/                       # Engine Architecture & State Contracts (Phase 1.3)
│   │   └── contracts/                # BaseEngineState, CNN, RL, Graph, Opt & Visualizer contracts
│   │
│   ├── schema/                       # Zod validation schemas
│   │   ├── model.schema.ts           # Model/layer type definitions
│   │   ├── paper.schema.ts           # CanonicalPaperZodSchema + RKR sub-schemas
│   │   ├── training-dynamics.schema.ts # SimulationPreset, TrainingConcept, enums
│   │   └── implementation.schema.ts  # ModelImplementationData + code block schemas
│   │
│   ├── data-access/                  # Data loading utilities
│   │   ├── models.ts                 # Client-side model summaries
│   │   ├── models.server.ts          # Server-side model loading (server-only)
│   │   ├── papers.ts                 # Paper registry + getPaperById + getAllPaperIds
│   │   ├── training-dynamics.ts      # getTrainingConcepts / getSimulationPreset / getRelatedConcepts
│   │   ├── learning-engine.ts        # Live explanations, warnings, comparative narratives, scenarios
│   │   ├── implementations.server.ts # getImplementationData(slug) with server-only boundary
│   │   └── README.md                 # Data access layer documentation
│   │
│   ├── data/                         # Static data helpers
│   │   ├── model-categories.ts       # Category configurations
│   │   └── relationships.ts          # Model relationship metadata
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── comparison.ts             # Comparison-related types
│   │   └── training-dynamics.ts      # SimulationState, TelemetrySnapshot, events, particles
│   │
│   ├── training-dynamics/            # Standalone simulation engine core (no React)
│   │   ├── simulation-engine.ts      # SimulationEngine class (public API, state, events, metrics)
│   │   ├── particle-engine.ts        # Particle lifecycle & trajectories
│   │   ├── physics.ts                # Node graph layout math
│   │   ├── renderer.ts               # Pure Canvas 2D rendering pipeline
│   │   ├── color-system.ts           # Color mapping utilities
│   │   ├── loss-models.ts            # Pluggable LossModel strategy factory
│   │   └── telemetry.ts              # TelemetrySnapshot generation + health/color/derived-value helpers
│   │
│   ├── search/                       # Search engine (Phase 4)
│   │   ├── search-engine.ts          # 5-tier relevance engine
│   │   ├── metadata-enrichment.ts    # Educational metadata enrichment
│   │   └── types.ts                  # Search type definitions
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-reduced-motion.ts     # Accessibility hook for motion preference
│   │   ├── use-is-mobile.ts          # Mobile viewport detection
│   │   ├── use-knowledge-search.ts   # Unified search hook
│   │   └── use-paper-knowledge-base.ts # localStorage paper state (status, favorites, notes, tags)
│   │
│   └── utils/                        # Utility functions
│       ├── cn.ts                     # Tailwind class merge utility
│       ├── formatters.ts             # Number formatting utilities
│       ├── colors.ts                 # Color utilities
│       ├── filter-models.ts          # Model filtering utilities
│       ├── layer-styles.ts           # Layer styling utilities
│       └── rf-math.ts                # Receptive field + React Flow math utilities
│
│   └── shiki-highlighter.ts          # Server-side Shiki code highlighting with theme mapping
│
├── types/                            # Global type definitions
│   └── paper-schema.ts               # CanonicalPaperSchema + RKR interfaces + NoteCategory unions
│
├── nn-audit/                         # Research-Grade Python Audit Harness
│   ├── README.md                     # Reproduction instructions & pinned versions
│   ├── pyproject.toml                # Python dependencies (torch, timm, keras, tf, transformers)
│   ├── .python-version               # Python 3.12
│   ├── test_math_and_rf.py           # Math & receptive field unit tests
│   ├── verify_canonical_database.py  # Zero-trust model/framework/link/cross-repo audit
│   ├── generate_audit_report.py      # Synthesizes doc/RESEARCH_GRADE_CANONICAL_AUDIT_REPORT.md
│   ├── audit_full_results.json       # Full evidence artifact (6.8MB)
│   └── .venv/                        # Pinned Python 3.12.9 virtual environment
│
├── public/                           # Static assets
│   ├── advisor/                      # Advisor page static assets
│   └── *.svg                         # SVG icons (file, globe, next, window, vercel)
│
├── scripts/                          # Build and validation scripts
│   ├── validate-model-data.ts        # Data validation script
│   ├── validate-links.ts             # Link validation script
│   ├── data-validation-report.md     # Data validation report
│   ├── data-merge-changelog.md       # Schema update changelog
│   ├── extract_keras_models.py       # Keras model extraction
│   ├── fix_batchnorm_params.py       # BatchNorm parameter fix
│   ├── generate_audit_package.py     # Audit package generation
│   ├── init_data_from_lib.py         # Data initialization from library
│   ├── merge-model-data.ts           # Model data merging
│   ├── process_models.py             # Model processing
│   └── README.md                     # Scripts documentation
│
├── tools/                            # Archived utilities
│   └── archive/legacy-data-pipeline/ # Legacy Python model generation scripts
│
├── next.config.ts                    # Next.js config (static export)
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
└── README.md                         # Developer documentation
```

### 5.2 Key Directory Rationale

| Directory | Purpose | Why |
|---|---|---|
| `app/models/[slug]` | Dynamic routing | One route handles all 34 models, loads JSON by slug |
| `app/papers/[paperId]` | Dynamic routing | One route handles 18 canonical paper JSONs + alias slugs |
| `data/models/` | Individual model JSONs | Lazy-loaded per model for performance |
| `data/models.json` | Model summaries | Lightweight catalog data for listing |
| `data/papers/` | Canonical paper JSONs | Schema-validated 7-zone knowledge objects |
| `data/papers.json` | Paper summaries | Knowledge-center listing + search |
| `data/concepts/` | Training dynamics concepts | Educational content + simulation presets |
| `lib/schema/` | Zod schemas | Runtime validation for data integrity |
| `lib/data-access/` | Data access layer | Separates client/server data loading |
| `lib/training-dynamics/` | Simulation engine core | React-independent physics/particles/renderer/telemetry |
| `lib/search/` | Search engine | Unified search across all content types |
| `lib/data/relationships.ts` | Relationship metadata | Knowledge graph connections |
| `components/paper-details/` | Paper details zones | 7 cognitive information hierarchy zones |
| `components/training-dynamics/` | Simulation UI | Modular simulator UI components |
| `components/educational/` | Generic education | Reusable educational content components |
| `components/code-block/` | Code display | Shiki-based code rendering with metadata |
| `nn-audit/` | Audit harness | Python zero-trust verification of all data |
| `components/ui/` | Primitive components | Consistent, reusable UI primitives |

---

## 6. Core System Architecture

### 6.1 Architecture Principles

1. **Static-First:** All content pre-rendered at build time for instant loading
2. **Type-Safe:** Full TypeScript coverage with Zod runtime validation
3. **Component-Driven:** Modular, reusable components with clear boundaries
4. **Performance-Optimized:** Dynamic imports, memoization, code splitting
5. **Accessibility-First:** Reduced motion support, ARIA labels, keyboard navigation
6. **Mobile-Responsive:** Touch targets, safe areas, responsive layouts
7. **Schema-First:** All UI components react deterministically to canonical data contracts validated at runtime (paper details, training dynamics, implementations)
8. **Data-Validated:** Multiple Zod schema layers (models, papers, concepts, implementations) plus Python audit harness

### 6.2 Data Flow Architecture

```
Static JSON Files (data/)
         │
         ├──► Zod Validation (lib/schema/)
         │    ├── model.schema.ts          (34 models)
         │    ├── paper.schema.ts          (18 canonical papers)
         │    ├── training-dynamics.schema.ts (5 concepts + presets)
         │    └── implementation.schema.ts (implementation guides)
         │
         ├──► Data Access Layer (lib/data-access/)
         │    ├── models.ts / models.server.ts
         │    ├── papers.ts
         │    ├── training-dynamics.ts
         │    ├── learning-engine.ts
         │    └── implementations.server.ts
         │         │
         │         ├──► Server Components (app/)
         │         │    └──► Pre-rendered HTML
         │         │
         │         └──► Client Components (components/)
         │              └──► Interactive UI
         │
         ├──► Simulation Engine (lib/training-dynamics/)
         │    └──► Canvas Rendering + Telemetry Events
         │
         └──► Search Engine (lib/search/)
              └──► Unified Search API
```

### 6.3 Component Communication Patterns

1. **Props Down, Events Up:** Standard React pattern for component communication
2. **URL State:** Shareable state via query parameters
3. **Custom Hooks:** Encapsulated logic reuse
4. **Context:** Minimal use (only when truly needed)
5. **Server/Client Boundary:** Clear separation for performance
6. **Event Emitter:** `SimulationEngine` uses a strongly-typed event system (`Backpropagation`, `EpochComplete`, `MetricsUpdated`, `TelemetrySnapshot`, `StateChanged`, etc.)
7. **localStorage:** Paper knowledge base persists user state locally without backend

---

## 7. Data Architecture

### 7.1 Data Schema Design

#### TypeScript Interfaces (Zod Schemas)

```typescript
// FILE: lib/schema/model.schema.ts

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

#### Canonical Paper Schema (`types/paper-schema.ts`)

```typescript
export interface CanonicalPaperSchema {
  metadata: PaperMetadata;      // paperId, title, authors, venue, year, status
  summary: PaperSummary;        // tldr, oneSentenceMemory, keyTakeaways, vocabulary, visualFigures, readingGuide
  motivation: PaperMotivation;  // problemStatement, previousLimitations, coreInsight, contributions
  innovations: TechnicalInnovation[]; // expandable cards with math + codeSnippet
  evidence: PaperEvidence;      // datasets, richDatasets, primaryResults, ablationStudies
  criticalNotes: TaggedNote[];  // strengths/weaknesses/limitations/failureCases/tradeoffs/misconceptions
  connections: PaperConnections;// lineage, researchGaps, futureExtensions
  reference: DeepReference;     // abstract, trainingDetails, equationCatalog, bibtex
}
```

#### Training Dynamics Schema (`lib/schema/training-dynamics.schema.ts`)

```typescript
export interface TrainingConcept {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'optimization' | 'architecture' | 'normalization' | 'regularization' | 'mathematics' | 'general_cs';
  summary: string;
  problem: string;
  intuition: string;
  analogy: string;
  visualExplanation: string;
  mathematics: { formula: string; description: string; variables?: Record<string, string> };
  causes: string[];
  symptoms: string[];
  solutions: string[];
  realWorldArchitectures: string[];
  relatedConcepts: string[];
  references: Reference[];
  tags: string[];
  simulationPreset: SimulationPreset;
}

export interface SimulationPreset {
  id: string;
  name: string;
  particleSpeed: number;
  particleDecay: number;
  growthRate: number;
  shake: number;
  skipConnectionProbability: number;
  parallelGradient: boolean;
  normalization: boolean;
  gradientColor: string;
  connectionStyle: 'sequential' | 'weak' | 'unstable' | 'residual' | 'dense' | 'batchnorm';
  nodeStyle: string;
  gradientDecayRate: number;
  gradientGrowthRate: number;
  noiseLevel: number;
  nodeShake: number;
  skipProbability: number;
  parallelConnections: boolean;
  normalizationStrength: number;
  gradientClipping: number;
  learningRateMultiplier: number;
  activationSensitivity: number;
  weightInitialization: 'he' | 'xavier' | 'random_large' | 'random_small' | 'random_normal' | 'orthogonal' | 'ones';
  visualTheme: string;
  connectionType: 'sequential' | 'residual' | 'dense' | 'batchnorm';
  // Hyperparameters with defaults for backward compatibility
  activationFunction: 'sigmoid' | 'tanh' | 'relu' | 'gelu' | 'swish';
  optimizer: 'sgd' | 'momentum' | 'rmsprop' | 'adam' | 'adamw';
  normalizationType: 'none' | 'batchnorm' | 'layernorm';
  batchSize: number;
  dropoutRate: number;
  noiseInjection: number;
  presetCategory: 'architecture' | 'training' | 'research';
}
```

#### Implementation Schema (`lib/schema/implementation.schema.ts`)

```typescript
export interface ModelImplementationData {
  modelId: string;
  headerTitle: string;
  headerDescription: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  implementationType: ImplementationType;
  exampleCategory: ExampleCategory;
  isTransferLearning?: boolean;
  isProductionReady?: boolean;
  metadata: {
    frameworkVersion: string;
    pythonVersion: string;
    inputResolution: string;
    dataset: string;
    gpuRequirement: string;
    estimatedRuntime: string;
    mixedPrecisionSupported?: boolean;
    fineTuningSupported?: boolean;
    customBadges?: string[];
  };
  prerequisites: { ... };
  verification: { lastVerifiedDate: string; verifiedFrameworkVersions: string[]; verifiedPythonVersion: string };
  variants: CodeVariant[];
  callouts: Callout[];
  footer: { ... };
  engineeringNotes: { bestUsedWhen: string[]; architecturalTradeoffs: string[]; expectedTrainingBehavior: string[]; productionAndServingNotes: string[] };
  nextLearningSteps: Array<{ stepNumber: string; title: string; description: string; href: string; icon: string }>;
}
```

### 7.2 Data Sources

| Source | File(s) | Description |
|--------|---------|-------------|
| Model Summaries | `data/models.json` | 34 lightweight model summaries for catalog/compare |
| Full Models | `data/models/*.json` | Complete layer-by-layer architecture data |
| Paper Summaries | `data/papers.json` | 18 research paper summaries for knowledge center |
| Canonical Papers | `data/papers/*.json` | 18 research-grade paper knowledge objects (7-zone schema) |
| Evolution | `data/evolution.json` | 9 timeline nodes (1998-2022) |
| Advisor | `data/advisor.json` | 3-question model selection wizard |
| Training Concepts | `data/concepts/training-dynamics.json` | 5 concepts: educational content + simulation presets |
| Training Rules | `data/training-dynamics-rules.json` | Educational rule catalog for learning engine & comparison narratives |
| Training Scenarios | `data/training-dynamics-scenarios.json` | Categorized presets (Architecture/Training/Research) |
| Implementations | `data/implementations/resnet50.json` | Production implementation guides |
| Link Registry | `data/link_registry.json` | Static mapping for documentation links |
| Relationships | `lib/data/relationships.ts` | Model relationship metadata (Phase 3) |

### 7.3 Data Validation

All data is validated at build time using Zod schemas:

```typescript
// lib/schema/model.schema.ts
export const NeuralNetworkModelSchema = z.object({...});
export const ModelSummarySchema = z.object({...});

// lib/schema/paper.schema.ts
export const CanonicalPaperZodSchema = z.object({...});

// lib/schema/training-dynamics.schema.ts
export const TrainingConceptCatalogSchema = z.array(TrainingConceptSchema);
export const SimulationPresetSchema = z.object({...});

// lib/schema/implementation.schema.ts
export const ModelImplementationDataSchema = z.object({...});
```

**Validation Scripts:**
- `scripts/validate-model-data.ts` — zod validation for 34 models + summaries
- `nn-audit/verify_canonical_database.py` — independent Python zero-trust audit (parameter math, tensor shapes, links, cross-repo consistency)

**Status:** ✅ All 34 models validated with 0 errors; ✅ All 18 canonical papers validated via `CanonicalPaperZodSchema`; ✅ All 5 training concepts validated

### 7.4 Data Access Pattern

**Standardized Access Layer:** All data access goes through `lib/data-access/`:

```typescript
// Client-side model access
import { getModelSummaries } from '@/lib/data-access/models';
const models = getModelSummaries();

// Server-side model access
import { getModel } from '@/lib/data-access/models.server';
const model = getModel(slug);

// Paper access (canonical registry with alias slugs)
import { getPaperById, getAllPaperIds } from '@/lib/data-access/papers';
const paper = await getPaperById('resnet-2015-cvpr-he'); // or 'resnet50'

// Training dynamics access
import { getTrainingConcepts, getSimulationPreset, getRelatedConcepts } from '@/lib/data-access/training-dynamics';
const concepts = getTrainingConcepts();

// Implementation access (server-only)
import { getImplementationData } from '@/lib/data-access/implementations.server';
const impl = getImplementationData('resnet50');
```

**Rationale:** Single source of truth, consistent schema validation, centralized caching

---

## 8. Search Architecture

### 8.1 Search Engine Overview

**Type:** 5-Tier Deterministic Relevance Engine  
**Execution:** Client-side array filtering with intelligent scoring  
**Indexing:** Lightweight unified metadata index  
**Tokenizer:** Multi-token term matcher with score multiplier  
**Ranking:** Tiered relevance scoring (100/90/75/50/25 points)

### 8.2 Search Components

#### 1. Unified Search Metadata (`lib/search/types.ts`)

```typescript
export interface SearchableEntity {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  description: string;
  url: string;
  aliases: string[];
  keywords: string[];
  patterns: string[];
  components: string[];
  applications: string[];
  family?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  efficiency?: 'lightweight' | 'balanced' | 'powerful';
  year?: number;
  tags?: string[];
  authors?: string[];
  colorTheme?: string;
  rawItem?: unknown;
}
```

#### 2. Metadata Enrichment (`lib/search/metadata-enrichment.ts`)

- **Model Enrichment:** Adds canonical aliases, educational keywords, pattern IDs, component types, and deployment targets
- **Paper Enrichment:** Adds paper-specific aliases and search keywords (`enrichPaperEntity`)
- **Pattern Enrichment:** Central pattern metadata with canonical identifiers
- **Relationship Resolution:** Dynamic on-demand through existing `lib/data/relationships.ts`

#### 3. 5-Tier Relevance Engine (`lib/search/search-engine.ts`)

```typescript
// Tier scoring (per entity)
Exact Title Match:          100 pts
Alias/Abbreviation Match:   90 pts
Keyword/Pattern/Component:  75 pts
Description Match:           50 pts
Tags/Authors Match:          25 pts

// Multi-token boost
if (allTokensMatched && queryTokens.length > 1) {
  totalScore *= 1.25;
}

// Filtering criteria
- Architectural Pattern
- Family
- Deployment Target
- Difficulty
- Efficiency
- Historical Era
```

#### 4. Shared React Hook (`lib/hooks/use-knowledge-search.ts`)

- Encapsulates query state management
- Manages filter selections
- Handles URL synchronization
- Executes search engine with memoization
- Provides consistent API across pages

### 8.3 Search Coverage

**Supported Search Types:**
1. ✅ **Architectural concept search** - "residual", "attention", "dense", "depthwise"
2. ✅ **Abbreviation support** - NAS, ViT, SE, MBConv
3. ✅ **Family-level search** - "ResNet" finds all variants
4. ✅ **Component search** - "bottleneck", "skip connection", "SE block"
5. ✅ **Characteristic search** - "lightweight", "efficient", "powerful"
6. ✅ **Deployment search** - "mobile", "edge", "server"
7. ✅ **Pattern search** - Compound, NAS, attention patterns
8. ✅ **Paper search** - Papers linked to models and patterns

**Search Success Rate:** 100% on canonical queries (15/15 tested)

### 8.4 Search Performance

- **Average Latency:** <5ms for 34 models
- **Scalability:** O(n) with memoization handles 1000+ models
- **Bundle Impact:** ~5KB minified (search engine + metadata)
- **Memory Footprint:** ~50KB (metadata enrichment)

---

## 9. UI/UX Architecture

### 9.1 Design System

#### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#020612` | Page backgrounds |
| Card | `rgba(9, 15, 35, 0.45)` | Cards, panels |
| Border | `rgba(255, 255, 255, 0.05)` | All borders |
| Primary | `#22d3ee` | Active tabs, buttons, links |
| Text Primary | `#e5e7eb` | Headings, important text |
| Text Secondary | `#9ca3af` | Body text, descriptions |
| Text Muted | `#6b7280` | Labels, metadata |

#### Active State Pattern

Every active/interactive element uses:
- **Solid cyan background** (`#22d3ee`) + **dark text** (`#020617`)
- **Cyan glow shadow**: `shadow-[0_0_12px_rgba(34,211,238,0.25)]`

**Applied to:** Category tabs, nav links, metric tabs, view toggles

#### Typography Scale

| Role | Size | Usage |
|------|------|-------|
| Display | `clamp(1.8rem, 5vw + 1rem, 3.5rem)` | Page titles |
| Heading | `clamp(1.3rem, 3vw + 0.8rem, 2.2rem)` | Section titles |
| Body | `0.875rem` | Descriptions, paragraphs |
| Caption | `0.75rem` | Metadata, labels |
| Micro | `0.625rem` | Chart labels, badges |

**Mobile Typography:** Minimum 12px for body/label text (Phase 2B)

### 9.2 Component Design Patterns

#### Glass Card Pattern

```css
.glass-card {
  background: rgba(9, 15, 35, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
}
```

**Usage:** All cards, panels, and containers throughout the application

#### Touch Target Pattern

**Minimum:** 44×44px for all interactive elements (Phase 2B)

```tsx
<button className="min-h-[44px] min-w-[44px]">
  Button Content
</button>
```

#### Responsive Grid Pattern

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

---

## 10. Educational Architecture

### 10.1 Knowledge Graph

**Relationship Metadata** (`lib/data/relationships.ts`):

```typescript
export interface ModelRelationships {
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
  papers: {
    originalUrl: string;
    paperPageAnchor: string;
    relatedPapers: RelatedPaperRef[];
  };
  compareShortcuts: CompareShortcut[];
  continueLearning: LearningItem[];
}
```

**Coverage:** All 34 models with deterministic relationship metadata

### 10.2 Educational Components

#### 1. ContinueLearning Component

**Location:** `components/ui/continue-learning.tsx`

**Features:**
- Compact, responsive recommendation grid
- Maximum 5 recommendations per page
- Color-coded badges for different content types
- Context-aware recommendations based on current page

#### 2. ModelRelationshipsView Component

**Location:** `components/model-explorer/model-relationships.tsx`

**Sections:**
- Uses These Architecture Patterns
- Related Theoretical Concepts
- Paper Context & Research Resources
- Architecture Lineage & Relationships
- Related Architectures
- Compare with Similar Models
- Continue Learning

#### 3. ImplementationTab Component

**Location:** `components/model-explorer/implementation-tab.tsx`

**Purpose:** Displays practical implementation details for neural network models in the Model Explorer

**Features:**
- **Empty State Handling:** Graceful fallback when implementation JSON doesn't exist
- **Implementation Header:** Metadata badges (difficulty, implementation type, example category), title, and description labeled as "Practical Learning Stage"
- **Engineering Specifications:** Grid display of 6 key specifications (framework version, Python version, input shape, pretrained dataset, GPU requirement, estimated runtime)
- **Verification Metadata:** Last verified date, tested framework versions, and Python version
- **Prerequisites Card:** Minimum Python version, framework version, hardware recommendations, knowledge prerequisites, and expected familiarity as tags
- **Code Integration:** Integrates with `CodeBlock` component (Shiki server-side highlighting) for code display with implementation metadata, variants, callouts, and footer
- **Engineering Notes:** Four summary sections in 2-column grid (Best Used When, Architectural Tradeoffs, Expected Training Behavior, Production & Serving Notes)
- **Navigation:** Next learning steps with three options (Explore Topology Graph, Read Original Paper, Compare Model Benchmarks)

**Technical Details:**
- Uses `useReducedMotionPreference` hook for accessibility
- Framer Motion animations with conditional reduced motion
- Responsive grid layouts (1-6 columns based on screen size)
- Lucide React icons for visual indicators
- TypeScript with `ModelImplementationData` schema

#### 4. Generic Educational Components (`components/educational/`)

Reusable educational content components used by concept pages:
- `ConceptExplanation` — structured title/summary/problem/intuition
- `MathSection` — KaTeX formula display + variable glossary
- `IntuitionSection` — plain-English intuition callout
- `AnalogySection` — analogy card
- `ReferenceSection` — academic references with year/url/type

### 10.3 Learning Pathways

**3 Guided Learning Paths:**

1. **Feedforward & Homogeneous Stacks** (VGG16, VGG19)
2. **The Residual Revolution** (ResNet50, ResNet50V2, ResNet152)
3. **Dense Connectivity & Feature Reuse** (DenseNet121, DenseNet201)

**Model Selection Advisor:**

- 3-question wizard with animated progress
- Questions: Goal, Hardware, Budget
- Client-side rule-based scoring engine
- Results: Top 4 recommended models with match percentage

### 10.4 Concept Explorers

#### Receptive Field Explorer

**Location:** `/concepts/receptive-field`

**Features:**
- Interactive visualization of receptive field growth
- Layer-by-layer breakdown
- Model selector
- Mathematical formulas (verified against `$RF_i = RF_{i-1} + (K_i - 1) \cdot S_{i-1}$`)
- URL parameter support (`?model=id`)

#### Training Dynamics Simulator

**Location:** `/concepts/training-dynamics`

**Features:**
- Interactive canvas simulation of gradient flow (Phases 1–5)
- 5 concept presets: Vanishing, Exploding, Residual, Dense, BatchNorm
- Rich telemetry dashboard, gradient heatmap, activation statistics, loss curve
- Adaptive hyperparameter controls (activation, optimizer, normalization, depth, LR, weight init, clipping)
- Educational learning engine with live explanations and risk warnings
- Playback timeline with click-to-seek epoch navigation
- Synchronized side-by-side comparison mode with twin simulation engines
- URL parameter support (`?concept=id`)
- Fully data-driven — zero hardcoded concept conditionals in engine code

---

## 11. Training Dynamics Simulation Platform

### 11.1 Architecture Overview

The Training Dynamics module is a **data-driven, decoupled simulation platform** built across Phases 1–5. It separates educational content, simulation state, physics, graphics rendering, and UI controls into isolated, single-responsibility modules.

```
data/concepts/training-dynamics.json      <- Educational Content & Simulation Presets
data/training-dynamics-rules.json         <- Educational Rule Catalog
data/training-dynamics-scenarios.json     <- Categorized Presets (Architecture/Training/Research)
         │
         ▼
lib/schema/training-dynamics.schema.ts    <- Zod Runtime Validation & Types
         │
         ▼
lib/data-access/training-dynamics.ts      <- Strongly-typed Data Access Layer
lib/data-access/learning-engine.ts        <- Educational Learning Engine
         │
         ▼
lib/training-dynamics/                    <- Standalone Simulation Engine Core (no React)
  ├── simulation-engine.ts                <- SimulationEngine (state, events, metrics, telemetry)
  ├── particle-engine.ts                  <- Particle lifecycle & trajectories
  ├── physics.ts                          <- Node graph layout math
  ├── renderer.ts                         <- Pure Canvas 2D rendering
  ├── color-system.ts                     <- Color mapping utilities
  ├── loss-models.ts                      <- Pluggable LossModel strategy factory
  └── telemetry.ts                        <- TelemetrySnapshot + health/color derived helpers
         │
         ▼
app/concepts/training-dynamics/page.tsx   <- Modular React Orchestrator
   ├── components/training-dynamics/      <- 14 core UI components + 5 comparison components
   └── components/educational/            <- 5 reusable educational components
```

### 11.2 Simulation Engine Core

`SimulationEngine` (`lib/training-dynamics/simulation-engine.ts`) is a standalone TypeScript class independent of React UI lifecycles.

**Public API:**
- `initialize(width, height)` — computes node graph topology
- `start()` / `pause()` / `togglePlayPause()` / `reset()`
- `loadPreset(preset)` — swaps concept preset
- `update(deltaTime)` — advances simulation, metrics, telemetry
- `render(ctx, width, height)` — delegates to renderer
- `triggerBackprop()` — manual backpropagation pulse
- `seekToEpoch(targetEpoch)` — playback timeline seeking
- `getMetrics()` — quantitative metrics engine
- `getTelemetrySnapshot()` — immutable telemetry data
- `getState()` / `getPreset()` / `getGraph()` / `getParticles()`
- `setNetworkDepth()` / `setLearningRate()` / `setWeightInitialization()` / `setActivationFunction()` / `setOptimizer()` / `setNormalizationType()` / `setBatchSize()` / `setGradientClipping()` / `setDropoutRate()` / `setNoiseInjection()` / `setSelectedLayerIndex()`

**Event System (strongly-typed):**
- `Backpropagation`, `ForwardPass`, `EpochComplete`, `LayerUpdated`
- `SimulationReset`, `PresetChanged`, `MetricsUpdated`, `StateChanged`
- `TelemetrySnapshot`, `LayerSelected`

### 11.3 Immutable Telemetry Snapshots (Phase 3)

Every tick, `SimulationEngine` calculates and emits an immutable `TelemetrySnapshot`:

```typescript
interface TelemetrySnapshot {
  timestamp: number;
  epoch: number;
  iteration: number;
  loss: number;
  gradientNorm: number;
  averageGradient: number;
  activationVariance: number;
  updateMagnitude: number;
  learningRate: number;
  networkDepth: number;
  networkStability: number;
  convergenceStatus: 'Stabilizing' | 'Converging' | 'Stalled' | 'Diverging' | 'Vanishing';
  layers: LayerTelemetryRaw[];
  lossHistory: LossHistoryEntry[];
  timelineEvents: PlaybackEvent[];
}
```

**Derived values** (`healthStatus`, `heatmapColor`, `badgeColor`) are computed on-the-fly via pure helpers in `telemetry.ts` (`getHealthStatus`, `getHeatmapColor`, `getHealthBadgeStyle`) rather than stored redundantly.

### 11.4 Pluggable Loss Models (Phase 4)

`LossModelFactory` (`lib/training-dynamics/loss-models.ts`) uses the strategy pattern:
- `VanishingLossModel` — plates around 1.2 threshold
- `ResidualLossModel` — fast convergence to ~0.04
- `ExplodingLossModel` — diverges upward (bounded by clipping)
- `BatchNormLossModel` — smooth decay with LR stability
- `DenseNetLossModel` — super-fast feature-reuse decay
- `DefaultLossModel` — fallback

### 11.5 Educational Learning Engine (Phase 4)

`lib/data-access/learning-engine.ts` evaluates active simulation state:
- `getLiveExplanation(state, preset)` — educational outcomes based on activation/normalization/connection/optimizer
- `getEducationalWarnings(state, preset)` — contextual risk warnings (vanishing gradient risk, instability hazard, exploding gradient hazard)
- `getComparativeNarrative(presetA, presetB)` — rule-driven comparison narratives from `training-dynamics-rules.json`
- `getCategorizedScenarios()` — returns Architecture/Training/Research scenario groups

### 11.6 Synchronized Comparison Mode (Phase 5)

`ComparisonOrchestrator` (`components/training-dynamics/comparison/`) controls twin `SimulationEngine` instances (Engine A vs Engine B):
- `SynchronizedControls` — Play/Pause, Step, Reset, Speed
- `ArchitectureOverlay` — block diagrams & shortcut math
- `ComparativeMetrics` — side-by-side metrics & win badges
- `DifferenceSummary` — live comparative educational narrative
- Reuses standard components (`Canvas`, `MetricPanel`, `TelemetryDashboard`)

### 11.7 Telemetry UI Components (Phase 3)

| Component | Purpose |
|-----------|---------|
| `TelemetryDashboard` | Epoch, Loss, Grad Norm, Var, ΔW, Status |
| `GradientHeatmap` | Layer bars with HSL health colors + ΔW display |
| `ActivationStats` | Mean, variance, std dev, 5-bin histograms |
| `LossCurve` | Real-time SVG loss plotting |
| `LayerInspector` | Interactive canvas node click modal |
| `PlaybackTimeline` | Milestones + seek-to-epoch jumping |

### 11.8 Extensibility Model

To add a new concept:
1. **JSON Entry:** Add concept definition & `simulationPreset` to `data/concepts/training-dynamics.json`
2. **Done!** Zod validates the schema, the data access layer retrieves it, tabs render automatically, and the canvas renderer executes the physics/drawing rules based on the preset configuration. Core engine code requires zero modifications.

**Categorized Scenarios** (`data/training-dynamics-scenarios.json`):
- **Architecture:** VGG, ResNet, DenseNet
- **Training:** Stable, Unstable, Bad Init
- **Research:** Vanishing, Exploding, BatchNorm

### 11.9 Decoupled Simulation & Visualization Platform (Phase 3.1 - Phase 3.5)

The Training Dynamics subsystem is refactored into a **decoupled, plugin-driven simulation and visualization platform**:

1. **Phase 3.1 (Generic DAG Topology):** Network structure represented by immutable `TopologyGraph` DAGs (`TopologyNode`, `TopologyEdge`, `TopologyPort`). Includes structural and cycle validation via Kahn's algorithm (`topology-validator.ts`) and adapters (`SequentialTopologyAdapter`, `ArchitectureTopologyAdapter`).
2. **Phase 3.2 (Training Engine):** Standalone `TrainingEngine` (`lib/training/engine/`) producing canonical, 100% serializable `EngineState` snapshots scheduled via `TopologyScheduler` along DAG topological order. Managed by deterministic `EngineStateMachine`.
3. **Phase 3.3 (Visualizer Framework):** Framework infrastructure (`lib/visualization/`) defining `VisualizerPlugin`, `VisualizerContext`, `VisualizerSnapshot`, `visualizerRegistry`, and `VisualizerHost`.
4. **Phase 3.4 (Simulator Migration):** Legacy Canvas 2D renderer and particle engine converted into `GradientFlowPlugin` with 100% pixel-identical visual behavior.
5. **Phase 3.5 (Visualizer Plugins):** 6 registered plugins:
   - `gradient-flow`: Canvas 2D particle dynamics & signal flow.
   - `learning-curve`: Loss, accuracy, and learning rate trajectories.
   - `layer-health`: Activation health, gradient norm, and stability heatmap.
   - `distribution`: Activation/weight/gradient distribution histograms and stats.
   - `execution-timeline`: Step execution history and timeline markers.
   - `node-inspector`: Node parameters, shapes, weights, and educational notes.

### 11.10 Automated Knowledge Navigation & Cross Linking (Phase 4.1 - Phase 4.2)

The platform features an automated **Knowledge Navigation & Cross Linking** layer driven by the `KnowledgeRepository` and `RelationshipResolver`:

1. **Phase 4.1 (Knowledge Navigation):** Educational navigation (Related Knowledge, Prerequisites, Successors, Perspective Links, Learning Paths) is computed dynamically from graph relationships via `NavigationService` and `IKnowledgeRepository` query APIs.
2. **Phase 4.2 (Cross Linking):** Connects all 5 domains (Architecture, Training, Research, Evolution, Implementation) via `RelationshipResolver.resolveCrossDomain(target, allObjects)` into a unified `CrossDomainConnections` graph structure.
3. **Generic Navigation UI Components (`components/navigation/`):**
   - `KnowledgeNavigation`: Main container orchestrating perspective links, learning paths, and cross-domain links.
   - `PerspectiveSwitcher`: Dynamic route links to Architecture, Training, Research, Evolution, and Implementation perspectives.
   - `LearningPath`: Graph-traversed Previous $\leftarrow$ Current $\rightarrow$ Next learning path bar.
   - `CrossDomainExplorer`: Interactive tabbed network connecting Architecture, Training, Research, Evolution, and Implementation objects.
   - `RelatedKnowledge`, `PrerequisiteList`, `SuccessorList`, `ResearchConnections`, `EvolutionTimelineLinks`, `ImplementationExamples`, `RelationshipGraph`.

---

## 12. Paper Details Specification Platform

### 12.1 Design Philosophy

The **Paper Details Specification Page** transforms static academic research papers into interactive, structured, navigable, and reusable knowledge objects. Each paper is a **Research Knowledge Graph Node** with schema-first rendering contracts.

### 12.2 The 7 Cognitive Information Zones

1. **Zone 1 — Quick Scan** (`#quick-scan`): PaperHeader (title, authors, venue, badges), TLDRCard, key takeaways
2. **Zone 2 — Motivation** (`#motivation`): Problem Statement, Previous Limitations, Core Insight, Contributions grid
3. **Zone 3 — Technical Innovations** (`#innovations`): Expandable InnovationCards with type badges, KaTeX math deep-dive, variable glossary, code snippets
4. **Zone 4 — Evidence** (`#evidence`): MetricCard grid, dataset badges, ablation tables, reproducibility notes
5. **Zone 5 — Critical Notes** (`#critical-notes`): Unified tagged list with filter bar (Strengths / Weaknesses / Limitations / Tradeoffs / Failure Cases)
6. **Zone 6 — Research Connections** (`#connections`): Lineage (predecessors/successors), research gaps, future extensions
7. **Zone 7 — Deep Reference** (`#reference`, collapsed by default): Original abstract, training details, equation catalog, BibTeX

### 12.3 Stable Identifier & Deep Linking

- **Paper IDs:** `<primary-family>-<year>-<venue>-<lead-author-surname>` (e.g. `resnet-2015-cvpr-he`)
- **Alias Slugs:** `getAllPaperIds()` returns canonical IDs + friendly aliases (e.g. `resnet50`, `vgg16`, `vit`) via `STATIC_PAPERS_REGISTRY`
- **Anchor hashes:** Every zone and sub-block exposes a deterministic anchor hash (`#quick-scan`, `#innovations`, `#evidence-results`, etc.)

### 12.4 Rendering Pipeline

```
Route Trigger (/papers/resnet-2015-cvpr-he)
  │
  ▼
Static Next.js Server Component (app/papers/[paperId]/page.tsx)
  │   generateStaticParams() → getAllPaperIds()
  │   generateMetadata() → paper.metadata.title + summary.tldr
  ▼
Runtime Zod Schema Validation (CanonicalPaperZodSchema)
  │
  ▼
PaperPageLayout (Client Component)
  ├── Zone 1: QuickScan
  ├── Zone 2: Motivation
  ├── Zone 3: Innovations (KaTeX math rendering)
  ├── Zone 4: Evidence
  ├── Zone 5: CriticalNotes (tag filtering)
  ├── Zone 6: Connections
  └── Zone 7: Reference (collapsed accordion)
```

### 12.5 Component Architecture

```
components/paper-details/
├── index.ts                         # Public API barrel export
├── PaperPageLayout.tsx              # Two-column master wrapper
├── PaperBreadcrumbs.tsx             # Navigation breadcrumb
├── shared/                          # Reusable micro-components
│   ├── SectionHeader.tsx            # Title + anchor copy link
│   ├── ExpandableCard.tsx           # Accessible collapsible
│   ├── VerificationBadge.tsx        # Empirical reproducibility badge
│   ├── MetricCard.tsx               # Metric display
│   ├── InnovationTypeBadge.tsx      # Component/Architecture/Math/Loss/Optimization
│   └── TaggedList.tsx               # Unified category-tagged notes list
├── utility-panel/
│   └── PersistentUtilityPanel.tsx   # Sticky sidebar: TOC, bookmark, citation, JSON export
└── zones/                           # 7 cognitive zones (1:1 section mapping)
    ├── Zone1_QuickScan/
    ├── Zone2_Motivation/
    ├── Zone3_Innovations/
    ├── Zone4_Evidence/
    ├── Zone5_CriticalNotes/
    ├── Zone6_Connections/
    └── Zone7_Reference/
```

### 12.6 Research Knowledge Record (RKR) Enhancements

`types/paper-schema.ts` extends the base `CanonicalPaperSchema` with:
- `ResearchVocabularyTerm[]` — term/definition/formalNotation/significance
- `VisualMemoryFigure[]` — figureNumber/title/purpose/section
- `ReadingGuide` — difficultyRating (1-5), prerequisites, mustRevisit/quickScan/canSkip sections
- `RichDatasetReference[]` — name/description/officialUrl/leaderboardUrl/codeUrl
- Additional `NoteCategory`: `'misconception'`
- `equationCatalog` entries include `name` field

---

## 13. Papers Knowledge Base

### 13.1 Overview

The `/papers` route (`app/papers/page.tsx`) is a local-first research knowledge center. Users manage their reading workflow entirely in the browser.

### 13.2 Features

- **Search:** Filter by query via 5-tier search engine + paper entity enrichment
- **Categories:** CNN Foundations, Residual & Dense, Mobile & Efficient, Vision Transformers, NAS & Scaling
- **Reading Status:** `unread` / `reading` / `read` / `bookmarked`
- **Favorites:** Star-toggle persistence via localStorage
- **Personal Notes:** Per-paper inline notes editor
- **Custom Tags:** Add/remove searchable tags per paper
- **Sort Modes:** Year desc/asc, title, starred
- **Recently Opened:** Track last 5 papers
- **Citation & BibTeX:** Copy-to-clipboard with feedback
- **Deep Links:** `#paper-id` hash routing to specific paper cards

### 13.3 Persistence (`lib/hooks/use-paper-knowledge-base.ts`)

- Storage key: `nn_explorer_paper_kb_v1`
- Data structure: `Record<paperId, { status, isFavorite, personalNotes, customTags, lastRead }>`
- Recent papers key: `nn_explorer_paper_kb_v1_recent`
- SSR-safe: reads localStorage after hydration via `requestAnimationFrame`
- No backend required — entirely static-compatible

---

## 14. Implementation & Code Reference Architecture

### 14.1 Overview

The Implementation tab in the Model Explorer provides production-grade code references for model architectures. Currently ships with ResNet-50; the schema supports additional models via JSON.

### 14.2 Data Schema (`lib/schema/implementation.schema.ts`)

- `FrameworkType`: pytorch | tensorflow | keras | huggingface | jax | onnx | bash | python
- `DifficultyLevel`: Beginner | Intermediate | Advanced
- `ImplementationType`: Transfer Learning, Fine-Tuning, Image Classification, Semantic Segmentation, etc.
- `CodeSnippet`: id, filename, language, framework, code, highlightLines, sections
- `CodeVariant`: framework-specific variants (e.g. TF/Keras vs PyTorch)
- `CalloutType`: why | mistake | tip | strategy | note
- `ModelImplementationData`: full schema with metadata, prerequisites, verification, engineeringNotes, nextLearningSteps

### 14.3 Data Access (`lib/data-access/implementations.server.ts`)

- Server-only boundary (`import 'server-only'`)
- `getImplementationData(slug)` reads `data/implementations/{slug}.json` via `readFileSync`
- Validates against `ModelImplementationDataSchema`
- Returns `null` if no implementation file exists (graceful empty state)

### 14.4 Code Highlighting (`lib/shiki-highlighter.ts` + `components/code-block/`)

- **Shiki** runs server-side only (`codeToHtml`) — no client bundle impact
- Theme: `one-dark-pro` to match the glassmorphism dark UI
- `highlightLines` transformer for line-level highlighting
- `components/code-block/` provides: header with file/framework badges, copy button, callouts (why/mistake/tip/strategy/note), footer with metadata, line numbers

---

## 15. Research-Grade Canonical Audit Harness

### 15.1 Overview

`nn-audit/` is an independent, zero-trust Python audit harness that programmatically verifies the entire canonical database.

### 15.2 Pinned Environment

- **Python:** 3.12.9
- **torch:** 2.13.0+cpu
- **torchvision:** 0.28.0+cpu
- **timm:** 1.0.28
- **transformers:** 5.14.1
- **tensorflow:** 2.21.0
- **keras:** 3.15.1

### 15.3 Execution Pipeline

1. **`nn-audit/test_math_and_rf.py`** — 6 mathematical unit tests (Conv2D, DepthwiseConv2D, PointwiseConv2D, Linear, BatchNorm, LayerNorm, RF growth, FLOPs/MACs, output shapes)
2. **`nn-audit/verify_canonical_database.py`** — zero-trust audit:
   - Instantiates models from torchvision/timm/keras/transformers
   - Recalculates parameter counts, shapes, layer totals layer-by-layer
   - Validates `Σ layer.parameters == totalParameters` for all 34 models
   - Checks every URL for HTTP 200 / canonical location
   - Audits cross-repository consistency (`data/models.json` ↔ `data/models/*.json` ↔ papers ↔ relationships → app)
3. **`nn-audit/generate_audit_report.py`** — synthesizes `doc/RESEARCH_GRADE_CANONICAL_AUDIT_REPORT.md`

### 15.4 Verification Results (July 30, 2026)

- ✅ Layer Parameter Sum: 100% passed (all 34 models)
- ✅ Tensor Shape Propagation: all 8,388 layers satisfied dimension consistency
- ✅ Cross-Repository Discrepancies: 0
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors
- **Artifact:** `nn-audit/audit_full_results.json` (6.8MB full evidence log)

### 15.5 Benchmark Provenance Matrix

Every model's accuracy is attributed to its exact source (Original Paper vs TorchVision Checkpoint vs Keras Default vs timm Default) with evaluation dataset, resolution, training recipe, and framework version. Full matrix in `doc/RESEARCH_GRADE_CANONICAL_AUDIT_REPORT.md` Section 2.

---

## 16. Routing & Navigation

### 16.1 Route Map

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Homepage (Hero + Featured Models) |
| `/catalog` | `app/catalog/page.tsx` | Full model catalog with filters |
| `/models/[slug]` | `app/models/[slug]/page.tsx` | Model Explorer (Tabbed) |
| `/compare` | `app/compare/page.tsx` | Model Comparison |
| `/evolution` | `app/evolution/page.tsx` | Architecture Evolution Timeline |
| `/papers` | `app/papers/page.tsx` | Paper Knowledge Center (local-first) |
| `/papers/[paperId]` | `app/papers/[paperId]/page.tsx` | Paper Details (7-zone specification) — 18 canonical IDs + aliases |
| `/learn` | `app/learn/page.tsx` | Learning Paths + Model Advisor |
| `/research-map` | `app/research-map/page.tsx` | Research DAG Visualization |
| `/architecture-patterns` | `app/architecture-patterns/page.tsx` | Design Patterns Library |
| `/concepts/receptive-field` | `app/concepts/receptive-field/page.tsx` | Receptive Field Explorer |
| `/concepts/training-dynamics` | `app/concepts/training-dynamics/page.tsx` | Training Dynamics Simulator |

**Total Routes:** 12+ (48 static pages generated including model detail pages)

### 16.2 Navigation Architecture

#### Desktop Navigation

- **Navbar:** Fixed top navigation with dropdowns
- **Dropdowns:** Hover-activated, well-organized
- **Navigation Groups:**
  - Home
  - Explore (Catalog, Compare, Evolution, Research Map, Patterns)
  - Learn (Papers, Learn)
  - Tools (Receptive Field, Training Dynamics)

#### Mobile Navigation

- **Hamburger Menu:** Transforms to X on open
- **Grid Layout:** 2-column grid for navigation items
- **Bottom Sheets:** Used for inspector panel
- **Mobile Bottom Navigation Bar:** Fixed bottom navigation with 5 primary destinations (Phase 2B)

#### URL State Management

**Supported URL Parameters:**
- Catalog: `?category=`, `?q=`, `?pattern=`, `?app=`, `?diff=`, `?eff=`, `?era=`
- Compare: `?models=`
- Learn: `?tab=`
- Evolution: `?node=`
- Research Map: `?paper=`
- Patterns: `?pattern=`
- Receptive Field: `?model=`
- Training Dynamics: `?concept=`
- Papers: `#paper-id` (hash routing)

**Pattern:** All state syncs to URL for shareability

---

## 17. Component Architecture

### 17.1 Component Hierarchy

#### Model Explorer Component Tree

```
TabbedExplorer (components/model-explorer/tabbed-explorer.tsx)
├── Navigation Breadcrumb
├── Model Title & Description Header
├── Tab Controls (Overview / Implementation / Layers / Topology)
├── Overview Tab
│   ├── Architecture Idea Card
│   ├── Resources & References Card
│   ├── ModelRelationshipsView
│   └── ContinueLearning
├── Implementation Tab
│   ├── Implementation Header (metadata badges, title, description)
│   ├── Engineering Specifications (framework, Python, input shape, dataset, GPU, runtime)
│   ├── Prerequisites Card (Python version, framework, hardware, knowledge)
│   ├── CodeBlock Integration (Shiki highlighting, variants, callouts, footer)
│   ├── Engineering Notes (use cases, tradeoffs, behavior, deployment)
│   └── Next Learning Steps (topology, paper, compare)
├── Layers Tab
│   ├── Layer List
│   └── Inspector Panel (Desktop) / Inspector Sheet (Mobile)
└── Topology Tab
    ├── Controls Bar
    │   └── Show Detailed Layers Toggle
    ├── FlowCanvas (React Flow)
    └── Inspector Panel (Desktop) / Inspector Sheet (Mobile)
```

#### Training Dynamics Page Component Tree

```
TrainingDynamicsPage (app/concepts/training-dynamics/page.tsx)
├── View Mode Toggle (Single | Comparison)
├── Single Mode
│   ├── ConceptSelector (5 concepts from JSON)
│   ├── ExplanationPanel (educational content)
│   ├── ControlPanel (adaptive hyperparameters)
│   ├── Canvas (SimulationEngine 2D rendering)
│   ├── Legend
│   ├── MetricPanel (live metrics)
│   ├── GradientHeatmap
│   ├── ActivationStats
│   ├── LossCurve
│   └── ArchitecturePreview
├── Comparison Mode
│   └── ComparisonOrchestrator
│       ├── SynchronizedControls
│       ├── ArchitectureOverlay
│       ├── Canvas × 2 (Engine A + Engine B)
│       ├── ComparativeMetrics
│       └── DifferenceSummary
├── LayerInspector (modal)
└── ContinueLearning
```

#### Paper Details Page Component Tree

```
PaperDetailsPage (app/papers/[paperId]/page.tsx - Server Component)
├── generateStaticParams() → getAllPaperIds()
├── generateMetadata()
└── PaperPageLayout (Client)
    ├── PaperBreadcrumbs
    ├── Main Column (7 Cognitive Zones)
    │   ├── QuickScanZone (header, badges, TLDR, reading guide)
    │   ├── MotivationZone (problem, limitations, insight, contributions)
    │   ├── InnovationsZone (expandable cards, KaTeX math, code snippets)
    │   ├── EvidenceZone (metrics, datasets, ablations)
    │   ├── CriticalNotesZone (tag filters)
    │   ├── ConnectionsZone (lineage, gaps, extensions)
    │   └── ReferenceZone (collapsed: abstract, equations, training details, BibTeX)
    └── PersistentUtilityPanel (sticky right sidebar)
        ├── SectionNavTracker (scroll-spy)
        ├── BookmarkButton
        ├── CitationExporter (BibTeX / formatted)
        └── JSONExporter
```

### 17.2 Component Inventory

| Component | Purpose | Dependencies | Reusability | Complexity |
|-----------|---------|------------|-------------|------------|
| `Navbar` | Top navigation with dropdowns | `framer-motion`, `lucide-react` | Low | Medium |
| `Footer` | Page footer | `lucide-react` | Low | Low |
| `PageTransition` | Animated page transitions | `framer-motion` | Low | Low |
| `ModelCard` | Catalog model display | `framer-motion`, `lucide-react` | Medium | Medium |
| `ModelGrid` | Grid of model cards | `framer-motion` | Medium | Low |
| `CategoryTabs` | Category filter tabs | `framer-motion` | Low | Low |
| `SearchBar` | Search and filter UI | `framer-motion` | Low | Medium |
| `TabbedExplorer` | Model explorer with tabs | Multiple | Low | High |
| `ImplementationTab` | Implementation details display | `framer-motion`, `lucide-react`, `@/components/code-block` | Low | Medium |
| `FlowCanvas` | React Flow topology | `@xyflow/react` | Low | High |
| `CustomNode` | React Flow node | `@xyflow/react` | Low | Medium |
| `LayerList` | Collapsible layer list | - | Low | Medium |
| `InspectorPanel` | Layer details panel | - | Low | High |
| `InspectorSheet` | Mobile bottom sheet | - | Low | Medium |
| `ComparisonClient` | Comparison page logic | Multiple | Low | High |
| `ResearchFlow` | Research DAG visualization | `@xyflow/react` | Low | High |
| `ModelAdvisor` | Model recommendation tool | - | Low | Medium |
| `ModelRelationshipsView` | Relationship metadata display | - | Low | Medium |
| `ContinueLearning` | Educational recommendations | - | High | Low |
| `Badge` | Styled badge component | - | High | Low |
| `MathRenderer` | KaTeX formula rendering | `katex` | High | Low |
| `MathFormula` | LaTeX display component | `katex` | High | Low |
| `ConceptExplanation` | Educational concept block | - | High | Low |
| `MathSection` | Formula + variable glossary | `lucide-react` | High | Low |
| `IntuitionSection` | Intuition callout | - | High | Low |
| `AnalogySection` | Analogy card | - | High | Low |
| `ReferenceSection` | Academic references | - | High | Low |
| `SimulationEngine` | Training simulation core | - (framework-agnostic) | High | High |
| `Canvas` | Training simulation canvas | `SimulationEngine` | Medium | Medium |
| `ControlPanel` | Adaptive hyperparameter controls | - | Medium | Medium |
| `TelemetryDashboard` | Epoch/loss/grad/variance display | - | Medium | Low |
| `GradientHeatmap` | Layer health heatmap | - | Medium | Medium |
| `LossCurve` | SVG loss curve | - | Medium | Medium |
| `PlaybackTimeline` | Epoch milestone seeking | - | Medium | Medium |
| `ComparisonOrchestrator` | Twin-engine comparison container | `SimulationEngine` ×2 | Low | High |
| `PaperPageLayout` | 7-zone paper page wrapper | All zones | Low | Medium |
| `QuickScanZone` | Paper header + TLDR | shared components | Low | Medium |
| `InnovationsZone` | Expandable innovation cards | `ExpandableCard`, `MathRenderer` | Low | High |
| `PersistentUtilityPanel` | TOC/bookmark/citation/export | - | Low | Medium |

### 17.3 God Components

- `TabbedExplorer` — Handles 4 tabs (Overview/Implementation/Layers/Topology), state management, and multiple views
- `ComparisonClient` — Complex state management for model selection
- `FlowCanvas` — Complex React Flow integration
- `SimulationEngine` — Standalone simulation state machine, metrics, telemetry, event system
- `ComparisonOrchestrator` — Twin engines, synchronized controls, side-by-side state
- `PaperKnowledgeCenter` (`app/papers/page.tsx`) — search, filters, bookmarks, notes, BibTeX copy

---

## 18. Performance Architecture

### 18.1 Performance Optimizations Implemented

#### Phase 1B Optimizations

1. **Lazy-load Model Advisor component** (~15KB deferred)
2. **Disabled staggered animations on mobile** (improved perceived performance)
3. **Hidden MiniMap on mobile in Flow Canvas** (reduced rendering overhead)
4. **Converted PageBackground to server component** (~2KB reduction)

**Impact:** ~17KB initial JS reduction, ~200KB deferred

#### Phase 5 Optimizations

1. **Error boundary:** Global error handling via `app/error.tsx`
2. **Payload splitting:** Model data split at server boundary to reduce client bundle
3. **Callback memoization:** Event handlers wrapped in `useCallback` to prevent unnecessary re-renders
4. **FlowCanvas memoization:** `selectedLayerId` removed from dependency arrays
5. **ComparisonTable memoization:** `METRICS` hoisted to module scope, `metricStats` wrapped in `useMemo`
6. **ComparisonChart memoization:** `barChartData` and `radarChartData` wrapped in `useMemo`
7. **PageTransition fix:** Removed `key={pathname}` to prevent full remounts
8. **Navbar memoization:** `navGroups` moved to `STATIC_NAV_GROUPS`, active state computed with `useMemo`

#### Training Dynamics Optimizations

1. **Standalone engine:** `SimulationEngine` decoupled from React state/lifecycle — only immutable snapshots flow to UI
2. **Derived values:** Health/color/badge styles computed via pure helpers, never stored redundantly
3. **Event-driven updates:** UI subscribes to `TelemetrySnapshot`/`MetricsUpdated` events rather than polling
4. **Typed event emitter:** `Map<SimulationEventType, Set<Handler>>` with type-safe subscriptions
5. **Loss history cap:** 50 entries maximum (ring buffer)
6. **Single real-time loop**: `requestAnimationFrame` drives `update(deltaTime)` + `render(ctx)`

#### Paper Details Optimizations

1. **Server components:** `page.tsx` fetches/validates paper JSON on the server
2. **Deferred DOM:** Zone 7 (Reference) remains collapsed; KaTeX math only renders when expanded
3. **Static generation:** `generateStaticParams()` pre-compiles all valid `paperId` slugs at build time
4. **Lightweight shared components:** micro-components (`SectionHeader`, `Badge`, `MetricCard`) hoisted for reuse

#### Shiki Code Highlighting

1. **Server-side only:** `codeToHtml` runs in server components — zero client bundle cost
2. **Multi-language:** PyTorch, TensorFlow/Keras, Hugging Face, JAX, ONNX, bash, python
3. **Line-level transformers:** `highlightLines` for reference context

### 18.2 Rendering Strategy

#### Dynamic Imports

- **React Flow:** Lazy-loaded in tabbed-explorer.tsx
- **Recharts:** Lazy-loaded in comparison-client.tsx
- **Model Advisor:** Lazy-loaded in learn/page.tsx
- **Research Flow:** Lazy-loaded in research-map/page.tsx

**Rationale:** Defer heavy dependencies until needed

#### Memoization Strategy

```typescript
// Expensive calculations
const filteredModels = useMemo(() => {
  return models.filter(filterFn);
}, [models, filterFn]);

// Event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

#### Node Limiting

**Rule:** Detailed topology disabled for models with >100 layers

**Rationale:** Prevent performance degradation on large models

### 18.3 Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Initial JS Load | ~90KB (home page) | ✅ Good |
| Search Latency | <5ms | ✅ Excellent |
| Hydration Cost | Minimal | ✅ Good |
| Static Export | 48 pages | ✅ Complete |
| Bundle Size | Optimized | ✅ Good |
| KaTeX Bundle | ~50KB (conditionally loaded) | ✅ Good |
| Shiki Bundle | 0KB (server-side only) | ✅ Excellent |

---

## 19. Mobile Strategy

### 19.1 Mobile UX Improvements (Phase 2B)

#### Stage 1 — Mobile Foundations (P0)

- Added mobile typography scale rules (min 12px body/label font size)
- Implemented `.min-touch-target` (min 44×44px) utility class
- Added `.scroll-fade-x` horizontal scroll affordance gradients
- Added safe-area inset helpers and `:focus-visible` accessibility outlines

#### Stage 2 — Navigation Refinement (P0)

- Implemented fixed mobile bottom navigation bar with 5 primary destinations
- Added backdrop blur and safe-area inset padding
- Active state derived dynamically without duplicate navigation logic

#### Stage 3 & 4 — Content Density & Page Refinement (P1)

- Upgraded all labels and tags to minimum 12px text
- Added `min-h-[44px]` touch targets for all CTAs and interactive elements
- Implemented progressive disclosure with collapsed cards
- Made SVG diagrams responsive
- Added mobile timeline spine indicators

#### Stage 5 — Complex Pages (P1)

- Reduced bottom sheet max height from 85vh to 60vh
- Upgraded all layer card buttons and group headers to 44px touch targets
- Added `min-h-[44px]` to tab buttons across all tabbed interfaces

### 19.2 Training Dynamics Mobile Adaptations

- Canvas simulation scales to viewport width
- Control panels stack vertically on mobile
- Comparison mode surfaces side-by-side metrics in vertically stacked cards
- Telemetry dashboard collapses to compact stat grid

### 19.3 Paper Details Mobile Adaptations

- Zones stack in single column
- `PersistentUtilityPanel` converts to bottom action bar / slide-up drawer
- Innovation math blocks collapsed by default
- Reference zone always collapsed

### 19.4 Mobile-Specific Components

- **InspectorSheet:** Mobile bottom sheet for layer details
- **Mobile Bottom Navigation:** Fixed bottom navigation bar
- **Responsive Grids:** 1-4 column layouts based on screen size
- **Touch-Optimized Controls:** Larger touch targets for interactive elements

### 19.5 Mobile Performance

- **Reduced Motion:** Respects `prefers-reduced-motion`
- **MiniMap Hidden:** Disabled on mobile for React Flow
- **Staggered Animations:** Disabled on mobile for perceived performance
- **Lazy Loading:** Heavy components loaded on-demand

---

## 20. Accessibility Strategy

### 20.1 Implemented Features

#### Reduced Motion Support

```typescript
// lib/hooks/use-reduced-motion.ts
const shouldReduceMotion = useReducedMotionPreference();

// Usage in components
transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
```

#### ARIA Labels

- Added `role="search"` and `aria-label` to search inputs
- Added `role="tablist"` and `role="tab"` to category tabs
- Added `aria-expanded` to expandable elements
- Added `aria-selected` to tab controls
- Paper details: `aria-expanded` / `aria-controls` on accordions, `role="tablist"` / `role="tab"` on filters

#### Keyboard Navigation

- Tab navigation works throughout
- Focus indicators visible with `:focus-visible`
- Keyboard shortcuts in model explorer (Arrow keys, Space, L, Esc)

#### Focus Management

- Proper focus order in inspector panels
- Focus states on all interactive elements
- Skip links for main content (can be added)

### 20.2 Math Accessibility (KaTeX)

- `output: 'htmlAndMathml'` emits both visual HTML and semantic MathML
- `MathRenderer` provides `fallbackText` for screen readers
- `MathFormula` accepts `aria-label` for formula description

### 20.3 Color Contrast

**Status:** ✅ Meets WCAG AA requirements

- Primary text (`#e5e7eb`) on background (`#020612`)
- Secondary text (`#9ca3af`) on background
- Primary accent (`#22d3ee`) for interactive elements

### 20.4 Semantic HTML

- Proper use of `<section>`, `<nav>`, `<main>`
- Heading hierarchy maintained
- Landmark roles where appropriate
- Paper zones use `<section id="...">` with `scroll-mt-24` for anchor offset

### 20.5 Screen Reader Support

- Text content is readable
- ARIA labels for visualizations (can be improved)
- Alt text for images (where applicable)

---

## 21. Styling System

### 21.1 Tailwind CSS Configuration

**Version:** Tailwind CSS 4

**Custom Theme:**
```css
/* app/globals.css */
@theme {
  --color-background: #020612;
  --color-card: rgba(9, 15, 35, 0.45);
  --color-border: rgba(255, 255, 255, 0.05);
  --color-primary: #22d3ee;
  --color-text-primary: #e5e7eb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
}
```

### 21.2 CSS Variables

```css
:root {
  --background: #020612;
  --card: rgba(9, 15, 35, 0.45);
  --border: rgba(255, 255, 255, 0.05);
  --primary: #22d3ee;
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
}
```

### 21.3 Utility Classes

#### Class Merging

```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### Custom Utilities

```css
.glass-card {
  background: rgba(9, 15, 35, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
}

.min-touch-target {
  min-height: 44px;
  min-width: 44px;
}

.scroll-fade-x {
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
}
```

### 21.4 Styling Token Standardization (Phase 5)

**Standardized Tokens:**
- Background: `bg-slate-950` instead of `#020617`
- Border: `border-slate-800` instead of `#1f2937`
- Text: `text-slate-200` instead of `#e5e7eb`
- Opacity: `border-border/10`, `border-border/20`, `bg-slate-900/40`

**Train Health Badge Colors (telemetry):**
- Excellent → `bg-emerald-500/10 text-emerald-400 border-emerald-500/30`
- Healthy → `bg-teal-500/10 text-teal-400 border-teal-500/30`
- Weak → `bg-amber-500/10 text-amber-400 border-amber-500/30`
- Vanishing → `bg-blue-500/10 text-blue-400 border-blue-500/30`
- Exploding → `bg-red-500/10 text-red-400 border-red-500/30`

---

## 22. Static Export Strategy

### 22.1 Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
```

### 22.2 Static Export Benefits

- **Instant Loading:** All pages pre-rendered as HTML
- **No Server Required:** Deployable to any static host
- **CDN Friendly:** Can be served from CDN edge locations
- **SEO Optimized:** Full HTML for search engines
- **Offline Capable:** Works without server after initial load

### 22.3 Static Export Compatibility

**All Routes:** ✅ Compatible with static export

**Dynamic Routes:**
- `generateStaticParams` used for model detail pages (`/models/[slug]`)
- `generateStaticParams` used for paper detail pages (`/papers/[paperId]`)

**Build Output:** `out/` directory with 48 static HTML pages

### 22.4 Static Export Limitations

- No API routes
- No server-side rendering at runtime
- No incremental static regeneration
- Images must be unoptimized

---

## 23. Build Pipeline

### 23.1 Build Commands

```bash
# Development
npm run dev

# Production build (static export)
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Data validation
npm run validate:data

# Independent Python audit
cd nn-audit && .venv\Scripts\activate
python nn-audit/test_math_and_rf.py
python nn-audit/verify_canonical_database.py
python nn-audit/generate_audit_report.py
```

### 23.2 Build Process

1. **TypeScript Compilation:** Full type checking
2. **Data Validation:** Zod schema validation for all data (models, papers, concepts, implementations)
3. **Static Generation:** All routes pre-rendered (models + papers + static routes)
4. **Asset Optimization:** Images and fonts processed
5. **Bundle Analysis:** Code splitting and optimization
6. **Static Export:** HTML files generated in `out/`

### 23.3 Build Verification

**Status:** ✅ All checks passing

- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors, 0 warnings
- ✅ Data Validation: 34 models passed
- ✅ Static Export: 48/48 pages generated
- ✅ Python Audit: All 34 models layer-math, tensor-shape, cross-repo, links verified

---

## 24. Data Validation Pipeline

### 24.1 Validation Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `scripts/validate-platform.ts` | `npm run validate:platform` | Platform registry architecture, referential integrity, capability consistency, orphan, and cycle validation |
| `scripts/run-validation-tests.ts` | `npm run validate:tests` | Regression test suite for validation pipeline against deterministic fixtures |
| `scripts/validate-model-data.ts` | `npm run validate:data` | Zod validation for 34 models + summaries |
| `scripts/validate-links.ts` | `npx tsx scripts/validate-links.ts` | Verify internal/external links resolve |
| `nn-audit/test_math_and_rf.py` | `python nn-audit/test_math_and_rf.py` | 6 math + receptive field unit tests |
| `nn-audit/verify_canonical_database.py` | `python nn-audit/verify_canonical_database.py` | Zero-trust framework/model/link/cross-repo audit |
| `nn-audit/generate_audit_report.py` | `python nn-audit/generate_audit_report.py` | Builds `doc/RESEARCH_GRADE_CANONICAL_AUDIT_REPORT.md` |

### 24.2 Validation Coverage

**Zod-validated entities:**
- Model summaries (`data/models.json`)
- Full model architectures (`data/models/*.json`)
- Paper summaries (`data/papers.json`)
- Canonical papers (`data/papers/*.json`)
- Training concepts + presets (`data/concepts/training-dynamics.json`)
- Implementation data (`data/implementations/*.json`)
- Evolution timeline (`data/evolution.json`)
- Advisor questions (`data/advisor.json`)

**Python-verified entities:**
- Parameter sums per layer per model
- Tensor shape propagation layer-by-layer
- Benchmark provenance (paper vs torchvision vs keras vs timm)
- URL validity across the repository
- Cross-repository consistency between all data files

### 24.3 Schema Definitions

**Locations:**
- `lib/schema/model.schema.ts` — Models
- `lib/schema/paper.schema.ts` — CanonicalPaperZodSchema + RKR sub-schemas
- `lib/schema/training-dynamics.schema.ts` — TrainingConcept + SimulationPreset
- `lib/schema/implementation.schema.ts` — ModelImplementationData + CodeBlock schemas

---

## 25. Engineering Principles

### 25.1 Core Principles

1. **Static-First:** Prefer static generation over dynamic rendering
2. **Type-Safe:** Full TypeScript coverage with runtime validation
3. **Performance-Optimized:** Lazy loading, memoization, code splitting
4. **Accessibility-First:** Reduced motion, ARIA labels, keyboard navigation
5. **Mobile-Responsive:** Touch targets, safe areas, responsive layouts
6. **Component-Driven:** Modular, reusable components with clear boundaries
7. **Data-Validated:** Zod schemas for all data structures
8. **URL-Shareable:** State syncs to URL parameters
9. **Schema-First:** UI components react deterministically to canonical data contracts (papers, training dynamics, implementations)
10. **Zero Hardcoded Content:** Educational content lives in JSON; engines are parameter-driven
11. **Standalone Engines:** Physics/particle/simulation logic decoupled from React (framework-agnostic)

### 25.2 Code Quality Standards

- **No Dead Code:** Regularly remove unused functions and imports
- **No Duplication:** Extract shared logic into utilities
- **Consistent Naming:** kebab-case for files, PascalCase for components
- **Clear Separation:** UI components separate from business logic
- **Type Safety:** No `any` types, proper TypeScript usage
- **Server/Client Boundaries:** `import 'server-only'` enforces model/implementation data stays server-side

### 25.3 Testing Philosophy

**Current Status:** No unit test infrastructure in the web app itself (identified as technical debt)

**New:** `nn-audit/test_math_and_rf.py` provides Python-based mathematical verification (layer parameter formulas, receptive field math, FLOP/MAC calculations, tensor dimension propagation)

**Future State:** Unit tests for critical business logic, integration tests for data validation

---

## 26. Design Decisions & Trade-offs

### 26.1 Static Export vs. SSR

**Decision:** Static export

**Rationale:**
- Instant loading for better UX
- No server costs
- CDN-friendly
- Sufficient for current use case

**Trade-off:** No dynamic data fetching at runtime

### 26.2 Client-Side Search vs. Backend Search

**Decision:** Client-side search with 5-tier relevance engine

**Rationale:**
- Fast (<5ms latency)
- No server dependency
- Offline-capable
- Sufficient for 34 models

**Trade-off:** Limited to dataset size (scales to 1000+ models)

### 26.3 React Flow vs. Custom Graph

**Decision:** React Flow

**Rationale:**
- Industry standard
- Well-maintained
- Feature-rich
- Good performance

**Trade-off:** Large bundle size (~200KB)

### 26.4 Framer Motion vs. CSS Animations

**Decision:** Framer Motion

**Rationale:**
- Respects `prefers-reduced-motion`
- Easy to use
- Good performance
- Rich features

**Trade-off:** Additional bundle size (~40KB)

### 26.5 Dark Mode Only vs. Theme Toggle

**Decision:** Dark mode only (hardcoded)

**Rationale:**
- Consistent branding
- Better for technical content
- Reduced complexity
- Good for eye strain

**Trade-off:** No user preference for light mode

### 26.6 KaTeX vs. MathJax

**Decision:** KaTeX

**Rationale:**
- Much lighter (~50KB vs ~300KB)
- SSR-safe (renderToString)
- `htmlAndMathml` output improves accessibility
- Faster rendering on repeated formulas

**Trade-off:** Slightly less LaTeX support than MathJax

### 26.7 Shiki vs. Prism / Highlight.js

**Decision:** Shiki (server-side)

**Rationale:**
- Atomic themes matching the dark UI
- `codeToHtml` runs on server — zero client JS
- Transformer API for line highlighting
- Full TextMate grammar support

**Trade-off:** Cannot re-highlight dynamically on the client without additional setup

### 26.8 Simulation Engine: Standalone Class vs. React Hook

**Decision:** Standalone TypeScript class (`SimulationEngine`)

**Rationale:**
- Decoupled from React state & lifecycle
- Testable in isolation
- Twin instances for comparison mode trivially
- Runs on `requestAnimationFrame` without React re-renders

**Trade-off:** More initial boilerplate; React refs needed to bridge into components

### 26.9 Paper Data: Individual JSONs vs. Single File

**Decision:** Individual JSON files (`data/papers/*.json`) for detail pages + single `data/papers.json` for the knowledge center

**Rationale:**
- Lazy-loaded per-paper; only requested paper enters client bundle
- `generateStaticParams()` pre-compiles all slugs at build
- Registry with alias slugs (`resnet50` → `resnet-2015-cvpr-he`) for friendly URLs

**Trade-off:** Duplicated paper metadata across both files (mitigated by Python cross-repo audit)

---

## 27. Coding Standards

### 27.1 File Naming

- **Components:** PascalCase (e.g., `ModelCard.tsx`)
- **Utilities:** kebab-case (e.g., `formatters.ts`)
- **Hooks:** kebab-case with `use-` prefix (e.g., `use-reduced-motion.ts`)
- **Types:** kebab-case (e.g., `model.schema.ts`)
- **Zones:** `Zone{N}_{Name}` (e.g., `Zone1_QuickScan/QuickScanZone.tsx`)
- **Sub-directories:** kebab-case (e.g., `utility-panel/`, `training-dynamics/`)

### 27.2 Component Structure

```typescript
// 1. Imports
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

// 2. Types/Interfaces
interface ComponentProps {
  // props
}

// 3. Component
export function Component({ prop }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Memoized values
  const memoized = useMemo(() => {
    // computation
  }, [deps]);
  
  // 6. Event handlers
  const handleClick = useCallback(() => {
    // handler logic
  }, [deps]);
  
  // 7. Render
  return (
    <div className={cn('base-class', className)}>
      {/* JSX */}
    </div>
  );
}
```

### 27.3 TypeScript Standards

- **Strict Mode:** Enabled
- **No Any:** Avoid `any` types
- **Explicit Returns:** Function return types
- **Interface vs Type:** Use interfaces for object shapes, types for unions
- **Zod Inference:** Types derived via `z.infer<typeof X>` where schemas exist

### 27.4 Comment Standards

- **JSDoc:** For public functions
- **Inline Comments:** For complex logic only
- **TODO Comments:** Mark with `TODO:` for future work

---

## 28. Performance Optimizations

### 28.1 Implemented Optimizations

#### Bundle Size Reduction

- **Lazy Loading:** React Flow, Recharts, Model Advisor, Research Flow
- **Server Components:** PageBackground converted to server component
- **Server-only Shiki:** code highlighting runs on server (0KB client)
- **Code Splitting:** Per-route code splitting

#### Rendering Optimization

- **Memoization:** `useMemo` for expensive calculations
- **Callback Memoization:** `useCallback` for event handlers
- **Node Limiting:** Detailed view disabled for >100 layers
- **Reduced Motion:** Animations disabled on preference
- **Immutable snapshots:** telemetry flows to UI via immutable snapshots, no internal polling

#### Data Loading Optimization

- **Payload Splitting:** Model data split at server boundary
- **Selective Loading:** Only load needed data per page
- **Caching:** Module-level cache for enriched entities
- **Per-paper JSON:** Each paper file loads independently

#### Mobile Optimization

- **MiniMap Hidden:** Disabled on mobile for React Flow
- **Staggered Animations Disabled:** Better perceived mobile performance
- **Touch Targets:** 44px minimum for all interactive elements

### 28.2 Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial JS Load | ~107KB | ~90KB | ~17KB reduction |
| Search Latency | N/A | <5ms | Excellent |
| Mobile Perceived Load | Slow | Fast | ~1.7s improvement |
| Hydration Cost | High | Low | ~17KB reduction |
| Shiki Client Bundle | N/A | 0KB | Server-only |
| KaTeX Client Bundle | N/A | ~50KB lazy | Conditional load |

---

## 29. Known Constraints

### 29.1 Technical Constraints

- **Static Export Only:** No API routes or server-side rendering at runtime
- **No Database:** All data stored in JSON files
- **No Authentication:** No user accounts or authentication
- **No Backend:** No server-side processing (beyond static generation)
- **Bundle Size Limits:** Heavy dependencies (React Flow, Framer Motion)

### 29.2 Scalability Constraints

- **Model Count:** Current architecture scales to 1000+ models
- **Search Performance:** O(n) complexity, may need debouncing at 5000+ models
- **Static Export:** Build time increases with more routes
- **Bundle Size:** May need code splitting at 100+ models

### 29.3 Feature Constraints

- **No Dark Mode Toggle:** Dark mode hardcoded
- **No Server-Side Auth / Sync:** Paper knowledge base is localStorage-only (cleared when browser data clears)
- **Single File Implementations:** Only `resnet50.json` implementation guide exists; schema supports more
- **No Offline Sync:** Bookmark/notes/status don't sync across devices

---

## 30. Future Extension Guidelines

### 30.1 Adding New Models

**Process:**

1. Create model JSON file in `data/models/`
2. Add summary to `data/models.json`
3. Add relationship metadata to `lib/data/relationships.ts`
4. Add search metadata to `lib/search/metadata-enrichment.ts`
5. Run `npm run validate:data`
6. Run `python nn-audit/verify_canonical_database.py`
7. Build and test

**Schema:** Follow `lib/schema/model.schema.ts`

### 30.2 Adding New Papers

**Process:**

1. Create canonical paper JSON in `data/papers/{paperId}.json` (follow `types/paper-schema.ts`)
2. Add summary entry to `data/papers.json`
3. Register paper + aliases in `lib/data-access/papers.ts` `STATIC_PAPERS_REGISTRY`
4. Add search enrichment in `lib/search/metadata-enrichment.ts`
5. Validate via `CanonicalPaperZodSchema` (runtime)

### 30.3 Adding New Training Dynamics Concepts

**Process:**

1. Add concept definition + `simulationPreset` to `data/concepts/training-dynamics.json`
2. Done! Zod validates, data access retrieves, tabs render, physics/renderers run from preset config — zero engine modifications

**Optional:** Add comparison narratives to `data/training-dynamics-rules.json` if a new connection type is introduced

### 30.4 Adding New Implementation Guides

**Process:**

1. Create `data/implementations/{modelId}.json` following `lib/schema/implementation.schema.ts`
2. The Implementation tab automatically discovers and renders it
3. Update verification metadata (last verified date, framework versions)

### 30.5 Adding New Pages

**Process:**

1. Create page in `app/` directory
2. Add navigation link to `components/layout/navbar.tsx`
3. Update sitemap if needed
4. Add route to `app/sitemap.ts`
5. Test static export compatibility

**Guidelines:**
- Use static export-compatible patterns
- Implement mobile-responsive layouts
- Add ContinueLearning component
- Sync state to URL parameters

### 30.6 Adding New Features

**Guidelines:**

- Maintain static-first architecture
- Preserve type safety
- Add accessibility features
- Test mobile responsiveness
- Document changes

### 30.7 Scaling Beyond 1000 Models

**Required Changes:**

1. **API Backend:** Replace static JSON with API
2. **Pagination:** Implement pagination for catalog
3. **Virtualization:** Add virtual scrolling for long lists
4. **Search Debouncing:** Add debouncing for search
5. **Code Splitting:** More aggressive code splitting

---

## 31. Production Readiness Status

### 31.1 Overall Assessment

**Status:** 100% Production Ready

**Quality Scores:**
- Architecture Quality: 9/10
- UI Quality: 8/10
- UX Quality: 8/10
- Code Quality: 9/10
- Scalability: 7/10
- Maintainability: 9/10
- Educational Value: 9/10

### 31.2 Verification Checklist

- ✅ **Build:** Static export successful (48/48 pages)
- ✅ **TypeScript:** 0 errors
- ✅ **ESLint:** 0 errors, 0 warnings
- ✅ **Data Validation:** 34 models passed (Zod)
- ✅ **Python Audit:** 34 models layer-math, tensor shapes, cross-repo, links verified
- ✅ **Performance:** Optimizations implemented
- ✅ **Accessibility:** Reduced motion, ARIA labels, KaTeX MathML
- ✅ **Mobile:** Touch targets, responsive layouts
- ✅ **Search:** 5-tier relevance engine
- ✅ **Education:** Knowledge graph, relationships, training dynamics simulator
- ✅ **Research:** Paper knowledge center + 7-zone paper details + canonical audit
- ✅ **Documentation:** Comprehensive

### 31.3 Deployment Readiness

**Deployment Options:**
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static hosting service

**Environment Variables:** None required

**Build Command:** `npm run build`

**Output Directory:** `out/`

### 31.4 Monitoring Recommendations

**Future Enhancements:**
- Add analytics (e.g., Vercel Analytics)
- Add error tracking (e.g., Sentry)
- Add performance monitoring (e.g., Web Vitals)
- Add uptime monitoring

---

## 32. Appendix

### 32.1 Model Coverage (34 Complete Models)

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

**Total layers across all models:** 8,388  
**Total parameters across all models:** ~1.23B

### 32.2 Paper Coverage (18 Research Papers)

**Canonical Paper Files (`data/papers/*.json`):**

| Paper ID | Title | Year |
|----------|-------|------|
| `lenet-1998-ieee-lecun` | Gradient-Based Learning Applied to Document Recognition | 1998 |
| `alexnet-2012-nips-krizhevsky` | ImageNet Classification with Deep Convolutional Neural Networks | 2012 |
| `vgg-2014-arxiv-simonyan` | Very Deep Convolutional Networks for Large-Scale Image Recognition | 2014 |
| `inceptionv3-2015-cvpr-szegedy` | Rethinking the Inception Architecture for Computer Vision | 2015 |
| `resnet-2015-cvpr-he` | Deep Residual Learning for Image Recognition | 2015 |
| `resnetv2-2016-eccv-he` | Identity Mappings in Deep Residual Networks | 2016 |
| `densenet-2016-cvpr-huang` | Densely Connected Convolutional Networks | 2016 |
| `xception-2016-cvpr-chollet` | Xception: Deep Learning with Depthwise Separable Convolutions | 2016 |
| `inceptionresnetv2-2016-aaai-szegedy` | Inception-v4, Inception-ResNet and the Impact of Residual Connections | 2016 |
| `mobilenetv1-2017-arxiv-howard` | MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications | 2017 |
| `nasnet-2017-cvpr-zoph` | Learning Transferable Architectures for Scalable Image Recognition | 2017 |
| `mobilenetv2-2018-cvpr-sandler` | MobileNetV2: Inverted Residuals and Linear Bottlenecks | 2018 |
| `mobilenetv3-2019-iccv-howard` | Searching for MobileNetV3 | 2019 |
| `efficientnet-2019-icml-tan` | EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks | 2019 |
| `vit-2020-iclr-dosovitskiy` | An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale | 2020 |
| `swin-2021-iccv-liu` | Swin Transformer: Hierarchical Vision Transformer using Shifted Windows | 2021 |
| `convnext-2022-cvpr-liu` | A ConvNet for the 2020s | 2022 |
| `maxvit-2022-eccv-chen` | MaxViT: Multi-Axis Vision Transformer | 2022 |

### 32.3 Evolution Timeline (9 Milestones)

**Timeline Nodes:**
1. LeNet (1998) - Foundational CNN
2. AlexNet (2012) - Deep Learning Breakthrough
3. VGG (2014) - Homogeneous Stacks
4. ResNet (2015) - Residual Learning
5. DenseNet (2016) - Dense Connectivity
6. MobileNet (2017) - Efficient Mobile CNNs
7. EfficientNet (2019) - Compound Scaling
8. ViT (2020) - Vision Transformers
9. ConvNeXt (2022) - Modern ConvNets

### 32.4 Architecture Patterns (6 Patterns)

1. **Residual** - Skip connections
2. **Dense** - Dense connectivity
3. **Depthwise** - Depthwise separable convolution
4. **Attention** - Self-attention mechanisms
5. **Compound** - Compound scaling
6. **NAS** - Neural Architecture Search

### 32.5 Training Dynamics Concepts (5 Concepts)

1. **Vanishing Gradient** — `preset-vanishing` (sequential, decay)
2. **Exploding Gradient** — `preset-exploding` (sequential, growth)
3. **Residual Connections (ResNet)** — `preset-residual` (residual, skip)
4. **Dense Connections (DenseNet)** — `preset-dense` (dense, parallel)
5. **Batch Normalization** — `preset-batchnorm` (batchnorm, normalized)

Each concept includes: title, difficulty, category, summary, problem, intuition, analogy, visualExplanation, mathematics (KaTeX), causes, symptoms, solutions, realWorldArchitectures, relatedConcepts, references, tags, and a full `simulationPreset`.

### 32.6 Audit Harness Details (`nn-audit/`)

**Pinned Framework Versions:**
- torch: 2.13.0+cpu
- torchvision: 0.28.0+cpu
- timm: 1.0.28
- transformers: 5.14.1
- tensorflow: 2.21.0
- keras: 3.15.1

**Verification Coverage:**
- Layer parameter sum: `Σ layer.parameters == totalParameters` (all 34 models)
- Tensor shape propagation: input/output dimensions layer-by-layer (all 8,388 layers)
- Cross-repository consistency: 0 discrepancies
- Link validation: HTTP checks across `link_registry.json`, `papers.json`, model files, docs
- Benchmark provenance: per-model attribution matrix (paper vs torchvision vs keras vs timm)

### 32.7 Performance Optimization History

**Phase 1 (Performance):**
- Lazy-loaded heavy components
- Disabled mobile animations
- Hidden mobile MiniMap
- Converted PageBackground to server component

**Phase 2 (Mobile UX):**
- Mobile typography scale
- 44px touch targets
- Fixed bottom navigation
- Progressive disclosure

**Phase 3 (Education):**
- Knowledge graph implementation
- Relationship metadata
- ContinueLearning component
- Difficulty badges

**Phase 4 (Search):**
- 5-tier relevance engine
- Educational metadata enrichment
- Cross-discovery mechanisms
- Search suggestions

**Phase 5 (Code Quality):**
- Data access standardization
- Dead code removal
- Accessibility improvements
- Documentation creation

**Phase 6 (Training Dynamics Refactor):**
- Data-driven architecture (Phases 1-2)
- Rich telemetry (Phase 3)
- Adaptive controls + learning engine (Phase 4)
- Synchronized comparison mode (Phase 5)

**Phase 7 (Papers + Research):**
- Paper Details Specification (7-zone architecture)
- Papers Knowledge Base (local-first, bookmarks/notes/status)
- Research-Grade Canonical Audit harness (`nn-audit/`)
- Implementation code reference architecture (Shiki)

### 32.8 Technical Debt

**Identified Issues:**
- No test infrastructure in web app (Medium priority) — partially mitigated by `nn-audit/` Python suite
- No dark mode toggle (Low priority)
- No export functionality (Low priority)
- Chart accessibility (Medium priority)
- localStorage paper state doesn't sync across devices (Low priority)
- Duplicate paper metadata between `papers.json` and `papers/*.json` (Low priority — mitigated by audit)

**Status:** Non-blocking for production deployment

---

**Document Version:** 1.2  
**Last Updated:** August 2, 2026  
**Maintained By:** Development Team  
**Next Review:** As needed for major changes