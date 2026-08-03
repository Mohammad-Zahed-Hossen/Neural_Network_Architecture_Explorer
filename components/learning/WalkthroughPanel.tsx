'use client';

import React from 'react';
import type { LearningStep } from '@/lib/learning/types';

interface WalkthroughPanelProps {
  step: LearningStep;
}

export const WalkthroughPanel: React.FC<WalkthroughPanelProps> = ({ step }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-6 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 uppercase">
          {step.stageId.replace('_', ' ')}
        </span>
      </div>

      <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
      <p className="text-xs text-slate-400 mb-6 pb-4 border-b border-slate-800/80">{step.summary}</p>

      {/* Main Step Content */}
      <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-xs leading-relaxed space-y-4">
        {step.content.split('\n\n').map((paragraph, i) => {
          if (paragraph.startsWith('```')) {
            return (
              <pre key={i} className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                <code>{paragraph.replace(/```[a-z]*/g, '').trim()}</code>
              </pre>
            );
          }
          return <p key={i}>{paragraph}</p>;
        })}
      </div>

      {/* Formula Box if present */}
      {step.mathFormula && (
        <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono text-center text-sm text-cyan-300">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans mb-1">Mathematical Formulation</div>
          <div>{step.mathFormula}</div>
        </div>
      )}
    </div>
  );
};
