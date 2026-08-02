'use client';

import React from 'react';
import { TelemetrySnapshot, SimulationPreset } from '@/lib/types/training-dynamics';
import { Award, Zap, TrendingDown, Flame } from 'lucide-react';

interface ComparativeMetricsProps {
  snapshotA: TelemetrySnapshot;
  snapshotB: TelemetrySnapshot;
  presetA: SimulationPreset;
  presetB: SimulationPreset;
}

export default function ComparativeMetrics({
  snapshotA,
  snapshotB,
  presetA,
  presetB,
}: ComparativeMetricsProps) {
  // Determine winner for key metrics
  const isAHealthierGrad =
    Math.abs(snapshotA.gradientNorm - 1.0) < Math.abs(snapshotB.gradientNorm - 1.0);
  const isALowerLoss = snapshotA.loss < snapshotB.loss;
  const isAHealthierVar =
    Math.abs(snapshotA.activationVariance - 1.0) < Math.abs(snapshotB.activationVariance - 1.0);

  return (
    <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-5 backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/10 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          Comparative Real-time Telemetry Metrics
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Epoch {snapshotA.epoch}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Gradient Norm */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-border/20 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> Gradient Norm Preservation
          </span>
          <div className="flex items-center justify-between font-mono text-sm">
            <div className={`flex flex-col ${isAHealthierGrad ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
              <span className="text-[10px] text-slate-500 font-sans">{presetA.name}</span>
              {snapshotA.gradientNorm.toFixed(3)}
            </div>
            <span className="text-slate-600 font-sans text-xs">vs</span>
            <div className={`flex flex-col text-right ${!isAHealthierGrad ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
              <span className="text-[10px] text-slate-500 font-sans">{presetB.name}</span>
              {snapshotB.gradientNorm.toFixed(3)}
            </div>
          </div>
          <span className="text-[9px] text-slate-400">
            Winner: {isAHealthierGrad ? presetA.name : presetB.name} (closer to 1.0 baseline)
          </span>
        </div>

        {/* Metric 2: Loss Convergence */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-border/20 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-emerald-400" /> Training Loss
          </span>
          <div className="flex items-center justify-between font-mono text-sm">
            <div className={`flex flex-col ${isALowerLoss ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
              <span className="text-[10px] text-slate-500 font-sans">{presetA.name}</span>
              {snapshotA.loss.toFixed(3)}
            </div>
            <span className="text-slate-600 font-sans text-xs">vs</span>
            <div className={`flex flex-col text-right ${!isALowerLoss ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
              <span className="text-[10px] text-slate-500 font-sans">{presetB.name}</span>
              {snapshotB.loss.toFixed(3)}
            </div>
          </div>
          <span className="text-[9px] text-slate-400">
            Winner: {isALowerLoss ? presetA.name : presetB.name} (faster optimization)
          </span>
        </div>

        {/* Metric 3: Activation Variance */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-border/20 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-cyan-400" /> Activation Variance
          </span>
          <div className="flex items-center justify-between font-mono text-sm">
            <div className={`flex flex-col ${isAHealthierVar ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
              <span className="text-[10px] text-slate-500 font-sans">{presetA.name}</span>
              {snapshotA.activationVariance.toFixed(2)}
            </div>
            <span className="text-slate-600 font-sans text-xs">vs</span>
            <div className={`flex flex-col text-right ${!isAHealthierVar ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
              <span className="text-[10px] text-slate-500 font-sans">{presetB.name}</span>
              {snapshotB.activationVariance.toFixed(2)}
            </div>
          </div>
          <span className="text-[9px] text-slate-400">
            Winner: {isAHealthierVar ? presetA.name : presetB.name} (closer to unit variance)
          </span>
        </div>
      </div>
    </div>
  );
}
