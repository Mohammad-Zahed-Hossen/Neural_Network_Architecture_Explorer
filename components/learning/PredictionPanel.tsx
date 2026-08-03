'use client';

import React from 'react';
import type { PredictionQuestion } from '@/lib/learning/types';

interface PredictionPanelProps {
  predictionQuestion: PredictionQuestion;
  onAnswer: (selectedIndex: number) => void;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  predictionQuestion,
  onAnswer,
}) => {
  const isAnswered = predictionQuestion.isAnswered;
  const userSelected = predictionQuestion.userSelectedIndex;
  const correct = predictionQuestion.correctOptionIndex;

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/30 border border-purple-500/30 rounded-xl p-5 my-6 backdrop-blur-md shadow-lg shadow-purple-950/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="p-1 bg-purple-500/20 rounded text-purple-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </span>
        <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
          Educational Prediction Exercise
        </h4>
      </div>

      <p className="text-sm font-semibold text-white mb-4">{predictionQuestion.prompt}</p>

      <div className="space-y-2 mb-4">
        {predictionQuestion.options.map((opt, idx) => {
          let btnStyle = 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:border-purple-500/50 hover:bg-purple-950/30';
          if (isAnswered) {
            if (idx === correct) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold shadow-md shadow-emerald-500/10';
            } else if (idx === userSelected && idx !== correct) {
              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
            } else {
              btnStyle = 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => onAnswer(idx)}
              className={`w-full text-left p-3 rounded-lg text-xs border transition-all flex items-start gap-3 ${btnStyle}`}
            >
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800 shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className={`p-3 rounded-lg border text-xs ${
          userSelected === correct
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="font-bold mb-1 flex items-center gap-1.5">
            {userSelected === correct ? '✔ Correct Prediction!' : 'ℹ Explanation & Insight'}
          </div>
          <div>{predictionQuestion.explanation}</div>
        </div>
      )}
    </div>
  );
};
