'use client';

import React from 'react';
import { LayerTelemetryRaw } from '@/lib/types/training-dynamics';
import { getHealthStatus, getHeatmapColor, getHealthBadgeStyle } from '@/lib/training-dynamics/telemetry';
import { Activity, Layers } from 'lucide-react';

interface GradientHeatmapProps {
  layers: LayerTelemetryRaw[];
  onSelectLayer?: (index: number) => void;
  selectedIndex?: number | null;
}

export default function GradientHeatmap({ layers, onSelectLayer, selectedIndex }: GradientHeatmapProps) {
  const maxGrad = Math.max(1.5, ...layers.map((l) => l.incomingGradient));

  return (
    <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-5 backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/10 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Layer Gradient & Weight Update Heatmap
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">
          Click any layer to inspect
        </span>
      </div>

      {/* Layer Bars */}
      <div className="flex flex-col gap-2.5">
        {layers.map((layer) => {
          const status = getHealthStatus(layer.incomingGradient, layer.activationVariance);
          const color = getHeatmapColor(layer.incomingGradient, status);
          const badgeStyle = getHealthBadgeStyle(status);
          const widthPercent = Math.min(100, Math.max(4, (layer.incomingGradient / maxGrad) * 100));
          const isSelected = selectedIndex === layer.layerIndex;

          return (
            <div
              key={layer.layerIndex}
              onClick={() => onSelectLayer?.(layer.layerIndex)}
              className={`group flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/80 border-primary/60 shadow-lg shadow-primary/10'
                  : 'bg-slate-900/40 border-border/20 hover:bg-slate-800/50 hover:border-border/40'
              }`}
            >
              {/* Layer label */}
              <div className="w-20 sm:w-24 shrink-0 flex flex-col">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {layer.layerName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Layers className="h-2.5 w-2.5 text-purple-400" /> ΔW: {layer.weightUpdate}
                </span>
              </div>

              {/* Progress bar container */}
              <div className="flex-1 h-5 bg-slate-950/80 rounded-lg p-0.5 overflow-hidden relative border border-slate-800/50">
                <div
                  className="h-full rounded-md transition-all duration-300 relative flex items-center justify-end px-2"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 12px ${color}40`,
                  }}
                >
                  <span className="text-[10px] font-black text-slate-950 font-mono drop-shadow">
                    {layer.incomingGradient}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`shrink-0 px-2 py-0.5 rounded-md border text-[10px] font-bold ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                {status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
