# Neural Network Architecture Explorer

An interactive, production-ready educational platform designed to explore and analyze deep learning Convolutional Neural Network (CNN) architectures. It features interactive topology visualization, side-by-side model comparison, an evolution timeline, a research paper knowledge center, and an automated model selection advisor.

## 🚀 Key Features

*   **30 Complete Model Architectures**: Comprehensive, layer-by-layer details (over 5,000 layers documented) with zero placeholders. Sourced from Keras Applications and validated against official papers.
*   **Interactive Topology Visualization**: Explore network graphs interactively utilizing React Flow, filtering layers dynamically.
*   **Sequential Layer list & Calculator**: Deep-dive into hyperparameters, parameter dimensions, weight/bias splits, and step-by-step mathematical calculations.
*   **Side-by-Side Model Comparison**: Compare any combination of the 30 models with dynamically generated radar charts, spec tables, and key metric cards.
*   **Model Selection Advisor**: A rule-based scoring engine (questionnaire wizard) recommending the best model fit based on your hardware, budget, and performance goals.
*   **Architecture Evolution Timeline**: Chronological journey tracing CNN development from LeNet (1998) to ConvNeXt (2022).
*   **Paper Knowledge Center**: Curated analysis of 10 classic computer vision papers detailing problems, innovations, and modern relevance.
*   **Learning Paths & Concepts**: Guided tracks and interactive conceptual explanations covering Receptive Fields, Training Dynamics, and more.

## 🛠️ Tech Stack

*   **Framework**: Next.js 16.2 (App Router) + React 19
*   **Styling**: Vanilla CSS + Tailwind CSS 4 (Custom Dark & Cyan theme)
*   **Animation**: Framer Motion
*   **Visualization & Charts**: React Flow 12, Recharts, Lucide React
*   **Language**: TypeScript

## 📁 Directory Structure

```
nn_architecture/
├── doc/                        # Project documentation
│   ├── ARCHITECTURE.md         # In-depth architectural details & schema definition
│   └── PROJECT_REPORT.md       # Comprehensive project report & inventory
├── app/                        # Next.js App Router (pages and layouts)
│   ├── page.tsx                # Main portal / Home
│   ├── catalog/                # Interactive model catalog
│   ├── compare/                # Comparative analysis dashboards
│   ├── advisor/                # Questionnaire selection engine
│   ├── evolution/              # Historical CNN timeline
│   ├── papers/                 # Research papers repository
│   └── learn/ & concepts/      # Educational tracks and lessons
├── components/                 # Reusable UI component blocks (catalog, comparison, explorer, etc.)
├── data/                       # Root JSON data store (summaries, graphs, papers, timeline config)
├── lib/                        # Type definitions, category configs, metadata, and full layer JSONs
├── scripts/                    # Python and JS helper scripts for scraping and compiling data
├── public/                     # Static diagrams and imagery
├── .env                        # Local environment variables configuration
├── .gitignore                  # Git ignore definitions
├── package.json                # Project dependencies and script definitions
└── tsconfig.json               # TypeScript configuration
```

## ⚙️ Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📦 Production Build & Export

The project uses Next.js static HTML export (`output: 'export'`). To build and export:

```bash
npm run build
```

This compiles the project and generates static HTML files in the `out/` directory, which can be deployed to any static host (GitHub Pages, Vercel, Netlify, Cloudflare Pages, S3, etc.).
