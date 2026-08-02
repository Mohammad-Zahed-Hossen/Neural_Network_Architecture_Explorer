import React from 'react';

interface IntuitionSectionProps {
  intuition: string;
  visualExplanation?: string;
  className?: string;
}

export default function IntuitionSection({
  intuition,
  visualExplanation,
  className = '',
}: IntuitionSectionProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
          Key Intuition
        </span>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          {intuition}
        </p>
      </div>

      {visualExplanation && (
        <div className="space-y-1 bg-slate-900/25 border-l-2 border-primary/40 pl-3 py-1.5 rounded-r-lg">
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
            Visual Behavior
          </span>
          <p className="text-xs text-slate-350 leading-relaxed">
            {visualExplanation}
          </p>
        </div>
      )}
    </div>
  );
}
