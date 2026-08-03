'use client';

import React from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';

interface ComparisonRelationshipsProps {
  result: ComparisonResult;
}

export const ComparisonRelationships: React.FC<ComparisonRelationshipsProps> = ({ result }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-md">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        Knowledge Graph Relationship Topology
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.objects.map((obj) => (
          <div key={obj.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">{obj.title}</h4>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Prerequisites</span>
                {obj.relationships.prerequisites.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {obj.relationships.prerequisites.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">Foundational architecture</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Successors / Derived</span>
                {obj.relationships.successors.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {obj.relationships.successors.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">Current state</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Related Objects</span>
                <div className="flex flex-wrap gap-1">
                  {obj.relationships.relatedObjects.slice(0, 4).map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[11px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
