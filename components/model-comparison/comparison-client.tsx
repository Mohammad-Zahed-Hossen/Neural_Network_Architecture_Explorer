'use client';

import { useState, useMemo, ComponentType } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Cpu, Layers, Award, HardDrive, BarChart3, 
  Search, X, ChevronDown, ChevronUp, Check, RefreshCw, Filter, SlidersHorizontal
} from 'lucide-react';
import { ModelMetadata, ModelCategory } from '@/lib/data/model-metadata';
import StatCards from './stat-card';
import ComparisonTable from './comparison-table';
import { cn } from '@/lib/utils/cn';
import { modelCategories } from '@/lib/data/model-categories';
import dynamic from 'next/dynamic';

const ComparisonCharts = dynamic(() => import('./comparison-chart'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-slate-900/10 border border-border/20 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-500 font-bold uppercase tracking-wider">
      Loading comparison charts...
    </div>
  )
});

interface ComparisonClientProps {
  models: ModelMetadata[];
}

type MetricType = 'parameters' | 'depth' | 'accuracy' | 'memory' | 'flops';

export default function ComparisonClient({ models }: ComparisonClientProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('parameters');
  
  // Default selection: a subset of classic models representing different families
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'vgg16', 'resnet50', 'densenet121', 'mobilenet', 'inceptionv3'
  ]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(true);
  const [selectorSearch, setSelectorSearch] = useState('');

  const toggleModel = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAll = () => setSelectedIds(models.map(m => m.id));
  const selectNone = () => setSelectedIds([]);
  const selectClassics = () => setSelectedIds(['vgg16', 'resnet50', 'densenet121', 'mobilenet', 'inceptionv3']);

  const selectCategory = (category: string) => {
    const categoryModelIds = models.filter(m => m.category === category).map(m => m.id);
    setSelectedIds(prev => {
      const allSelected = categoryModelIds.every(id => prev.includes(id));
      if (allSelected) {
        // Deselect this category
        return prev.filter(id => !categoryModelIds.includes(id));
      } else {
        // Select all in this category
        return Array.from(new Set([...prev, ...categoryModelIds]));
      }
    });
  };

  const comparedModels = useMemo(() => {
    return models.filter(m => selectedIds.includes(m.id));
  }, [models, selectedIds]);

  // Group models by category
  const modelsByCategory = useMemo(() => {
    const groups: Record<string, ModelMetadata[]> = {};
    models.forEach(model => {
      if (!groups[model.category]) {
        groups[model.category] = [];
      }
      groups[model.category].push(model);
    });
    return groups;
  }, [models]);

  // Filter based on selector search query
  const filteredGroups = useMemo(() => {
    if (!selectorSearch) return modelsByCategory;
    const filtered: Record<string, ModelMetadata[]> = {};
    Object.entries(modelsByCategory).forEach(([category, list]) => {
      const match = list.filter(m => 
        m.name.toLowerCase().includes(selectorSearch.toLowerCase()) ||
        m.fullName.toLowerCase().includes(selectorSearch.toLowerCase()) ||
        m.category.toLowerCase().includes(selectorSearch.toLowerCase())
      );
      if (match.length > 0) {
        filtered[category] = match;
      }
    });
    return filtered;
  }, [modelsByCategory, selectorSearch]);

  const metricTabs: { id: MetricType; label: string; icon: ComponentType<{ className?: string }>; desc: string }[] = [
    { 
      id: 'parameters', 
      label: 'Parameters', 
      icon: Cpu, 
      desc: 'Learnable weights size' 
    },
    { 
      id: 'depth', 
      label: 'Network Depth', 
      icon: Layers, 
      desc: 'Layer stack depth' 
    },
    { 
      id: 'accuracy', 
      label: 'Accuracy', 
      icon: Award, 
      desc: 'ImageNet classification score' 
    },
    { 
      id: 'memory', 
      label: 'Memory Size', 
      icon: HardDrive, 
      desc: 'Runtime VRAM requirements' 
    },
    { 
      id: 'flops', 
      label: 'FLOPs Overhead', 
      icon: BarChart3, 
      desc: 'Floating point operations scale' 
    }
  ];

  return (
    <div className="flex-1 flex flex-col w-full bg-background mesh-gradient relative pb-16">
      {/* Decorative ambient glowing overlay in center */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.06] bg-primary z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/50 border border-border/30 rounded-xl px-3.5 py-1.5 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Catalog
          </Link>
          
          {/* Quick links to explore models */}
          {comparedModels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mr-1">Explore Selected:</span>
              {comparedModels.slice(0, 3).map(model => (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-slate-900/40 hover:bg-slate-800/40 transition-colors"
                  style={{ borderColor: `${model.colorTheme}20`, color: model.colorTheme }}
                >
                  {model.name}
                </Link>
              ))}
              {comparedModels.length > 3 && (
                <span className="text-[9px] text-slate-500 font-bold">+{comparedModels.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1 border-b border-border/10 pb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            Model Comparison
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
          </h1>
          <p className="text-sm text-slate-450 font-medium">
            Analyze hardware constraints, topological depths, and accuracy trade-offs across classic Convolutional Network generations.
          </p>
        </div>

        {/* Dynamic Model Selector Dashboard */}
        <div className="bg-slate-950/20 border border-border/30 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg">
          {/* Dashboard Header */}
          <button
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="w-full flex items-center justify-between px-5 py-4 bg-slate-900/20 hover:bg-slate-900/40 border-b border-border/10 transition-colors cursor-pointer text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-wide">Configure Models to Compare</h2>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Comparing <span className="text-primary font-bold">{selectedIds.length}</span> of {models.length} available models
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Short stats badge */}
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-900/60 border border-border/20 px-2 py-0.5 rounded-full">
                {selectedIds.length} Selected
              </span>
              {isSelectorOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </div>
          </button>

          {/* Selector Content (Collapsible) */}
          {isSelectorOpen && (
            <div className="p-5 space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                {/* Search bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search model names..."
                    value={selectorSearch}
                    onChange={(e) => setSelectorSearch(e.target.value)}
                    className="w-full bg-slate-900/60 border border-border/20 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  {selectorSearch && (
                    <button
                      onClick={() => setSelectorSearch('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Preset selectors */}
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-slate-500 font-bold mr-1">Presets:</span>
                  <button
                    onClick={selectAll}
                    className="cursor-pointer bg-slate-900/50 border border-border/20 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white hover:border-primary/40 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectClassics}
                    className="cursor-pointer bg-slate-900/50 border border-border/20 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white hover:border-primary/40 transition-colors"
                  >
                    Classics Only
                  </button>
                  <button
                    onClick={selectNone}
                    className="cursor-pointer bg-slate-900/50 border border-border/20 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Models selection grid */}
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 border border-border/10 rounded-xl p-4 bg-slate-950/40">
                {Object.entries(filteredGroups).map(([category, list]) => {
                  const catMeta = modelCategories[category as ModelCategory];
                  const catSelectedCount = list.filter(m => selectedIds.includes(m.id)).length;
                  const allCatSelected = catSelectedCount === list.length;
                  
                  return (
                    <div key={category} className="space-y-2 border-b border-border/5 pb-3 last:border-b-0 last:pb-0">
                      {/* Category Header toggle */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span 
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: catMeta?.textColor ? undefined : '#475569' }}
                          />
                          <span className={cn("text-[11px] font-extrabold uppercase tracking-wider", catMeta?.textColor || 'text-slate-400')}>
                            {category}
                          </span>
                        </span>
                        <button
                          onClick={() => selectCategory(category)}
                          className="text-[9px] font-bold text-slate-500 hover:text-white px-2 py-0.5 rounded border border-border/15 bg-slate-900/40 cursor-pointer"
                        >
                          {allCatSelected ? 'Deselect Category' : `Select All ${category}`}
                        </button>
                      </div>

                      {/* Models List */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {list.map(model => {
                          const isSelected = selectedIds.includes(model.id);
                          return (
                            <button
                              key={model.id}
                              onClick={() => toggleModel(model.id)}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg border text-left cursor-pointer transition-all",
                                isSelected
                                  ? "bg-slate-900/60 text-white"
                                  : "bg-slate-950/20 text-slate-500 border-transparent hover:bg-slate-900/20 hover:text-slate-300"
                              )}
                              style={{ 
                                borderColor: isSelected ? `${model.colorTheme}40` : undefined,
                                boxShadow: isSelected ? `0 0 8px ${model.colorTheme}08` : undefined
                              }}
                            >
                              <div 
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center transition-all",
                                  isSelected ? "bg-primary border-primary text-white" : "border-slate-700 bg-slate-950/60"
                                )}
                                style={{
                                  backgroundColor: isSelected ? model.colorTheme : undefined,
                                  borderColor: isSelected ? model.colorTheme : undefined,
                                }}
                              >
                                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="text-[11px] font-bold truncate">{model.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {Object.keys(filteredGroups).length === 0 && (
                  <div className="text-center py-6 text-slate-500 font-bold text-xs">
                    No models match your search criteria.
                  </div>
                )}
              </div>

              {/* Selected Badges list */}
              {comparedModels.length > 0 && (
                <div className="pt-3 border-t border-border/10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Current Selection ({comparedModels.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comparedModels.map(model => (
                      <span
                        key={model.id}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-slate-900/40 backdrop-blur-sm"
                        style={{ 
                          borderColor: `${model.colorTheme}30`, 
                          color: model.colorTheme 
                        }}
                      >
                        {model.name}
                        <button
                          onClick={() => toggleModel(model.id)}
                          className="hover:bg-slate-800 rounded-full p-0.5 cursor-pointer text-slate-500 hover:text-white"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {comparedModels.length > 0 ? (
          <>
            {/* 1. Stat Cards Highlights Grid */}
            <StatCards models={comparedModels} />

            {/* 2. Interactive Charts & Toggle Workspace */}
            <div className="flex flex-col gap-5 mt-3">
              {/* Tab Metric Selectors */}
              <div className="flex flex-wrap gap-2.5 bg-slate-900/35 border border-border/20 rounded-2xl p-2 backdrop-blur-md">
                {metricTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeMetric === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMetric(tab.id)}
                      className={cn(
                        "flex-1 min-w-[130px] flex items-center gap-2.5 rounded-xl p-3.5 border transition-all duration-300 text-left cursor-pointer focus:outline-none",
                        isActive 
                          ? "bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.25)]" 
                          : "bg-transparent border-[#1f2937] text-[#9ca3af] hover:text-[#e5e7eb] hover:border-[#22d3ee]/30"
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        isActive ? "border-[#020617]/20 bg-[#020617]/10 text-[#020617]" : "border-[#1f2937] bg-[#020617] text-[#9ca3af]"
                      )}>
                        <TabIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold tracking-tight">{tab.label}</h3>
                        <p className="text-[9px] text-[#6b7280] font-semibold mt-0.5 leading-none">{tab.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Recharts Graph Panel */}
              <ComparisonCharts models={comparedModels} activeMetric={activeMetric} />
            </div>

            {/* 3. Tabular Side-by-Side Detailed Specs */}
            <div className="space-y-3 mt-6">
              <h2 className="text-sm font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-3 bg-primary rounded-full" />
                Detailed Specifications Ledger
              </h2>
              <ComparisonTable models={comparedModels} />
            </div>
          </>
        ) : (
          <div className="bg-slate-950/20 border border-border/20 rounded-2xl p-16 text-center backdrop-blur-md">
            <Filter className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-white">No Models Selected</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Please select at least one model in the configuration panel above to populate the stats, comparison charts, and specifications table.
            </p>
            <button
              onClick={selectClassics}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/15 border border-primary/20 hover:border-primary/30 rounded-xl text-xs font-bold text-primary transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Load Classic Models Preset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
