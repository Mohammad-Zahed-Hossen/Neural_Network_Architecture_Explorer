'use client';

import { useMemo, useState } from 'react';
import { 
  GraduationCap, BookOpen, Layers, Calendar, 
  Tag, AlertCircle, Link2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import papersData from '@/data/papers.json';
import modelsSummary from '@/data/models.json';

// Lazy load the React Flow component for performance and bundler optimizations
const ResearchFlow = dynamic(() => import('@/components/research-map/research-flow'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950/20 rounded-2xl flex items-center justify-center animate-pulse py-40 border border-border/10">
      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mounting Research DAG...</span>
    </div>
  ),
});

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

export default function ResearchMap() {
  const [selectedPaperId, setSelectedPaperId] = useState<string>('resnet');

  // Selected paper object
  const activePaper = useMemo(() => {
    return ALL_PAPERS.find(p => p.id === selectedPaperId) || ALL_PAPERS[0];
  }, [selectedPaperId]);

  // Model references
  const associatedModels = useMemo(() => {
    return modelsSummary.filter(m => activePaper.modelIds.includes(m.id));
  }, [activePaper]);

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24 overflow-x-hidden">
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
            <span className="text-[10px] text-slate-550 font-extrabold uppercase tracking-widest block pl-2">
              Deep Learning Lineage Graph (1998 - 2022)
            </span>

            <div className="flex-1 bg-slate-950 border border-border/25 rounded-2xl relative overflow-hidden shadow-inner flex flex-col justify-between">
              
              <div className="flex-1 min-h-[460px] relative">
                <ResearchFlow
                  selectedPaperId={selectedPaperId}
                  onSelectPaper={setSelectedPaperId}
                />
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
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border/30 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/40 hover:border-[#22d3ee]/45 transition-all cursor-pointer uppercase tracking-wider"
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
