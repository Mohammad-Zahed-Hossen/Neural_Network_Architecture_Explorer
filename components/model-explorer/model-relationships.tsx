'use client';

import Link from 'next/link';
import { 
  GitCommit, Compass, BookOpen, 
  ExternalLink, ArrowRight, Layers, BarChart3,
  History
} from 'lucide-react';
import { ModelRelationships } from '@/lib/data/relationships';
import ContinueLearning from '@/components/ui/continue-learning';

interface ModelRelationshipsViewProps {
  relationships: ModelRelationships;
}

export default function ModelRelationshipsView({ relationships }: ModelRelationshipsViewProps) {
  const {
    era,
    predecessors,
    successors,
    influencedBy,
    influenced,
    relatedModels,
    patterns,
    concepts,
    papers,
    compareShortcuts,
    continueLearning
  } = relationships;

  return (
    <div className="space-y-6 w-full">
      {/* 1. Architecture Patterns Used */}
      {patterns && patterns.length > 0 && (
        <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-4">
            <GitCommit className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider">
              Uses These Architecture Patterns
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patterns.map(pattern => (
              <Link
                key={pattern.id}
                href={pattern.href}
                className="group flex flex-col justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                      Design Pattern
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 mt-1">
                    {pattern.name}
                  </h4>
                  {pattern.note && (
                    <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                      {pattern.note}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-emerald-400 font-extrabold mt-3 block">
                  View Math & Blueprint →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. Related Concepts */}
      {concepts && concepts.length > 0 && (
        <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-5 w-5 text-[#22d3ee]" />
            <h3 className="text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider">
              Related Theoretical Concepts
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {concepts.map(concept => (
              <Link
                key={concept.id}
                href={concept.href}
                className="group flex flex-col justify-between p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-wide">
                      Interactive Visualizer
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 mt-1">
                    {concept.name}
                  </h4>
                  {concept.note && (
                    <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                      {concept.note}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-cyan-400 font-extrabold mt-3 block">
                  Launch Interactive Simulator →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. Paper Context & Research Resources */}
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider">
              Paper Context & Research Resources
            </h3>
          </div>
          <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-full font-bold uppercase">
            {era}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={papers.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors font-bold text-xs"
          >
            <span className="text-slate-200">Read Original Publication PDF</span>
            <ExternalLink className="h-4 w-4 text-purple-400" />
          </a>

          <Link
            href={papers.paperPageAnchor}
            className="flex items-center justify-between p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors font-bold text-xs"
          >
            <span className="text-slate-200">View In-App Paper Summary</span>
            <ArrowRight className="h-4 w-4 text-purple-400" />
          </Link>
        </div>

        {papers.relatedPapers && papers.relatedPapers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/20">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block mb-2">
              Related Landmark Papers
            </span>
            <div className="space-y-2">
              {papers.relatedPapers.map((paper, i) => (
                <a
                  key={i}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-border/20 text-xs text-slate-300 hover:text-white hover:border-purple-500/30 transition-colors"
                >
                  <span className="truncate pr-2">
                    <strong className="text-white">{paper.title}</strong> ({paper.year}) — {paper.authors}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Architecture Lineage & Relationships */}
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <History className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider">
            Architecture Lineage & Relationships
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Predecessors */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-border/20 space-y-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
              Predecessor Models
            </span>
            {predecessors.length > 0 ? (
              <div className="space-y-2">
                {predecessors.map(pred => (
                  <Link
                    key={pred.id}
                    href={`/models/${pred.id}`}
                    className="flex flex-col p-2.5 rounded-lg bg-slate-950/60 border border-white/5 hover:border-amber-500/40 transition-colors"
                  >
                    <span className="text-xs font-extrabold text-white flex items-center justify-between">
                      {pred.name}
                      <ArrowRight className="h-3 w-3 text-amber-400" />
                    </span>
                    {pred.note && <span className="text-[11px] text-slate-400 mt-0.5">{pred.note}</span>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Pioneering model baseline in catalog</p>
            )}
          </div>

          {/* Successors */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-border/20 space-y-2">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
              Successor Models
            </span>
            {successors.length > 0 ? (
              <div className="space-y-2">
                {successors.map(succ => (
                  <Link
                    key={succ.id}
                    href={`/models/${succ.id}`}
                    className="flex flex-col p-2.5 rounded-lg bg-slate-950/60 border border-white/5 hover:border-emerald-500/40 transition-colors"
                  >
                    <span className="text-xs font-extrabold text-white flex items-center justify-between">
                      {succ.name}
                      <ArrowRight className="h-3 w-3 text-emerald-400" />
                    </span>
                    {succ.note && <span className="text-[11px] text-slate-400 mt-0.5">{succ.note}</span>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Modern state-of-the-art model</p>
            )}
          </div>
        </div>

        {(influencedBy.length > 0 || influenced.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
            {influencedBy.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                  Influenced By
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {influencedBy.map(inf => (
                    <Link
                      key={inf.id}
                      href={`/models/${inf.id}`}
                      className="text-xs font-bold text-slate-300 bg-slate-800/60 hover:text-white px-2.5 py-1 rounded-md border border-white/5 transition-colors"
                    >
                      {inf.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {influenced.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                  Influenced
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {influenced.map(inf => (
                    <Link
                      key={inf.id}
                      href={`/models/${inf.id}`}
                      className="text-xs font-bold text-slate-300 bg-slate-800/60 hover:text-white px-2.5 py-1 rounded-md border border-white/5 transition-colors"
                    >
                      {inf.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Related Architectures */}
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider">
              Related Architectures
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Family & Design Similarity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {relatedModels.map(rel => (
            <Link
              key={rel.id}
              href={`/models/${rel.id}`}
              className="group p-3.5 rounded-xl bg-slate-900/40 border border-border/20 hover:border-blue-500/40 hover:bg-slate-900/80 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-extrabold text-white group-hover:text-blue-400 transition-colors block">
                  {rel.name}
                </span>
                {rel.reason && (
                  <p className="text-[11px] text-slate-400 mt-1 font-medium line-clamp-2">
                    {rel.reason}
                  </p>
                )}
              </div>
              <span className="text-[11px] text-blue-400 font-bold mt-2.5 inline-flex items-center gap-1">
                Explore Model <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Context-Aware Compare Shortcut */}
      {compareShortcuts && compareShortcuts.length > 0 && (
        <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-rose-400" />
            <h3 className="text-sm font-extrabold text-[#e5e7eb] uppercase tracking-wider">
              Compare with Similar Models
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {compareShortcuts.map((sc, i) => (
              <Link
                key={i}
                href={`/compare?models=${sc.modelIds.join(',')}`}
                className="group flex flex-col justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-rose-300 uppercase tracking-wide">
                    {sc.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {sc.description}
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-400 mt-3 inline-flex items-center gap-1">
                  Launch Side-by-Side Comparison <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 7. Continue Learning */}
      <ContinueLearning items={continueLearning} />
    </div>
  );
}
