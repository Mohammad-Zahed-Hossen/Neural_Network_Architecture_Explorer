'use client';

import { ComponentType, useState, useEffect } from 'react';
import { 
  Layers, Image, Activity, Zap, Shrink, 
  AlignJustify, Key, PlusCircle, GitMerge, 
  HelpCircle, ArrowDown, ChevronDown, ChevronRight, Eye
} from 'lucide-react';
import { Layer, LayerType } from '@/lib/schema/model.schema';
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

// Icon mappings based on LayerType

export default function LayerList({ layers, selectedLayerId, onSelectLayer, groups }: LayerListProps) {
  // Store collapsible state per group ID
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Auto-expand group containing selected layer
  useEffect(() => {
    if (selectedLayerId && groups) {
      const activeGroup = groups.find(g => g.layerIds.includes(selectedLayerId));
      if (activeGroup) {
        setExpandedGroups(prev => ({
          ...prev,
          [activeGroup.id]: true
        }));
      }
    }
  }, [selectedLayerId, groups]);

  // Initial setup: expand input stem by default
  useEffect(() => {
    if (groups && groups.length > 0 && Object.keys(expandedGroups).length === 0) {
      setExpandedGroups({
        [groups[0].id]: true
      });
    }
  }, [groups, expandedGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // If no group info is provided, fallback to flat list
  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col gap-2 py-2">
        {layers.map((layer, index) => (
          <div key={layer.id} className="w-full">
            {renderLayerCard(layer, selectedLayerId, onSelectLayer)}
            {index < layers.length - 1 && renderConnectionArrow()}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      {groups.map((group, groupIdx) => {
        const groupLayers = layers.filter(l => group.layerIds.includes(l.id));
        if (groupLayers.length === 0) return null;

        const isExpanded = !!expandedGroups[group.id];
        
        return (
          <div key={group.id} className="border border-border/20 rounded-2xl bg-slate-900/10 overflow-hidden">
            {/* Group Header Card */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between p-4 bg-slate-950/40 border-b border-border/10 cursor-pointer hover:bg-slate-900/20 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: group.color || '#22d3ee' }}
                />
                <div>
                  <h3 className="text-xs font-black text-slate-200 tracking-wide">{group.name}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{group.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] font-bold border-slate-800 text-slate-400">
                  {groupLayers.length} Layers
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-450" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-455" />
                )}
              </div>
            </button>

            {/* Collapsible Layer stack details */}
            {isExpanded && (
              <div className="p-3 bg-slate-950/10 divide-y divide-border/5 space-y-1">
                {groupLayers.map((layer, idx) => (
                  <div key={layer.id} className="pt-2 first:pt-0">
                    {renderLayerCard(layer, selectedLayerId, onSelectLayer, idx % 2 === 1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Render individual layer card
function renderLayerCard(
  layer: Layer, 
  selectedLayerId: string | null, 
  onSelectLayer: (id: string | null) => void,
  isAltRow = false
) {
  const Icon = layerIconMap[layer.type] || HelpCircle;
  const style = layerStyleMap[layer.type] || {
    border: 'border-slate-800 hover:border-slate-700',
    text: 'text-slate-350',
    bg: 'bg-slate-900/10',
    badge: 'default',
    shadow: 'shadow-slate-500/5'
  };
  const isSelected = selectedLayerId === layer.id;

  return (
    <button
      onClick={() => onSelectLayer(layer.id)}
      className={cn(
        "w-full text-left rounded-xl p-3 border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer focus:outline-none relative overflow-hidden",
        isSelected 
          ? "border-primary bg-slate-900/60 shadow-[0_0_15px_rgba(34,211,238,0.1)] translate-x-0.5" 
          : cn("border-border/10", isAltRow ? "bg-slate-900/20" : "bg-transparent hover:bg-slate-900/10 hover:border-border/30")
      )}
    >
      {/* Indicator Accent bar on selection */}
      {isSelected && (
        <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
      )}

      {/* Left side info */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/20 bg-slate-950/50 text-slate-450 transition-transform group-hover:scale-105 duration-300",
          isSelected && "text-primary border-primary/25 bg-primary/5"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "font-bold text-slate-200 text-xs tracking-tight",
              isSelected && "text-primary"
            )}>
              {layer.name}
            </span>
            <Badge variant={style.badge} className="text-[8px] py-0 px-1 uppercase font-bold tracking-wider opacity-85">
              {layer.type === 'conv2d' ? 'Conv2D' : layer.type.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
            {layer.educationalNote.summary}
          </p>
        </div>
      </div>

      {/* Right side info */}
      <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0 gap-1 sm:gap-0 font-mono text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          {layer.parameters.total > 0 && (
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-900/40 border border-border/10 px-1.5 py-0.5 rounded">
              {formatShortNumber(layer.parameters.total)} params
            </span>
          )}
          <span className="text-[10px] font-bold text-slate-350 bg-slate-950/40 border border-border/10 px-1.5 py-0.5 rounded">
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
