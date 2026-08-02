'use client';

import React from 'react';
import { SimulationPreset } from '@/lib/types/training-dynamics';
import { Layers, GitCommit, ShieldCheck, Cpu } from 'lucide-react';

interface ArchitectureOverlayProps {
  preset: SimulationPreset;
  side: 'A' | 'B';
}

export default function ArchitectureOverlay({ preset, side }: ArchitectureOverlayProps) {
  const getDiagramContent = () => {
    switch (preset.connectionType) {
      case 'residual':
        return {
          icon: <GitCommit className="h-4 w-4 text-emerald-400" />,
          formula: 'H(x) = F(x) + x',
          diagram: 'Conv ➔ Conv ➔ (+) ➔ ReLU',
          desc: 'Identity Shortcut Bypass',
        };
      case 'dense':
        return {
          icon: <Cpu className="h-4 w-4 text-purple-400" />,
          formula: 'x_l = H([x_0, ..., x_{l-1}])',
          diagram: 'L1 ➔ L2 ➔ L3 ➔ Concat',
          desc: 'Dense Feature Reuse Pathways',
        };
      case 'batchnorm':
        return {
          icon: <ShieldCheck className="h-4 w-4 text-cyan-400" />,
          formula: 'y = γ((x - μ)/σ) + β',
          diagram: 'Conv ➔ BatchNorm ➔ ReLU',
          desc: 'Zero-Mean Unit-Variance Barrier',
        };
      case 'sequential':
      default:
        return {
          icon: <Layers className="h-4 w-4 text-blue-400" />,
          formula: 'x_{l+1} = σ(W_l x_l + b_l)',
          diagram: 'Layer 1 ➔ Layer 2 ➔ Layer 3',
          desc: 'Standard Feedforward Stack',
        };
    }
  };

  const content = getDiagramContent();

  return (
    <div className="glass-card rounded-xl border border-border/30 bg-slate-900/60 p-3 flex flex-col gap-1.5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-white flex items-center gap-1.5">
          {content.icon}
          Simulator {side}: {preset.name}
        </span>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {content.desc}
        </span>
      </div>

      {/* Simplified Structural Formula & Flow Diagram */}
      <div className="flex items-center justify-between text-xs font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800/60">
        <span className="text-slate-300 font-semibold">{content.diagram}</span>
        <span className="text-primary font-bold">{content.formula}</span>
      </div>
    </div>
  );
}
