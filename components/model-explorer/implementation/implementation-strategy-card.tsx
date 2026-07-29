'use client';

import React from 'react';
import { GitBranch, ShieldCheck, Cpu } from 'lucide-react';
import { ModelImplementationData } from '@/lib/schema/implementation.schema';
import { CollapsibleCard } from './collapsible-card';

interface ImplementationStrategyCardProps {
  strategy: NonNullable<ModelImplementationData['strategy']>;
}

export function ImplementationStrategyCard({ strategy }: ImplementationStrategyCardProps) {
  if (!strategy) return null;

  const { rationale, backboneStrategy, fineTuningStrategy, trainingProgression } = strategy;

  return (
    <CollapsibleCard
      title="Implementation Strategy & Rationale"
      icon={<GitBranch className="h-4 w-4 text-cyan-400 shrink-0" />}
      summaryBadge={
        <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-md">
          {trainingProgression?.length || 0} Stages
        </span>
      }
      defaultExpandedDesktop={true}
      defaultExpandedMobile={false}
    >
      <div className="space-y-4">
        {/* Decision Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
          {rationale && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 sm:p-3.5 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                Transfer Learning Rationale
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {rationale}
              </p>
            </div>
          )}

          {backboneStrategy && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 sm:p-3.5 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-amber-400" />
                Backbone Freezing Strategy
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {backboneStrategy}
              </p>
            </div>
          )}

          {fineTuningStrategy && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 sm:p-3.5 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
                Fine-Tuning Strategy
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {fineTuningStrategy}
              </p>
            </div>
          )}
        </div>

        {/* Training Progression Timeline */}
        {trainingProgression && trainingProgression.length > 0 && (
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Recommended Training Progression
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              {trainingProgression.map((item, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-extrabold text-cyan-400">
                        {idx + 1}
                      </span>
                      {item.stage}
                    </span>
                    {item.lr && (
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        LR: {item.lr}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
