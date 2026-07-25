'use client';

import { useState, useCallback } from 'react';
import { 
  HelpCircle, ArrowDown, ChevronDown, ChevronRight,
  Maximize2, Minimize2, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { Layer } from '@/lib/schema/model.schema';
import { cn } from '@/lib/utils/cn';
import { layerIconMap, layerStyleMap } from '@/lib/utils/layer-styles';
import { formatShortNumber } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';

interface LayerGroup {
  id: string;
  name: string;
  description: string;
  layerIds: string[];
  color: string;
}

interface LayerListProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  groups?: LayerGroup[];
}

export default function LayerList({ layers, selectedLayerId, onSelectLayer, groups }: LayerListProps) {
  // Store collapsible state per group ID - initialize with first group expanded if available
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    if (groups && groups.length > 0) {
      const initial: Record<string, boolean> = {};
      groups.forEach((g, idx) => {
        initial[g.id] = idx === 0;
      });
      return initial;
    }
    return {};
  });

  // Auto-expand group containing selected layer
  const handleLayerSelect = useCallback((id: string | null) => {
    onSelectLayer(id);
    if (id && groups) {
      const activeGroup = groups.find(g => g.layerIds.includes(id));
      if (activeGroup && !expandedGroups[activeGroup.id]) {
        setExpandedGroups(prev => ({
          ...prev,
          [activeGroup.id]: true
        }));
      }
    }
  }, [onSelectLayer, groups, expandedGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const expandAll = () => {
    if (!groups) return;
    const allExpanded: Record<string, boolean> = {};
    groups.forEach(g => { allExpanded[g.id] = true; });
    setExpandedGroups(allExpanded);
  };

  const collapseAll = () => {
    if (!groups) return;
    const allCollapsed: Record<string, boolean> = {};
    groups.forEach(g => { allCollapsed[g.id] = false; });
    setExpandedGroups(allCollapsed);
  };

  const jumpToFirst = () => {
    if (layers.length > 0) {
      handleLayerSelect(layers[0].id);
    }
  };

  const jumpToLast = () => {
    if (layers.length > 0) {
      handleLayerSelect(layers[layers.length - 1].id);
    }
  };

  // If no group info is provided, fallback to flat list
  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col gap-2 py-2">
        {layers.map((layer, index) => (
          <div key={layer.id} className="w-full">
            {renderLayerCard(layer, selectedLayerId, handleLayerSelect, index + 1)}
            {index < layers.length - 1 && renderConnectionArrow()}
          </div>
        ))}
      </div>
    );
  }

  // Pre-calculate layer index mapping
  const layerIndexMap = new Map<string, number>();
  layers.forEach((l, i) => layerIndexMap.set(l.id, i + 1));

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Top Action Controls Bar */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-border/20 rounded-xl p-2 mb-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <span className="text-slate-200">Quick Navigation</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={jumpToFirst}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-border/20 text-[10px] font-bold text-slate-300 transition-colors"
            title="Select first layer (Input)"
          >
            <ArrowUpCircle className="h-3 w-3 text-emerald-400" />
            <span className="hidden min-[400px]:inline">First Layer</span>
          </button>
          <button
            onClick={jumpToLast}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-border/20 text-[10px] font-bold text-slate-300 transition-colors"
            title="Select last layer (Output)"
          >
            <ArrowDownCircle className="h-3 w-3 text-teal-400" />
            <span className="hidden min-[400px]:inline">Output Layer</span>
          </button>
          <span className="text-slate-700 text-xs">|</span>
          <button
            onClick={expandAll}
            className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-border/20 text-slate-400 hover:text-slate-200 transition-colors"
            title="Expand all layer groups"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
          <button
            onClick={collapseAll}
            className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-border/20 text-slate-400 hover:text-slate-200 transition-colors"
            title="Collapse all layer groups"
          >
            <Minimize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Layer Groups Stack */}
      <div className="space-y-3">
        {groups.map((group) => {
          const groupLayers = layers.filter(l => group.layerIds.includes(l.id));
          if (groupLayers.length === 0) return null;

          const isExpanded = !!expandedGroups[group.id];
          
          return (
            <div key={group.id} className="border border-border/20 rounded-2xl bg-slate-900/20 overflow-hidden shadow-sm">
              {/* Group Header Card (Sticky when scrolling inside container) */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="sticky top-0 z-10 w-full flex items-center justify-between p-3.5 min-h-[44px] bg-slate-950/90 backdrop-blur-md border-b border-border/15 cursor-pointer hover:bg-slate-900/60 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" 
                    style={{ backgroundColor: group.color || '#22d3ee' }}
                  />
                  <div>
                    <h3 className="text-xs font-black text-slate-100 tracking-wide flex items-center gap-2">
                      {group.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-1">{group.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] font-extrabold border-slate-800 text-slate-400 bg-slate-900/50">
                    {groupLayers.length} Layers
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Collapsible Layer stack details */}
              {isExpanded && (
                <div className="p-2.5 bg-slate-950/20 space-y-1.5">
                  {groupLayers.map((layer) => {
                    const globalIdx = layerIndexMap.get(layer.id) || 1;
                    return (
                      <div key={layer.id} className="relative">
                        {renderLayerCard(layer, selectedLayerId, handleLayerSelect, globalIdx)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Render individual layer card
function renderLayerCard(
  layer: Layer, 
  selectedLayerId: string | null, 
  onSelectLayer: (id: string | null) => void,
  layerIndex: number
) {
  const Icon = layerIconMap[layer.type] || HelpCircle;
  const style = layerStyleMap[layer.type] || {
    border: 'border-slate-800 hover:border-slate-700',
    text: 'text-slate-350',
    bg: 'bg-slate-900/10',
    badge: 'default' as const,
    shadow: 'shadow-slate-500/5'
  };
  const isSelected = selectedLayerId === layer.id;

  return (
    <button
      onClick={() => onSelectLayer(layer.id)}
      className={cn(
        "w-full text-left rounded-xl p-3 min-h-[46px] border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer focus:outline-none relative overflow-hidden group/layer",
        isSelected 
          ? "border-primary bg-slate-900/85 shadow-[0_0_20px_rgba(34,211,238,0.18)] translate-x-1 border-l-4 border-l-primary" 
          : "border-border/15 bg-slate-950/40 hover:bg-slate-900/40 hover:border-border/30"
      )}
    >
      {/* Left side info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Layer Index Badge */}
        <span className={cn(
          "font-mono text-[10px] font-black px-1.5 py-0.5 rounded border shrink-0 min-w-[28px] text-center",
          isSelected 
            ? "bg-primary/20 text-primary border-primary/40" 
            : "bg-slate-900/80 text-slate-500 border-border/10 group-hover/layer:text-slate-300"
        )}>
          #{String(layerIndex).padStart(2, '0')}
        </span>

        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/20 bg-slate-950/70 text-slate-400 transition-transform group-hover/layer:scale-105 duration-200",
          isSelected && "text-primary border-primary/30 bg-primary/10"
        )}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "font-bold text-xs tracking-tight truncate max-w-[180px] sm:max-w-[240px]",
              isSelected ? "text-primary" : "text-slate-100"
            )}>
              {layer.name}
            </span>
            <Badge variant={style.badge} className="text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider opacity-85">
              {layer.type === 'conv2d' ? 'Conv2D' : layer.type.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
            {layer.educationalNote.summary}
          </p>
        </div>
      </div>

      {/* Right side info */}
      <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0 gap-1.5 sm:gap-1 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          {layer.parameters.total > 0 && (
            <span className="text-[10px] font-bold text-slate-300 bg-slate-900/80 border border-border/20 px-2 py-0.5 rounded-md">
              {formatShortNumber(layer.parameters.total)} params
            </span>
          )}
          <span className="text-[10px] font-extrabold text-slate-200 bg-slate-950 border border-border/20 px-2 py-0.5 rounded-md shadow-inner">
            {formatShape(layer.outputShape.dimensions)}
          </span>
        </div>
      </div>
    </button>
  );
}

// Render down connection arrow
function renderConnectionArrow() {
  return (
    <div className="flex items-center justify-center my-1 text-slate-700 pointer-events-none opacity-20">
      <ArrowDown className="h-3.5 w-3.5" />
    </div>
  );
}

// Format dimensions
function formatShape(dims: (number | null)[]): string {
  const filtered = dims.filter((d) => d !== null);
  if (filtered.length === 0) return 'Flat';
  return filtered.join('×');
}

