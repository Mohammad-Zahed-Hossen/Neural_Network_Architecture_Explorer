'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitCommit, Network, Split, Scaling, Cpu, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import modelsSummary from '@/data/models.json';

interface PatternInfo {
  id: string;
  name: string;
  icon: typeof GitCommit;
  color: string;
  bgColor: string;
  borderColor: string;
  math: string;
  problem: string;
  solution: string;
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  models: string[]; // Model IDs using this pattern
}

const PATTERNS: PatternInfo[] = [
  {
    id: 'residual',
    name: 'Residual Connections (Skip Mappings)',
    icon: GitCommit,
    color: '#10b981', // emerald
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    math: 'H(x) = F(x) + x   ⇒   dH/dx = dF/dx + 1',
    problem: 'As sequential network depth exceeds 20 layers, training accuracy degrades rapidly. This is not caused by overfitting, but by optimization degradation: backpropagated gradients shrink exponentially (vanish) as they pass through dozens of weight layers, leaving early features untrained.',
    solution: 'By adding an identity skip connection that bypasses convolutional weight blocks, the inputs are added directly to outputs. Mathematically, the gradient derivative of "x" is a constant "1". Even if the weight block derivative (dF/dx) vanishes to 0, the overall gradient remains at least 1, allowing gradients to flow back unimpeded to early layers.',
    tradeoffs: {
      pros: [
        'Enables training networks containing hundreds of layers (e.g. ResNet152) without gradient blockages.',
        'Improves training convergence rates and training stability.',
        'Acts as an ensemble of shallow sub-networks, improving feature learning.'
      ],
      cons: [
        'The addition operation requires the output channel size of the weight path to exactly match the input channel size of the skip path.',
        'Requires 1x1 projection convolutions to scale dimensions when downsampling, increasing parameters.'
      ]
    },
    models: ['resnet50', 'resnet50v2', 'resnet101', 'resnet101v2', 'resnet152', 'resnet152v2', 'inceptionresnetv2', 'mobilenetv2', 'convnext']
  },
  {
    id: 'dense',
    name: 'Dense Connectivity (Feature Concatenation)',
    icon: Network,
    color: '#8b5cf6', // violet
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    math: 'x_l = H_l([x_0, x_1, ..., x_{l-1}])',
    problem: 'In traditional residual structures, feature maps are added together. This summation merges and dilutes distinct layer representations, occasionally bottlenecking information flow and forcing redundant parameter learning in deeper layers.',
    solution: 'Instead of summing features, DenseNet concatenates the output feature maps of ALL preceding layers. Every layer receives direct connections from all previous layers. This creates direct, parallel channels of information flow from the input to all deeper layers, maximizing feature reuse.',
    tradeoffs: {
      pros: [
        'Highly parameter efficient: achieves similar accuracy to ResNet with 50-60% fewer parameters.',
        'Maintains distinct feature representations at all levels, eliminating redundant feature mappings.',
        'Deep supervision: every layer has direct access to the gradient loss, stabilizing updates.'
      ],
      cons: [
        'Extremely memory intensive during training: concatenation generates wide activation maps that must be cached, leading to high GPU memory footprints.',
        'Prone to high latency on standard hardware due to constant concatenation allocations.'
      ]
    },
    models: ['densenet121', 'densenet169', 'densenet201']
  },
  {
    id: 'depthwise',
    name: 'Depthwise Separable Convolutions',
    icon: Split,
    color: '#06b6d4', // cyan
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    math: 'Cost Ratio = 1/N + 1/D²  (where D is kernel size, N is channels)',
    problem: 'Standard convolutions perform spatial filtering and channel mixing simultaneously (sweeping a 3D kernel over 3D tensors). This is computationally expensive, making deep CNNs impractical for mobile, embedded, and real-time vision applications.',
    solution: 'Splits standard convolution into two independent steps: (1) A spatial-only Depthwise Convolution (applies a single 2D kernel to each input channel separately) followed by (2) A channel-mixing Pointwise Convolution (applies 1x1 convolutions across all channels). This reduces floating-point calculations (FLOPs) by 80-90%.',
    tradeoffs: {
      pros: [
        'Drastically reduces parameters and computational FLOPs (e.g. MobileNet runs at only 4.2M params).',
        'Enables local inference on low-power CPUs, edge devices, and smartphones.',
        'Separates spatial and channel relationship learning, which can act as a regularizer.'
      ],
      cons: [
        'Slightly lower representational capacity compared to standard convolutions of equal widths.',
        'Often requires wider channel configurations to match standard CNN accuracy.'
      ]
    },
    models: ['mobilenet', 'mobilenetv2', 'mobilenetv3small', 'mobilenetv3large', 'xception', 'maxvit']
  },
  {
    id: 'compound',
    name: 'Compound Scaling',
    icon: Scaling,
    color: '#f97316', // orange
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    math: 'd = α^φ,  w = β^φ,  r = γ^φ   s.t.  α·β²·γ² ≈ 2',
    problem: 'Traditionally, models are scaled up along a single arbitrary dimension to improve accuracy: either depth (more layers), width (more channels), or resolution (larger images). However, scaling one dimension alone soon reaches diminishing returns.',
    solution: 'EfficientNet introduced Compound Scaling, proving that scaling depth, width, and resolution together in fixed, balanced proportions yields optimal performance. A baseline model (B0) is scaled using a unified compound coefficient (phi) determined through a grid search.',
    tradeoffs: {
      pros: [
        'Exceptional parameter efficiency: achieves state-of-the-art accuracy with up to 10x fewer parameters.',
        'Provides a predictable, mathematically optimal scaling path across different computing budgets.',
        'Maintains balanced receptive fields, feature counts, and input resolution scales.'
      ],
      cons: [
        'Requires finding a high-quality baseline model first (usually via NAS) for compound scaling to be effective.',
        'Larger resolutions (e.g., B7 at 600x600) require substantial GPU memory during inference.'
      ]
    },
    models: ['efficientnetb0', 'efficientnetb1', 'efficientnetb2', 'efficientnetb3', 'efficientnetb4', 'efficientnetb5', 'efficientnetb6', 'efficientnetb7']
  },
  {
    id: 'nas',
    name: 'Neural Architecture Search (NAS)',
    icon: Cpu,
    color: '#00d9ff', // bright cyan
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    math: 'Policy Gradient:  J(θ) = E_{a ~ p_θ}[R(a)]',
    problem: 'Designing neural network architectures requires immense human expertise and months of trial-and-error. Designing optimal block connectivity manually is highly limited by human intuition.',
    solution: 'Instead of manual engineering, an algorithmic controller (usually Reinforcement Learning or Evolutionary algorithms) searches a predefined space of operations to discover optimal sub-blocks (Normal and Reduction cells). These discovered cells are then stacked sequentially to build the final model.',
    tradeoffs: {
      pros: [
        'Discovers highly non-intuitive connectivity layouts that outperform human-engineered models.',
        'Can be customized to search for hardware-aware constraints (optimizing both accuracy and latency).'
      ],
      cons: [
        'Extreme computational search cost: original NAS searches required thousands of GPU-hours.',
        'Resulting cells are often highly irregular, disjointed, and difficult to optimize on custom hardware chips.'
      ]
    },
    models: ['nasnetmobile', 'nasnetlarge', 'mobilenetv3small', 'mobilenetv3large']
  },
  {
    id: 'attention',
    name: 'Self-Attention & Window Blocks',
    icon: Sparkles,
    color: '#d946ef', // fuchsia
    bgColor: 'bg-fuchsia-500/10',
    borderColor: 'border-fuchsia-500/30',
    math: 'Attention(Q,K,V) = softmax( (Q Kᵀ) / √d_k ) V',
    problem: 'Convolutions are restricted to local receptive fields (e.g. 3x3 grids), requiring many stacked layers to share context between distant pixels. This local constraint makes capturing long-range spatial correlations difficult.',
    solution: 'Replaces convolutions with Self-Attention. Images are projected to tokens (patches). Each token queries all other tokens globally to compute similarity weights, capturing global dependencies in a single step. Local Window (Swin) and sparse Grid attention limit this computation to linear complexity.',
    tradeoffs: {
      pros: [
        'Captures global semantic relationships in the very first layers.',
        'Bypasses spatial constraints, making the representation highly flexible.',
        'Scales exceptionally well with massive datasets, outperforming traditional CNNs.'
      ],
      cons: [
        'Lacks convolution\'s spatial inductive bias (translation invariance, locality), requiring large-scale pretraining to perform well.',
        'Standard global attention scales quadratically with image size ($O(H^2 W^2)$).'
      ]
    },
    models: ['vit', 'swin', 'maxvit']
  }
];

export default function ArchitecturePatterns() {
  const [selectedPattern, setSelectedPattern] = useState<string>('residual');

  const activePattern = PATTERNS.find(p => p.id === selectedPattern) || PATTERNS[0];
  const Icon = activePattern.icon;

  // Filter models summary list to only show models implementing this pattern
  const associatedModels = modelsSummary.filter(m => activePattern.models.includes(m.id));

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-[#22d3ee] z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-purple-500 z-0" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border/10 pb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Network className="h-8 w-8 text-[#22d3ee]" />
            Architecture Design Patterns Library
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-3xl leading-relaxed">
            Master the core design blocks that transfer across hundreds of deep learning networks. Shift from memorizing model names to understanding routing motifs.
          </p>
        </div>

        {/* Dynamic Pattern Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT 5-COL: Patterns Index Selector */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block pl-2">
              Select Design Pattern
            </span>

            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2.5 pb-2 lg:pb-0 scrollbar-none w-full bg-slate-950/40 border border-border/25 rounded-2xl p-2 backdrop-blur-md">
              {PATTERNS.map((p) => {
                const isActive = selectedPattern === p.id;
                const PIcon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPattern(p.id)}
                    className={`flex-shrink-0 lg:flex-shrink-1 w-[200px] lg:w-full text-left px-4 py-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-between cursor-pointer border ${
                      isActive 
                        ? 'bg-slate-900 border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.15)] text-[#22d3ee]' 
                        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div 
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-slate-950/50"
                        style={{ 
                          borderColor: isActive ? '#22d3ee' : p.borderColor,
                          color: isActive ? '#22d3ee' : p.color
                        }}
                      >
                        <PIcon className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm tracking-tight truncate">{p.name.split(' (')[0]}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'rotate-90 text-[#22d3ee]' : 'text-slate-600'} hidden lg:block`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT 8-COL: Interactive Pattern Details & SVG Block Viewer */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-6">
              
              {/* Pattern Title */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/10 pb-4">
                <span className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
                  <Icon className="h-5.5 w-5.5" style={{ color: activePattern.color }} />
                  {activePattern.name}
                </span>

                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border font-mono"
                  style={{ 
                    color: activePattern.color, 
                    borderColor: activePattern.borderColor,
                    backgroundColor: activePattern.bgColor
                  }}
                >
                  Math Pattern
                </span>
              </div>

              {/* Mathematical Equation Box */}
              <div className="bg-slate-950 border border-border/40 rounded-xl p-4 font-mono text-center text-xs sm:text-sm font-black text-primary select-all shadow-inner relative overflow-hidden group overflow-x-auto scrollbar-none">
                <div className="absolute top-1 left-2 text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">Formal Equation</div>
                <div className="py-2.5 tracking-wide text-[#22d3ee]">{activePattern.math}</div>
              </div>

              {/* Concept description boxes */}
              <div className="space-y-4 text-xs sm:text-sm font-medium">
                
                {/* Problem Box */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    What problem does this solve?
                  </span>
                  <p className="text-slate-300 leading-relaxed pl-4.5 border-l border-border/10">
                    {activePattern.problem}
                  </p>
                </div>

                {/* Solution Box */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    How does the routing solve it?
                  </span>
                  <p className="text-slate-300 leading-relaxed pl-4.5 border-l border-border/10">
                    {activePattern.solution}
                  </p>
                </div>

              </div>

              {/* SVG / Canvas Block routing Diagram */}
              <div className="border border-border/20 rounded-xl bg-slate-950 overflow-hidden min-h-[160px] flex items-center justify-center p-4 relative shadow-inner">
                <div className="absolute top-2 left-3 text-[9px] text-slate-600 font-bold uppercase tracking-widest">Routing Schema Block</div>
                
                {/* SVG Visualizer */}
                {activePattern.id === 'residual' && (
                  <svg className="w-full max-w-[400px] h-[120px]" viewBox="0 0 400 120">
                    <g transform="translate(40, 60)" stroke="#64748b" strokeWidth="2.5" fill="none">
                      {/* Identity Path */}
                      <path d="M 0,0 C 50,-50 210,-50 260,0" stroke="#10b981" strokeWidth="3" strokeDasharray="3 3"/>
                      <text x="130" y="-36" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle" stroke="none">Identity Skip Path (Gradient Superhighway)</text>
                      
                      {/* Main Conv Path */}
                      <line x1="0" y1="0" x2="60" y2="0"/>
                      <line x1="140" y1="0" x2="200" y2="0"/>
                      <line x1="200" y1="0" x2="250" y2="0"/>

                      {/* Weight layers */}
                      <rect x="60" y="-18" width="80" height="36" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>
                      <text x="100" y="4" fill="#3b82f6" fontSize="9" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle" stroke="none">Weight Block</text>

                      {/* Addition node */}
                      <circle cx="260" cy="0" r="10" fill="#0f172a" stroke="#10b981" strokeWidth="2.5"/>
                      <text x="260" y="3" fill="#10b981" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle" stroke="none">+</text>

                      {/* Outer arrows */}
                      <line x1="-30" y1="0" x2="-6" y2="0" strokeWidth="2" markerEnd="url(#arrow)"/>
                      <line x1="270" y1="0" x2="296" y2="0" strokeWidth="2" markerEnd="url(#arrow)"/>
                      
                      {/* Anchor text labels */}
                      <text x="-40" y="4" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace" stroke="none">x</text>
                      <text x="320" y="4" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace" stroke="none">F(x) + x</text>
                    </g>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b"/>
                      </marker>
                    </defs>
                  </svg>
                )}

                {activePattern.id === 'dense' && (
                  <svg className="w-full max-w-[400px] h-[120px]" viewBox="0 0 400 120">
                    <g transform="translate(30, 60)" stroke="#64748b" strokeWidth="2.5" fill="none">
                      {/* Layers */}
                      <rect x="10" y="-20" width="50" height="40" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>
                      <text x="35" y="4" fill="#3b82f6" fontSize="10" fontWeight="extrabold" stroke="none" textAnchor="middle">Layer 0</text>

                      <rect x="120" y="-20" width="50" height="40" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>
                      <text x="145" y="4" fill="#3b82f6" fontSize="10" fontWeight="extrabold" stroke="none" textAnchor="middle">Layer 1</text>

                      <rect x="230" y="-20" width="50" height="40" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>
                      <text x="255" y="4" fill="#3b82f6" fontSize="10" fontWeight="extrabold" stroke="none" textAnchor="middle">Layer 2</text>

                      {/* Sequential flow */}
                      <line x1="60" y1="0" x2="114" y2="0" markerEnd="url(#arrow)"/>
                      <line x1="170" y1="0" x2="224" y2="0" markerEnd="url(#arrow)"/>
                      <line x1="280" y1="0" x2="315" y2="0" markerEnd="url(#arrow)"/>

                      {/* Dense skip connections */}
                      <path d="M 35,-20 C 65,-45 115,-45 145,-26" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-violet)"/>
                      <path d="M 35,-20 C 100,-65 200,-65 250,-26" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-violet)"/>
                      <path d="M 145,-20 C 175,-40 220,-40 250,-26" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-violet)"/>

                      <text x="140" y="-50" fill="#8b5cf6" fontSize="8" fontWeight="bold" stroke="none" textAnchor="middle">Concatenation Channel Highway</text>
                    </g>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b"/>
                      </marker>
                      <marker id="arrow-violet" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8b5cf6"/>
                      </marker>
                    </defs>
                  </svg>
                )}

                {activePattern.id === 'depthwise' && (
                  <svg className="w-full max-w-[400px] h-[120px]" viewBox="0 0 400 120">
                    <g transform="translate(20, 60)" stroke="#64748b" strokeWidth="2" fill="none">
                      {/* Split blocks */}
                      <rect x="0" y="-22" width="100" height="44" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="2"/>
                      <text x="50" y="-4" fill="#06b6d4" fontSize="9" fontWeight="bold" stroke="none" textAnchor="middle">Depthwise Conv</text>
                      <text x="50" y="10" fill="#475569" fontSize="8" fontWeight="extrabold" stroke="none" textAnchor="middle">Spatial Only (K×K)</text>

                      <rect x="150" y="-22" width="100" height="44" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>
                      <text x="200" y="-4" fill="#3b82f6" fontSize="9" fontWeight="bold" stroke="none" textAnchor="middle">Pointwise Conv</text>
                      <text x="200" y="10" fill="#475569" fontSize="8" fontWeight="extrabold" stroke="none" textAnchor="middle">Channel Mixing (1×1)</text>

                      {/* Connectors */}
                      <line x1="-20" y1="0" x2="-6" y2="0" markerEnd="url(#arrow)"/>
                      <line x1="100" y1="0" x2="144" y2="0" markerEnd="url(#arrow)"/>
                      <line x1="250" y1="0" x2="276" y2="0" markerEnd="url(#arrow)"/>

                      <text x="125" y="-12" fill="#06b6d4" fontSize="8" fontWeight="bold" stroke="none" textAnchor="middle">Intermediate</text>
                      <text x="315" y="4" fill="#94a3b8" fontSize="9" fontWeight="bold" stroke="none">Outputs</text>
                    </g>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b"/>
                      </marker>
                    </defs>
                  </svg>
                )}

                {/* Compound Scaling Diagram */}
                {activePattern.id === 'compound' && (
                  <svg className="w-full max-w-[480px] h-[120px]" viewBox="0 0 480 120">
                    <g transform="translate(10, 15)" stroke="#64748b" strokeWidth="1.5" fill="none">
                      {/* 1. Baseline */}
                      <g transform="translate(10, 10)">
                        <rect x="0" y="20" width="40" height="30" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
                        <text x="20" y="38" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">B0 Base</text>
                        <text x="20" y="65" fill="#64748b" fontSize="7" textAnchor="middle" stroke="none" fontWeight="bold">w, d, r = 1.0</text>
                      </g>

                      {/* Plus operators and arrows */}
                      <line x1="75" y1="45" x2="95" y2="45" strokeWidth="1.5" markerEnd="url(#arrow)"/>

                      {/* 2. Width Scaling */}
                      <g transform="translate(115, 10)">
                        <rect x="0" y="20" width="70" height="30" rx="3" fill="#0f172a" stroke="#f97316" strokeWidth="1.5"/>
                        <text x="35" y="38" fill="#f97316" fontSize="8" textAnchor="middle" stroke="none">Width-Scaled</text>
                        <text x="35" y="65" fill="#64748b" fontSize="7" textAnchor="middle" stroke="none" fontWeight="bold">w = 2.0 (Channels)</text>
                      </g>

                      <line x1="205" y1="45" x2="225" y2="45" strokeWidth="1.5" markerEnd="url(#arrow)"/>

                      {/* 3. Depth Scaling */}
                      <g transform="translate(245, 10)">
                        <rect x="0" y="5" width="40" height="60" rx="3" fill="#0f172a" stroke="#f97316" strokeWidth="1.5"/>
                        <text x="20" y="38" fill="#f97316" fontSize="8" textAnchor="middle" stroke="none">Depth</text>
                        <text x="20" y="80" fill="#64748b" fontSize="7" textAnchor="middle" stroke="none" fontWeight="bold">d = 2.0 (Layers)</text>
                      </g>

                      <line x1="305" y1="45" x2="325" y2="45" strokeWidth="1.5" markerEnd="url(#arrow)"/>

                      {/* 4. Compound Scaling */}
                      <g transform="translate(345, 5)">
                        <rect x="0" y="10" width="60" height="50" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="2.5"/>
                        <text x="30" y="38" fill="#10b981" fontSize="9" fontWeight="black" textAnchor="middle" stroke="none">Compound</text>
                        <text x="30" y="75" fill="#10b981" fontSize="7" textAnchor="middle" stroke="none" fontWeight="bold">w, d, r = 1.5 (Balanced)</text>
                      </g>
                    </g>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b"/>
                      </marker>
                    </defs>
                  </svg>
                )}

                {/* Neural Architecture Search Diagram */}
                {activePattern.id === 'nas' && (
                  <svg className="w-full max-w-[400px] h-[120px]" viewBox="0 0 400 120">
                    <g transform="translate(20, 10)" stroke="#64748b" strokeWidth="2" fill="none">
                      {/* Controller */}
                      <rect x="10" y="35" width="85" height="40" rx="6" fill="#0f172a" stroke="#00d9ff" strokeWidth="2"/>
                      <text x="52.5" y="55" fill="#00d9ff" fontSize="9" fontWeight="bold" textAnchor="middle" stroke="none">Controller RNN</text>
                      <text x="52.5" y="67" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle" stroke="none">Policy θ</text>

                      {/* Sample path */}
                      <path d="M 95,45 C 130,25 180,25 215,45" stroke="#00d9ff" strokeWidth="2" markerEnd="url(#arrow-cyan)"/>
                      <text x="155" y="24" fill="#00d9ff" fontSize="7" fontWeight="bold" textAnchor="middle" stroke="none">Samples Cell Arch</text>

                      {/* Child Network / Evaluator */}
                      <rect x="225" y="35" width="85" height="40" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>
                      <text x="267.5" y="55" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle" stroke="none">Child Network</text>
                      <text x="267.5" y="67" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle" stroke="none">Train & Eval</text>

                      {/* Feedback reward path */}
                      <path d="M 225,65 C 190,85 140,85 105,65" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)"/>
                      <text x="155" y="93" fill="#10b981" fontSize="7" fontWeight="bold" textAnchor="middle" stroke="none">Reward: Validation Acc</text>
                    </g>
                    <defs>
                      <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00d9ff"/>
                      </marker>
                      <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981"/>
                      </marker>
                    </defs>
                  </svg>
                )}

                {/* Self-Attention Diagram */}
                {activePattern.id === 'attention' && (
                  <svg className="w-full max-w-[400px] h-[120px]" viewBox="0 0 400 120">
                    <g transform="translate(10, 10)" stroke="#64748b" strokeWidth="1.5" fill="none">
                      {/* Input Tokens */}
                      <rect x="10" y="45" width="55" height="30" rx="4" fill="#0f172a" stroke="#d946ef" strokeWidth="1.5"/>
                      <text x="37.5" y="63" fill="#d946ef" fontSize="9" fontWeight="bold" textAnchor="middle" stroke="none">Tokens X</text>

                      {/* Projections Q, K, V */}
                      <path d="M 65,55 L 105,25" strokeWidth="1.5" markerEnd="url(#arrow)"/>
                      <path d="M 65,60 L 105,60" strokeWidth="1.5" markerEnd="url(#arrow)"/>
                      <path d="M 65,65 L 105,95" strokeWidth="1.5" markerEnd="url(#arrow)"/>

                      <text x="120" y="28" fill="#a855f7" fontSize="9" fontWeight="black" stroke="none">Q</text>
                      <text x="120" y="63" fill="#a855f7" fontSize="9" fontWeight="black" stroke="none">K</text>
                      <text x="120" y="98" fill="#a855f7" fontSize="9" fontWeight="black" stroke="none">V</text>

                      {/* Similarity Node QK^T */}
                      <circle cx="170" cy="40" r="10" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5"/>
                      <text x="170" y="43" fill="#a855f7" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">×</text>
                      <text x="170" y="24" fill="#64748b" fontSize="7" textAnchor="middle" stroke="none" fontWeight="bold">Similarity</text>

                      {/* Lines to similarity */}
                      <line x1="130" y1="25" x2="160" y2="35" markerEnd="url(#arrow)"/>
                      <line x1="130" y1="60" x2="160" y2="45" markerEnd="url(#arrow)"/>

                      {/* Softmax */}
                      <line x1="180" y1="40" x2="215" y2="40" markerEnd="url(#arrow)"/>
                      <rect x="220" y="28" width="55" height="24" rx="4" fill="#0f172a" stroke="#d946ef" strokeWidth="1.5"/>
                      <text x="247.5" y="43" fill="#d946ef" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">Softmax</text>

                      {/* Attention multiplication with V */}
                      <circle cx="310" cy="55" r="10" fill="#0f172a" stroke="#d946ef" strokeWidth="1.5"/>
                      <text x="310" y="58" fill="#d946ef" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">×</text>

                      <line x1="275" y1="40" x2="302" y2="50" markerEnd="url(#arrow)"/>
                      <path d="M 130,95 L 300,60" markerEnd="url(#arrow)"/>
                      <text x="215" y="85" fill="#a855f7" fontSize="7" textAnchor="middle" stroke="none" fontWeight="bold">Value Path</text>

                      {/* Output */}
                      <line x1="320" y1="55" x2="355" y2="55" markerEnd="url(#arrow)"/>
                      <text x="365" y="58" fill="#94a3b8" fontSize="9" fontWeight="bold" stroke="none">Outputs</text>
                    </g>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b"/>
                      </marker>
                    </defs>
                  </svg>
                )}

                {/* Placeholders for others */}
                {!['residual', 'dense', 'depthwise', 'compound', 'nas', 'attention'].includes(activePattern.id) && (
                  <div className="flex flex-col items-center justify-center text-slate-550 select-none">
                    <Scaling className="h-10 w-10 text-slate-600 mb-2 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">{activePattern.name.split(' (')[0]} Schema Map</span>
                    <span className="text-[10px] text-slate-500 mt-1">Multi-stage composite configuration block.</span>
                  </div>
                )}
              </div>

              {/* Trade-offs splits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#020617]/50 border border-white/5 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">
                    Key Advantages
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
                    {activePattern.tradeoffs.pros.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#020617]/50 border border-white/5 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block">
                    Trade-offs & Constraints
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
                    {activePattern.tradeoffs.cons.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Linked Models list */}
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[#22d3ee]" />
                Catalog Models Employing This Pattern
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {associatedModels.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-xs text-slate-500 font-bold uppercase">
                    No models in the current catalog use this pattern directly.
                  </div>
                ) : (
                  associatedModels.map((m) => (
                    <div 
                      key={m.id}
                      className="bg-[#020617]/40 border border-border/20 rounded-xl p-3.5 hover:border-[#22d3ee]/20 transition-all flex flex-col justify-between items-start gap-3"
                    >
                      <div>
                        <span className="text-xs font-black text-slate-200 block truncate">{m.name}</span>
                        <span className="text-[9px] text-slate-500 block font-bold uppercase mt-0.5">{m.category} | {m.year}</span>
                      </div>
                      <Link
                        href={`/models/${m.id}`}
                        className="text-[10px] font-extrabold text-[#22d3ee] hover:text-blue-300 transition-colors uppercase tracking-wider flex items-center gap-1 group"
                      >
                        Explore Layer structure
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </section>
    </div>
  );
}
