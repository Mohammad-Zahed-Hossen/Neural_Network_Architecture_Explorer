# Neural Network Architecture Explorer
## Comprehensive Architecture & Design Specification

**Version:** 1.0  
**Date:** Architecture Phase  
**Status:** Awaiting Approval

---

## Table of Contents
1. [Product Architecture](#1-product-architecture)
2. [Folder Structure](#2-folder-structure)
3. [Data Schema Design](#3-data-schema-design)
4. [Component Hierarchy](#4-component-hierarchy)
5. [Page Architecture](#5-page-architecture)
6. [UI Wireframes & Layout Design](#6-ui-wireframes--layout-design)
7. [State Management Strategy](#7-state-management-strategy)
8. [Animation Strategy](#8-animation-strategy)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Technical Specifications](#10-technical-specifications)

---

## 1. Product Architecture

### 1.1 Application Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Neural Network Architecture Explorer                  │
│                    ─────────────────────────────────                     │
│                                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────┐    │
│  │  Home    │───▶│   Model      │───▶│ Explorer │───▶│ Compare  │    │
│  │  Page    │    │   Catalog    │    │   Page   │    │  Page    │    │
│  │          │    │  (3 Models)  │    │          │    │          │    │
│  └──────────┘    └──────────────┘    └──────────┘    └──────────┘    │
│                                         │                             │
│                                         ▼                             │
│                              ┌──────────────────┐                    │
│                              │   Layer Inspector  │                    │
│                              │   (Side Panel)     │                    │
│                              └──────────────────┘                    │
│                                         │                             │
│                                         ▼                             │
│                              ┌──────────────────┐                    │
│                              │ Parameter Calc   │                    │
│                              │ Forward Pass     │                    │
│                              └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 User Flow

```
[User Lands on Homepage]
         │
         ▼
[Model Catalog Cards: VGG16 / ResNet50 / DenseNet121]
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
   [VGG16 Page]      [ResNet50 Page]    [DenseNet121 Page]
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   [Architecture     [Layer Inspector]    [Forward Pass]
    Explorer]           (Click Layer)       (Animation)
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
              [Model Comparison Page]
               (All 3 Models Side-by-Side)
```

### 1.3 Core User Journeys

| Journey | User Action | Application Response |
|---------|-------------|----------------------|
| **Browse** | Lands on homepage | Sees 3 model cards with key stats |
| **Explore** | Clicks model card | Navigates to architecture explorer with React Flow diagram |
| **Inspect** | Clicks a layer node | Side panel opens with layer details, formulas, and educational notes |
| **Calculate** | Views layer inspector | Sees step-by-step parameter calculation with formula |
| **Animate** | Clicks "Play Forward Pass" | Animated highlight flows through layers with play/pause/reset controls |
| **Compare** | Clicks "Compare Models" | Interactive charts comparing all 3 models across metrics |

---

## 2. Folder Structure

```
neural-network-architecture-explorer/
├── app/                              # Next.js App Router (App Dir)
│   ├── layout.tsx                    # Root layout with dark theme, global providers
│   ├── page.tsx                      # Homepage (Model Catalog)
│   ├── globals.css                   # Global styles, Tailwind directives, custom CSS vars
│   │
│   ├── model/
│   │   ├── [slug]/                   # Dynamic route: /model/vgg16, /model/resnet50, /model/densenet121
│   │   │   ├── page.tsx              # Model Explorer page (React Flow + Layer Inspector + Animation)
│   │   │   └── layout.tsx            # Model page layout with side panel context
│   │
│   ├── compare/
│   │   └── page.tsx                  # Model Comparison page (interactive charts)
│   │
│   └── api/                          # Reserved for future (no API routes in MVP)
│
├── components/                       # Reusable UI Components
│   ├── ui/                           # Primitive UI components (shadcn/ui style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tooltip.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── tabs.tsx
│   │   ├── slider.tsx
│   │   └── panel.tsx                 # Collapsible side panel
│   │
│   ├── model-catalog/                # Homepage components
│   │   ├── model-card.tsx            # Individual model card with hover effects
│   │   └── model-grid.tsx            # Grid layout for model cards
│   │
│   ├── architecture-explorer/        # React Flow diagram components
│   │   ├── flow-canvas.tsx           # React Flow canvas wrapper (zoom/pan/fit-view)
│   │   ├── custom-node.tsx           # Layer node component (different styles per layer type)
│   │   ├── custom-edge.tsx           # Edge component with animated data flow
│   │   ├── node-types.ts             # Node type definitions for React Flow
│   │   ├── edge-types.ts             # Edge type definitions for React Flow
│   │   ├── flow-controls.tsx         # Custom control buttons (zoom, fit, lock)
│   │   └── mini-map.tsx              # Custom minimap styling
│   │
│   ├── layer-inspector/              # Layer detail panel components
│   │   ├── inspector-panel.tsx       # Main side panel container
│   │   ├── layer-header.tsx          # Layer type badge + name
│   │   ├── shape-display.tsx         # Input/output shape visualizer
│   │   ├── parameter-calculator.tsx  # Formula + step-by-step calculation
│   │   ├── educational-note.tsx      # Educational explanation card
│   │   └── layer-properties.tsx      # Grid of layer properties (kernel, filters, stride, padding, activation)
│   │
│   ├── forward-pass/                 # Animation components
│   │   ├── animation-controls.tsx    # Play / Pause / Reset / Speed controls
│   │   ├── progress-tracker.tsx      # Progress bar + current layer indicator
│   │   ├── data-flow-particle.tsx    # Animated dot/gradient traveling along edges
│   │   └── layer-highlight.tsx       # Glow/border animation on active layer
│   │
│   ├── model-comparison/             # Comparison page components
│   │   ├── comparison-table.tsx      # Tabular comparison of model specs
│   │   ├── comparison-chart.tsx      # Bar/radar charts using Recharts
│   │   ├── stat-card.tsx             # Individual stat highlight card
│   │   └── metric-selector.tsx       # Toggle which metrics to compare
│   │
│   └── layout/                       # Shared layout components
│       ├── navbar.tsx                # Top navigation with logo + links
│       ├── footer.tsx                # Footer with attribution
│       ├── page-header.tsx           # Page title + breadcrumb section
│       └── theme-toggle.tsx          # Dark/light mode toggle (MVP: dark mode only, but extensible)
│
├── lib/                              # Core utilities, logic, and types
│   ├── types/                        # TypeScript interfaces and types
│   │   ├── model.ts                  # Model schema types
│   │   ├── layer.ts                  # Layer schema types
│   │   ├── architecture.ts           # Architecture graph types (React Flow integration)
│   │   └── comparison.ts             # Comparison metric types
│   │
│   ├── data/                         # Static JSON data (architecture definitions)
│   │   ├── vgg16.json                # Complete VGG16 architecture definition
│   │   ├── resnet50.json             # Complete ResNet50 architecture definition
│   │   ├── densenet121.json          # Complete DenseNet121 architecture definition
│   │   └── model-metadata.ts         # Aggregated metadata array for catalog page
│   │
│   ├── utils/                        # Utility functions
│   │   ├── formatters.ts             # Number formatting (params, FLOPs, memory)
│   │   ├── calculations.ts           # Parameter calculation formulas per layer type
│   │   ├── colors.ts                 # Color schemes per layer type (for visual diagram)
│   │   └── cn.ts                     # Tailwind class merge utility (clsx + tailwind-merge)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-animation.ts          # Forward pass animation state machine
│   │   ├── use-layer-selection.ts    # Layer selection + side panel toggle
│   │   ├── use-model-data.ts         # Load and parse JSON architecture data
│   │   └── use-keyboard-shortcuts.ts # Accessibility shortcuts (space=play, esc=close panel)
│   │
│   ├── constants.ts                  # App constants (speeds, breakpoints, animation durations)
│   └── react-flow-helpers.ts         # React Flow layout algorithms, node positioning
│
├── public/                           # Static assets
│   ├── images/
│   │   ├── model-thumbnails/         # Thumbnail visuals for model cards
│   │   └── icons/                    # Custom SVG icons
│   └── diagrams/                     # Static reference diagrams (optional)
│
├── styles/                           # Additional styling (beyond Tailwind)
│   └── animations.css                # Custom keyframe animations (glow, pulse, slide-in)
│
├── next.config.js                    # Next.js config (static export for deployment)
├── tailwind.config.ts                # Tailwind config with dark theme colors
├── tsconfig.json                     # TypeScript config (strict mode)
├── package.json                      # Dependencies
└── README.md                         # Developer documentation
```

### 2.1 Key Directory Rationale

| Directory | Purpose | Why |
|---|---|---|
| `app/model/[slug]` | Dynamic routing | One route handles all 3 models, loads JSON by slug |
| `components/architecture-explorer` | React Flow encapsulation | Isolates React Flow complexity; clean separation from business logic |
| `lib/data/` | Static JSON files | No backend needed; Keras-sourced architecture data lives here |
| `lib/hooks/` | Custom hooks | Animation state machine and layer selection are complex enough to warrant dedicated hooks |
| `components/ui/` | Primitive components | Patterned after shadcn/ui for consistency and maintainability |

---

## 3. Data Schema Design

### 3.1 TypeScript Interfaces

```typescript
// ============================================================
// FILE: lib/types/model.ts
// ============================================================

export interface NeuralNetworkModel {
  id: string;                         // "vgg16", "resnet50", "densenet121"
  name: string;                       // "VGG16"
  fullName: string;                   // "Very Deep Convolutional Networks for Large-Scale Image Recognition"
  paperYear: number;                  // 2014
  authors: string[];                  // ["Karen Simonyan", "Andrew Zisserman"]
  paperUrl: string;                   // arXiv / paper link
  depth: number;                      // Number of layers with weights (e.g., 16 for VGG16)
  totalParameters: number;            // Total trainable parameters
  totalFLOPs: number;                 // Total FLOPs (approximate)
  inputShape: ImageShape;             // { channels: 3, height: 224, width: 224 }
  top1Accuracy: number;               // ImageNet top-1 accuracy
  top5Accuracy: number;               // ImageNet top-5 accuracy
  memoryUsage: number;                // Approximate inference memory (MB)
  description: string;                // Short educational summary
  architecture: Architecture;
  tags: string[];                     // ["cnn", "classification", "imagenet"]
  colorTheme: string;               // Primary color for diagram (hex)
}

export interface ImageShape {
  channels: number;
  height: number;
  width: number;
}

export interface Architecture {
  layers: Layer[];
  connections: Connection[];          // Explicit edges between layers
  groups: LayerGroup[];               // Named groups (e.g., "Conv Block 1", "Dense Block")
}

export interface LayerGroup {
  id: string;
  name: string;
  description: string;
  layerIds: string[];
  color: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'sequential' | 'skip' | 'concatenate' | 'add';  // ResNet skip, DenseNet concat
  label?: string;
}
```

```typescript
// ============================================================
// FILE: lib/types/layer.ts
// ============================================================

export type LayerType =
  | 'input'
  | 'conv2d'
  | 'batch_norm'
  | 'activation'
  | 'max_pooling2d'
  | 'average_pooling2d'
  | 'global_average_pooling2d'
  | 'flatten'
  | 'dense'
  | 'dropout'
  | 'add'               // ResNet residual add
  | 'concatenate'       // DenseNet dense concatenation
  | 'bottleneck'        // ResNet bottleneck block (composite)
  | 'dense_block'       // DenseNet dense block (composite)
  | 'transition_block'  // DenseNet transition block (composite)
  | 'output';

export interface Layer {
  id: string;                         // Unique layer ID (e.g., "conv1_1")
  type: LayerType;
  name: string;                       // Human-readable name (e.g., "Conv 1-1")
  
  // Shapes
  inputShape: TensorShape;
  outputShape: TensorShape;
  
  // Layer-specific parameters
  config: LayerConfig;
  
  // Parameters
  parameters: ParameterBreakdown;
  
  // Educational content
  educationalNote: EducationalNote;
  
  // Visual positioning (for React Flow)
  position?: Position;
  
  // Styling override
  color?: string;
  icon?: string;
}

export interface TensorShape {
  dimensions: (number | null)[];      // [batch, height, width, channels] — null for dynamic batch
  description: string;                // "224×224×3 RGB Image"
}

export type LayerConfig =
  | Conv2DConfig
  | PoolingConfig
  | DenseConfig
  | ActivationConfig
  | BatchNormConfig
  | DropoutConfig
  | InputConfig
  | AddConfig
  | ConcatenateConfig
  | BottleneckConfig;

export interface Conv2DConfig {
  filters: number;
  kernelSize: [number, number];     // [3, 3]
  strides: [number, number];          // [1, 1]
  padding: 'same' | 'valid';
  dilationRate?: [number, number];
  useBias: boolean;
  activation: ActivationFunction;
}

export interface PoolingConfig {
  poolSize: [number, number];       // [2, 2]
  strides: [number, number];          // [2, 2]
  padding: 'same' | 'valid';
}

export interface DenseConfig {
  units: number;
  activation: ActivationFunction;
  useBias: boolean;
}

export interface ActivationConfig {
  activation: ActivationFunction;
}

export interface BatchNormConfig {
  axis: number;
  momentum: number;
  epsilon: number;
}

export interface DropoutConfig {
  rate: number;
}

export interface InputConfig {
  shape: number[];                  // [224, 224, 3]
}

export interface AddConfig {
  // Residual addition — no extra params
}

export interface ConcatenateConfig {
  axis: number;
}

export interface BottleneckConfig {
  // ResNet bottleneck: 1×1 conv (reduce) → 3×3 conv → 1×1 conv (restore)
  // Stored as sub-layers or simplified
  expansion: number;                // 4 for ResNet50
  subLayers: Layer[];               // Optional: expand to individual layers
}

export type ActivationFunction =
  | 'relu'
  | 'softmax'
  | 'sigmoid'
  | 'tanh'
  | 'linear'
  | 'leaky_relu'
  | 'gelu';

export interface ParameterBreakdown {
  total: number;
  weights: number;
  biases: number;
  formula: string;                  // Human-readable formula
  calculationSteps: CalculationStep[];
}

export interface CalculationStep {
  label: string;                    // "Kernel weights"
  expression: string;               // "3 × 3 × 3 × 64"
  result: number;
  explanation: string;              // "Each of the 64 filters has a 3×3 kernel across 3 input channels"
}

export interface EducationalNote {
  summary: string;                    // One-line summary
  detailed: string;                   // Detailed educational explanation
  analogy?: string;                   // Real-world analogy for intuition
  whyItMatters: string;               // Why this layer is important
  keyTakeaway: string;                // Single key takeaway
}

export interface Position {
  x: number;
  y: number;
}
```

```typescript
// ============================================================
// FILE: lib/types/comparison.ts
// ============================================================

export interface ComparisonMetric {
  id: string;
  label: string;
  unit: string;
  format: 'number' | 'percentage' | 'bytes' | 'count';
  description: string;
}

export interface ComparisonData {
  models: ModelComparisonEntry[];
  metrics: ComparisonMetric[];
}

export interface ModelComparisonEntry {
  modelId: string;
  modelName: string;
  color: string;
  values: Record<string, number>;   // metricId -> value
}

export interface ComparisonCategory {
  id: string;
  label: string;
  metrics: string[];                // metric IDs in this category
}
```

### 3.2 JSON Data Schema (Example: VGG16)

```json
{
  "id": "vgg16",
  "name": "VGG16",
  "fullName": "Very Deep Convolutional Networks for Large-Scale Image Recognition",
  "paperYear": 2014,
  "authors": ["Karen Simonyan", "Andrew Zisserman"],
  "paperUrl": "https://arxiv.org/abs/1409.1556",
  "depth": 16,
  "totalParameters": 138357544,
  "totalFLOPs": 15300000000,
  "inputShape": { "channels": 3, "height": 224, "width": 224 },
  "top1Accuracy": 0.713,
  "top5Accuracy": 0.901,
  "memoryUsage": 528,
  "description": "VGG16 uses a simple but deep architecture with repeated 3×3 convolutions and 2×2 max pooling. Its uniform design makes it easy to understand and extend.",
  "colorTheme": "#3B82F6",
  "tags": ["cnn", "classification", "imagenet", "oxford"],
  "architecture": {
    "layers": [
      {
        "id": "input",
        "type": "input",
        "name": "Input",
        "inputShape": { "dimensions": [null, 224, 224, 3], "description": "224×224×3 RGB Image" },
        "outputShape": { "dimensions": [null, 224, 224, 3], "description": "224×224×3 RGB Image" },
        "config": { "shape": [224, 224, 3] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
          "summary": "The input is a 224×224 pixel RGB image.",
          "detailed": "The network receives a standard ImageNet-sized image with 3 color channels (Red, Green, Blue). Each pixel is normalized to a range suitable for training.",
          "analogy": "Think of this as the retina of the neural network — the raw visual information enters here.",
          "whyItMatters": "Standard input size ensures consistent feature extraction across all images.",
          "keyTakeaway": "224×224×3 is the canonical input size for many classic CNNs."
        }
      },
      {
        "id": "conv1_1",
        "type": "conv2d",
        "name": "Conv 1-1",
        "inputShape": { "dimensions": [null, 224, 224, 3], "description": "224×224×3" },
        "outputShape": { "dimensions": [null, 224, 224, 64], "description": "224×224×64" },
        "config": {
          "filters": 64,
          "kernelSize": [3, 3],
          "strides": [1, 1],
          "padding": "same",
          "useBias": true,
          "activation": "relu"
        },
        "parameters": {
          "total": 1792,
          "weights": 1728,
          "biases": 64,
          "formula": "(kernel_height × kernel_width × input_channels + bias) × output_channels",
          "calculationSteps": [
            {
              "label": "Kernel weights",
              "expression": "3 × 3 × 3 × 64",
              "result": 1728,
              "explanation": "Each of the 64 filters has a 3×3 kernel across 3 input channels"
            },
            {
              "label": "Biases",
              "expression": "1 × 64",
              "result": 64,
              "explanation": "One bias term per output filter"
            },
            {
              "label": "Total",
              "expression": "1728 + 64",
              "result": 1792,
              "explanation": "Sum of weights and biases"
            }
          ]
        },
        "educationalNote": {
          "summary": "3×3 convolution with 64 filters extracts low-level image features.",
          "detailed": "This is the first convolutional layer. It applies 64 different 3×3 filters to the input image, each learning to detect a specific low-level pattern such as horizontal edges, vertical edges, or color gradients. The 'same' padding preserves spatial dimensions.",
          "analogy": "Like having 64 different magnifying glasses, each looking for a specific simple pattern in the image.",
          "whyItMatters": "Early convolutional layers detect low-level features (edges, textures) that later layers combine into complex shapes.",
          "keyTakeaway": "First conv layers learn edges and textures; small 3×3 filters are efficient and expressive."
        }
      }
    ],
    "connections": [
      { "id": "c1", "sourceId": "input", "targetId": "conv1_1", "type": "sequential" }
    ],
    "groups": [
      {
        "id": "group1",
        "name": "Conv Block 1",
        "description": "Two 3×3 conv layers with 64 filters",
        "layerIds": ["conv1_1", "conv1_2"],
        "color": "#3B82F6"
      }
    ]
  }
}
```

### 3.3 Keras-Sourced Data Specifications

| Model | Depth | Total Parameters | FLOPs | ImageNet Top-1 | ImageNet Top-5 | Memory |
|---|---|---|---|---|---|---|
| **VGG16** | 16 | 138,357,544 | 15.3B | 71.3% | 90.1% | ~528 MB |
| **ResNet50** | 50 | 25,636,712 | 4.1B | 74.9% | 92.1% | ~98 MB |
| **DenseNet121** | 121 | 8,062,504 | 2.9B | 75.0% | 92.3% | ~31 MB |

**Note:** Architecture JSON files will be derived from Keras Applications layer specifications. Each JSON contains the complete layer-by-layer topology with accurate parameter counts, shapes, and connections.

---

## 4. Component Hierarchy

### 4.1 Component Tree (Homepage)

```
HomePage (app/page.tsx)
├── Navbar
│   ├── Logo
│   ├── NavLink: "Explore" → /model/vgg16
│   ├── NavLink: "Compare" → /compare
│   └── ThemeToggle
│
├── PageHeader
│   ├── Title: "Neural Network Architecture Explorer"
│   └── Subtitle: "Interactive visual learning platform for CNNs"
│
├── ModelGrid
│   └── ModelCard (×3)
│       ├── CardHeader
│       │   ├── ModelName (e.g., "VGG16")
│       │   └── YearBadge (e.g., "2014")
│       ├── CardBody
│       │   ├── Description
│       │   └── StatRow
│       │       ├── Stat: Depth
│       │       ├── Stat: Parameters
│       │       └── Stat: Accuracy
│       └── CardFooter
│           └── LinkButton: "Explore Architecture →"
│
└── Footer
```

### 4.2 Component Tree (Model Explorer Page)

```
ModelPage (app/model/[slug]/page.tsx)
├── Navbar
│
├── PageHeader
│   ├── BackButton → /
│   ├── ModelTitle
│   ├── ModelMeta (year, authors, paper link)
│   └── ActionButtons
│       ├── Button: "Forward Pass Animation"
│       └── Button: "Compare Models"
│
├── ModelExplorerLayout (flex container)
│   ├── ArchitectureExplorer (flex-grow, ~70% width)
│   │   ├── FlowCanvas
│   │   │   ├── ReactFlowProvider
│   │   │   │   ├── ReactFlow
│   │   │   │   │   ├── Background (grid pattern)
│   │   │   │   │   ├── MiniMap (custom styled)
│   │   │   │   │   ├── Controls (zoom, fit, lock)
│   │   │   │   │   ├── Node: InputNode
│   │   │   │   │   ├── Node: ConvNode
│   │   │   │   │   ├── Node: PoolNode
│   │   │   │   │   ├── Node: DenseNode
│   │   │   │   │   ├── Node: SkipConnectionNode (for ResNet)
│   │   │   │   │   ├── Node: ConcatenateNode (for DenseNet)
│   │   │   │   │   ├── Edge: SequentialEdge
│   │   │   │   │   └── Edge: SkipEdge (dashed, animated)
│   │   │   │   └── Panel (top-right): FlowControls
│   │   │       ├── ZoomIn/ZoomOut
│   │   │       ├── FitView
│   │   │       └── Lock/Unlock
│   │   │
│   │   └── ForwardPassOverlay (absolute overlay on canvas)
│   │       ├── DataFlowParticle (animated along edges)
│   │       └── LayerHighlight (glow on active nodes)
│   │
│   └── LayerInspectorPanel (fixed width, ~400px, collapsible)
│       ├── PanelHeader
│       │   ├── LayerTypeBadge (e.g., "CONV2D")
│       │   ├── LayerName
│       │   └── CloseButton
│       ├── PanelTabs
│       │   ├── Tab: "Overview"
│       │   ├── Tab: "Parameters"
│       │   └── Tab: "Education"
│       ├── TabContent: Overview
│       │   ├── ShapeDisplay
│       │   │   ├── InputShapeCard
│       │   │   └── OutputShapeCard
│       │   └── PropertiesGrid
│       │       ├── Property: Kernel Size
│       │       ├── Property: Filters
│       │       ├── Property: Stride
│       │       ├── Property: Padding
│       │       └── Property: Activation
│       ├── TabContent: Parameters
│       │   ├── ParameterFormula
│       │   │   └── LaTeX-style formula display
│       │   ├── CalculationSteps
│       │   │   └── StepCard (×N)
│       │   │       ├── StepLabel
│       │   │       ├── Expression
│       │   │       ├── Result
│       │   │       └── Explanation
│       │   └── TotalParametersCard
│       └── TabContent: Education
│           ├── SummaryCard
│           ├── DetailedExplanation
│           ├── AnalogyCard
│           ├── WhyItMatters
│           └── KeyTakeaway
│
├── ForwardPassControls (fixed bottom bar, visible when animation active)
│   ├── ProgressTracker
│   │   ├── ProgressBar
│   │   └── CurrentLayerLabel
│   ├── ControlButtons
│   │   ├── ResetButton
│   │   ├── PlayPauseButton
│   │   └── SpeedSlider (0.5x, 1x, 2x)
│   └── TimelineScrubber
│
└── Footer
```

### 4.3 Component Tree (Comparison Page)

```
ComparePage (app/compare/page.tsx)
├── Navbar
├── PageHeader
│   ├── Title: "Model Comparison"
│   └── Subtitle: "Compare VGG16, ResNet50, and DenseNet121"
├── ComparisonLayout
│   ├── MetricSelector (multi-select chips)
│   ├── ComparisonTable
│   │   ├── TableHeader (models as columns)
│   │   └── TableBody (metrics as rows)
│   │       ├── MetricRow: Parameters
│   │       ├── MetricRow: Depth
│   │       ├── MetricRow: FLOPs
│   │       ├── MetricRow: Skip Connections
│   │       ├── MetricRow: Top-1 Accuracy
│   │       ├── MetricRow: Top-5 Accuracy
│   │       └── MetricRow: Memory Usage
│   └── ComparisonCharts
│       ├── BarChart: Parameters
│       ├── BarChart: FLOPs
│       ├── BarChart: Accuracy
│       ├── RadarChart: Multi-metric comparison
│       └── HorizontalBarChart: Memory Usage
└── Footer
```

### 4.4 Component Responsibility Matrix

| Component | Responsibility | Receives | Emits |
|---|---|---|---|
| `ModelCard` | Display model summary | `NeuralNetworkModel` (summary) | `onSelect(modelId)` |
| `FlowCanvas` | Render React Flow diagram | `Architecture` (nodes + edges) | `onNodeClick(layerId)` |
| `CustomNode` | Render individual layer | `Layer` + `isSelected` + `isActive` | `onClick(layerId)` |
| `InspectorPanel` | Show layer details | `Layer` + `isOpen` | `onClose()` |
| `ParameterCalculator` | Compute & display formula | `ParameterBreakdown` | — |
| `AnimationControls` | Control forward pass | `AnimationState` | `onPlay()`, `onPause()`, `onReset()`, `onSpeedChange()` |
| `ComparisonChart` | Render Recharts charts | `ComparisonData` + `selectedMetrics` | `onMetricToggle(metricId)` |

---

## 5. Page Architecture

### 5.1 Route Map

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Model Catalog (homepage) |
| `/model/vgg16` | `app/model/[slug]/page.tsx` | VGG16 Explorer (dynamic route) |
| `/model/resnet50` | `app/model/[slug]/page.tsx` | ResNet50 Explorer (dynamic route) |
| `/model/densenet121` | `app/model/[slug]/page.tsx` | DenseNet121 Explorer (dynamic route) |
| `/compare` | `app/compare/page.tsx` | Model Comparison page |

### 5.2 Page Layout Specifications

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Navbar                                    │
│  [Logo]  Explore  Compare  [ThemeToggle]                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────┐  ┌──────────────────────┐   │
│  │                                  │  │  Layer Inspector      │   │
│  │   Architecture Explorer          │  │  (400px, collapsible) │   │
│  │   (React Flow Canvas)            │  │  ───────────────────  │   │
│  │                                  │  │  [Tabs]               │   │
│  │   ┌────┐   ┌────┐   ┌────┐     │  │  Overview | Params    │   │
│  │   │Inp │──▶│Conv│──▶│Pool│     │  │  ───────────────────  │   │
│  │   └────┘   └────┘   └────┘     │  │  Type: Conv2D         │   │
│  │                                  │  │  In:  [224,224,3]     │   │
│  │   Zoom / Pan / Click / Hover    │  │  Out: [224,224,64]    │   │
│  │                                  │  │  ───────────────────  │   │
│  │   ┌──────────────────┐           │  │  Formula:             │   │
│  │   │ Forward Pass     │           │  │  (3×3×3+1)×64 = 1792  │   │
│  │   │ ▶  ●━━━━━━━●  ■  │           │  │  ───────────────────  │   │
│  │   └──────────────────┘           │  │  This layer extracts  │   │
│  │                                  │  │  low-level features...│   │
│  └──────────────────────────────────┘  └──────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  [Footer]                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Responsive Breakpoints

| Breakpoint | Width | Layout Behavior |
|---|---|---|
| Mobile | < 768px | Single column, inspector becomes bottom sheet, canvas stacks above |
| Tablet | 768–1024px | Inspector collapses to 320px, canvas takes remaining width |
| Desktop | 1024–1440px | Standard split layout (canvas + 400px inspector) |
| Large Desktop | > 1440px | Wider inspector (480px), centered max-width content |

### 5.4 Page Data Flow

```
Model Page (Server Component, async)
  │
  ├─▶ Loads `params.slug` from URL
  │
  ├─▶ Imports `lib/data/[slug].json` (static import at build time)
  │
  ├─▶ Passes full model data to `ModelExplorerClient` (Client Component)
  │
  │     ModelExplorerClient (React Context Provider)
  │       │
  │       ├─▶ `ArchitectureExplorer` → React Flow (receives `Architecture`)
  │       │
  │       ├─▶ `LayerInspectorPanel` → Displays selected layer (receives `Layer` from context)
  │       │
  │       └─▶ `ForwardPassControls` → Animation state (managed via `useAnimation` hook)
  │
  └─▶ No API calls, no database queries — pure static rendering
```

---

## 6. UI Wireframes & Layout Design

### 6.1 Homepage (Model Catalog)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]  Neural Network Architecture Explorer      [Dark Mode Toggle]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                                                           │    │
│  │   Interactive Visual Learning Platform for CNN Architectures│    │
│  │                                                           │    │
│  │   Explore • Inspect • Compare • Animate                   │    │
│  │                                                           │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │                 │  │                 │  │                 │     │
│  │    [VGG16]      │  │   [ResNet50]    │  │  [DenseNet121]  │     │
│  │                 │  │                 │  │                 │     │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │     │
│  │  │           │  │  │  │  ╱───╲    │  │  │  │  ○─○─○    │  │     │
│  │  │  ▓▓▓▓▓▓   │  │  │  │  │   │   │  │  │  │  │ │ │    │  │     │
│  │  │  ▓▓▓▓▓▓   │  │  │  │  ╲───╱    │  │  │  │  ○─○─○    │  │     │
│  │  │  ▓▓▓▓▓▓   │  │  │  │  ╱───╲    │  │  │  │  │ │ │    │  │     │
│  │  │  ▓▓▓▓▓▓   │  │  │  │  ╲───╱    │  │  │  │  ○─○─○    │  │     │
│  │  │           │  │  │  │           │  │  │  │           │  │     │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │     │
│  │                 │  │                 │  │                 │     │
│  │  VGG16          │  │  ResNet50       │  │  DenseNet121    │     │
│  │  Oxford, 2014   │  │  Microsoft, 2015│  │  Facebook, 2016 │     │
│  │                 │  │                 │  │                 │     │
│  │  Depth: 16      │  │  Depth: 50      │  │  Depth: 121     │     │
│  │  Params: 138M   │  │  Params: 25.6M  │  │  Params: 8.1M   │     │
│  │  Top-1: 71.3%   │  │  Top-1: 74.9%   │  │  Top-1: 75.0%   │     │
│  │                 │  │                 │  │                 │     │
│  │  [Explore →]    │  │  [Explore →]    │  │  [Explore →]    │     │
│  │                 │  │                 │  │                 │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Built with Next.js • React Flow • Framer Motion                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Model Explorer Page (Split View)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  ← Back to Models   VGG16   [Compare]  [Forward Pass] [ThemeToggle]│
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌────────────────────────────────────────┐  ┌────────────────────────┐   │
│  │                                        │  │  Layer Inspector ▼ ✕   │   │
│  │    ┌────────┐                           │  │                        │   │
│  │    │ Input  │                           │  │  ┌──────────────────┐  │   │
│  │    │ 224×224│                           │  │  │ CONV2D           │  │   │
│  │    └───┬────┘                           │  │  │ Conv 1-1         │  │   │
│  │        │                                │  │  └──────────────────┘  │   │
│  │    ┌───▼────┐                           │  │                        │   │
│  │    │ Conv   │◄─────────────────────┐   │  │  [Overview] [Parameters] │   │
│  │    │ 64@3×3 │                      │   │  │  [Education]           │   │
│  │    └───┬────┘                      │   │  │                        │   │
│  │        │                          │   │  │  ┌──────────────────┐  │   │
│  │    ┌───▼────┐                     │   │  │  │ Input Shape      │  │   │
│  │    │ Conv   │                     │   │  │  │ 224 × 224 × 3    │  │   │
│  │    │ 64@3×3 │                     │   │  │  └──────────────────┘  │   │
│  │    └───┬────┘                     │   │  │  ┌──────────────────┐  │   │
│  │        │                          │   │  │  │ Output Shape     │  │   │
│  │    ┌───▼────┐                     │   │  │  │ 224 × 224 × 64   │  │   │
│  │    │ MaxPool│                     │   │  │  └──────────────────┘  │   │
│  │    │ 2×2    │                     │   │  │                        │   │
│  │    └───┬────┘                     │   │  │  Kernel:  3 × 3      │   │
│  │        │                          │   │  │  Filters: 64           │   │
│  │        │      ┌──────────┐       │   │  │  Stride:  1 × 1      │   │
│  │        │      │ Skip Add │◄──────┘   │  │  Padding: same         │   │
│  │        │      │ (ResNet) │           │  │  Activation: ReLU      │   │
│  │        │      └────┬─────┘           │  │                        │   │
│  │        │           │                 │  │  ──────────────────────│   │
│  │        └───────────┘                 │  │                        │   │
│  │                                      │  │  Parameters:           │   │
│  │  [+][-]  [Fit]  [Lock]              │  │  (3 × 3 × 3 + 1) × 64  │   │
│  │                                      │  │  = 1,792 parameters    │   │
│  │                                      │  │                        │   │
│  │                                      │  │  ──────────────────────│   │
│  │                                      │  │                        │   │
│  │                                      │  │  💡 This layer applies │   │
│  │                                      │  │  64 learnable 3×3      │   │
│  │                                      │  │  filters to detect     │   │
│  │                                      │  │  low-level features    │   │
│  │                                      │  │  like edges and        │   │
│  │                                      │  │  textures.             │   │
│  │                                      │  │                        │   │
│  └────────────────────────────────────────┘  └────────────────────────┘   │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │  Forward Pass:  ◀◀  ▶▶/⏸  ■  ────────────────●──────  1.5x    │     │
│  │  Input → Conv1-1 → Conv1-2 → Pool1 → Conv2-1 → ...             │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Comparison Page

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Explore  Compare  [ThemeToggle]                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Model Comparison                                                          │
│  Compare VGG16, ResNet50, and DenseNet121 side-by-side                     │
│                                                                            │
│  Show metrics: [Parameters ✓] [FLOPs ✓] [Depth ✓] [Accuracy ✓] [Memory ✓]  │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  Comparison Chart (Bar Chart)                                      │   │
│  │                                                                    │   │
│  │  140M │                                                            │   │
│  │  120M │  ████                                                      │   │
│  │  100M │  ████                                                      │   │
│  │   80M │  ████                                                      │   │
│  │   60M │  ████                                                      │   │
│  │   40M │  ████  ██                                                  │   │
│  │   20M │  ████  ██  █                                               │   │
│  │    0M │  ████  ██  █                                               │   │
│  │        ─────────────────────────────────────────────────────────── │   │
│  │         VGG16   ResNet50   DenseNet121                             │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  Metric        │  VGG16      │  ResNet50   │  DenseNet121           │   │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │  Parameters    │  138.4M     │  25.6M      │  8.1M                  │   │
│  │  Depth         │  16         │  50         │  121                   │   │
│  │  FLOPs         │  15.3B      │  4.1B       │  2.9B                  │   │
│  │  Top-1 Acc     │  71.3%      │  74.9%      │  75.0%                 │   │
│  │  Top-5 Acc     │  90.1%      │  92.1%      │  92.3%                 │   │
│  │  Memory        │  528 MB     │  98 MB      │  31 MB                 │   │
│  │  Skip Conn.    │  No         │  Yes        │  Yes (Dense)           │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  Radar Chart: Multi-dimensional Comparison                         │   │
│  │  (Accuracy vs Efficiency vs Depth vs Memory)                       │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. State Management Strategy

### 7.1 State Categories

| State Category | Examples | Management | Why |
|---|---|---|---|
| **UI State** | Inspector open/closed, active tab, zoom level | React Context + `useState` | Simple, component-local, no persistence needed |
| **Selection State** | Selected layer, selected model | React Context | Shared across multiple components (canvas + inspector + animation) |
| **Animation State** | Play/pause, current step, speed, progress | Custom hook (`useAnimation`) | Complex state machine with timing logic; isolated for reusability |
| **Data State** | Model JSON, layer definitions | Static imports / React Context | No mutations needed; data is read-only after load |
| **URL State** | Active model (`slug`), comparison params | Next.js router | Native URL sync for shareability and back-button support |

### 7.2 React Context Architecture

```typescript
// ============================================================
// FILE: lib/contexts/explorer-context.tsx
// ============================================================

interface ExplorerState {
  // Selection
  selectedLayerId: string | null;
  selectLayer: (id: string | null) => void;
  
  // Inspector panel
  isInspectorOpen: boolean;
  toggleInspector: () => void;
  closeInspector: () => void;
  
  // Animation
  animationState: 'idle' | 'playing' | 'paused' | 'completed';
  currentLayerIndex: number;
  animationSpeed: number; // 0.5, 1.0, 2.0
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  
  // Model data (immutable)
  model: NeuralNetworkModel;
}

// Context Provider wraps each model page
// No external libraries (Redux, Zustand) needed for MVP scope
```

### 7.3 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│   │  vgg16.json  │  │ resnet50.json│  │densenet121...│       │
│   └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (import at build time)
┌─────────────────────────────────────────────────────────────────┐
│                      Context Provider                           │
│              (ExplorerContextProvider)                          │
│   ┌──────────────────────────────────────────────────────┐     │
│   │  model: NeuralNetworkModel (immutable)               │     │
│   │  selectedLayerId: string | null                      │     │
│   │  isInspectorOpen: boolean                          │     │
│   │  animationState + controls                         │     │
│   └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
       │              │              │
       ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ FlowCanvas│  │Inspector │  │  Animation   │
│ (React    │  │  Panel   │  │   Controls   │
│  Flow)    │  │          │  │              │
└──────────┘  └──────────┘  └──────────────┘
       │              │              │
       └──────────────┼──────────────┘
                      ▼
         ┌────────────────────┐
         │  useAnimation Hook │
         │  (state machine)   │
         │                    │
         │  • step timing     │
         │  • progress calc   │
         │  • layer highlight │
         │    coordination    │
         └────────────────────┘
```

### 7.4 Animation State Machine

```
                    ┌──────────┐
         ┌─────────▶│  IDLE    │◀──────────┐
         │ reset    │          │             │
         │          └────┬─────┘             │
         │               │ play               │
         │               ▼                    │
         │          ┌──────────┐              │
         │    ┌────▶│ PLAYING  │────┐         │
         │    │     │          │    │ pause   │
         │    │     └────┬─────┘    │         │
         │    │          │ complete  │         │
         │    │          ▼           │         │
         │    │     ┌──────────┐     │         │
         │    └─────│ PAUSED   │◀────┘         │
         │          │          │               │
         │          └────┬─────┘               │
         │               │ complete             │
         │               ▼                      │
         │          ┌──────────┐               │
         └─────────│COMPLETED │───────────────┘
                    │          │
                    └──────────┘
```

---

## 8. Animation Strategy

### 8.1 Animation Philosophy

- **Educational, not decorative** — every animation teaches a concept
- **Smooth and performant** — 60fps target, GPU-accelerated where possible
- **Controllable** — user controls speed, play, pause, reset
- **Accessible** — `prefers-reduced-motion` respected globally

### 8.2 Animation Inventory

| Animation | Library | Trigger | Details |
|---|---|---|---|
| **Page transitions** | Framer Motion | Route change | Fade + subtle slide (AnimatePresence) |
| **Model card hover** | Framer Motion | hover | Scale 1.02, shadow lift, stat reveal |
| **Model card entrance** | Framer Motion | mount | Staggered fade-up (index × 0.1s delay) |
| **Node hover** | CSS + Framer Motion | hover | Border glow, tooltip fade-in |
| **Node click** | Framer Motion | click | Scale pulse, selection ring |
| **Edge data flow** | CSS + React Flow | animation play | Animated gradient stroke along edge path |
| **Layer highlight** | Framer Motion | animation step | Background glow + border pulse on active node |
| **Inspector slide** | Framer Motion | select layer | Slide-in from right (x: 400 → 0) |
| **Parameter counter** | Framer Motion | tab switch | Count-up animation for parameter total |
| **Chart bars** | Recharts | mount/update | Animated grow from 0 |
| **Forward pass progress** | Framer Motion | time | Smooth progress bar + layer indicator |

### 8.3 Forward Pass Animation Specification

```typescript
// ============================================================
// FILE: lib/hooks/use-animation.ts (specification)
// ============================================================

interface AnimationConfig {
  speed: number;           // 0.5x, 1x, 2x (multiplier)
  dwellTime: number;       // ms to linger on each layer (base: 1500ms)
  transitionTime: number;  // ms for edge traversal (base: 800ms)
  easing: string;          // "easeInOutCubic"
}

// Animation sequence per layer:
// 1. [0ms] Previous layer highlight fades
// 2. [0ms] Edge particle starts traveling from prev → current
// 3. [transitionTime] Edge particle reaches current layer
// 4. [transitionTime] Current layer receives "active" glow state
// 5. [transitionTime + dwellTime] Current layer glow fades
// 6. [transitionTime + dwellTime] Next edge particle starts
//
// Total per-layer duration = dwellTime + transitionTime
// Speed multiplier adjusts both values proportionally
```

### 8.4 CSS Custom Properties for Theming

```css
/* styles/animations.css */

:root {
  /* Animation Durations */
  --anim-fast: 150ms;
  --anim-normal: 300ms;
  --anim-slow: 500ms;
  --anim-dwell: 1500ms;
  --anim-transition: 800ms;

  /* Layer Type Colors (consistent across diagrams) */
  --layer-input: #10B981;      /* emerald */
  --layer-conv: #3B82F6;       /* blue */
  --layer-pool: #F59E0B;       /* amber */
  --layer-dense: #8B5CF6;      /* violet */
  --layer-norm: #6B7280;       /* gray */
  --layer-activation: #EC4899;  /* pink */
  --layer-add: #EF4444;        /* red (skip connections) */
  --layer-concat: #06B6D4;     /* cyan (DenseNet) */
  --layer-output: #10B981;     /* emerald */

  /* Glow effects */
  --glow-conv: 0 0 20px rgba(59, 130, 246, 0.4);
  --glow-active: 0 0 30px rgba(255, 255, 255, 0.2);
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 8.5 React Flow Customization

| Element | Customization |
|---|---|
| **Nodes** | Custom SVG-based nodes with color-coded headers, shape icons, and parameter badges |
| **Edges** | `smoothstep` edges with animated stroke-dasharray for data flow; dashed edges for skip connections |
| **Background** | Subtle dot grid pattern, dark theme |
| **MiniMap** | Custom node colors matching layer types, dark background |
| **Controls** | Styled buttons matching app theme, positioned bottom-right |
| **Layout** | Custom layout algorithm (elk.js or dagre for automatic positioning) for each model topology |

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal:** Project scaffold, types, and static data

| Task | Deliverable | Effort |
|---|---|---|
| 1.1 Initialize Next.js project with TypeScript + Tailwind | `package.json`, `tsconfig.json`, `tailwind.config.ts` | 1h |
| 1.2 Configure dark mode and global CSS variables | `globals.css`, `styles/animations.css` | 2h |
| 1.3 Install dependencies: React Flow, Framer Motion, Recharts, clsx | `package.json` updated | 30m |
| 1.4 Define TypeScript interfaces (all types in `lib/types/`) | `model.ts`, `layer.ts`, `comparison.ts`, `architecture.ts` | 3h |
| 1.5 Create JSON data files for VGG16, ResNet50, DenseNet121 | `lib/data/vgg16.json`, `resnet50.json`, `densenet121.json` | 6h |
| 1.6 Build utility functions (formatters, calculations, colors) | `lib/utils/*.ts` | 2h |
| 1.7 Create `cn()` helper and base UI primitives | `lib/utils/cn.ts`, `components/ui/*.tsx` | 2h |
| **Phase 1 Total** | | **~16.5h** |

**Checkpoint:** All types compile, all JSON data loads, UI primitives render correctly.

---

### Phase 2: Model Catalog & Navigation (Week 1–2)
**Goal:** Homepage with model cards and routing

| Task | Deliverable | Effort |
|---|---|---|
| 2.1 Build Navbar component | `components/layout/navbar.tsx` | 1h |
| 2.2 Build PageHeader component | `components/layout/page-header.tsx` | 30m |
| 2.3 Build ModelCard with stats and hover animation | `components/model-catalog/model-card.tsx` | 3h |
| 2.4 Build ModelGrid layout | `components/model-catalog/model-grid.tsx` | 1h |
| 2.5 Implement homepage (`app/page.tsx`) | Entry point with animated entrance | 2h |
| 2.6 Set up dynamic routing for model pages | `app/model/[slug]/page.tsx`, `layout.tsx` | 1h |
| 2.7 Build Footer component | `components/layout/footer.tsx` | 30m |
| 2.8 Add page transitions with Framer Motion | `AnimatePresence` in root layout | 1h |
| **Phase 2 Total** | | **~10h** |

**Checkpoint:** Homepage renders 3 cards with accurate data. Navigation to model pages works.

---

### Phase 3: Architecture Explorer (Week 2)
**Goal:** React Flow diagram with zoom, pan, and node rendering

| Task | Deliverable | Effort |
|---|---|---|
| 3.1 Build custom node types (Input, Conv, Pool, Dense, Add, Concat) | `components/architecture-explorer/custom-node.tsx` | 4h |
| 3.2 Build custom edge types (Sequential, Skip) | `components/architecture-explorer/custom-edge.tsx` | 2h |
| 3.3 Implement FlowCanvas with React Flow | `components/architecture-explorer/flow-canvas.tsx` | 3h |
| 3.4 Create layout algorithm for automatic node positioning | `lib/react-flow-helpers.ts` | 3h |
| 3.5 Add custom controls (zoom, fit, lock) | `components/architecture-explorer/flow-controls.tsx` | 1h |
| 3.6 Style minimap and background | Custom CSS / React Flow props | 1h |
| 3.7 Connect node click to layer selection context | `ExplorerContext` integration | 1h |
| **Phase 3 Total** | | **~15h** |

**Checkpoint:** Full architecture diagram renders for all 3 models. Nodes are clickable, zoom/pan works.

---

### Phase 4: Layer Inspector (Week 2–3)
**Goal:** Side panel with layer details, parameters, and educational content

| Task | Deliverable | Effort |
|---|---|---|
| 4.1 Build collapsible Panel component | `components/ui/panel.tsx` | 1h |
| 4.2 Build InspectorPanel container with tabs | `components/layer-inspector/inspector-panel.tsx` | 2h |
| 4.3 Build LayerHeader with type badge | `components/layer-inspector/layer-header.tsx` | 30m |
| 4.4 Build ShapeDisplay component (input/output shapes) | `components/layer-inspector/shape-display.tsx` | 1h |
| 4.5 Build LayerProperties grid | `components/layer-inspector/layer-properties.tsx` | 1h |
| 4.6 Build ParameterCalculator with step-by-step display | `components/layer-inspector/parameter-calculator.tsx` | 3h |
| 4.7 Build EducationalNote component with cards | `components/layer-inspector/educational-note.tsx` | 2h |
| 4.8 Wire up ExplorerContext for selection state | `lib/contexts/explorer-context.tsx` | 1h |
| 4.9 Add keyboard shortcuts (Escape, arrow keys) | `lib/hooks/use-keyboard-shortcuts.ts` | 1h |
| **Phase 4 Total** | | **~12.5h** |

**Checkpoint:** Clicking any layer opens the inspector with correct data. Parameter calculations render step-by-step. Educational notes display.

---

### Phase 5: Forward Pass Animation (Week 3)
**Goal:** Animated data flow through the network with controls

| Task | Deliverable | Effort |
|---|---|---|
| 5.1 Design `useAnimation` hook with state machine | `lib/hooks/use-animation.ts` | 3h |
| 5.2 Build AnimationControls component (play/pause/reset/speed) | `components/forward-pass/animation-controls.tsx` | 2h |
| 5.3 Build ProgressTracker component | `components/forward-pass/progress-tracker.tsx` | 1h |
| 5.4 Implement DataFlowParticle (animated edge stroke) | `components/forward-pass/data-flow-particle.tsx` | 2h |
| 5.5 Implement LayerHighlight (glow on active node) | `components/forward-pass/layer-highlight.tsx` | 1h |
| 5.6 Integrate animation with React Flow edge rendering | CSS keyframe animation on SVG edges | 2h |
| 5.7 Add timeline scrubber for seeking | Slider component with layer snapping | 2h |
| 5.8 Test all 3 models with animation | Verify timing and visual clarity | 2h |
| **Phase 5 Total** | | **~15h** |

**Checkpoint:** Play button starts animation; data flows through layers; pause and reset work; speed control adjusts timing.

---

### Phase 6: Model Comparison (Week 3–4)
**Goal:** Interactive comparison page with charts and tables

| Task | Deliverable | Effort |
|---|---|---|
| 6.1 Build comparison data aggregation logic | `lib/data/model-metadata.ts` | 1h |
| 6.2 Build ComparisonTable component | `components/model-comparison/comparison-table.tsx` | 2h |
| 6.3 Build BarChart component with Recharts | `components/model-comparison/comparison-chart.tsx` | 2h |
| 6.4 Build RadarChart for multi-metric comparison | Recharts RadarChart wrapper | 2h |
| 6.5 Build MetricSelector (toggle metrics) | `components/model-comparison/metric-selector.tsx` | 1h |
| 6.6 Build StatCard component for highlight stats | `components/model-comparison/stat-card.tsx` | 1h |
| 6.7 Implement comparison page (`app/compare/page.tsx`) | Full layout with all components | 2h |
| 6.8 Add chart animations and responsive sizing | Recharts responsive containers | 1h |
| **Phase 6 Total** | | **~12h** |

**Checkpoint:** Comparison page shows all 3 models with interactive charts. Metric toggles update views. Responsive layout works.

---

### Phase 7: Polish & Optimization (Week 4)
**Goal:** Production-ready quality, accessibility, and performance

| Task | Deliverable | Effort |
|---|---|---|
| 7.1 Add `aria-label`, `role`, and keyboard navigation to all interactive elements | Accessibility audit pass | 3h |
| 7.2 Implement `prefers-reduced-motion` across all animations | CSS media query + Framer Motion props | 1h |
| 7.3 Optimize React Flow performance (memoization, virtualization) | `React.memo`, `useMemo` on nodes | 2h |
| 7.4 Add loading states and error boundaries | `loading.tsx`, `error.tsx` (Next.js) | 1h |
| 7.5 Configure static export for deployment | `next.config.js` (output: 'export') | 30m |
| 7.6 Verify all 3 models render correctly with complete data | Data validation | 2h |
| 7.7 Add OG meta tags and SEO basics | `metadata` exports in pages | 1h |
| 7.8 Final responsive testing (mobile, tablet, desktop) | Cross-device visual pass | 2h |
| **Phase 7 Total** | | **~12.5h** |

**Checkpoint:** App passes accessibility checks, runs at 60fps, builds successfully for static export.

---

### 9.1 Estimated Timeline Summary

| Phase | Focus | Estimated Duration | Cumulative |
|---|---|---|---|
| Phase 1 | Foundation (types, data, utils) | ~16.5h | 16.5h |
| Phase 2 | Model Catalog & Navigation | ~10h | 26.5h |
| Phase 3 | Architecture Explorer | ~15h | 41.5h |
| Phase 4 | Layer Inspector | ~12.5h | 54h |
| Phase 5 | Forward Pass Animation | ~15h | 69h |
| Phase 6 | Model Comparison | ~12h | 81h |
| Phase 7 | Polish & Optimization | ~12.5h | 93.5h |
| **Total** | | **~93.5h** | |

> **Note:** These are engineering estimates. With efficient execution, this is approximately **3–4 weeks of focused development** for a single engineer, or **1–2 weeks** with parallel workstreams.

---

## 10. Technical Specifications

### 10.1 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | ^15 | Framework, App Router, static export |
| `react` | ^19 | UI library |
| `react-dom` | ^19 | React DOM renderer |
| `typescript` | ^5 | Type safety |
| `tailwindcss` | ^4 | Utility-first CSS |
| `@tailwindcss/postcss` | ^4 | PostCSS integration |
| `@xyflow/react` | ^12 | React Flow (node-based diagrams) |
| `framer-motion` | ^11 | Animations, transitions, gestures |
| `recharts` | ^2 | Charts (bar, radar, area) for comparison page |
| `clsx` | ^2 | Conditional class joining |
| `tailwind-merge` | ^2 | Tailwind class conflict resolution |
| `lucide-react` | ^0 | Icon library |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |
| `eslint` | ^9 | Linting |
| `@eslint/eslintrc` | ^3 | ESLint config |
| `postcss` | ^8 | CSS processing |

### 10.2 Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Rendering** | Static Export (`output: 'export'`) | No backend needed; deployable to any static host (Vercel, GitHub Pages, Netlify) |
| **Data Loading** | Static JSON imports | No API latency, no database, instant load; JSON files derived from Keras |
| **Diagram Library** | React Flow (`@xyflow/react`) | Industry standard for interactive node graphs; excellent zoom/pan/selection APIs |
| **Animation Library** | Framer Motion | Declarative, performant, integrates well with React; excellent for layout animations |
| **Charts** | Recharts | React-native charts, customizable, responsive, no heavy dependencies |
| **Styling** | Tailwind CSS + CSS Variables | Rapid development, consistent design system, easy dark mode theming |
| **State** | React Context + Custom Hooks | No need for Redux/Zustand at this scale; Context handles cross-component sharing |
| **Icons** | Lucide React | Clean, consistent, tree-shakeable SVG icons |
| **Font** | Inter (system / Google Fonts) | Highly legible at all sizes; standard for data-heavy UIs |

### 10.3 Performance Targets

| Metric | Target | How |
|---|---|---|
| First Contentful Paint | < 1.5s | Static export, minimal JS, preloaded JSON |
| Largest Contentful Paint | < 2.5s | Optimized images, code splitting by route |
| Time to Interactive | < 3s | Lightweight JS bundle, no heavy runtime computations |
| React Flow FPS | 60fps | `React.memo` on nodes, virtualization for large graphs |
| Animation FPS | 60fps | CSS transforms only (GPU-accelerated), avoid layout thrashing |
| Total Bundle Size | < 500KB (initial) | Code splitting, tree-shaking, dynamic imports for heavy libs |

### 10.4 Accessibility Requirements

| Requirement | Implementation |
|---|---|
| **Color Contrast** | All text meets WCAG AA (4.5:1 for normal, 3:1 for large) |
| **Keyboard Navigation** | Tab navigation through all interactive elements; arrow keys for canvas pan |
| **Screen Reader** | `aria-label` on all nodes; `role="button"` on clickable layers; live region for animation progress |
| **Reduced Motion** | `prefers-reduced-motion` disables all non-essential animations |
| **Focus Management** | Focus trap in inspector panel; focus returns to trigger on close |
| **Semantic HTML** | Proper heading hierarchy (`h1` → `h2` → `h3`), landmarks (`nav`, `main`, `footer`) |

---

## Appendix A: Keras-Derived Layer Reference

### VGG16 Topology (Simplified)

```
Input(224×224×3)
→ Conv2D(64, 3×3, relu) ×2 → MaxPool(2×2)
→ Conv2D(128, 3×3, relu) ×2 → MaxPool(2×2)
→ Conv2D(256, 3×3, relu) ×3 → MaxPool(2×2)
→ Conv2D(512, 3×3, relu) ×3 → MaxPool(2×2)
→ Conv2D(512, 3×3, relu) ×3 → MaxPool(2×2)
→ Flatten → Dense(4096, relu) → Dropout(0.5)
→ Dense(4096, relu) → Dropout(0.5)
→ Dense(1000, softmax) → Output
```

### ResNet50 Topology (Simplified)

```
Input(224×224×3) → Conv2D(64, 7×7, stride=2) → MaxPool(3×3, stride=2)
→ Stage 1: Bottleneck × 3 (64 → 64 → 256)
→ Stage 2: Bottleneck × 4 (128 → 128 → 512)  (stride=2 first)
→ Stage 3: Bottleneck × 6 (256 → 256 → 1024) (stride=2 first)
→ Stage 4: Bottleneck × 3 (512 → 512 → 2048) (stride=2 first)
→ GlobalAvgPool → Dense(1000, softmax) → Output

Bottleneck block:
  1×1 Conv (reduce) → 3×3 Conv → 1×1 Conv (restore) → Add(skip)
```

### DenseNet121 Topology (Simplified)

```
Input(224×224×3) → Conv2D(64, 7×7, stride=2) → MaxPool(3×3, stride=2)
→ Dense Block 1 (6 layers, growth_rate=32) → Transition (1×1 Conv + 2×2 AvgPool)
→ Dense Block 2 (12 layers, growth_rate=32) → Transition (1×1 Conv + 2×2 AvgPool)
→ Dense Block 3 (24 layers, growth_rate=32) → Transition (1×1 Conv + 2×2 AvgPool)
→ Dense Block 4 (16 layers, growth_rate=32)
→ GlobalAvgPool → Dense(1000, softmax) → Output

Dense block: each layer receives concatenated outputs from ALL previous layers
Transition: 1×1 conv (compression) + 2×2 average pooling
```

---

## Appendix B: Color Palette (Dark Mode)

| Role | Color | Hex | Usage |
|---|---|---|---|
| Background | Deep Slate | `#0F172A` | Page background |
| Surface | Slate 800 | `#1E293B` | Cards, panels |
| Surface Elevated | Slate 700 | `#334155` | Hover states, elevated cards |
| Primary | Blue 500 | `#3B82F6` | Primary actions, links, VGG16 theme |
| Secondary | Violet 500 | `#8B5CF6` | Secondary accents, DenseNet theme |
| Accent | Emerald 500 | `#10B981` | Success, input/output nodes, ResNet theme |
| Text Primary | Slate 100 | `#F1F5F9` | Headings, primary text |
| Text Secondary | Slate 400 | `#94A3B8` | Body text, descriptions |
| Text Muted | Slate 500 | `#64748B` | Captions, meta text |
| Border | Slate 700 | `#334155` | Dividers, borders |
| Border Hover | Slate 500 | `#64748B` | Hover borders |
| Glow Blue | Blue 400 | `#60A5FA` | Active layer glow |
| Glow Red | Red 400 | `#F87171` | Skip connection highlight |
| Glow Cyan | Cyan 400 | `#22D3EE` | DenseNet concatenation highlight |

---

## Appendix C: JSON Data Generation Plan

Each model JSON file (`vgg16.json`, `resnet50.json`, `densenet121.json`) will be hand-crafted from Keras Applications specifications with the following completeness criteria:

- [ ] Every layer with weights has accurate `inputShape`, `outputShape`, and `parameters`
- [ ] Every `conv2d` layer has `kernelSize`, `filters`, `strides`, `padding`, `activation`
- [ ] Every `dense` layer has `units`, `activation`
- [ ] Every pooling layer has `poolSize`, `strides`
- [ ] `batch_norm` layers are included (with 0 parameters or correctly counted if trainable)
- [ ] ResNet skip connections (`add`) are explicitly modeled as edges with `type: "skip"`
- [ ] DenseNet concatenations are explicitly modeled as edges with `type: "concatenate"`
- [ ] Every layer has a meaningful `educationalNote` with `summary`, `detailed`, `analogy`, `whyItMatters`, `keyTakeaway`
- [ ] Every layer with parameters has `calculationSteps` with clear `label`, `expression`, `result`, `explanation`
- [ ] Node `position` coordinates are defined for React Flow rendering
- [ ] `groups` are defined for logical grouping (e.g., "Conv Block 1", "Stage 2")

---

## Approval Checklist

Before proceeding to code generation, confirm the following:

- [ ] **Folder structure** is acceptable — any additions or removals needed?
- [ ] **TypeScript interfaces** cover all required data fields — anything missing?
- [ ] **Component hierarchy** is clear and logical — any restructuring needed?
- [ ] **Page architecture** and routing strategy is approved — any route changes?
- [ ] **UI wireframes** match the desired user experience — any layout adjustments?
- [ ] **State management** strategy is sufficient — need a library (Zustand/Redux) instead?
- [ ] **Animation strategy** is comprehensive — any additional animations desired?
- [ ] **Implementation roadmap** is realistic — adjust phase priorities or timeline?
- [ ] **Color palette** and design direction is approved — any branding changes?
- [ ] **JSON data generation** approach is acceptable — automate from Keras script?

**Please review and approve the architecture above. Once approved, I will proceed to Phase 1 (Foundation) code generation.**

---

*Document Version: 1.0*  
*Architecture Phase Complete — Awaiting Approval*
