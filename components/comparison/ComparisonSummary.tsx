'use client';

import React from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';

interface ComparisonSummaryProps {
  result: ComparisonResult;
}

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ result }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Key Similarities */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Key Similarities
        </h3>
        {result.keySimilarities.length > 0 ? (
          <div className="space-y-3">
            {result.keySimilarities.map((sim, i) => (
              <div key={i} className="bg-slate-900/60 rounded-lg p-3 border border-emerald-500/10">
                <div className="text-xs font-medium text-emerald-300">{sim.feature}</div>
                <div className="text-xs text-slate-300 mt-1">{sim.description || String(sim.value)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">All compared entities share foundational neural network properties.</p>
        )}
      </div>

      {/* Key Differences */}
      <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Key Differences
        </h3>
        <div className="space-y-3">
          {result.keyDifferences.slice(0, 3).map((diff, i) => (
            <div key={i} className="bg-slate-900/60 rounded-lg p-3 border border-amber-500/10">
              <div className="text-xs font-medium text-amber-300">{diff.feature}</div>
              {diff.impact && <div className="text-[11px] text-slate-400 mt-1 italic">{diff.impact}</div>}
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                {Object.entries(diff.values).map(([objId, val]) => (
                  <div key={objId} className="bg-slate-950/50 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] font-mono">{objId}</span>
                    <span className="text-slate-300 font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
