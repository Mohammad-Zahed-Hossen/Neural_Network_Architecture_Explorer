'use client';

import React from 'react';
import { PlaybackEvent } from '@/lib/types/training-dynamics';
import { Clock, AlertTriangle, Info } from 'lucide-react';

interface PlaybackTimelineProps {
  events: PlaybackEvent[];
  currentEpoch: number;
  onSeekToEpoch: (epoch: number) => void;
}

export default function PlaybackTimeline({ events, currentEpoch, onSeekToEpoch }: PlaybackTimelineProps) {
  if (events.length === 0) return null;

  const getEventIcon = (severity: PlaybackEvent['severity']) => {
    switch (severity) {
      case 'critical':
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case 'info':
      default:
        return <Info className="h-3.5 w-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-4 backdrop-blur-md flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border/10 pb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Playback Event Timeline (Click milestone to jump)
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          {events.length} Milestones Recorded
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {events.map((evt) => {
          const isActive = currentEpoch >= evt.epoch;
          return (
            <button
              key={evt.id}
              onClick={() => onSeekToEpoch(evt.epoch)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-slate-800/90 border-primary/50 text-white shadow-md'
                  : 'bg-slate-900/40 border-border/20 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              {getEventIcon(evt.severity)}
              <div className="flex flex-col">
                <span className="text-[11px] font-bold leading-none">{evt.title}</span>
                <span className="text-[9px] font-mono text-slate-400">Epoch {evt.epoch}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
