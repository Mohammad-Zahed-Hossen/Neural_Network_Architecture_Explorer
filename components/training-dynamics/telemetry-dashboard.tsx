'use client';

import React from 'react';
import { TelemetrySnapshot } from '@/lib/types/training-dynamics';
import { Activity, Flame, ShieldAlert, Zap, TrendingDown, Layers } from 'lucide-react';

interface TelemetryDashboardProps {
  snapshot: TelemetrySnapshot;
}

export default function TelemetryDashboard({ snapshot }: TelemetryDashboardProps) {
  const getStatusBadge = (status: TelemetrySnapshot['convergenceStatus']) => {
    switch (status) {
      case 'Diverging':
        return { label: 'Diverging (Exploding)', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
      case 'Vanishing':
        return { label: 'Vanishing Gradient', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'Stalled':
        return { label: 'Optimization Stalled', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'Stabilizing':
        return { label: 'Stabilizing', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' };
      case 'Converging':
      default:
        return { label: 'Healthy Convergence', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    }
  };

  const statusStyle = getStatusBadge(snapshot.convergenceStatus);

  return (
    <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/60 p-4 sm:p-5 backdrop-blur-md grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 items-center">
      {/* Epoch & Iteration */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
          <Activity className="h-3 w-3 text-primary" /> Epoch
        </span>
        <span className="text-lg font-black text-white font-mono">
          {snapshot.epoch} <span className="text-xs font-normal text-slate-500">({snapshot.iteration} iter)</span>
        </span>
      </div>

      {/* Loss */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-emerald-400" /> Current Loss
        </span>
        <span className="text-lg font-black text-emerald-400 font-mono">
          {snapshot.loss.toFixed(3)}
        </span>
      </div>

      {/* Gradient Norm */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-400" /> Gradient Norm
        </span>
        <span className="text-lg font-black text-white font-mono">
          {snapshot.gradientNorm.toFixed(3)}
        </span>
      </div>

      {/* Activation Var */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
          <Flame className="h-3 w-3 text-cyan-400" /> Activation Var
        </span>
        <span className="text-lg font-black text-white font-mono">
          {snapshot.activationVariance.toFixed(2)}
        </span>
      </div>

      {/* Avg Weight Update Delta W */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
          <Layers className="h-3 w-3 text-purple-400" /> Avg ΔW
        </span>
        <span className="text-lg font-black text-purple-300 font-mono">
          {snapshot.updateMagnitude.toFixed(4)}
        </span>
      </div>

      {/* Learning Rate */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Learning Rate
        </span>
        <span className="text-base font-bold text-slate-200 font-mono">
          {snapshot.learningRate}
        </span>
      </div>

      {/* Status Badge */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col justify-center">
        <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-center flex items-center justify-center gap-1.5 ${statusStyle.bg} ${statusStyle.border}`}>
          <ShieldAlert className="h-3.5 w-3.5" />
          <span className={statusStyle.text}>{statusStyle.label}</span>
        </div>
      </div>
    </div>
  );
}
