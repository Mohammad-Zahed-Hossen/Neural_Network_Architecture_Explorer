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
          className="!w-2 !h-2 !bg-slate-750 !border-slate-900 rounded-full"
        />
      )}

      {/* Main Node Card */}
      <div
        className={cn(
          "w-[260px] rounded-xl border p-3.5 transition-all duration-300 glass-card bg-slate-950/80 cursor-pointer shadow-lg overflow-hidden group/node",
          data.isSelected ? "ring-2 ring-primary border-transparent shadow-[0_0_15px_rgba(34,211,238,0.25)] scale-[1.02]" : style.border,
          style.bg,
          !data.isSelected && "hover:shadow-xl hover:scale-[1.02]"
        )}
      >
        {/* Colored top accent line */}
        <div 
          className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover/node:opacity-100 transition-opacity duration-300"
          style={{ 
            backgroundColor: data.isSelected ? 'transparent' : (
              data.type === 'conv2d' ? '#3b82f6' :
              data.type === 'max_pooling2d' ? '#f59e0b' :
              data.type === 'dense' ? '#8b5cf6' :
              data.type === 'batch_norm' ? '#64748b' :
              data.type === 'activation' ? '#ec4899' :
              data.type === 'add' ? '#ef4444' :
              data.type === 'input' ? '#10b981' : '#64748b'
            )
          }}
        />

        <div className="flex items-start gap-2.5">
          {/* Left: Icon square */}
          <div className={cn(
            "flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/50 text-slate-450 transition-all duration-300",
            data.isSelected && "text-primary border-primary/20 bg-primary/5",
            !data.isSelected && "group-hover/node:scale-110 group-hover/node:text-white"
          )}>
            <Icon className="h-4 w-4" />
          </div>

          {/* Center: Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <span 
                className="font-bold text-slate-100 text-xs tracking-tight truncate max-w-[125px]" 
                title={data.name}
              >
                {data.name}
              </span>
              <Badge 
                variant={style.badge} 
                className="text-[8px] py-0 px-1 font-extrabold tracking-wider uppercase scale-90 origin-right"
              >
                {data.type === 'conv2d' ? 'Conv2D' : data.type.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5" title={data.educationalSummary}>
              {data.educationalSummary}
            </p>
          </div>
        </div>

        {/* Bottom Details Strip */}
        <div className="mt-2.5 pt-2 border-t border-border/10 flex items-center justify-between text-[10px]">
          <span className="text-slate-500 font-bold font-mono bg-slate-900/50 px-1.5 py-0.5 rounded border border-border/5">
            {data.outputShape}
          </span>
          {hasParams ? (
            <span className="font-semibold text-slate-450">
              {formatShortNumber(data.parametersTotal)} params
            </span>
          ) : (
            <span className="text-slate-600 italic">No params</span>
          )}
        </div>
      </div>

      {/* Source output handle (only if not predictions classification head) */}
      {!isOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-slate-750 !border-slate-900 rounded-full"
        />
      )}
    </div>
  );
}

export default memo(CustomNode);
