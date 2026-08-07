'use client';

import React from 'react';
import Link from 'next/link';
import type { ComparisonResult } from '@/lib/comparison/types';
import { resolveEntityLink } from '@/lib/comparison/utils/entity-link';

interface ComparisonRelationshipsProps {
  result: ComparisonResult;
}

export const ComparisonRelationships: React.FC<ComparisonRelationshipsProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl mb-8">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 font-mono tracking-wider uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
          Topology Graph
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide Topology Graph' : 'Show Topology Graph'}</span>
          <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 animate-fadeIn">
          {result.objects.map((obj, i) => {
            const colors = ['text-blue-300', 'text-emerald-300', 'text-amber-300', 'text-purple-300', 'text-rose-300', 'text-cyan-300'];
            const titleColor = colors[i % colors.length];

            const selfLink = resolveEntityLink(obj.id, obj.type);

            return (
              <div key={obj.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <Link
                    href={selfLink.href}
                    className={`text-xs font-bold ${titleColor} uppercase tracking-wider mb-3 hover:underline flex items-center gap-1 group`}
                  >
                    <span>{obj.title}</span>
                    <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>

                  <div className="space-y-3.5 text-xs">
                    {/* Prerequisites */}
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Prerequisites</span>
                      {obj.relationships.prerequisites.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {obj.relationships.prerequisites.map((p, idx) => {
                            const linkInfo = resolveEntityLink(p);
                            return (
                              <Link
                                key={idx}
                                href={linkInfo.href}
                                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-blue-300 text-[11px] font-mono transition-colors"
                              >
                                {linkInfo.title}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Foundational architecture</span>
                      )}
                    </div>

                    {/* Successors / Derived */}
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Successors / Derived</span>
                      {obj.relationships.successors.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {obj.relationships.successors.map((s, idx) => {
                            const linkInfo = resolveEntityLink(s);
                            return (
                              <Link
                                key={idx}
                                href={linkInfo.href}
                                className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/60 text-emerald-300 text-[11px] font-mono transition-colors"
                              >
                                {linkInfo.title}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Current state</span>
                      )}
                    </div>

                    {/* Related Entities */}
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Related Entities</span>
                      <div className="flex flex-wrap gap-1">
                        {obj.relationships.relatedObjects.slice(0, 4).map((r, idx) => {
                          const linkInfo = resolveEntityLink(r);
                          return (
                            <Link
                              key={idx}
                              href={linkInfo.href}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-[11px] font-mono transition-colors"
                            >
                              {linkInfo.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
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
