'use client';

import React from 'react';
import { EducationalExplanation, EducationalWarning } from '@/lib/data-access/learning-engine';
import { BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AdaptiveExplanationProps {
  explanation: EducationalExplanation;
  warnings: EducationalWarning[];
}

export default function AdaptiveExplanation({ explanation, warnings }: AdaptiveExplanationProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Contextual Warnings Callout */}
      {warnings.map((warn, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 backdrop-blur-md animate-pulse"
        >
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">{warn.title}</h4>
            <p className="text-xs text-red-200 leading-relaxed">{warn.message}</p>
          </div>
        </div>
      ))}

      {/* Dynamic Explanation Card */}
      <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-5 backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-border/10 pb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-white">{explanation.title}</h3>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Expected Outcomes:
          </span>
          <ul className="space-y-1.5">
            {explanation.outcomes.map((outcome, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
