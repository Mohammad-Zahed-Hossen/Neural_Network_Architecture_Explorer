'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Cpu, Award, HardDrive, Play, Pause, ChevronUp, ChevronDown, Keyboard } from 'lucide-react';
import { NeuralNetworkModel } from '@/lib/types/model';
import { formatShortNumber, formatAccuracy, formatMemory } from '@/lib/utils/formatters';
import LayerList from './layer-list';
import InspectorPanel from './inspector-panel';
import FlowCanvas from './flow-canvas';
import { cn } from '@/lib/utils/cn';

interface ExplorerClientProps {
  model: NeuralNetworkModel;
}

export default function ExplorerClient({ model }: ExplorerClientProps) {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const layers = model.architecture.layers;
  const totalParams = model.totalParameters;

  // Find currently selected layer details
  const selectedLayer = layers.find(
    (layer) => layer.id === selectedLayerId
  ) || null;

  const selectedIndex = layers.findIndex(l => l.id === selectedLayerId);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setSelectedLayerId(prev => {
            const idx = prev ? layers.findIndex(l => l.id === prev) : -1;
            const nextIdx = Math.min(idx + 1, layers.length - 1);
            return layers[nextIdx]?.id ?? null;
          });
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedLayerId(prev => {
            const idx = prev ? layers.findIndex(l => l.id === prev) : 1;
            const nextIdx = Math.max(idx - 1, 0);
            return layers[nextIdx]?.id ?? null;
          });
          break;
        case 'Escape':
          setSelectedLayerId(null);
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'l':
          setViewMode(prev => prev === 'graph' ? 'list' : 'graph');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layers]);

  // Auto-play through layers
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setSelectedLayerId(prev => {
          const idx = prev ? layers.findIndex(l => l.id === prev) : -1;
          const nextIdx = idx + 1;
          if (nextIdx >= layers.length) {
            setIsPlaying(false);
            return layers[0]?.id ?? null;
          }
          return layers[nextIdx]?.id ?? null;
        });
      }, 1200);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, layers]);

  const handleSelectLayer = useCallback((id: string | null) => {
    setSelectedLayerId(id);
    if (isPlaying && id === null) {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return (
    <div className="flex-1 flex flex-col w-full bg-background mesh-gradient relative">
      {/* Top Background Glow Overlay matching model theme */}
      <div 
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full filter blur-[150px] pointer-events-none opacity-20 z-0"
        style={{ backgroundColor: model.colorTheme }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9ca3af] hover:text-[#e5e7eb] bg-[#020617] border border-[#1f2937] rounded-xl px-3.5 py-1.5 transition-all hover:border-[#22d3ee]/30"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Model Catalog
          </Link>

          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9ca3af] hover:text-[#e5e7eb] bg-[#020617] border border-[#1f2937] rounded-xl px-3.5 py-1.5 transition-all hover:border-[#22d3ee]/30 cursor-pointer"
          >
            <Keyboard className="h-3.5 w-3.5" />
            Shortcuts
          </button>
        </div>

        {/* Keyboard Shortcuts Tooltip */}
        {showShortcuts && (
          <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 text-xs space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#e5e7eb]">Keyboard Shortcuts</h4>
              <button onClick={() => setShowShortcuts(false)} className="text-[#6b7280] hover:text-[#e5e7eb] cursor-pointer">×</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[#9ca3af]">
              <span><kbd className="bg-[#1f2937] px-1.5 py-0.5 rounded text-[#e5e7eb] font-mono">↑</kbd> / <kbd className="bg-[#1f2937] px-1.5 py-0.5 rounded text-[#e5e7eb] font-mono">←</kbd> Previous layer</span>
              <span><kbd className="bg-[#1f2937] px-1.5 py-0.5 rounded text-[#e5e7eb] font-mono">↓</kbd> / <kbd className="bg-[#1f2937] px-1.5 py-0.5 rounded text-[#e5e7eb] font-mono">→</kbd> Next layer</span>
              <span><kbd className="bg-[#1f2937] px-1.5 py-0.5 rounded text-[#e5e7eb] font-mono">Space</kbd> Play / Pause</span>
              <span><kbd className="bg-[#1f2937] px-1.5 py-0.5 rounded text-[#e5e7eb] font-mono">L</kbd> Toggle view</span>
              <span><kbd className="bg-[#1f2937] px-1.5 py-0.5 rounded text-[#e5e7eb] font-mono">Esc</kbd> Deselect</span>
            </div>
          </div>
        )}

        {/* Model Title & Specs Header */}
        <div className="flex flex-col gap-3.5 md:flex-row md:items-start md:justify-between border-b border-[#1f2937] pb-6">
          <div className="flex-1 max-w-3xl">
            <h1 className="text-3xl font-black text-[#e5e7eb] tracking-tight flex items-center gap-3">
              {model.name}
              <span 
                className="inline-block w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: model.colorTheme }} 
              />
            </h1>
            <p className="text-sm text-[#9ca3af] mt-1 font-medium italic">
              {model.fullName}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center mt-3 text-xs text-[#6b7280] font-medium">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                {model.paperYear}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UsersIcon className="h-3.5 w-3.5" />
                {model.authors.slice(0, 3).join(', ')}{model.authors.length > 3 ? ' et al.' : ''}
              </span>
              <span>•</span>
              <a
                href={model.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#22d3ee] hover:text-[#67e8f9] transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Read Original Paper
              </a>
            </div>
          </div>

          {/* Metric Stats Strip */}
          <div className="grid grid-cols-4 divide-x divide-[#1f2937] rounded-2xl border border-[#1f2937] bg-[#020617] p-4 w-full md:max-w-md text-center shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="flex flex-col items-center justify-center">
              <Cpu className="h-4 w-4 text-[#6b7280] mb-1" />
              <span className="text-sm font-extrabold text-[#e5e7eb]">
                {formatShortNumber(model.totalParameters)}
              </span>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wider font-bold">Params</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Layers className="h-4 w-4 text-[#6b7280] mb-1" />
              <span className="text-sm font-extrabold text-[#e5e7eb]">{model.depth}</span>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wider font-bold">Layers</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Award className="h-4 w-4 text-[#6b7280] mb-1" />
              <span className="text-sm font-extrabold text-[#e5e7eb]">
                {formatAccuracy(model.top1Accuracy)}
              </span>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wider font-bold">Top-1 Acc</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <HardDrive className="h-4 w-4 text-[#6b7280] mb-1" />
              <span className="text-sm font-extrabold text-[#e5e7eb]">
                {formatMemory(model.memoryUsage)}
              </span>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wider font-bold">Memory</span>
            </div>
          </div>
        </div>

        {/* Split Screen Workspace */}
        <div className="flex flex-col lg:flex-row gap-6 w-full flex-1 items-stretch">
          {/* Left panel: Sequential List / Graph */}
          <div className="flex-1 lg:w-3/5 bg-[#020617] border border-[#1f2937] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col h-[calc(100vh-280px)] min-h-[550px]">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3 mb-4 shrink-0">
              <h2 className="text-base font-bold text-[#e5e7eb] tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#22d3ee]" />
                Topology Explorer
                <span className="text-xs text-[#6b7280] font-medium">
                  ({layers.length} Total Layers)
                </span>
              </h2>
              
              <div className="flex items-center gap-2">
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer border",
                    isPlaying
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                      : "bg-slate-900/60 border-border/30 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  )}
                  title="Space to toggle"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3 w-3" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                {/* Graph vs List View Toggle Switch */}
                <div className="flex items-center gap-1 bg-[#020617] border border-[#1f2937] rounded-xl p-0.5 select-none shrink-0">
                  <button
                    onClick={() => setViewMode('graph')}
                    className={cn(
                      "text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-300 border",
                      viewMode === 'graph'
                        ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee]"
                        : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb]"
                    )}
                  >
                    Graph
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-300 border",
                      viewMode === 'list'
                        ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee]"
                        : "bg-transparent text-[#9ca3af] border-transparent hover:text-[#e5e7eb]"
                    )}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
            
            {/* Layer Navigation Indicator */}
            {selectedLayerId && (
              <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                  <span className="font-mono font-bold text-[#e5e7eb]">
                    Layer {selectedIndex + 1} of {layers.length}
                  </span>
                  <span className="text-[#1f2937]">|</span>
                  <span className="text-[#9ca3af]">{selectedLayer?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const prevIdx = Math.max(selectedIndex - 1, 0);
                      setSelectedLayerId(layers[prevIdx]?.id ?? null);
                    }}
                    disabled={selectedIndex <= 0}
                    className="p-1 rounded hover:bg-slate-800/60 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      const nextIdx = Math.min(selectedIndex + 1, layers.length - 1);
                      setSelectedLayerId(layers[nextIdx]?.id ?? null);
                    }}
                    disabled={selectedIndex >= layers.length - 1}
                    className="p-1 rounded hover:bg-slate-800/60 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex-1 min-h-0 w-full relative">
              <div className="absolute inset-0">
                {viewMode === 'graph' ? (
                  <FlowCanvas
                    model={model}
                    selectedLayerId={selectedLayerId}
                    onSelectLayer={handleSelectLayer}
                  />
                ) : (
                  <div className="h-full overflow-y-auto pr-1 scrollbar-thin">
                    <LayerList
                      layers={layers}
                      selectedLayerId={selectedLayerId}
                      onSelectLayer={handleSelectLayer}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Layer Inspector */}
          <div className="lg:w-2/5 shrink-0 flex flex-col">
            <InspectorPanel 
              layer={selectedLayer} 
              onClose={() => setSelectedLayerId(null)}
              totalModelParameters={totalParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Inline Icon Helpers to avoid extra imports
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}
