'use client';

import React from 'react';
import { PlayCircle, ArrowRight, ArrowDown } from 'lucide-react';
import { ModelImplementationData } from '@/lib/schema/implementation.schema';

interface InferencePipelineCardProps {
  pipeline?: ModelImplementationData['inferencePipeline'];
}

export function InferencePipelineCard({ pipeline }: InferencePipelineCardProps) {
  if (!pipeline || pipeline.length === 0) return null;

  return (
    <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-cyan-400 shrink-0" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Inference Pipeline Architecture
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
          End-to-End Pipeline
        </span>
      </div>

      {/* Pipeline Steps Container */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {pipeline.map((step, idx) => {
            const isLast = idx === pipeline.length - 1;

            return (
              <div key={idx} className="flex flex-col md:flex-row items-stretch gap-2">
                <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/30 text-[10px] font-extrabold text-cyan-400">
                      {step.step || idx + 1}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider truncate">
                      Step {step.step || idx + 1}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-200 tracking-tight block truncate" title={step.title}>
                    {step.title}
                  </span>

                  <p className="text-[10px] text-slate-400 leading-normal line-clamp-2" title={step.description}>
                    {step.description}
                  </p>
                </div>

                {!isLast && (
                  <div className="flex items-center justify-center py-1 md:py-0 md:px-0 text-slate-600">
                    <ArrowRight className="hidden md:block h-3.5 w-3.5 text-cyan-500/60 shrink-0" />
                    <ArrowDown className="block md:hidden h-3.5 w-3.5 text-cyan-500/60 shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
