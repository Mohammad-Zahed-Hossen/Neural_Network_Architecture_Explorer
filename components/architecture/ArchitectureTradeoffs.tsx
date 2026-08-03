import React from 'react';
import type { ArchitectureTradeoffsProps } from './types';

export default function ArchitectureTradeoffs({ tradeoffs }: ArchitectureTradeoffsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Key Advantages */}
      <div className="bg-[#020617]/50 border border-white/5 rounded-xl p-4 space-y-2">
        <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">
          Key Advantages
        </span>
        <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
          {tradeoffs.pros.map((p, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Trade-offs & Constraints */}
      <div className="bg-[#020617]/50 border border-white/5 rounded-xl p-4 space-y-2">
        <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block">
          Trade-offs & Constraints
        </span>
        <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
          {tradeoffs.cons.map((c, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-amber-500 shrink-0 mt-0.5">•</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
