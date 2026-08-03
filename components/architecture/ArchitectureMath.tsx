import React from 'react';
import MathFormula from '@/components/ui/math-formula';
import type { ArchitectureMathProps } from './types';

export default function ArchitectureMath({ formula }: ArchitectureMathProps) {
  return (
    <div className="space-y-1.5 w-full">
      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
        Formal Mathematical Specification
      </span>
      <div className="bg-[#020617]/70 border border-[#22d3ee]/20 rounded-xl p-3 sm:p-4 overflow-x-auto scrollbar-thin shadow-inner">
        <MathFormula formula={formula} className="my-0 bg-transparent border-none p-0 text-[#22d3ee]" />
      </div>
    </div>
  );
}
