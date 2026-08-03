'use client';

import React from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';

interface ComparisonReferencesProps {
  result: ComparisonResult;
}

export const ComparisonReferences: React.FC<ComparisonReferencesProps> = ({ result }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-md">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
        Academic Citations & Implementation Code Reference
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {result.objects.map((obj) => (
          <div key={obj.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">{obj.title}</span>
                <span className="text-[10px] text-slate-500 font-mono uppercase">{obj.type}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{obj.summary}</p>

              {obj.researchCitations.length > 0 && (
                <div className="mb-3 bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px]">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Citations</span>
                  <span className="text-slate-300 italic">{obj.researchCitations.join('; ')}</span>
                </div>
              )}

              {Boolean(obj.implementationDetails.codeSnippet) && (
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                  <pre>{String(obj.implementationDetails.codeSnippet || '')}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
