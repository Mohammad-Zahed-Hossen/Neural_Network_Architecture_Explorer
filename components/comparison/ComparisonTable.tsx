'use client';

import React, { useMemo } from 'react';
import {
  Trophy,
  Award,
  HardDrive,
  Calendar,
  BookOpen,
} from 'lucide-react';
import type { ComparisonResult } from '@/lib/comparison/types';
import { metricRegistry } from '@/lib/comparison/metric-registry';

interface ComparisonTableProps {
  result: ComparisonResult;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ result }) => {
  const colCount = result.objects.length + 1;

  // Group metrics into metric categories using MetricRegistry
  const groupedMetrics = useMemo(() => {
    const accuracyGroup: string[] = [];
    const resourceGroup: string[] = [];
    const researchGroup: string[] = [];

    for (const metric of result.metrics) {
      const def = metricRegistry.get(metric.id);
      const cat = def ? def.category : metric.category;

      if (cat === 'Performance') {
        accuracyGroup.push(metric.id);
      } else if (cat === 'Architecture' || cat === 'Resources' || cat === 'Efficiency') {
        resourceGroup.push(metric.id);
      } else {
        researchGroup.push(metric.id);
      }
    }

    return { accuracyGroup, resourceGroup, researchGroup };
  }, [result.metrics]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden mb-8 backdrop-blur-md shadow-xl">
      {/* Table Title Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 tracking-wide uppercase font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
          Metric Matrix
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Comparing {result.objects.length} Entities
          </span>
          <span className="text-[10px] text-cyan-400/80 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 sm:hidden">
            ← Scroll horizontally →
          </span>
        </div>
      </div>

      {/* Desktop Matrix Table (hidden on mobile sm:hidden) */}
      <div className="hidden sm:block overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 z-20 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 sticky left-0 z-30 bg-slate-950 border-r border-slate-800 min-w-[220px] shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                Metric / Architectural Property
              </th>
              {result.objects.map((obj, i) => {
                const headerColors = ['text-blue-300', 'text-emerald-300', 'text-amber-300', 'text-purple-300'];
                const titleColor = headerColors[i % headerColors.length];

                return (
                  <th key={obj.id} className="py-3.5 px-4 min-w-[200px] border-r border-slate-800/60">
                    <div className={`font-extrabold text-sm font-sans tracking-tight ${titleColor}`}>
                      {obj.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 lowercase">
                      {obj.type} • {obj.domain}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {/* SECTION 1: ACCURACY & PERFORMANCE METRICS */}
            <tr className="bg-slate-950/90 border-y border-slate-800">
              <td
                colSpan={colCount}
                className="py-2.5 px-4 sticky left-0 z-10 bg-slate-950 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                1. Accuracy & Performance Benchmark Matrix
              </td>
            </tr>

            {groupedMetrics.accuracyGroup.map((metricId, idx) => {
              const metric = result.metrics.find((m) => m.id === metricId);
              if (!metric) return null;

              const zebraBg = idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-950/50';

              return (
                <tr key={metric.id} className={`${zebraBg} hover:bg-cyan-950/20 transition-colors`}>
                  <td className="py-3 px-4 font-bold text-slate-200 sticky left-0 z-10 bg-slate-950 border-r border-slate-800 min-w-[220px] shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                    <div>{metric.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{metric.description}</div>
                  </td>
                  {result.objects.map((obj) => {
                    const entry = result.metricMatrix[metric.id]?.[obj.id];
                    const status = entry?.status;
                    const isBetter = status === 'better';
                    const isWorse = status === 'worse';

                    return (
                      <td key={obj.id} className="py-3 px-4 border-r border-slate-800/40 align-middle">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-md border font-semibold ${
                              isBetter
                                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                                : isWorse
                                ? 'bg-rose-950/40 text-rose-300 border-rose-500/20'
                                : 'bg-slate-950/80 text-slate-300 border-slate-800'
                            }`}
                          >
                            {isBetter && (
                              <span className="flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-sans font-bold">Best</span>
                              </span>
                            )}
                            <span>{entry?.formatted || 'N/A'}</span>
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* SECTION 2: RESOURCE EFFICIENCY & COMPUTATIONAL COMPLEXITY */}
            <tr className="bg-slate-950/90 border-y border-slate-800">
              <td
                colSpan={colCount}
                className="py-2.5 px-4 sticky left-0 z-10 bg-slate-950 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                2. Resource Efficiency & Compute Complexity
              </td>
            </tr>

            {groupedMetrics.resourceGroup.map((metricId, idx) => {
              const metric = result.metrics.find((m) => m.id === metricId);
              if (!metric) return null;

              const zebraBg = idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-950/50';

              return (
                <tr key={metric.id} className={`${zebraBg} hover:bg-cyan-950/20 transition-colors`}>
                  <td className="py-3 px-4 font-bold text-slate-200 sticky left-0 z-10 bg-slate-950 border-r border-slate-800 min-w-[220px] shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                    <div>{metric.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{metric.description}</div>
                  </td>
                  {result.objects.map((obj) => {
                    const entry = result.metricMatrix[metric.id]?.[obj.id];
                    const status = entry?.status;
                    const isBetter = status === 'better';
                    const isWorse = status === 'worse';

                    return (
                      <td key={obj.id} className="py-3 px-4 border-r border-slate-800/40 align-middle">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-md border font-semibold ${
                              isBetter
                                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                                : isWorse
                                ? 'bg-rose-950/40 text-rose-300 border-rose-500/20'
                                : 'bg-slate-950/80 text-slate-300 border-slate-800'
                            }`}
                          >
                            {isBetter && (
                              <span className="flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-sans font-bold">Best</span>
                              </span>
                            )}
                            <span>{entry?.formatted || 'N/A'}</span>
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* SECTION 3: METADATA & RESEARCH CITATION */}
            <tr className="bg-slate-950/90 border-y border-slate-800">
              <td
                colSpan={colCount}
                className="py-2.5 px-4 sticky left-0 z-10 bg-slate-950 text-purple-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                3. Metadata & Research Origins
              </td>
            </tr>

            {/* Year Row */}
            <tr className="bg-slate-900/30 hover:bg-cyan-950/20 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-200 sticky left-0 z-10 bg-slate-950 border-r border-slate-800 min-w-[220px] shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Publication Year</span>
                </div>
              </td>
              {result.objects.map((obj) => (
                <td key={obj.id} className="py-3 px-4 border-r border-slate-800/40 font-mono text-slate-300">
                  {obj.rawObject.metadata.year || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Authors Row */}
            <tr className="bg-slate-950/50 hover:bg-cyan-950/20 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-200 sticky left-0 z-10 bg-slate-950 border-r border-slate-800 min-w-[220px] shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Key Authors / Contributors</span>
                </div>
              </td>
              {result.objects.map((obj) => (
                <td key={obj.id} className="py-3 px-4 border-r border-slate-800/40 text-slate-400 text-xs">
                  {obj.rawObject.metadata.authors && obj.rawObject.metadata.authors.length > 0
                    ? obj.rawObject.metadata.authors.slice(0, 3).join(', ')
                    : 'N/A'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Purpose-Built Mobile Card View (block sm:hidden) */}
      <div className="block sm:hidden p-4 space-y-5">
        {result.metrics.map((metric) => (
          <div key={metric.id} className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="font-bold text-xs text-slate-100">{metric.label}</div>
              <span className="text-[10px] text-slate-500 font-mono">{metric.category}</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{metric.description}</p>

            <div className="grid grid-cols-2 gap-2">
              {result.objects.map((obj, i) => {
                const entry = result.metricMatrix[metric.id]?.[obj.id];
                const isBetter = entry?.status === 'better';
                const colors = ['text-blue-300', 'text-emerald-300', 'text-amber-300', 'text-purple-300'];

                return (
                  <div
                    key={obj.id}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                      isBetter
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className={`font-semibold text-[11px] truncate ${colors[i % colors.length]}`}>
                      {obj.title}
                    </span>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono font-bold">{entry?.formatted || 'N/A'}</span>
                      {isBetter && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

