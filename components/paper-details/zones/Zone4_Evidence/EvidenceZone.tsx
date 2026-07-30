'use client';

import React from 'react';
import { PaperEvidence } from '@/types/paper-schema';
import { SectionHeader } from '../../shared/SectionHeader';
import { MetricCard } from '../../shared/MetricCard';
import { ExpandableCard } from '../../shared/ExpandableCard';
import { BarChart3, Database, Layers, CheckCircle, ExternalLink, Trophy, Code } from 'lucide-react';

interface EvidenceZoneProps {
  evidence: PaperEvidence;
}

export function EvidenceZone({ evidence }: EvidenceZoneProps) {
  const { datasets, richDatasets, primaryResults, ablationStudies, reproducibilityNotes } = evidence;

  return (
    <section id="evidence" className="space-y-6 scroll-mt-24 w-full max-w-full min-w-0">
      <SectionHeader
        id="evidence-header"
        title="Empirical Evidence & Benchmark Results"
        subtitle="SOTA metrics, benchmark dataset evaluations, and component ablation studies."
        icon={<BarChart3 className="w-5 h-5" />}
      />

      {/* RKR Rich Dataset Reference Cards */}
      {richDatasets && richDatasets.length > 0 ? (
        <div className="space-y-3 w-full min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 min-w-0">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Benchmark Dataset Reference Cards</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
            {richDatasets.map((ds, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="font-bold text-slate-100 text-sm truncate">{ds.name}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed break-words">{ds.description}</p>
                <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                  {ds.officialUrl && (
                    <a href={ds.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium">
                      <ExternalLink className="w-3 h-3" /> Official Page
                    </a>
                  )}
                  {ds.leaderboardUrl && (
                    <a href={ds.leaderboardUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium">
                      <Trophy className="w-3 h-3" /> Leaderboard
                    </a>
                  )}
                  {ds.codeUrl && (
                    <a href={ds.codeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium">
                      <Code className="w-3 h-3" /> Code/Loader
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Fallback Evaluated Datasets Row */
        datasets.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap bg-slate-900/40 p-3 rounded-xl border border-slate-800 w-full min-w-0">
            <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Evaluated Datasets:
            </span>
            {datasets.map((dataset, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700/80 break-words max-w-full"
              >
                {dataset}
              </span>
            ))}
          </div>
        )
      )}

      {/* Primary Benchmark Results Grid */}
      <div id="evidence-results" className="space-y-3 w-full min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Primary Benchmark Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0">
          {primaryResults.map((result, idx) => (
            <MetricCard key={idx} result={result} />
          ))}
        </div>
      </div>

      {/* Ablation Matrix Studies */}
      {ablationStudies.length > 0 && (
        <div id="evidence-ablations" className="space-y-3 pt-2 w-full min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 min-w-0">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Ablation Studies & Impact Analysis</span>
          </h3>
          <div className="space-y-3 w-full min-w-0">
            {ablationStudies.map((ablation, idx) => (
              <ExpandableCard
                key={idx}
                title={ablation.title}
                subtitle={`Removed: ${ablation.removedComponent}`}
                defaultExpanded={false}
              >
                <div className="space-y-2 pt-1 text-xs sm:text-sm min-w-0">
                  <p className="text-slate-300 break-words">{ablation.description}</p>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-cyan-300 font-mono text-xs break-words overflow-x-auto">
                    <strong>Performance Impact Delta: </strong> {ablation.performanceDelta}
                  </div>
                </div>
              </ExpandableCard>
            ))}
          </div>
        </div>
      )}

      {/* Empirical Reproducibility Notes */}
      {reproducibilityNotes && (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 min-w-0">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <strong className="text-slate-200 font-semibold">Empirical Setup & Reproducibility Context: </strong>
            <span className="break-words">{reproducibilityNotes}</span>
          </div>
        </div>
      )}
    </section>
  );
}
