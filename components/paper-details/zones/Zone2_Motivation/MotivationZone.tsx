'use client';

import React from 'react';
import { PaperMotivation, ReadingGuide } from '@/types/paper-schema';
import { SectionHeader } from '../../shared/SectionHeader';
import { HelpCircle, AlertOctagon, Lightbulb, CheckCircle2, Target, BookmarkCheck, BookOpen, FastForward, CheckSquare } from 'lucide-react';

interface MotivationZoneProps {
  motivation: PaperMotivation;
  readingGuide?: ReadingGuide;
}

export function MotivationZone({ motivation, readingGuide }: MotivationZoneProps) {
  const { problemStatement, previousLimitations, coreInsight, contributions } = motivation;

  return (
    <section id="motivation" className="space-y-6 scroll-mt-24 w-full max-w-full min-w-0">
      <SectionHeader
        id="motivation-header"
        title="Motivation & Research Context"
        subtitle="Why was this paper written and what core problems does it solve?"
        icon={<Target className="w-5 h-5" />}
      />

      {/* RKR Reading & Revisit Guide Section */}
      {readingGuide && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 min-w-0 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2.5">
            <BookmarkCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Re-learning & Revision Guide</span>
          </div>

          {/* Prerequisite Topics */}
          {readingGuide.prerequisites && readingGuide.prerequisites.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                Prerequisite Concepts Needed:
              </span>
              <div className="flex flex-wrap gap-2 min-w-0">
                {readingGuide.prerequisites.map((req, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 text-indigo-300 border border-indigo-500/20 break-words">
                    ✓ {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section Revisit Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {readingGuide.mustRevisitSection && (
              <div className="bg-slate-950/90 p-3.5 rounded-xl border border-rose-500/20 space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Must Re-read</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{readingGuide.mustRevisitSection.section}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{readingGuide.mustRevisitSection.reason}</p>
              </div>
            )}

            {readingGuide.quickScanSection && (
              <div className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/20 space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <FastForward className="w-3.5 h-3.5 shrink-0" />
                  <span>Quick Scan</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{readingGuide.quickScanSection.section}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{readingGuide.quickScanSection.reason}</p>
              </div>
            )}

            {readingGuide.canSkipSection && (
              <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <span>Can Skip</span>
                </div>
                <div className="text-xs font-semibold text-slate-300">{readingGuide.canSkipSection.section}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{readingGuide.canSkipSection.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4-Card Grid Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full min-w-0">
        {/* Card 1: Problem Statement */}
        <div id="motivation-problem" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2 shrink-0">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Core Problem Statement</span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium break-words">
              {problemStatement}
            </p>
          </div>
        </div>

        {/* Card 2: Core Insight Callout */}
        <div id="motivation-insight" className="bg-gradient-to-br from-cyan-950/30 via-slate-900/80 to-slate-900/60 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 shrink-0">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>Core Breakthrough Insight</span>
            </div>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium break-words">
              {coreInsight}
            </p>
          </div>
        </div>

        {/* Card 3: Previous Limitations */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 shrink-0">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>Previous Model Limitations</span>
          </div>
          <ul className="space-y-2.5 min-w-0">
            {previousLimitations.map((lim, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span className="break-words min-w-0">{lim}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 4: Key Contributions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Novel Technical Contributions</span>
          </div>
          <ul className="space-y-2.5 min-w-0">
            {contributions.map((con, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span className="break-words min-w-0">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
