'use client';

import React from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';

interface ComparisonTableProps {
  result: ComparisonResult;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ result }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden mb-8 backdrop-blur-md">
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Side-by-Side Quantitative Metrics Matrix
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="py-3 px-4 border-b border-slate-800 min-w-[180px]">Metric / Property</th>
              {result.objects.map((obj) => (
                <th key={obj.id} className="py-3 px-4 border-b border-slate-800 min-w-[160px] text-white font-bold">
                  <div>{obj.title}</div>
                  <div className="text-[9px] text-slate-500 font-normal uppercase">{obj.type} • {obj.domain}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {result.metrics.map((metric) => (
              <tr key={metric.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-200">
                  <div>{metric.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{metric.description}</div>
                </td>
                {result.objects.map((obj) => {
                  const entry = result.metricMatrix[metric.id]?.[obj.id];
                  const status = entry?.status;
                  return (
                    <td key={obj.id} className="py-3 px-4">
                      <span
                        className={`inline-block font-mono text-xs px-2 py-1 rounded border ${
                          status === 'better'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 font-semibold'
                            : status === 'worse'
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/20'
                            : 'bg-slate-950/40 text-slate-300 border-slate-800'
                        }`}
                      >
                        {entry?.formatted || 'N/A'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
