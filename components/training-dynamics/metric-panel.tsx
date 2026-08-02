'use client';

import React from 'react';
import { SimulationMetrics } from '@/lib/types/training-dynamics';
import { Gauge, ShieldCheck, Zap, Activity } from 'lucide-react';

interface MetricPanelProps {
  metrics: SimulationMetrics;
  className?: string;
}

export default function MetricPanel({ metrics, className = '' }: MetricPanelProps) {
  const stabilityColor =
    metrics.networkStability > 70
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
      : metrics.networkStability > 40
      ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
      : 'text-rose-400 border-rose-500/30 bg-rose-950/20';

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
      {/* Gradient Norm */}
      <div className="bg-slate-900/40 border border-border/20 rounded-xl p-3 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Grad Magnitude</span>
          <Activity className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="mt-2 flex items-baseline gap-1 font-mono">
          <span className="text-base sm:text-lg font-black text-white">
            {metrics.gradientMagnitude < 0.001
              ? metrics.gradientMagnitude.toExponential(2)
              : metrics.gradientMagnitude.toFixed(3)}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 mt-1">Output derivative norm</span>
      </div>

      {/* Average Gradient */}
      <div className="bg-slate-900/40 border border-border/20 rounded-xl p-3 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Avg Grad</span>
          <Zap className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1 font-mono">
          <span className="text-base sm:text-lg font-black text-white">
            {metrics.averageGradient < 0.001
              ? metrics.averageGradient.toExponential(2)
              : metrics.averageGradient.toFixed(3)}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 mt-1">Across all network layers</span>
      </div>

      {/* Update Magnitude */}
      <div className="bg-slate-900/40 border border-border/20 rounded-xl p-3 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Step Update</span>
          <Gauge className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1 font-mono">
          <span className="text-base sm:text-lg font-black text-white">
            {metrics.updateMagnitude < 0.0001
              ? metrics.updateMagnitude.toExponential(2)
              : metrics.updateMagnitude.toFixed(4)}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 mt-1">ΔW = η · ∂L/∂W</span>
      </div>

      {/* Network Stability */}
      <div className={`border rounded-xl p-3 backdrop-blur-md flex flex-col justify-between ${stabilityColor}`}>
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span>Stability Score</span>
          <ShieldCheck className="h-3.5 w-3.5" />
        </div>
        <div className="mt-2 flex items-baseline gap-1 font-mono">
          <span className="text-base sm:text-lg font-black">
            {metrics.networkStability.toFixed(0)}%
          </span>
        </div>
        <span className="text-[9px] opacity-75 mt-1">Signal vitality ratio</span>
      </div>
    </div>
  );
}
