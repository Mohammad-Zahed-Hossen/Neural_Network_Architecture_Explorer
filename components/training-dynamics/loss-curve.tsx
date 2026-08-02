'use client';

import React from 'react';
import { LossHistoryEntry } from '@/lib/types/training-dynamics';
import { TrendingDown } from 'lucide-react';

interface LossCurveProps {
  history: LossHistoryEntry[];
}

export default function LossCurve({ history }: LossCurveProps) {
  if (history.length === 0) {
    return (
      <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-5 backdrop-blur-md flex flex-col items-center justify-center min-h-[180px] text-slate-500 text-xs">
        <TrendingDown className="h-6 w-6 text-slate-600 mb-2" />
        Loss history will render as training progresses across epochs...
      </div>
    );
  }

  const maxLoss = Math.max(2.5, ...history.map((h) => h.loss));
  const minLoss = 0.0;
  const svgWidth = 400;
  const svgHeight = 140;

  // Generate SVG polyline path
  const points = history.map((entry, idx) => {
    const x = (idx / Math.max(1, history.length - 1)) * svgWidth;
    const y = svgHeight - ((entry.loss - minLoss) / (maxLoss - minLoss)) * (svgHeight - 20) - 10;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 0,${svgHeight} L ${points.join(' L ')} L ${svgWidth},${svgHeight} Z`;

  return (
    <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-5 backdrop-blur-md flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border/10 pb-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-emerald-400" />
          Epoch Loss Curve
        </h3>
        <span className="text-xs font-mono text-emerald-400 font-bold">
          Latest Loss: {history[history.length - 1]?.loss.toFixed(4)}
        </span>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full h-[140px] bg-slate-950/80 rounded-xl p-2 border border-slate-800/50 overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

          {/* Filled Area */}
          <path d={areaD} fill="url(#lossGradient)" />

          {/* Curve Line */}
          <path d={pathD} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Latest Point Pulsing Node */}
          {history.length > 0 && (
            <circle
              cx={(svgWidth * (history.length - 1)) / Math.max(1, history.length - 1)}
              cy={svgHeight - ((history[history.length - 1].loss - minLoss) / (maxLoss - minLoss)) * (svgHeight - 20) - 10}
              r="4"
              fill="#10B981"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
