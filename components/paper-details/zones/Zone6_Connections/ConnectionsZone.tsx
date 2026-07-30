'use client';

import React from 'react';
import { PaperConnections } from '@/types/paper-schema';
import { SectionHeader } from '../../shared/SectionHeader';
import { Network, ArrowLeft, ArrowRight, HelpCircle, Compass } from 'lucide-react';

interface ConnectionsZoneProps {
  connections: PaperConnections;
}

export function ConnectionsZone({ connections }: ConnectionsZoneProps) {
  const { lineage, researchGaps, futureExtensions } = connections;

  const predecessors = lineage.filter(p => p.relationshipType === 'predecessor' || p.relationshipType === 'inspired_by');
  const successors = lineage.filter(p => p.relationshipType === 'successor' || p.relationshipType === 'competing');

  return (
    <section id="connections" className="space-y-6 scroll-mt-24 w-full max-w-full min-w-0">
      <SectionHeader
        id="connections-header"
        title="Research Network & Lineage Connections"
        subtitle="Historical predecessors, successor architectures, open research gaps, and future evolutions."
        icon={<Network className="w-5 h-5" />}
      />

      {/* Predecessors & Successors Pedigree Grid */}
      <div id="connections-lineage" className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-full min-w-0">
        {/* Predecessors Column */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2 min-w-0">
            <ArrowLeft className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Predecessors & Influences</span>
          </h3>
          <div className="space-y-3 min-w-0">
            {predecessors.map(p => (
              <div key={p.paperId} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all min-w-0 overflow-hidden">
                <div className="flex items-start justify-between gap-2 mb-1 min-w-0">
                  <span className="font-semibold text-slate-200 text-xs sm:text-sm break-words min-w-0">{p.title}</span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded shrink-0">{p.year}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1.5 break-words">{p.authors}</p>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800/60 break-words">
                  {p.description}
                </p>
              </div>
            ))}
            {predecessors.length === 0 && <p className="text-xs text-slate-400">No predecessors listed.</p>}
          </div>
        </div>

        {/* Successors Column */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2 min-w-0">
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Successors & Evolutions</span>
          </h3>
          <div className="space-y-3 min-w-0">
            {successors.map(p => (
              <div key={p.paperId} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all min-w-0 overflow-hidden">
                <div className="flex items-start justify-between gap-2 mb-1 min-w-0">
                  <span className="font-semibold text-slate-200 text-xs sm:text-sm break-words min-w-0">{p.title}</span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded shrink-0">{p.year}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1.5 break-words">{p.authors}</p>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800/60 break-words">
                  {p.description}
                </p>
              </div>
            ))}
            {successors.length === 0 && <p className="text-xs text-slate-400">No successors listed.</p>}
          </div>
        </div>
      </div>

      {/* Research Gaps & Future Extensions */}
      <div id="connections-gaps" className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 w-full max-w-full min-w-0">
        {/* Unaddressed Research Gaps */}
        {researchGaps.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 min-w-0 overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3 min-w-0">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Unaddressed Research Gaps</span>
            </h3>
            <ul className="space-y-2 min-w-0">
              {researchGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span className="break-words min-w-0">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Future Extensions */}
        {futureExtensions.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 min-w-0 overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3 min-w-0">
              <Compass className="w-4 h-4 shrink-0" />
              <span>Subsequent Architectural Evolutions</span>
            </h3>
            <div className="flex flex-wrap gap-2 min-w-0">
              {futureExtensions.map((ext, i) => (
                <span key={i} className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700 break-words max-w-full">
                  {ext}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
