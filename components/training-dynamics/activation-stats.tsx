'use client';

import React from 'react';
import { LayerTelemetryRaw } from '@/lib/types/training-dynamics';
import { Flame } from 'lucide-react';

interface ActivationStatsProps {
  layers: LayerTelemetryRaw[];
  normalizationType: string;
}

export default function ActivationStats({ layers, normalizationType }: ActivationStatsProps) {
  return (
    <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-5 backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/10 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Flame className="h-4 w-4 text-cyan-400" />
          Layer Activation Statistics & Histograms
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Norm: {normalizationType.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {layers.slice(0, 6).map((layer) => (
          <div
            key={layer.layerIndex}
            className="p-3 rounded-xl bg-slate-900/40 border border-border/20 flex flex-col gap-2.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{layer.layerName}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                σ: {layer.activationStd}
              </span>
            </div>

            {/* Mean & Variance */}
            <div className="grid grid-cols-2 gap-2 text-center bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/40">
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-semibold">Mean (μ)</span>
                <span className="text-xs font-black text-cyan-300 font-mono">{layer.activationMean}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-semibold">Var (σ²)</span>
                <span className="text-xs font-black text-cyan-300 font-mono">{layer.activationVariance}</span>
              </div>
            </div>

            {/* 5-bin Histogram chart */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-medium text-slate-400">Distribution Histogram</span>
              <div className="flex items-end gap-1 h-8 bg-slate-950/80 rounded-md p-1 border border-slate-800/50">
                {layer.histogram.map((binCount, idx) => (
                  <div key={idx} className="flex-1 h-full flex items-end">
                    <div
                      className="w-full bg-cyan-500/70 hover:bg-cyan-400 rounded-sm transition-all"
                      style={{ height: `${Math.max(10, binCount)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
