import React from 'react';
import { Network } from 'lucide-react';
import type { ArchitecturePatternHeaderProps } from './types';

export default function ArchitecturePatternHeader({
  activePattern,
  variant = 'page',
}: ArchitecturePatternHeaderProps) {
  if (variant === 'pattern' && activePattern) {
    const Icon = activePattern.icon;
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/10 pb-4">
        <span className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
          <Icon className="h-5.5 w-5.5" style={{ color: activePattern.color }} />
          {activePattern.name}
        </span>

        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border font-mono"
          style={{
            color: activePattern.color,
            borderColor: activePattern.borderColor,
            backgroundColor: activePattern.bgColor,
          }}
        >
          Math Pattern
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 border-b border-border/10 pb-4 sm:pb-5">
      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
        <Network className="h-7 w-7 sm:h-8 sm:w-8 text-[#22d3ee]" />
        Architecture Design Patterns Library
      </h1>
      <p className="text-[11px] sm:text-xs text-slate-400 font-medium max-w-3xl leading-snug">
        Master the core design blocks that transfer across hundreds of deep learning networks. Shift from memorizing model names to understanding routing motifs.
      </p>
    </div>
  );
}
