import React from 'react';
import { SimulationPreset } from '@/lib/types/training-dynamics';

interface LegendProps {
  preset: SimulationPreset;
  className?: string;
}

export default function Legend({ preset, className = '' }: LegendProps) {
  return (
    <div className={`bg-slate-900/30 border border-border/20 rounded-xl p-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-medium ${className}`}>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.gradientColor }} />
        <span>Gradient Signal: <strong className="text-white">{preset.name}</strong></span>
      </div>

      <div className="flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-slate-500 inline-block" />
          <span>Sequential Flow</span>
        </div>

        {preset.connectionType === 'residual' && (
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-4 h-0.5 bg-emerald-500 rounded inline-block" />
            <span>ResNet Skip Highway</span>
          </div>
        )}

        {preset.connectionType === 'dense' && (
          <div className="flex items-center gap-1.5 text-violet-400">
            <span className="w-4 h-0.5 bg-violet-500 rounded inline-block" />
            <span>Dense Multi-Channel Arc</span>
          </div>
        )}

        {preset.normalization && (
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-1 h-3 bg-cyan-400 rounded inline-block" />
            <span>BatchNorm Barrier</span>
          </div>
        )}
      </div>
    </div>
  );
}
