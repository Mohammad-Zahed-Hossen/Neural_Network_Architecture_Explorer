import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ArchitecturePatternNavigationProps } from './types';

export default function ArchitecturePatternNavigation({
  patterns,
  selectedPattern,
  onSelectPattern,
}: ArchitecturePatternNavigationProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-4">
      <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block pl-2">
        Select Design Pattern
      </span>

      <div className="flex lg:flex-col overflow-x-auto scroll-fade-x lg:overflow-x-visible gap-2.5 pb-2 lg:pb-0 scrollbar-none w-full bg-slate-950/40 border border-border/25 rounded-2xl p-2 backdrop-blur-md">
        {patterns.map((p) => {
          const isActive = selectedPattern === p.id;
          const PIcon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPattern(p.id)}
              className={`flex-shrink-0 lg:flex-shrink-1 w-[220px] lg:w-full min-h-[44px] text-left px-4 py-3.5 rounded-xl text-xs transition-all duration-300 flex items-center justify-between cursor-pointer border ${
                isActive
                  ? 'bg-slate-900 border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.15)] text-[#22d3ee]'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-slate-950/50"
                  style={{
                    borderColor: isActive ? '#22d3ee' : p.borderColor,
                    color: isActive ? '#22d3ee' : p.color,
                  }}
                >
                  <PIcon className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm tracking-tight truncate">{p.name.split(' (')[0]}</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive ? 'rotate-90 text-[#22d3ee]' : 'text-slate-600'
                } hidden lg:block`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
