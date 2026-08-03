import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, BookOpen, GitBranch, Sparkles } from 'lucide-react';
import type { ArchitectureRelationshipsProps } from './types';

export default function ArchitectureRelationships({
  associatedModels,
  evolution,
  research,
  relatedPatterns = [],
}: ArchitectureRelationshipsProps) {
  return (
    <div className="space-y-6">
      {/* 1. Linked Catalog Models */}
      <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="h-4.5 w-4.5 text-[#22d3ee]" />
          Catalog Models Employing This Pattern
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {associatedModels.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-slate-500 font-bold uppercase">
              No models in the current catalog use this pattern directly.
            </div>
          ) : (
            associatedModels.map((m) => (
              <div
                key={m.id}
                className="bg-[#020617]/40 border border-border/20 rounded-xl p-3.5 hover:border-[#22d3ee]/20 transition-all flex flex-col justify-between items-start gap-3"
              >
                <div>
                  <span className="text-xs font-black text-slate-200 block truncate">{m.name}</span>
                  <span className="text-[9px] text-slate-500 block font-bold uppercase mt-0.5">
                    {m.category} | {m.year}
                  </span>
                </div>
                <Link
                  href={`/models/${m.id}`}
                  className="text-[10px] font-extrabold text-[#22d3ee] hover:text-blue-300 transition-colors uppercase tracking-wider flex items-center gap-1 group"
                >
                  Explore Layer structure
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Research Papers & Evolution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research Papers */}
        <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            Landmark Research Publications
          </h3>

          {research?.papers && research.papers.length > 0 ? (
            <div className="space-y-2.5">
              {research.papers.map((paper) => (
                <div
                  key={paper.identity.id}
                  className="bg-[#020617]/40 border border-border/20 rounded-xl p-3 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 truncate">
                    <Link
                      href={`/papers/${paper.identity.slug}`}
                      className="text-xs font-bold text-slate-200 hover:text-emerald-400 transition-colors block truncate"
                    >
                      {paper.identity.title}
                    </Link>
                    <span className="text-[9px] text-slate-400 block font-medium">
                      {(paper.metadata.authors || []).slice(0, 2).join(', ')}
                      {(paper.metadata.authors || []).length > 2 ? ' et al.' : ''}
                    </span>
                  </div>
                  <Link
                    href={`/papers/${paper.identity.slug}`}
                    className="text-[9px] font-mono font-extrabold text-emerald-400 hover:underline uppercase shrink-0"
                  >
                    View Paper
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-[10px] text-slate-500 font-bold uppercase">
              Primary literature linked via Knowledge Repository.
            </div>
          )}
        </div>

        {/* Evolution Lineage */}
        <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="h-4 w-4 text-purple-400" />
            Architectural Evolution & Lineage
          </h3>

          <div className="flex flex-col gap-2 text-xs">
            {evolution?.predecessors && evolution.predecessors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase shrink-0 w-20">
                  Predecessors:
                </span>
                <div className="flex flex-wrap gap-1">
                  {evolution.predecessors.map((p) => (
                    <span
                      key={p.identity.id}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                    >
                      {p.identity.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {evolution?.successors && evolution.successors.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase shrink-0 w-20">
                  Successors:
                </span>
                <div className="flex flex-wrap gap-1">
                  {evolution.successors.map((s) => (
                    <span
                      key={s.identity.id}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-purple-300"
                    >
                      {s.identity.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(!evolution?.predecessors || evolution.predecessors.length === 0) &&
              (!evolution?.successors || evolution.successors.length === 0) && (
                <div className="py-4 text-center text-[10px] text-slate-500 font-bold uppercase">
                  Foundational architecture motif.
                </div>
              )}
          </div>
        </div>
      </div>

      {/* 3. Related Patterns */}
      {relatedPatterns.length > 0 && (
        <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-5 backdrop-blur-md space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#22d3ee]" />
            Related Architecture Patterns
          </h3>

          <div className="flex flex-wrap gap-2">
            {relatedPatterns.map((pat) => (
              <Link
                key={pat.identity.id}
                href={`/architecture-patterns?pattern=${pat.identity.slug}`}
                className="text-[10px] font-bold font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[#22d3ee] hover:border-[#22d3ee]/40 transition-all flex items-center gap-1.5"
              >
                {pat.identity.title}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
