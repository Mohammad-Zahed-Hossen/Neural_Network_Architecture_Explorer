'use client';

import React from 'react';

interface LearningNavigatorProps {
  currentStepIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const LearningNavigator: React.FC<LearningNavigatorProps> = ({
  currentStepIndex,
  totalSteps,
  onPrevious,
  onNext,
}) => {
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
          isFirst
            ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous Step
      </button>

      <div className="text-xs text-slate-500 font-mono">
        Step {currentStepIndex + 1} / {totalSteps}
      </div>

      <button
        onClick={onNext}
        disabled={isLast}
        className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
          isLast
            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400 cursor-not-allowed'
            : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20'
        }`}
      >
        <span>{isLast ? 'Walkthrough Complete' : 'Next Step'}</span>
        {!isLast && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
};
