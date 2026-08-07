'use client';

import React from 'react';
import Link from 'next/link';
import type { ComparisonResult } from '@/lib/comparison/types';
import { resolveEntityLink } from '@/lib/comparison/utils/entity-link';

import { CollapsibleText } from './CollapsibleText';

interface ComparisonTimelineProps {
  result: ComparisonResult;
}

export const ComparisonTimeline: React.FC<ComparisonTimelineProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const sortedObjects = [...result.objects].sort((a, b) => {
    const yearA = typeof a.metrics.year === 'number' ? a.metrics.year : 2015;
    const yearB = typeof b.metrics.year === 'number' ? b.metrics.year : 2015;
    return yearA - yearB;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl mb-8">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 font-mono tracking-wider uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>
          Research Lineage
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide Lineage' : 'Show Research Lineage'}</span>
          <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 mt-6 animate-fadeIn">
          {sortedObjects.map((obj, i) => {
            const colors = ['text-blue-300', 'text-emerald-300', 'text-amber-300', 'text-purple-300', 'text-rose-300', 'text-cyan-300'];
            const titleColor = colors[i % colors.length];

            const selfLink = resolveEntityLink(obj.id, obj.type);

            return (
              <div key={obj.id} className="relative pl-6">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-amber-400 shadow-md"></div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <Link
                      href={selfLink.href}
                      className={`text-xs font-bold ${titleColor} hover:underline flex items-center gap-1 group`}
                    >
                      <span>{obj.title}</span>
                      <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-amber-400 font-semibold">
                      {typeof obj.metrics.year === 'number' ? obj.metrics.year : 'Canonical'}
                    </span>
                  </div>

                  <div className="mt-2">
                    <CollapsibleText
                      text={obj.summary}
                      maxLines={2}
                      className="text-xs text-slate-300 leading-relaxed"
                    />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
                    <div><span className="text-slate-500">Domain:</span> {obj.domain}</div>
                    <div><span className="text-slate-500">Type:</span> {obj.type}</div>
                    {obj.evolutionLineage.predecessors.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500">Predecessors:</span>
                        {obj.evolutionLineage.predecessors.map((p, idx) => {
                          const linkInfo = resolveEntityLink(p);
                          return (
                            <Link
                              key={idx}
                              href={linkInfo.href}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-300 hover:underline transition-colors"
                            >
                              {linkInfo.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
