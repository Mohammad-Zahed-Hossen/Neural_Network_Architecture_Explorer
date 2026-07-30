'use client';

import React, { useState } from 'react';
import { TaggedNote, NoteCategory } from '@/types/paper-schema';
import { CheckCircle2, AlertTriangle, Info, XCircle, Sliders, ShieldAlert, HelpCircle } from 'lucide-react';

interface TaggedListProps {
  notes: TaggedNote[];
}

const CATEGORY_CONFIG: Record<NoteCategory, { label: string; icon: React.ReactNode; badgeClass: string; borderClass: string }> = {
  strength: {
    label: 'Strength',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderClass: 'border-l-emerald-500',
  },
  weakness: {
    label: 'Weakness',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderClass: 'border-l-amber-500',
  },
  limitation: {
    label: 'Limitation',
    icon: <Info className="w-4 h-4 text-sky-400" />,
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    borderClass: 'border-l-sky-500',
  },
  assumption: {
    label: 'Assumption',
    icon: <Info className="w-4 h-4 text-indigo-400" />,
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    borderClass: 'border-l-indigo-500',
  },
  failure_case: {
    label: 'Failure Case',
    icon: <XCircle className="w-4 h-4 text-rose-400" />,
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    borderClass: 'border-l-rose-500',
  },
  tradeoff: {
    label: 'Trade-off',
    icon: <Sliders className="w-4 h-4 text-purple-400" />,
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderClass: 'border-l-purple-500',
  },
  misconception: {
    label: 'Misconception',
    icon: <HelpCircle className="w-4 h-4 text-orange-400" />,
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    borderClass: 'border-l-orange-500',
  },
};

export function TaggedList({ notes }: TaggedListProps) {
  const [activeFilter, setActiveFilter] = useState<NoteCategory | 'all'>('all');

  const categories: Array<NoteCategory | 'all'> = [
    'all',
    'strength',
    'weakness',
    'limitation',
    'tradeoff',
    'failure_case',
    'misconception',
  ];

  const filteredNotes = activeFilter === 'all' ? notes : notes.filter(n => n.category === activeFilter);

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full min-w-0">
        {categories.map(cat => {
          const count = cat === 'all' ? notes.length : notes.filter(n => n.category === cat).length;
          if (count === 0 && cat !== 'all') return null;
          const label = cat === 'all' ? 'All Notes' : CATEGORY_CONFIG[cat].label;
          const isActive = activeFilter === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notes Stack */}
      <div className="space-y-3 w-full max-w-full min-w-0">
        {filteredNotes.map(note => {
          const isMisconception = note.category === 'misconception';
          const config = CATEGORY_CONFIG[note.category] || {
            label: note.category,
            icon: <ShieldAlert className="w-4 h-4 text-slate-400" />,
            badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
            borderClass: 'border-l-slate-700',
          };

          if (isMisconception) {
            return (
              <div
                key={note.id}
                className="bg-gradient-to-r from-orange-950/20 via-slate-900/80 to-slate-900/60 border border-orange-500/30 border-l-4 border-l-orange-500 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border shrink-0 bg-orange-500/10 text-orange-400 border-orange-500/20">
                    <HelpCircle className="w-4 h-4 text-orange-400" />
                    Common Misconception
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2 text-rose-300 font-semibold bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/20">
                    <span className="shrink-0 font-bold">❌ Myth:</span>
                    <span className="break-words min-w-0">{note.title}</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-300 font-medium bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                    <span className="shrink-0 font-bold text-emerald-400">✓ Reality:</span>
                    <span className="break-words min-w-0 text-slate-200">{note.content}</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={note.id}
              className={`bg-slate-900/60 border border-slate-800/80 border-l-4 ${config.borderClass} rounded-xl p-4 sm:p-5 shadow-sm hover:border-slate-700 transition-all min-w-0 overflow-hidden`}
            >
              <div className="flex items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap mb-2 min-w-0">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border shrink-0 ${config.badgeClass}`}>
                  {config.icon}
                  {config.label}
                </span>
                <h4 className="font-semibold text-slate-100 text-sm sm:text-base break-words min-w-0 flex-1">{note.title}</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">{note.content}</p>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/40 rounded-xl border border-slate-800">
            No notes match the selected tag filter.
          </div>
        )}
      </div>
    </div>
  );
}
