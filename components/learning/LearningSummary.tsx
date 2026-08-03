'use client';

import React from 'react';
import type { LearningSession } from '@/lib/learning/types';

interface LearningSummaryProps {
  session: LearningSession;
  onRestart: () => void;
}

export const LearningSummary: React.FC<LearningSummaryProps> = ({ session, onRestart }) => {
  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-6 mb-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Walkthrough Completed!</h3>
          <p className="text-xs text-slate-400">
            You have successfully explored all educational stages for <strong className="text-emerald-300">{session.targetObjectTitle}</strong>.
          </p>
        </div>
      </div>

      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 mb-6">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Checkpoint Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {session.steps.map((step) => {
            const cp = session.checkpoints[step.checkpointId];
            const state = cp?.state || 'needs_review';
            return (
              <div key={step.id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300 truncate max-w-[180px]">{step.title}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                  state === 'completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' :
                  state === 'reviewed' ? 'bg-blue-950 text-blue-300 border-blue-500/30' :
                  'bg-amber-950 text-amber-300 border-amber-500/30'
                }`}>
                  {state.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Restart Walkthrough
        </button>
      </div>
    </div>
  );
};
