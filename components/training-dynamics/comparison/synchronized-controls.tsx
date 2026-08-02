'use client';

import React from 'react';
import { Play, Pause, RotateCcw, FastForward, PlayCircle } from 'lucide-react';

interface SynchronizedControlsProps {
  isSimulating: boolean;
  onTogglePlayPause: () => void;
  onResetBoth: () => void;
  onTriggerBackpropBoth: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export default function SynchronizedControls({
  isSimulating,
  onTogglePlayPause,
  onResetBoth,
  onTriggerBackpropBoth,
  speed,
  onSpeedChange,
}: SynchronizedControlsProps) {
  return (
    <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/60 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <PlayCircle className="h-4 w-4 text-primary" /> Synchronized Dual Timeline
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Play / Pause both */}
        <button
          onClick={onTogglePlayPause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-slate-950 text-xs font-bold hover:bg-primary/90 transition-all shadow cursor-pointer"
        >
          {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isSimulating ? 'Pause Both' : 'Play Both'}
        </button>

        {/* Trigger Backprop both */}
        <button
          onClick={onTriggerBackpropBoth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-border/30 text-slate-200 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
        >
          <FastForward className="h-3.5 w-3.5 text-amber-400" />
          Pulse Both
        </button>

        {/* Reset both */}
        <button
          onClick={onResetBoth}
          className="p-2 rounded-xl bg-slate-900 border border-border/30 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Reset Both Simulators"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-border/20">
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                speed === s ? 'bg-primary text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
