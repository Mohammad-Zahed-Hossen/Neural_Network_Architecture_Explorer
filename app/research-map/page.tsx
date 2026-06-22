'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { 
  ReactFlow, Background, Controls, MiniMap, 
  useNodesState, useEdgesState, ConnectionMode,
  ReactFlowInstance, Node, Edge, Handle, Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  BookOpen, Compass, GraduationCap, Link2, 
  Layers, Cpu, Calendar, Tag, AlertCircle, ArrowLeft, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import papersData from '@/data/papers.json';
import modelsSummary from '@/data/models.json';

// Local fallbacks for foundational papers not present in papers.json
const FOUNDATIONAL_PAPERS = [
  {
    id: "lenet",
    modelIds: ["lenet"],
    title: "Gradient-Based Learning Applied to Document Recognition",
    authors: ["Yann LeCun", "Léon Bottou", "Yoshua Bengio", "Patrick Haffner"],
    year: 1998,
    contribution: "Introduced Convolutional Neural Networks (CNNs), weight sharing, local receptive fields, and pooling layer concepts.",
    problem: "Early pattern recognition methods relied on manual feature extraction and fully connected layers which blew up parameters and ignored spatial features.",
    strengths: [
      "Pioneered convolutions and subsampling grids",
      "Successfully deployed for reading bank checks globally"
    ],
    weaknesses: [
      "Constrained by 1990s CPU compute power, limits depth to 5 layers",
      "Saturating activations (tanh/sigmoid) restricted layer backpropagation"
    ],
    legacy: "Formulated the foundational core blocks of all modern computer vision systems.",
    relevance: "Historically critical; LeNet-5 is the 'Hello World' architecture of Deep Learning.",
    paperUrl: "http://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf"
  },
  {
    id: "alexnet",
    modelIds: ["alexnet"],
    title: "ImageNet Classification with Deep Convolutional Neural Networks",
    authors: ["Alex Krizhevsky", "Ilya Sutskever", "Geoffrey E. Hinton"],
    year: 2012,
    contribution: "Pioneered GPU-accelerated deep CNN training, ReLU activations, and dropout regularization, winning ImageNet 2012.",
    problem: "Traditional computer vision algorithms stalled at ~26% error rate on ImageNet; deeper networks were too slow to train on CPUs.",
    strengths: [
      "Achieved massive 10%+ accuracy jump over shallow algorithms",
      "Popularized ReLU activation function, speeding up training 6x"
    ],
    weaknesses: [
      "Prone to overfitting (required heavy Dropout and Data Augmentation)",
      "Ad-hoc layout decisions lacked homogeneous design guidelines"
    ],
    legacy: "Sparked the modern Deep Learning and AI boom, establishing GPU acceleration as the industry standard.",
    relevance: "Pioneered the core layers (ReLU, MaxPool, Dropout, Dense) used in modern CNN training pipelines.",
    paperUrl: "https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf"
  }
];

const ALL_PAPERS = [...FOUNDATIONAL_PAPERS, ...papersData];

// Custom Paper Node Component for React Flow
function PaperNode({ data }: { data: any }) {
  const colorMap: Record<string, string> = {
    Foundational: 'border-lime-500/30 text-lime-400 bg-lime-500/[0.02]',
    VGG: 'border-blue-500/30 text-blue-400 bg-blue-500/[0.02]',
    ResNet: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.02]',
    DenseNet: 'border-violet-500/30 text-violet-400 bg-violet-500/[0.02]',
    Inception: 'border-amber-500/30 text-amber-400 bg-amber-500/[0.02]',
    Xception: 'border-pink-500/30 text-pink-400 bg-pink-500/[0.02]',
    MobileNet: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/[0.02]',
    EfficientNet: 'border-orange-500/30 text-orange-400 bg-orange-500/[0.02]',
    NASNet: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/[0.02]',
    Transformer: 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/[0.02]'
  };

  const styleClass = colorMap[data.category] || 'border-slate-700 text-slate-300 bg-slate-800/10';

  return (
    <div className={`p-3 rounded-xl border w-[190px] transition-all duration-300 glass-card bg-slate-950/90 cursor-pointer ${
      data.isSelected 
        ? 'border-[#22d3ee] ring-2 ring-[#22d3ee]/80 shadow-[0_0_12px_rgba(34,211,238,0.25)] scale-[1.02]' 
        : 'border-border/40 hover:border-slate-300/30'
    }`}>
      {/* Top Tag row */}
      <div className="flex items-center justify-between text-[8px] font-extrabold uppercase tracking-wider">
        <span className={data.isSelected ? 'text-[#22d3ee]' : styleClass.split(' ')[1]}>{data.category}</span>
        <span className="text-slate-500">{data.year}</span>
      </div>

      {/* Title */}
      <h3 className="text-xs font-black text-slate-100 truncate mt-1.5" title={data.title}>
        {data.name}
      </h3>
      <p className="text-[9px] text-slate-500 font-bold truncate mt-0.5" title={data.authors.join(', ')}>
        {data.authors[0]} et al.
      </p>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-slate-750 !border-slate-900 rounded-full" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-slate-750 !border-slate-900 rounded-full" />
    </div>
  );
}

const nodeTypes = {
  paperNode: PaperNode,
};

export default function ResearchMap() {
  const [mounted, setMounted] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('resnet');
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Selected paper object
  const activePaper = useMemo(() => {
    return ALL_PAPERS.find(p => p.id === selectedPaperId) || ALL_PAPERS[0];
  }, [selectedPaperId]);

  // Model references
  const associatedModels = useMemo(() => {
    return modelsSummary.filter(m => activePaper.modelIds.includes(m.id));
  }, [activePaper]);

  // 1. Compile DAG Nodes
  const initialNodes: Node[] = useMemo(() => {
    const layout = [
      { id: 'lenet', name: 'LeNet-5', year: 1998, category: 'Foundational', x: 260, y: 0 },
      { id: 'alexnet', name: 'AlexNet', year: 2012, category: 'Foundational', x: 260, y: 110 },
      { id: 'vgg', name: 'VGG', year: 2014, category: 'VGG', x: 110, y: 220 },
      { id: 'inception', name: 'Inception', year: 2015, category: 'Inception', x: -40, y: 330 },
      { id: 'resnet', name: 'ResNet', year: 2015, category: 'ResNet', x: 410, y: 220 },
      { id: 'resnetv2', name: 'ResNet V2', year: 2016, category: 'ResNet', x: 530, y: 330 },
      { id: 'densenet', name: 'DenseNet', year: 2016, category: 'DenseNet', x: 670, y: 330 },
      { id: 'xception', name: 'Xception', year: 2016, category: 'Xception', x: -40, y: 440 },
      { id: 'nasnet', name: 'NASNet', year: 2017, category: 'NASNet', x: 110, y: 440 },
      { id: 'mobilenet', name: 'MobileNet', year: 2017, category: 'MobileNet', x: 270, y: 330 },
      { id: 'mobilenetv3', name: 'MobileNetV3', year: 2019, category: 'MobileNet', x: 210, y: 440 },
      { id: 'efficientnet', name: 'EfficientNet', year: 2019, category: 'EfficientNet', x: 350, y: 440 },
      { id: 'vit', name: 'ViT (Transformer)', year: 2020, category: 'Transformer', x: 530, y: 550 },
      { id: 'swin', name: 'Swin Transformer', year: 2021, category: 'Transformer', x: 660, y: 660 },
      { id: 'convnext', name: 'ConvNeXt', year: 2022, category: 'Transformer', x: 350, y: 550 },
      { id: 'maxvit', name: 'MaxViT', year: 2022, category: 'Transformer', x: 500, y: 770 }
    ];

    return layout.map(node => {
      const paperObj = ALL_PAPERS.find(p => p.id === node.id);
      return {
        id: node.id,
        type: 'paperNode',
        position: { x: node.x, y: node.y },
        data: {
          id: node.id,
          name: node.name,
          title: paperObj?.title ?? '',
          authors: paperObj?.authors ?? ['Unknown'],
          year: node.year,
          category: node.category,
          isSelected: node.id === selectedPaperId
        }
      };
    });
  }, [selectedPaperId]);

  // 2. Compile DAG Edges
  const initialEdges: Edge[] = useMemo(() => {
    const connections = [
      { source: 'lenet', target: 'alexnet' },
      { source: 'alexnet', target: 'vgg' },
      { source: 'alexnet', target: 'resnet' },
      { source: 'vgg', target: 'inception' },
      { source: 'vgg', target: 'resnet' },
      { source: 'inception', target: 'xception' },
      { source: 'resnet', target: 'resnetv2' },
      { source: 'resnet', target: 'densenet' },
      { source: 'resnet', target: 'mobilenet' },
      { source: 'resnet', target: 'nasnet' },
      { source: 'mobilenet', target: 'mobilenetv3' },
      { source: 'nasnet', target: 'mobilenetv3' },
      { source: 'resnet', target: 'efficientnet' },
      { source: 'mobilenet', target: 'efficientnet' },
      { source: 'resnet', target: 'convnext' },
      { source: 'vit', target: 'swin' },
      { source: 'vit', target: 'convnext' },
      { source: 'swin', target: 'maxvit' },
      { source: 'efficientnet', target: 'maxvit' },
      { source: 'convnext', target: 'maxvit' }
    ];

    return connections.map((conn, idx) => {
      const isSourceSelected = conn.source === selectedPaperId;
      const isTargetSelected = conn.target === selectedPaperId;
      const isRelevant = isSourceSelected || isTargetSelected;

      return {
        id: `e_${conn.source}_${conn.target}_${idx}`,
        source: conn.source,
        target: conn.target,
        type: 'smoothstep',
        animated: isRelevant,
        style: {
          stroke: isRelevant ? '#22d3ee' : 'rgba(100, 116, 139, 0.25)',
          strokeWidth: isRelevant ? 2.2 : 1.2,
          transition: 'stroke 0.3s, stroke-width 0.3s'
        }
      };
    });
  }, [selectedPaperId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onInit = (instance: ReactFlowInstance) => {
    reactFlowRef.current = instance;
    setTimeout(() => {
      instance.fitView({ padding: 0.1, duration: 800 });
    }, 100);
  };

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-950/20 rounded-2xl flex items-center justify-center animate-pulse py-40">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mounting Research DAG...</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-[#22d3ee] z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-purple-500 z-0" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border/10 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="h-8 w-8 text-[#22d3ee]" />
            Architecture Evolution Research Map
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-3xl leading-relaxed">
            Trace the evolutionary lineage of deep learning backbones. Select nodes in the Directed Acyclic Graph (DAG) to inspect paper breakthroughs, core problem formulations, and modern relevance.
          </p>
        </div>

        {/* Main interactive grid workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT 7-COL: React Flow Lineage Graph */}
          <div className="lg:col-span-7 flex flex-col gap-4 min-h-[550px]">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block pl-2">
              Deep Learning Lineage Graph (1998 - 2022)
            </span>

            <div className="flex-1 bg-slate-950 border border-border/25 rounded-2xl relative overflow-hidden shadow-inner flex flex-col justify-between">
              
              <div className="flex-1 min-h-[460px] relative">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  onNodeClick={(_, node) => setSelectedPaperId(node.id)}
                  onPaneClick={() => setSelectedPaperId('resnet')}
                  onInit={onInit}
                  fitView
                  connectionMode={ConnectionMode.Loose}
                  minZoom={0.1}
                  maxZoom={1.5}
                  proOptions={{ hideAttribution: true }}
                  className="font-sans"
                >
                  <Background color="#334155" gap={20} size={1} style={{ opacity: 0.15 }} />
                  <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300" showInteractive={false} />
                  <MiniMap 
                    nodeColor="rgba(30, 41, 59, 0.8)"
                    maskColor="rgba(2, 6, 23, 0.7)"
                    className="!bg-slate-950/60 !border-slate-800/80 rounded-xl overflow-hidden"
                  />
                </ReactFlow>
              </div>

              {/* Sub-label directions */}
              <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[8px] font-extrabold text-slate-650 uppercase tracking-widest pointer-events-none z-10">
                <span>← Multi-branch & Separable</span>
                <span>Chronological Progression (Downwards) ↓</span>
                <span>Residuals & Transformers →</span>
              </div>
            </div>
          </div>

          {/* RIGHT 5-COL: Selected Paper Detailed Side-panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md flex flex-col justify-between h-full space-y-6">
              
              {/* Paper Details Header */}
              <div className="space-y-2 border-b border-border/10 pb-4">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                  <span className="text-[#22d3ee]">Selected Paper</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    {activePaper.year}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white leading-tight">
                  {activePaper.title}
                </h2>
                <p className="text-xs text-slate-500 font-bold" title={activePaper.authors.join(', ')}>
                  By {activePaper.authors.join(', ')}
                </p>
              </div>

              {/* Core Breakdown Content */}
              <div className="flex-1 space-y-4 text-xs sm:text-sm font-medium pr-1 overflow-y-auto max-h-[380px] scrollbar-thin">
                
                {/* Contribution */}
                <div className="space-y-1 bg-[#020617]/50 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-[#22d3ee] font-extrabold uppercase tracking-wider block mb-1">
                    Core Contribution
                  </span>
                  <p className="text-slate-200 leading-relaxed font-semibold">
                    {activePaper.contribution}
                  </p>
                </div>

                {/* Problem Statement */}
                <div className="space-y-1 pl-3.5 border-l border-border/10">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block flex items-center gap-1 mb-1">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    The Problem
                  </span>
                  <p className="text-slate-350 leading-relaxed">
                    {activePaper.problem}
                  </p>
                </div>

                {/* Strengths */}
                <div className="space-y-1 pl-3.5 border-l border-border/10">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block flex items-center gap-1 mb-1">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                    Key Strengths
                  </span>
                  <ul className="list-disc list-inside text-slate-350 space-y-1 leading-relaxed">
                    {activePaper.strengths.map((s, idx) => (
                      <li key={idx} className="pl-1 text-slate-300">{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Legacy */}
                <div className="space-y-1.5 pl-3.5 border-l border-border/10">
                  <span className="text-[10px] text-[#22d3ee] font-extrabold uppercase tracking-wider block">
                    Legacy & Influence
                  </span>
                  <p className="text-slate-350 leading-relaxed">
                    {activePaper.legacy}
                  </p>
                </div>

                {/* Modern Relevance */}
                <div className="space-y-1.5 pl-3.5 border-l border-border/10">
                  <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">
                    Modern Relevance
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activePaper.relevance}
                  </p>
                </div>

              </div>

              {/* Linked models & arXiv links in Footer */}
              <div className="border-t border-border/10 pt-4 space-y-3 shrink-0">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Linked Explorer Models</span>
                  <div className="flex flex-wrap gap-1.5">
                    {associatedModels.length === 0 ? (
                      <span className="text-[10px] text-slate-600 italic">No direct models mapped.</span>
                    ) : (
                      associatedModels.map((m) => (
                        <Link 
                          key={m.id}
                          href={`/models/${m.id}`}
                          className="px-2 py-1 rounded-lg text-[10px] font-extrabold text-white border border-[#22d3ee]/20 bg-[#22d3ee]/5 hover:bg-[#22d3ee] hover:text-[#020617] hover:border-[#22d3ee] transition-all cursor-pointer flex items-center gap-1 group"
                        >
                          <Layers className="h-3 w-3" />
                          {m.name}
                          <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <a 
                  href={activePaper.paperUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border/30 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/40 hover:border-[#22d3ee]/40 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Link2 className="h-3.5 w-3.5 text-[#22d3ee]" />
                  Open official PDF / arXiv
                </a>
              </div>

            </div>

          </div>

        </div>

      </section>
    </div>
  );
}

// Small inline icons helpers to avoid extra module imports
function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
