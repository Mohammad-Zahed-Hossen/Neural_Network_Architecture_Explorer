'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  HelpCircle,
} from 'lucide-react';
import { LayerType } from '@/lib/schema/model.schema';
import { cn } from '@/lib/utils/cn';
import { layerIconMap, layerStyleMap } from '@/lib/utils/layer-styles';
import { formatShortNumber } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';

interface CustomNodeProps {
  data: {
    id: string;
    name: string;
    type: LayerType;
    outputShape: string;
    parametersTotal: number;
    isSelected: boolean;
    educationalSummary: string;
  };
}

// Icon mappings based on LayerType

function CustomNode({ data }: CustomNodeProps) {
  const Icon = layerIconMap[data.type] || HelpCircle;
  const style = layerStyleMap[data.type] || {
    border: 'border-slate-700 hover:border-slate-500',
    borderActive: 'ring-2 ring-primary border-transparent',
    text: 'text-slate-350',
    bg: 'bg-slate-800/10',
    badge: 'default' as const,
    glow: 'shadow-slate-500/5'
  };

  const isInput = data.type === 'input';
  const isOutput = data.type === 'output';
  const hasParams = data.parametersTotal > 0;

  return (
    <div className="relative select-none">
      {/* Target input handle (only if not input stem) */}
      {!isInput && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2.5 !h-2.5 !bg-slate-700 !border-2 !border-slate-950 rounded-full hover:!bg-primary transition-colors"
        />
      )}

      {/* Main Node Card */}
      <div
        className={cn(
          "w-[265px] rounded-xl border p-3.5 transition-all duration-300 glass-card bg-slate-950/85 cursor-pointer shadow-lg overflow-hidden group/node relative",
          data.isSelected 
            ? "ring-2 ring-primary border-primary/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.02] bg-slate-900/90" 
            : style.border,
          style.bg,
          !data.isSelected && "hover:shadow-xl hover:scale-[1.02] hover:border-slate-600"
        )}
      >
        {/* Colored top accent line */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 h-1 transition-opacity duration-300",
            data.isSelected ? "opacity-100 bg-primary shadow-[0_0_8px_#22d3ee]" : "opacity-60 group-hover/node:opacity-100"
          )}
          style={{ 
            backgroundColor: data.isSelected ? undefined : (
              data.type === 'conv2d' ? '#3b82f6' :
              data.type === 'max_pooling2d' || data.type === 'average_pooling2d' || data.type === 'global_average_pooling2d' ? '#f59e0b' :
              data.type === 'dense' ? '#8b5cf6' :
              data.type === 'batch_norm' ? '#64748b' :
              data.type === 'activation' ? '#ec4899' :
              data.type === 'add' || data.type === 'concatenate' ? '#ef4444' :
              data.type === 'input' ? '#10b981' : '#64748b'
            )
          }}
        />

        <div className="flex items-start gap-2.5 mt-0.5">
          {/* Left: Icon square */}
          <div className={cn(
            "flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 transition-all duration-300",
            data.isSelected && "text-primary border-primary/40 bg-primary/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]",
            !data.isSelected && "group-hover/node:scale-105 group-hover/node:text-white group-hover/node:border-slate-700"
          )}>
            <Icon className="h-4 w-4" />
          </div>

          {/* Center: Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <span 
                className={cn(
                  "font-extrabold text-xs tracking-tight truncate max-w-[130px]",
                  data.isSelected ? "text-primary" : "text-slate-100"
                )} 
                title={data.name}
              >
                {data.name}
              </span>
              <Badge 
                variant={style.badge} 
                className="text-[8px] py-0 px-1.5 font-extrabold tracking-wider uppercase scale-90 origin-right border-slate-800/80"
              >
                {data.type === 'conv2d' ? 'Conv2D' : data.type.replace(/_/g, ' ')}
              </Badge>
            </div>
            
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5" title={data.educationalSummary}>
              {data.educationalSummary}
            </p>
          </div>
        </div>

        {/* Bottom Details Strip */}
        <div className="mt-2.5 pt-2 border-t border-border/10 flex items-center justify-between text-[10px]">
          <span className="text-slate-300 font-bold font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-border/20 shadow-inner">
            {data.outputShape}
          </span>
          {hasParams ? (
            <span className="font-bold text-slate-300 bg-slate-900/60 border border-slate-800 px-1.5 py-0.5 rounded">
              {formatShortNumber(data.parametersTotal)} params
            </span>
          ) : (
            <span className="text-slate-500 italic text-[9px]">No params</span>
          )}
        </div>
      </div>

      {/* Source output handle (only if not predictions classification head) */}
      {!isOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !bg-slate-700 !border-2 !border-slate-950 rounded-full hover:!bg-primary transition-colors"
        />
      )}
    </div>
  );
}

export default memo(CustomNode);
