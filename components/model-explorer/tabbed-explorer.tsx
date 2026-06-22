'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Layers, Cpu, Award, HardDrive, 
  ExternalLink, ListFilter, Network, Compass
} from 'lucide-react';
import { NeuralNetworkModel } from '@/lib/types/model';
import { formatShortNumber, formatAccuracy, formatMemory } from '@/lib/utils/formatters';
import LayerList from './layer-list';
import InspectorPanel from './inspector-panel';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';




// Lazy load the React Flow component for performance and bundler optimizations
const FlowCanvas = dynamic(() => import('./flow-canvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-400 bg-slate-950/20 rounded-2xl flex items-center justify-center animate-pulse border border-border/20">
      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mounting interactive topology graph...</span>
    </div>
  ),
});

interface TabbedExplorerProps {
  model: NeuralNetworkModel;
  graphData: {
    nodes: any[];
    edges: any[];
    groups: any[];
    groupedNodes: any[];
    groupedEdges: any[];
  };
}

export default function TabbedExplorer({ model, graphData }: TabbedExplorerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'layers' | 'topology'>('overview');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [showDetailedLayers, setShowDetailedLayers] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nn_showDetailedLayers');
    if (saved !== null) {
      setShowDetailedLayers(saved === 'true');
    }
  }, []);

  const layers = model.architecture.layers;
  const totalParams = model.totalParameters;

  // Selected layer for inspector panel
  const selectedLayer = useMemo(() => {
    return layers.find(l => l.id === selectedLayerId) || null;
  }, [layers, selectedLayerId]);

  // Construct a model version of graphs data with coordinates & group details
  const topologyModel = useMemo(() => {
    // If showDetailedLayers is true, we render individual nodes.
    // Else, we render grouped nodes.
    const nodes = showDetailedLayers ? graphData.nodes : graphData.groupedNodes;
    const edges = showDetailedLayers ? graphData.edges : graphData.groupedEdges;
    
    return {
      ...model,
      architecture: {
        ...model.architecture,
        layers: showDetailedLayers 
          ? layers 
          : graphData.groupedNodes.map(gn => ({
              id: gn.id,
              type: 'transition_block', // Use this type style mapping for group blocks
              name: gn.label,
              inputShape: { dimensions: [], description: '' },
              outputShape: { dimensions: [], description: '' },
              config: {},
              parameters: { total: 0, weights: 0, biases: 0, formula: '', calculationSteps: [] },
              educationalNote: {
                summary: gn.description,
                detailed: gn.description,
                whyItMatters: '',
                keyTakeaway: ''
              },
              position: gn.position,
              layerIds: gn.layerIds
            })),
        connections: edges.map(e => ({
          id: e.id,
          sourceId: e.source,
          targetId: e.target,
          type: e.type
        }))
      }
    } as unknown as NeuralNetworkModel;
  }, [model, graphData, showDetailedLayers, layers]);

  return (
    <div className="flex-1 flex flex-col w-full bg-background mesh-gradient relative pb-12">
      {/* Dynamic Background Glow Overlay matching model theme */}
      <div 
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full filter blur-[150px] pointer-events-none opacity-10 z-0"
        style={{ backgroundColor: model.colorTheme }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/50 border border-border/30 rounded-xl px-3.5 py-1.5 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Catalog
          </Link>
        </div>

        {/* Model Title & Description Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              {model.name}
              <span 
                className="inline-block w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: model.colorTheme }} 
              />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium italic">
              {model.fullName}
            </p>
          </div>

          {/* New 3-Card Group metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Publication info */}
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 flex flex-col justify-between min-h-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <div>
                <span className="text-[9px] text-[#6b7280] font-extrabold uppercase tracking-wider block mb-1">Publication Reference</span>
                <span className="text-sm font-extrabold text-slate-200 block">
                  {model.paperYear} - {model.authors[0]}{model.authors.length > 1 ? ` & ${model.authors[1]}` : ''}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold truncate block max-w-xs mt-0.5" title={model.authors.join(', ')}>
                  By {model.authors.slice(0, 3).join(', ')}{model.authors.length > 3 ? ' et al.' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                <Link
                  href={`/papers#${model.id}`}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  View Paper Summary <BookOpen className="h-3 w-3" />
                </Link>
                <span className="text-slate-700 text-xs font-light">|</span>
                <a
                  href={model.paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Original PDF <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Card 2: Parameters and Layers */}
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 flex flex-col justify-center min-h-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <span className="text-[9px] text-[#6b7280] font-extrabold uppercase tracking-wider block mb-1">Complexity & Depth</span>
              <span className="text-sm font-extrabold text-slate-200 block">{formatShortNumber(model.totalParameters)} params</span>
              <span className="text-[10px] text-slate-450 font-semibold mt-0.5 block">{model.depth} network layers</span>
            </div>

            {/* Card 3: Accuracy and Memory */}
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 flex flex-col justify-center min-h-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <span className="text-[9px] text-[#6b7280] font-extrabold uppercase tracking-wider block mb-1">Accuracy & Footprint</span>
              <span className="text-sm font-extrabold text-slate-200 block">{formatAccuracy(model.top1Accuracy)} Top-1 Acc</span>
              <span className="text-[10px] text-slate-455 font-semibold mt-0.5 block">{formatMemory(model.memoryUsage)} VRAM footprint</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900/40 border border-border/25 rounded-2xl p-1 backdrop-blur-md shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all focus:outline-none border",
              activeTab === 'overview'
                ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb] hover:bg-[#020617]"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all focus:outline-none border",
              activeTab === 'layers'
                ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb] hover:bg-[#020617]"
            )}
          >
            <ListFilter className="h-4 w-4" />
            Layers List
          </button>
          <button
            onClick={() => setActiveTab('topology')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all focus:outline-none border",
              activeTab === 'topology'
                ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb] hover:bg-[#020617]"
            )}
          >
            <Network className="h-4 w-4" />
            Topology Graph
          </button>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 min-h-[450px]">
          {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Key Concept card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
                  <h2 className="text-lg font-bold text-[#e5e7eb] tracking-tight flex items-center gap-2">
                    <Compass className="h-5 w-5 text-[#22d3ee]" />
                    Architecture Idea & Design Philosophy
                  </h2>
                  <p className="text-sm text-[#9ca3af] leading-relaxed">
                    {model.description}
                  </p>
                  <p className="text-sm text-[#9ca3af] leading-relaxed">
                    This model is classified under the <strong className="text-[#e5e7eb]">{(model as any).category || (model as any).family || 'CNN'}</strong> family. 
                    It operates with a layer depth of <strong className="text-[#e5e7eb]">{model.depth}</strong>, 

                    consuming around <strong className="text-[#e5e7eb]">{formatMemory(model.memoryUsage)}</strong> inference RAM 
                    with a computational complexity of <strong className="text-[#e5e7eb]">{(model.totalFLOPs / 1e9).toFixed(1)} GFLOPs</strong>.
                  </p>
                </div>

                {/* External links */}
                <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
                  <h3 className="text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider">Resources & References</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={model.paperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#1f2937] bg-[#020617] hover:bg-[#0a0f1e] hover:border-[#22d3ee]/45 transition-colors font-bold text-xs"
                    >
                      <span className="text-[#9ca3af]">Read Research Publication</span>
                      <ExternalLink className="h-3.5 w-3.5 text-[#22d3ee]" />
                    </a>
                    <a
                      href={`https://www.tensorflow.org/api_docs/python/tf/keras/applications/${model.name.replace(' ', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#1f2937] bg-[#020617] hover:bg-[#0a0f1e] hover:border-[#22d3ee]/45 transition-colors font-bold text-xs"
                    >
                      <span className="text-[#9ca3af]">Keras API Documentation</span>
                      <ExternalLink className="h-3.5 w-3.5 text-[#22d3ee]" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Architectural Metrics sidebar */}
              <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-6">
                <h3 className="text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider border-b border-[#1f2937] pb-2">Hardware & Accuracy Benchmarks</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#6b7280]">Top-1 ImageNet Accuracy</span>
                      <span className="text-[#e5e7eb] font-bold">{formatAccuracy(model.top1Accuracy)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1f2937] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${model.top1Accuracy * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#6b7280]">Top-5 ImageNet Accuracy</span>
                      <span className="text-[#e5e7eb] font-bold">{formatAccuracy(model.top5Accuracy)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1f2937] rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${model.top5Accuracy * 100}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1f2937] grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#6b7280] font-bold uppercase text-[9px] tracking-wider block">Parameters size</span>
                      <span className="text-sm font-extrabold text-[#e5e7eb] mt-0.5 block">{formatShortNumber(model.totalParameters)}</span>
                    </div>
                    <div>
                      <span className="text-[#6b7280] font-bold uppercase text-[9px] tracking-wider block">Inference Ram</span>
                      <span className="text-sm font-extrabold text-[#e5e7eb] mt-0.5 block">{formatMemory(model.memoryUsage)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'layers' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col lg:flex-row gap-6 items-stretch"
            >
              {/* Layers List */}
              <div className="flex-1 bg-[#020617] border border-[#1f2937] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-widest font-extrabold block mb-4 border-b border-[#1f2937] pb-2">
                  Layer Stack Directory ({layers.length} Total Layers)
                </span>
                <LayerList
                  layers={layers}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={setSelectedLayerId}
                  groups={graphData.groups}
                />
              </div>

              {/* Inspector panel */}
              <div className="w-full lg:w-[420px] shrink-0">
                <InspectorPanel
                  layer={selectedLayer}
                  onClose={() => setSelectedLayerId(null)}
                  totalModelParameters={totalParams}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'topology' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4"
            >
              {/* Controls bar */}
              <div className="flex items-center justify-between bg-[#020617] border border-[#1f2937] p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2">
                  <Network className="h-4.5 w-4.5 text-primary" />
                  <span className="text-xs font-bold text-white tracking-tight">Interactive Topology Layout</span>
                </div>
                
                {/* Node Level toggle switch */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-550 font-bold uppercase">Show detailed layers</span>
                  <button
                    onClick={() => {
                      const nextVal = !showDetailedLayers;
                      setShowDetailedLayers(nextVal);
                      localStorage.setItem('nn_showDetailedLayers', String(nextVal));
                      setSelectedLayerId(null);
                    }}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      showDetailedLayers ? "bg-primary" : "bg-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                        showDetailedLayers ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 items-stretch h-[550px]">
                {/* Flow Graph container */}
                <div className="flex-1 bg-[#020617] border border-[#1f2937] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative h-full">
                  <FlowCanvas
                    model={topologyModel}
                    selectedLayerId={selectedLayerId}
                    onSelectLayer={setSelectedLayerId}
                  />
                </div>

                {/* Side inspector panel */}
                <div className="w-full lg:w-[420px] shrink-0 h-full">
                  <InspectorPanel
                    layer={selectedLayer}
                    onClose={() => setSelectedLayerId(null)}
                    totalModelParameters={totalParams}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
