'use client';

import React from 'react';
import type { LearningProgress as LearningProgressType } from '@/lib/learning/types';

interface LearningProgressProps {
  progress: LearningProgressType;
  currentStepIndex: number;
  totalSteps: number;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({
  progress,
  currentStepIndex,
  totalSteps,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase tracking-wider font-mono">Walkthrough Progress</span>
          <span className="text-slate-400">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>
        <div className="font-mono font-bold text-blue-400">{progress.percentage}% Complete</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
        <div
          className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        ></div>
      </div>

      {/* Checkpoint Counters */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Completed: {progress.completedSteps}
        </span>
        <span className="flex items-center gap-1.5 text-blue-400">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Reviewed: {progress.reviewedSteps}
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Needs Review: {progress.needsReviewSteps}
        </span>
      </div>
    </div>
  );
};
