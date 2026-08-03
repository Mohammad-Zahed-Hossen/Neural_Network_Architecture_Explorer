'use client';

import React from 'react';

export function GradientFlowLegend() {
  return (
    <div className="flex items-center gap-4 p-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-400">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span>Healthy Signal</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
        <span>Warning / Attenuated</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
        <span>Critical / Exploding</span>
      </div>
    </div>
  );
}
