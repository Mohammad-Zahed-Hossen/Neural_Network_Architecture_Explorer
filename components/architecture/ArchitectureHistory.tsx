import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ArchitectureHistoryProps } from './types';

export default function ArchitectureHistory({ problem, solution }: ArchitectureHistoryProps) {
  return (
    <div className="space-y-4 text-xs sm:text-sm font-medium">
      {/* Problem Box */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          What problem does this solve?
        </span>
        <p className="text-slate-300 leading-relaxed pl-4.5 border-l border-border/10">
          {problem}
        </p>
      </div>

      {/* Solution Box */}
      <div className="space-y-1 pt-2">
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          How does the routing solve it?
        </span>
        <p className="text-slate-300 leading-relaxed pl-4.5 border-l border-border/10">
          {solution}
        </p>
      </div>
    </div>
  );
}
