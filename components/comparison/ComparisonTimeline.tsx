'use client';

import React from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';

interface ComparisonTimelineProps {
  result: ComparisonResult;
}

export const ComparisonTimeline: React.FC<ComparisonTimelineProps> = ({ result }) => {
  const sortedObjects = [...result.objects].sort((a, b) => {
    const yearA = typeof a.metrics.year === 'number' ? a.metrics.year : 2015;
    const yearB = typeof b.metrics.year === 'number' ? b.metrics.year : 2015;
    return yearA - yearB;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-md">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        Chronological Research Evolution & Lineage Timeline
      </h3>

      <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
        {sortedObjects.map((obj) => (
          <div key={obj.id} className="relative pl-6">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-400"></div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">{obj.title}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {typeof obj.metrics.year === 'number' ? obj.metrics.year : 'Canonical'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">{obj.summary}</p>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-4 text-[11px] text-slate-400">
                <div><span className="text-slate-500">Domain:</span> {obj.domain}</div>
                <div><span className="text-slate-500">Type:</span> {obj.type}</div>
                {obj.evolutionLineage.predecessors.length > 0 && (
                  <div><span className="text-slate-500">Predecessors:</span> {obj.evolutionLineage.predecessors.join(', ')}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
