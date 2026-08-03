'use client';

import React from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';

interface ComparisonMetricsProps {
  result: ComparisonResult;
}

export const ComparisonMetrics: React.FC<ComparisonMetricsProps> = ({ result }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {result.metrics.map((metric) => {
        const numericValues = result.objects
          .map((o) => ({ obj: o, val: result.metricMatrix[metric.id]?.[o.id]?.value }))
          .filter((v): v is { obj: typeof v.obj; val: number } => typeof v.val === 'number');

        const maxVal = Math.max(...numericValues.map((v) => v.val), 1);

        return (
          <div key={metric.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{metric.label}</h4>
              <span className="text-[10px] text-slate-500 font-mono">{metric.category}</span>
            </div>

            <div className="space-y-3">
              {result.objects.map((obj, i) => {
                const entry = result.metricMatrix[metric.id]?.[obj.id];
                const rawVal = typeof entry?.value === 'number' ? entry.value : 0;
                const percent = Math.min(100, Math.max(10, Math.round((rawVal / maxVal) * 100)));

                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
                const barColor = colors[i % colors.length];

                return (
                  <div key={obj.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium truncate max-w-[150px]">{obj.title}</span>
                      <span className="font-mono text-white font-semibold">{entry?.formatted || 'N/A'}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
