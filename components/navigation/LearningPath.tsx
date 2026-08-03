'use client';

import React from 'react';
import Link from 'next/link';
import { LearningPathStep } from '@/lib/knowledge/navigation/navigation-service';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

interface LearningPathProps {
  step: LearningPathStep | null;
  className?: string;
}

export function LearningPath({ step, className = '' }: LearningPathProps) {
  if (!step) return null;

  const { previous, current, next } = step;

  const getHref = (id: string, type: string) => {
    switch (type) {
      case 'model':
        return `/models/${id}`;
      case 'paper':
        return `/papers/${id}`;
      case 'concept':
        return `/concepts/training-dynamics?concept=${id}`;
      case 'pattern':
        return `/architecture-patterns#${id}`;
      default:
        return `/models/${id}`;
    }
  };

  return (
    <div className={`w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg ${className}`}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800/80">
        <BookOpen className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Graph Learning Path
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
        {/* Previous */}
        {previous ? (
          <Link
            href={getHref(previous.identity.slug, previous.identity.type)}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-emerald-500/30 transition-colors group text-left"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Previous</span>
              <span className="text-zinc-200 font-medium truncate block">{previous.identity.title}</span>
            </div>
          </Link>
        ) : (
          <div className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40 text-zinc-600 text-center italic">
            First Step
          </div>
        )}

        {/* Current */}
        <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center font-bold text-emerald-300">
          <span className="text-[10px] text-emerald-400/80 uppercase block tracking-wider font-extrabold">
            Current Focus
          </span>
          <span className="truncate block">{current.identity.title}</span>
        </div>

        {/* Next */}
        {next ? (
          <Link
            href={getHref(next.identity.slug, next.identity.type)}
            className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-emerald-500/30 transition-colors group text-right"
          >
            <div className="truncate w-full pr-2">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Next Up</span>
              <span className="text-zinc-200 font-medium truncate block">{next.identity.title}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0" />
          </Link>
        ) : (
          <div className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40 text-zinc-600 text-center italic">
            Advanced Topic
          </div>
        )}
      </div>
    </div>
  );
}
