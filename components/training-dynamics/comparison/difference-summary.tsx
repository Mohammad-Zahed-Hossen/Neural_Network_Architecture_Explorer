'use client';

import React from 'react';
import { SimulationPreset } from '@/lib/types/training-dynamics';
import { getComparativeNarrative } from '@/lib/data-access/learning-engine';
import { Sparkles } from 'lucide-react';

interface DifferenceSummaryProps {
  presetA: SimulationPreset;
  presetB: SimulationPreset;
}

export default function DifferenceSummary({ presetA, presetB }: DifferenceSummaryProps) {
  const narrative = getComparativeNarrative(presetA, presetB);

  return (
    <div className="glass-card rounded-2xl border border-primary/30 bg-slate-950/60 p-5 backdrop-blur-md flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-border/10 pb-3">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <h3 className="text-sm font-bold text-white">Comparative Educational Takeaway</h3>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed font-sans">
        {narrative}
      </p>
    </div>
  );
}
