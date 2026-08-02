'use client';

import React from 'react';
import { LayerTelemetryRaw } from '@/lib/types/training-dynamics';
import { getHealthStatus, getHealthBadgeStyle, getHeatmapColor } from '@/lib/training-dynamics/telemetry';
import { X, Layers, Zap, Flame, Activity, CheckCircle2 } from 'lucide-react';

interface LayerInspectorProps {
  layer: LayerTelemetryRaw | null;
  learningRate: number;
  onClose: () => void;
}

export default function LayerInspector({ layer, learningRate, onClose }: LayerInspectorProps) {
  if (!layer) return null;

  const status = getHealthStatus(layer.incomingGradient, layer.activationVariance);
  const badgeStyle = getHealthBadgeStyle(status);
  const heatmapColor = getHeatmapColor(layer.incomingGradient, status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-card rounded-2xl border border-border/40 bg-slate-900/90 p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shadow"
              style={{ backgroundColor: heatmapColor }}
            />
            <h3 className="text-lg font-black text-white tracking-tight">
              {layer.layerName} Telemetry Inspector
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Health Status Banner */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${badgeStyle.bg} ${badgeStyle.border}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${badgeStyle.text}`} />
            <span className="text-xs font-bold text-slate-300">Gradient Health Vitality:</span>
          </div>
          <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {status}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Incoming Grad */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Incoming Gradient
            </span>
            <span className="text-lg font-black text-white font-mono">{layer.incomingGradient}</span>
          </div>

          {/* Outgoing Grad */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-emerald-400" /> Outgoing Gradient
            </span>
            <span className="text-lg font-black text-white font-mono">{layer.outgoingGradient}</span>
          </div>

          {/* Weight Update Delta W */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-purple-400" /> Weight Update (ΔW)
            </span>
            <span className="text-lg font-black text-purple-300 font-mono">{layer.weightUpdate}</span>
            <span className="text-[9px] text-slate-500 font-mono">Formula: η × g = {learningRate} × {layer.incomingGradient}</span>
          </div>

          {/* Activation Variance */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-cyan-400" /> Activation Stats
            </span>
            <span className="text-xs font-semibold text-slate-200">Mean: <span className="font-mono text-cyan-400">{layer.activationMean}</span></span>
            <span className="text-xs font-semibold text-slate-200">Var: <span className="font-mono text-cyan-400">{layer.activationVariance}</span></span>
          </div>
        </div>

        {/* Histogram distribution view */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300">Activation Distribution Histogram</span>
          <div className="flex items-end gap-1.5 h-14 bg-slate-950 p-2 rounded-xl border border-slate-800">
            {layer.histogram.map((count, idx) => (
              <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                <div
                  className="w-full bg-cyan-500/80 hover:bg-cyan-400 rounded-sm transition-all"
                  style={{ height: `${Math.max(8, count)}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}
