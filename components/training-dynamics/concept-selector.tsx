import React from 'react';
import { Zap } from 'lucide-react';
import { TrainingConcept } from '@/lib/types/training-dynamics';

interface ConceptSelectorProps {
  concepts: TrainingConcept[];
  activeConceptId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export default function ConceptSelector({
  concepts,
  activeConceptId,
  onSelect,
  className = '',
}: ConceptSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 bg-slate-950/40 border border-border/25 rounded-2xl p-2 backdrop-blur-md ${className}`}>
      {concepts.map((concept) => {
        const isActive = activeConceptId === concept.id;
        return (
          <button
            key={concept.id}
            onClick={() => onSelect(concept.id)}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-between cursor-pointer ${
              isActive
                ? 'bg-primary/10 border border-primary/20 text-primary shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/25'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{concept.title}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 font-mono">
                {concept.difficulty}
              </span>
            </div>
            {isActive && <Zap className="h-3.5 w-3.5 text-primary shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
