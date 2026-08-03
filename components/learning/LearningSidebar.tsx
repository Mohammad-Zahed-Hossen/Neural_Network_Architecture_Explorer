'use client';

import React from 'react';
import type { LearningSession } from '@/lib/learning/types';

interface LearningSidebarProps {
  session: LearningSession;
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const LearningSidebar: React.FC<LearningSidebarProps> = ({
  session,
  currentStepIndex,
  onSelectStep,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-mono">
        Walkthrough Stages
      </h3>

      <div className="space-y-1">
        {session.steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const cp = session.checkpoints[step.checkpointId];
          const state = cp?.state || 'needs_review';

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(idx)}
              className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between gap-2 border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  state === 'completed' ? 'bg-emerald-400' :
                  state === 'reviewed' ? 'bg-blue-400' : 'bg-amber-400'
                }`}></span>
                <span className="truncate">{step.title}</span>
              </div>
              <span className="text-[10px] font-mono opacity-60 shrink-0">#{idx + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
