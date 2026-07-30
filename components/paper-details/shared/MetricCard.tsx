'use client';

import React from 'react';
import { Award, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { MetricResult } from '@/types/paper-schema';

interface MetricCardProps {
  result: MetricResult;
}

export function MetricCard({ result }: MetricCardProps) {
  const { metricName, value, unit, baselineValue, isSOTA } = result;

  let deltaDisplay = null;
  if (baselineValue !== undefined && typeof value === 'number' && typeof baselineValue === 'number') {
    const diff = value - baselineValue;
    const isImprovement = diff < 0; // lower error rate is usually better
    deltaDisplay = (
      <div className={`flex items-center text-xs font-semibold ${isImprovement ? 'text-emerald-400' : 'text-amber-400'} truncate min-w-0`}>
        {isImprovement ? <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" /> : <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />}
        <span className="truncate">{Math.abs(diff).toFixed(2)}{unit} vs baseline</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all w-full max-w-full min-w-0">
      {isSOTA && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 z-10">
          <Award className="w-3 h-3 shrink-0" />
          <span>SOTA</span>
        </div>
      )}
      <p className="text-xs text-slate-400 font-medium pr-16 break-words">{metricName}</p>
      <div className="flex items-baseline gap-1 mt-2 mb-1 min-w-0 flex-wrap">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono break-all">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-400 shrink-0">{unit}</span>}
      </div>
      {deltaDisplay}
    </div>
  );
}
