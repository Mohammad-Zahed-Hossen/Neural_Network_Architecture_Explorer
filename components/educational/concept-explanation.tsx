import React from 'react';
import { TrainingConcept } from '@/lib/types/training-dynamics';
import MathSection from './math-section';
import IntuitionSection from './intuition-section';
import AnalogySection from './analogy-section';
import ReferenceSection from './reference-section';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ConceptExplanationProps {
  concept: TrainingConcept;
  className?: string;
}

export default function ConceptExplanation({ concept, className = '' }: ConceptExplanationProps) {
  return (
    <div className={`space-y-5 ${className}`}>
      {/* Problem summary */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">
          Problem Definition
        </span>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          {concept.problem}
        </p>
      </div>

      {/* Mathematics Section */}
      <MathSection data={concept.mathematics} />

      {/* Intuition Section */}
      <IntuitionSection
        intuition={concept.intuition}
        visualExplanation={concept.visualExplanation}
      />

      {/* Analogy Section */}
      <AnalogySection analogy={concept.analogy} />

      {/* Causes & Symptoms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border/10 pt-4">
        {concept.causes.length > 0 && (
          <div className="bg-slate-900/30 border border-border/15 rounded-xl p-3 space-y-1.5">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Primary Causes
            </span>
            <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
              {concept.causes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {concept.symptoms.length > 0 && (
          <div className="bg-slate-900/30 border border-border/15 rounded-xl p-3 space-y-1.5">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-3 w-3" />
              Observable Symptoms
            </span>
            <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
              {concept.symptoms.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Solutions */}
      {concept.solutions.length > 0 && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Architectural & Algorithmic Solutions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {concept.solutions.map((sol, i) => (
              <span
                key={i}
                className="bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-medium"
              >
                {sol}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Real World Architectures */}
      {concept.realWorldArchitectures.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">
            Used In Architectures
          </span>
          <div className="flex flex-wrap gap-1.5">
            {concept.realWorldArchitectures.map((arch, i) => (
              <span
                key={i}
                className="bg-slate-900 text-slate-300 border border-border/25 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                {arch}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reference Section */}
      <ReferenceSection references={concept.references} />
    </div>
  );
}
