'use client';

import React from 'react';
import { EngineState } from '../../../../lib/training';

interface GradientFlowOverlayProps {
  state: EngineState;
}

export function GradientFlowOverlay({ state }: GradientFlowOverlayProps) {
  return (
    <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1 p-2 rounded.md bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-300">
      <div>Epoch: <span className="text-emerald-400">{state.currentEpoch}</span></div>
      <div>Loss: <span className="text-emerald-400">{state.metrics.loss ?? 2.302}</span></div>
      <div>GradNorm: <span className="text-emerald-400">{state.metrics.gradientNorm ?? 1.0}</span></div>
    </div>
  );
}
