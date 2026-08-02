import React from 'react';
import MathFormula from '@/components/ui/math-formula';
import { MathSection as MathSectionType } from '@/lib/types/training-dynamics';

interface MathSectionProps {
  data: MathSectionType;
  className?: string;
}

export default function MathSection({ data, className = '' }: MathSectionProps) {
  return (
    <div className={`space-y-3 bg-slate-900/40 border border-border/20 rounded-xl p-4 backdrop-blur-sm ${className}`}>
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary block">
        Mathematical Formulation
      </span>

      <MathFormula formula={data.formula} />

      {data.description && (
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {data.description}
        </p>
      )}

      {data.variables && Object.keys(data.variables).length > 0 && (
        <div className="border-t border-border/10 pt-3 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {Object.entries(data.variables).map(([symbol, desc]) => (
            <div key={symbol} className="flex items-start gap-1.5 font-mono">
              <span className="text-primary font-bold">{symbol}:</span>
              <span className="text-slate-400 font-sans">{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
