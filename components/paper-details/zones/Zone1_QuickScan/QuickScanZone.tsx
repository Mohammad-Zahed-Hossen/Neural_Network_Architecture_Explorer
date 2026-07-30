'use client';

import React from 'react';
import { PaperMetadata, PaperSummary } from '@/types/paper-schema';
import { VerificationBadge } from '../../shared/VerificationBadge';
import { BookOpen, ExternalLink, GraduationCap, Quote, Sparkles, Cpu, Lightbulb, Star } from 'lucide-react';
import Link from 'next/link';

interface QuickScanZoneProps {
  metadata: PaperMetadata;
  summary: PaperSummary;
}

export function QuickScanZone({ metadata, summary }: QuickScanZoneProps) {
  const { title, authors, venue, year, primaryCategory, citationCount, pdfUrl, doi, arxivId, associatedModelId, status } = metadata;
  const { oneSentenceMemory, readingGuide } = summary;

  return (
    <section id="quick-scan" className="space-y-5 sm:space-y-6 scroll-mt-24 w-full max-w-full min-w-0">
      {/* Category & Status Badges Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            {primaryCategory}
          </span>
          <VerificationBadge tier={status.reproducibilityTier} />
          {status.peerReviewed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <GraduationCap className="w-3.5 h-3.5" />
              Peer Reviewed
            </span>
          )}
          {status.hasPretrainedModel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <Cpu className="w-3.5 h-3.5" />
              Pretrained Arch Available
            </span>
          )}
          {readingGuide?.difficultyRating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0" title={readingGuide.difficultyReason}>
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              Difficulty: {readingGuide.difficultyRating}/5
            </span>
          )}
        </div>

        {/* Citations Count */}
        {citationCount !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 shrink-0">
            <Quote className="w-3.5 h-3.5 text-cyan-400" />
            <span><strong className="text-slate-200">{citationCount.toLocaleString()}</strong> citations</span>
          </div>
        )}
      </div>

      {/* Main Paper Title */}
      <div className="space-y-3 min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight break-words text-wrap">
          {title}
        </h1>

        {/* Authors Roster & Venue */}
        <div className="text-sm text-slate-300 space-y-1 min-w-0">
          <p className="font-medium text-slate-200 break-words">
            {authors.map((a, i) => (
              <span key={i}>
                <span className={a.leadAuthor ? 'text-cyan-300 font-semibold underline decoration-cyan-500/40 decoration-2 underline-offset-4' : ''}>
                  {a.name}
                </span>
                {i < authors.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
          <p className="text-xs text-slate-400 break-words">
            Published in <strong className="text-slate-300">{venue}</strong> ({year})
          </p>
        </div>
      </div>

      {/* Primary External Links & Associated Model Explorer Button */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1 min-w-0">
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs md:text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md shadow-cyan-500/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[40px] sm:min-h-[44px]"
          >
            <BookOpen className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" />
            <span>Open Original PDF</span>
            <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5 ml-0.5 opacity-80 shrink-0" />
          </a>
        )}

        {associatedModelId && (
          <Link
            href={`/models/${associatedModelId}`}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs md:text-sm font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[40px] sm:min-h-[44px]"
          >
            <Cpu className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-400 shrink-0" />
            <span>Explore 3D/Node Model</span>
          </Link>
        )}

        {arxivId && (
          <a
            href={`https://arxiv.org/abs/${arxivId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer min-h-[36px] sm:min-h-[40px]"
          >
            arXiv:{arxivId}
          </a>
        )}

        {doi && (
          <a
            href={`https://doi.org/${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors cursor-pointer min-h-[36px] sm:min-h-[40px]"
          >
            DOI:{doi}
          </a>
        )}
      </div>

      {/* RKR 1-Sentence Memory Anchor Highlight Card */}
      {oneSentenceMemory && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex items-start gap-3 min-w-0">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              1-Sentence Memory Anchor
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed break-words">
              {oneSentenceMemory}
            </p>
          </div>
        </div>
      )}

      {/* 3-Second TL;DR Glassmorphic Callout */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md overflow-hidden min-w-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>TL;DR Executive Summary</span>
        </div>
        <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed break-words">
          {summary.tldr}
        </p>

        {summary.keyTakeaways.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-slate-800/80 pt-3 min-w-0">
            {summary.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <span className="break-words min-w-0">{takeaway}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
