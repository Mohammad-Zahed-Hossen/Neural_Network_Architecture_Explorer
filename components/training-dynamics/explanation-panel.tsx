import React from 'react';
import { TrainingConcept } from '@/lib/types/training-dynamics';
import ConceptExplanation from '@/components/educational/concept-explanation';

interface ExplanationPanelProps {
  concept: TrainingConcept;
  className?: string;
}

export default function ExplanationPanel({ concept, className = '' }: ExplanationPanelProps) {
  return (
    <div className={`glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-5 ${className}`}>
      <div className="flex items-center justify-between border-b border-border/10 pb-3">
        <h2 className="text-lg font-black text-white tracking-tight">
          {concept.title} Details
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
          {concept.category}
        </span>
      </div>

      <ConceptExplanation concept={concept} />
    </div>
  );
}
