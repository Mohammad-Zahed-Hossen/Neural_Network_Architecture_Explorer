'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, BookOpen, 
  ExternalLink, ListFilter, Network, Compass,
  Layers, Sparkles, X, Activity, HelpCircle, Code2
} from 'lucide-react';
import { NeuralNetworkModel, GroupedNode, GroupedEdge, LayerGroup, Layer } from '@/lib/schema/model.schema';
import { ModelImplementationData } from '@/lib/schema/implementation.schema';
import { formatShortNumber, formatAccuracy, formatMemory } from '@/lib/utils/formatters';
import LayerList from './layer-list';
import InspectorPanel from './inspector-panel';
import InspectorSheet from './inspector-sheet';
import ImplementationTab from './implementation-tab';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';
import dynamic from 'next/dynamic';
import { getModelRelationships } from '@/lib/data/relationships';
import ModelRelationshipsView from './model-relationships';

const MAX_DETAILED_NODES = 100;

// Lazy load the React Flow component for performance and bundler optimizations
const FlowCanvas = dynamic(() => import('./flow-canvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center animate-pulse border border-border/20 gap-2">
      <Network className="h-8 w-8 text-primary/40 animate-spin" />
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mounting interactive topology graph...</span>
    </div>
  ),
});

// Overview data - only the fields needed for the Overview tab
interface ModelOverview {
  id: string;
  name: string;
  fullName: string;
  description: string;
  category: string;
  colorTheme: string;
  paperYear: number;
  authors: string[];
  paperUrl: string;
  docsUrl?: string;
  totalParameters: number;
  depth: number;
  memoryUsage: number;
  totalFLOPs: number;
  top1Accuracy: number;
  top5Accuracy: number;
}

interface TabbedExplorerProps {
  overview: ModelOverview;
  layers: Layer[];
  graphData: {
    nodes: unknown[];
    edges: unknown[];
    groups: LayerGroup[];
    groupedNodes: GroupedNode[];
    groupedEdges: GroupedEdge[];
  };
  implementation?: ModelImplementationData | null;
}

export default function TabbedExplorer({ overview, layers, graphData, implementation }: TabbedExplorerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'layers' | 'topology' | 'implementation'>('overview');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const shouldReduceMotion = useReducedMotionPreference();
  const detailedNodeCount = graphData.nodes.length;
  const isDetailedViewDisabled = detailedNodeCount > MAX_DETAILED_NODES;
  const detailedPreferenceKey = `nn_showDetailedLayers:${overview.id}`;
  const helperDismissKey = `nn_topology_helper_dismissed`;

  // Initialize showDetailedLayers from localStorage (client-side only)
  const [showDetailedLayers, setShowDetailedLayers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(detailedPreferenceKey);
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return false;
  });

  // Educational quick tips helper dismissal
  const [hideTopologyTips, setHideTopologyTips] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(helperDismissKey) === 'true';
    }
    return false;
  });

  const dismissTips = () => {
    setHideTopologyTips(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(helperDismissKey, 'true');
    }
  };

  const hasVisitedTopology = activeTab === 'topology';
  const totalParams = overview.totalParameters;

  // Selected layer for inspector panel
  const selectedLayer = useMemo(() => {
    return layers.find(l => l.id === selectedLayerId) || null;
  }, [layers, selectedLayerId]);

  return (
    <div className="flex-1 flex flex-col w-full bg-background mesh-gradient relative pb-12 overflow-x-hidden">
      {/* Dynamic Background Glow Overlay matching model theme */}
      <div 
        className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[160px] pointer-events-none opacity-10 z-0"
        style={{ backgroundColor: overview.colorTheme }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6 w-full flex-1 flex flex-col gap-4 sm:gap-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/50 border border-border/30 rounded-xl px-3.5 py-1.5 transition-all shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Catalog
          </Link>
        </div>

        {/* Model Title & Description Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              {overview.name}
              <span 
                className="inline-block w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" 
                style={{ backgroundColor: overview.colorTheme }} 
              />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium italic">
              {overview.fullName}
            </p>
          </div>

          {/* 3-Card Group metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: Publication info */}
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-3 flex flex-col justify-between min-h-[90px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <div>
                <span className="text-[11px] text-[#6b7280] font-extrabold uppercase tracking-wider block mb-1">Publication Reference</span>
                <span className="text-sm font-extrabold text-slate-200 block">
                  {overview.paperYear} - {overview.authors[0]}{overview.authors.length > 1 ? ` & ${overview.authors[1]}` : ''}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold truncate block max-w-xs mt-0.5" title={overview.authors.join(', ')}>
                  By {overview.authors.slice(0, 3).join(', ')}{overview.authors.length > 3 ? ' et al.' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 items-center">
                <Link
                  href={`/papers#${overview.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors min-h-[32px]"
                >
                  View Paper Summary <BookOpen className="h-3.5 w-3.5" />
                </Link>
                <span className="text-slate-700 text-xs font-light">|</span>
                <a
                  href={overview.paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors min-h-[32px]"
                >
                  Original PDF <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: Parameters and Layers */}
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-3 flex flex-col justify-center min-h-[90px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <span className="text-[11px] text-[#6b7280] font-extrabold uppercase tracking-wider block mb-1">Complexity & Depth</span>
              <span className="text-sm font-extrabold text-slate-200 block">{formatShortNumber(overview.totalParameters)} params</span>
              <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">{overview.depth} network layers</span>
            </div>

            {/* Card 3: Accuracy and Memory */}
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-3 flex flex-col justify-center min-h-[90px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <span className="text-[11px] text-[#6b7280] font-extrabold uppercase tracking-wider block mb-1">Accuracy & Footprint</span>
              <span className="text-sm font-extrabold text-slate-200 block">{formatAccuracy(overview.top1Accuracy)} Top-1 Acc</span>
              <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">{formatMemory(overview.memoryUsage)} VRAM footprint</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900/50 border border-border/30 rounded-2xl p-1 backdrop-blur-md shrink-0 shadow-lg">
          <button
            onClick={() => setActiveTab('overview')}
            aria-label="Overview"
            className={cn(
              "flex-1 min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold rounded-xl cursor-pointer transition-all focus:outline-none border",
              activeTab === 'overview'
                ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb] hover:bg-[#020617]"
            )}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="hidden min-[380px]:inline">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            aria-label="Layers List"
            className={cn(
              "flex-1 min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold rounded-xl cursor-pointer transition-all focus:outline-none border",
              activeTab === 'layers'
                ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb] hover:bg-[#020617]"
            )}
          >
            <ListFilter className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Layers List</span>
            <span className="hidden min-[380px]:inline sm:hidden">Layers</span>
          </button>
          <button
            onClick={() => setActiveTab('topology')}
            aria-label="Topology Graph"
            className={cn(
              "flex-1 min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold rounded-xl cursor-pointer transition-all focus:outline-none border",
              activeTab === 'topology'
                ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb] hover:bg-[#020617]"
            )}
          >
            <Network className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Topology Graph</span>
            <span className="hidden min-[380px]:inline sm:hidden">Topology</span>
          </button>
          <button
            onClick={() => setActiveTab('implementation')}
            aria-label="Implementation Code"
            className={cn(
              "flex-1 min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold rounded-xl cursor-pointer transition-all focus:outline-none border",
              activeTab === 'implementation'
                ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb] hover:bg-[#020617]"
            )}
          >
            <Code2 className="h-4 w-4 shrink-0 text-cyan-400" />
            <span className="hidden sm:inline">Implementation</span>
            <span className="hidden min-[380px]:inline sm:hidden">Code</span>
          </button>
        </div>

        {/* Workspace Panels Container (Desktop standard height: 75-82vh) */}
        <div className="relative flex-1 min-h-[550px]">
          {/* Overview Panel */}
          <div className={activeTab === 'overview' ? "block" : "hidden"}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={activeTab === 'overview' ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Key Concept card */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-[#e5e7eb] tracking-tight flex items-center gap-2">
                    <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee]" />
                    Architecture Idea & Design Philosophy
                  </h2>
                  <p className="text-[11px] sm:text-sm text-[#9ca3af] leading-snug">
                    {overview.description}
                  </p>
                  <p className="text-[11px] sm:text-sm text-[#9ca3af] leading-snug">
                    This model is classified under the <strong className="text-[#e5e7eb]">{overview.category}</strong> family. 
                    It operates with a layer depth of <strong className="text-[#e5e7eb]">{overview.depth}</strong>, 
                    consuming around <strong className="text-[#e5e7eb]">{formatMemory(overview.memoryUsage)}</strong> inference RAM 
                    with a computational complexity of <strong className="text-[#e5e7eb]">{(overview.totalFLOPs / 1e9).toFixed(1)} GFLOPs</strong>.
                  </p>
                </div>

                {/* External links */}
                <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-3">
                  <h3 className="text-[11px] sm:text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider">Resources & References</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={overview.paperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#1f2937] bg-[#020617] hover:bg-[#0a0f1e] hover:border-[#22d3ee]/45 transition-colors font-bold text-xs"
                    >
                      <span className="text-[#9ca3af]">Read Research Publication</span>
                      <ExternalLink className="h-3.5 w-3.5 text-[#22d3ee]" />
                    </a>
                    {overview.docsUrl ? (
                      <a
                        href={overview.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[#1f2937] bg-[#020617] hover:bg-[#0a0f1e] hover:border-[#22d3ee]/45 transition-colors font-bold text-xs"
                      >
                        <span className="text-[#9ca3af]">Keras API Documentation</span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#22d3ee]" />
                      </a>
                    ) : (
                      <span className="flex items-center justify-center p-3.5 rounded-xl border border-[#1f2937] bg-[#020617] text-xs italic">
                        <span className="text-slate-500">Documentation unavailable</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Architectural Metrics sidebar */}
              <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
                <h3 className="text-[11px] sm:text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider border-b border-[#1f2937] pb-2">Hardware & Accuracy Benchmarks</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#6b7280]">Top-1 ImageNet Accuracy</span>
                      <span className="text-[#e5e7eb] font-bold">{formatAccuracy(overview.top1Accuracy)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1f2937] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overview.top1Accuracy * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#6b7280]">Top-5 ImageNet Accuracy</span>
                      <span className="text-[#e5e7eb] font-bold">{formatAccuracy(overview.top5Accuracy)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1f2937] rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${overview.top5Accuracy * 100}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1f2937] grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#6b7280] font-bold uppercase text-[9px] tracking-wider block">Parameters size</span>
                      <span className="text-sm font-extrabold text-[#e5e7eb] mt-0.5 block">{formatShortNumber(overview.totalParameters)}</span>
                    </div>
                    <div>
                      <span className="text-[#6b7280] font-bold uppercase text-[9px] tracking-wider block">Inference Ram</span>
                      <span className="text-sm font-extrabold text-[#e5e7eb] mt-0.5 block">{formatMemory(overview.memoryUsage)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Model Relationships */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={activeTab === 'overview' ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: 0.1 }}
              className="mt-6"
            >
              <ModelRelationshipsView
                relationships={getModelRelationships(overview.id, { name: overview.name, category: overview.category, year: overview.paperYear })}
              />
            </motion.div>
           </div>

           {/* Layers Panel - Desktop IDE height */}
           <div className={activeTab === 'layers' ? "block" : "hidden"}>
             <motion.div 
               initial={{ opacity: 0 }}
               animate={activeTab === 'layers' ? { opacity: 1 } : {}}
               transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
               className="flex flex-col lg:flex-row gap-6 items-stretch lg:h-[calc(80vh-140px)] lg:min-h-[620px] lg:max-h-[900px]"
             >
               {/* Layers List */}
               <div className="flex-1 bg-[#020617] border border-[#1f2937] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] h-[550px] lg:h-full overflow-y-auto pr-1 scrollbar-thin">
                 <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-2 shrink-0">
                   <span className="text-[10px] text-[#6b7280] uppercase tracking-widest font-extrabold">
                     Layer Stack Directory ({layers.length} Total Layers)
                   </span>
                   <Link
                     href={`/concepts/receptive-field?model=${overview.id}`}
                     className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-blue-300 transition-colors"
                   >
                     Visualize Receptive Field Growth <ArrowRight className="h-3 w-3" />
                   </Link>
                 </div>
                 <LayerList
                   layers={layers}
                   selectedLayerId={selectedLayerId}
                   onSelectLayer={setSelectedLayerId}
                   groups={graphData.groups}
                 />
               </div>

               {/* Inspector panel - Desktop only (lg+) */}
               <div className="hidden lg:block w-full lg:w-[420px] lg:h-full shrink-0">
                 <InspectorPanel
                   layer={selectedLayer}
                   onClose={() => setSelectedLayerId(null)}
                   totalModelParameters={totalParams}
                 />
               </div>
             </motion.div>
             
             {/* Inspector Sheet - Mobile only (< lg) */}
             <InspectorSheet
               layer={selectedLayer}
               onClose={() => setSelectedLayerId(null)}
               totalModelParameters={totalParams}
             />
           </div>

           {/* Topology Panel - IDE workspace layout */}
           <div className={activeTab === 'topology' ? "block" : "hidden"}>
             {hasVisitedTopology && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={activeTab === 'topology' ? { opacity: 1 } : {}}
                 transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                 className="flex flex-col gap-4 lg:h-[calc(82vh-140px)] lg:min-h-[640px] lg:max-h-[920px]"
               >
                 {/* Structured Topology Context Header */}
                 <div className="bg-[#020617] border border-[#1f2937] p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-3 shrink-0">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/15 pb-3">
                     <div>
                       <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                         <Network className="h-4.5 w-4.5 text-primary" />
                         Topology Explorer
                         <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-bold uppercase">
                           {showDetailedLayers ? 'Detailed View' : 'Grouped View'}
                         </span>
                       </h2>
                       <p className="text-xs text-slate-400 font-medium mt-0.5">
                         Visual representation of tensor data flow and computational blocks through {overview.name}.
                       </p>
                     </div>

                     {/* Segmented View Control Switch */}
                     <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                       <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                         <button
                           onClick={() => {
                             setShowDetailedLayers(false);
                             localStorage.setItem(detailedPreferenceKey, 'false');
                             setSelectedLayerId(null);
                           }}
                           className={cn(
                             "px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5",
                             !showDetailedLayers 
                               ? "bg-primary text-slate-950 shadow-md" 
                               : "text-slate-400 hover:text-slate-200"
                           )}
                         >
                           <Layers className="h-3.5 w-3.5" />
                           Grouped Architecture
                         </button>
                         <button
                           disabled={isDetailedViewDisabled}
                           title={
                             isDetailedViewDisabled
                               ? `This model has ${detailedNodeCount} layers. Detailed view is disabled to maintain 60fps rendering responsiveness.`
                               : 'Switch to detailed layer execution view'
                           }
                           onClick={() => {
                             if (isDetailedViewDisabled) return;
                             setShowDetailedLayers(true);
                             localStorage.setItem(detailedPreferenceKey, 'true');
                             setSelectedLayerId(null);
                           }}
                           className={cn(
                             "px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5",
                             isDetailedViewDisabled ? "cursor-not-allowed opacity-50 text-slate-600" : "cursor-pointer",
                             showDetailedLayers 
                               ? "bg-primary text-slate-950 shadow-md" 
                               : "text-slate-400 hover:text-slate-200"
                           )}
                         >
                           <Activity className="h-3.5 w-3.5" />
                           Detailed Layer View
                         </button>
                       </div>
                       
                       <p className="text-[10px] text-slate-400 font-medium">
                         {!showDetailedLayers 
                           ? "Grouped: Shows macro architectural blocks and stage logic."
                           : "Detailed: Shows every individual layer execution step."}
                       </p>
                     </div>
                   </div>

                   {/* Compact Metadata & Visual Legend Bar */}
                   <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                     <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                       <span>Visible Nodes: <strong className="text-slate-200">{showDetailedLayers ? detailedNodeCount : graphData.groupedNodes.length}</strong></span>
                       <span className="text-slate-700">•</span>
                       <span>Edges: <strong className="text-slate-200">{graphData.groupedEdges.length}</strong></span>
                       <span className="text-slate-700">•</span>
                       <span>Depth: <strong className="text-slate-200">{overview.depth} layers</strong></span>
                     </div>

                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setShowLegend(!showLegend)}
                         className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                       >
                         <HelpCircle className="h-3 w-3 text-primary" />
                         {showLegend ? 'Hide Legend' : 'View Graph Legend'}
                       </button>
                     </div>
                   </div>

                   {/* Expandable Visual Legend */}
                   {showLegend && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="pt-2 border-t border-border/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px]"
                     >
                       <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-border/10">
                         <span className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-slate-300 font-bold">Input Stem</span>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-border/10">
                         <span className="w-2 h-2 rounded-full bg-blue-500" />
                         <span className="text-slate-300 font-bold">Convolution</span>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-border/10">
                         <span className="w-2 h-2 rounded-full bg-amber-500" />
                         <span className="text-slate-300 font-bold">Pooling Block</span>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-border/10">
                         <span className="w-2 h-2 rounded-full bg-purple-500" />
                         <span className="text-slate-300 font-bold">Dense / FC</span>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-border/10">
                         <span className="w-2 h-2 rounded-full bg-red-500" />
                         <span className="text-slate-300 font-bold">Add / Concat</span>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-border/10">
                         <span className="w-4 h-0.5 bg-slate-400" />
                         <span className="text-slate-300 font-bold">Sequential Flow</span>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-border/10">
                         <span className="w-4 h-0.5 border-t border-dashed border-purple-400" />
                         <span className="text-purple-300 font-bold">Residual Skip</span>
                       </div>
                     </motion.div>
                   )}
                 </div>

                 {/* Educational Quick Tips Helper Banner */}
                 {!hideTopologyTips && (
                   <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-transparent border border-primary/20 p-3 rounded-xl flex items-center justify-between gap-3 text-xs shrink-0">
                     <div className="flex items-center gap-2">
                       <Sparkles className="h-4 w-4 text-primary shrink-0" />
                       <span className="text-slate-200 font-semibold">
                         <strong>Tips:</strong> Click any node to inspect • Drag canvas to pan • Scroll wheel to zoom • Press <em>Fit View</em> to center.
                       </span>
                     </div>
                     <button
                       onClick={dismissTips}
                       className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
                       title="Dismiss tip"
                     >
                       <X className="h-3.5 w-3.5" />
                     </button>
                   </div>
                 )}

                 {/* Interactive Canvas & Inspector Split Workspace */}
                 <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1 min-h-[480px]">
                   {/* Flow Graph container */}
                   <div className="h-[480px] lg:h-full lg:flex-1 bg-[#020617] border border-[#1f2937] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative">
                     <FlowCanvas
                       topology={
                         showDetailedLayers
                           ? { mode: 'detailed', model: { ...overview, architecture: { layers, connections: [], groups: graphData.groups } } as unknown as NeuralNetworkModel }
                           : {
                               mode: 'grouped',
                               id: overview.id,
                               groupedNodes: graphData.groupedNodes,
                               groupedEdges: graphData.groupedEdges,
                               colorTheme: overview.colorTheme,
                             }
                       }
                       selectedLayerId={selectedLayerId}
                       onSelectLayer={setSelectedLayerId}
                     />
                   </div>

                   {/* Side inspector panel - Desktop only (lg+) */}
                   <div className="hidden lg:block w-full lg:w-[420px] lg:h-full lg:shrink-0">
                     <InspectorPanel
                       layer={selectedLayer}
                       onClose={() => setSelectedLayerId(null)}
                       totalModelParameters={totalParams}
                     />
                   </div>
                 </div>
                 
                 {/* Inspector Sheet - Mobile only (< lg) */}
                 <InspectorSheet
                   layer={selectedLayer}
                   onClose={() => setSelectedLayerId(null)}
                   totalModelParameters={totalParams}
                 />
               </motion.div>
             )}
           </div>

           {/* Implementation Panel */}
           <div className={activeTab === 'implementation' ? "block" : "hidden"}>
             <ImplementationTab
               modelId={overview.id}
               modelName={overview.name}
               paperUrl={overview.paperUrl}
               implementation={implementation ?? null}
               onNavigateToTopology={() => setActiveTab('topology')}
             />
           </div>
         </div>
       </div>
     </div>
   );
}