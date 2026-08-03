'use client';

import React from 'react';
import type { LearningCheckpointState } from '@/lib/learning/types';

interface LearningCheckpointProps {
  checkpointId: string;
  currentState: LearningCheckpointState;
  onStateChange: (state: LearningCheckpointState) => void;
}

export const LearningCheckpointComponent: React.FC<LearningCheckpointProps> = ({
  currentState,
  onStateChange,
}) => {
  const states: { id: LearningCheckpointState; label: string; color: string; activeColor: string }[] = [
    { id: 'completed', label: 'Completed', color: 'border-emerald-500/30 text-emerald-400', activeColor: 'bg-emerald-600 text-white border-emerald-500' },
    { id: 'reviewed', label: 'Reviewed', color: 'border-blue-500/30 text-blue-400', activeColor: 'bg-blue-600 text-white border-blue-500' },
    { id: 'needs_review', label: 'Needs Review', color: 'border-amber-500/30 text-amber-400', activeColor: 'bg-amber-600 text-white border-amber-500' },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Learning Checkpoint Status</span>
        <span className="text-[11px] text-slate-400">Mark your understanding level for this walkthrough step.</span>
      </div>

      <div className="flex items-center gap-2">
        {states.map((st) => {
          const isActive = currentState === st.id;
          return (
            <button
              key={st.id}
              onClick={() => onStateChange(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isActive ? st.activeColor : `bg-slate-950/40 ${st.color} hover:bg-slate-800`
              }`}
            >
              {st.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
