'use client';

import React from 'react';
import Link from 'next/link';
import { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SuccessorListProps {
  successors: readonly KnowledgeObject[];
  className?: string;
}

export function SuccessorList({ successors, className = '' }: SuccessorListProps) {
  if (!successors || successors.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Architectural Successors
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {successors.map((obj) => (
          <Link
            key={obj.identity.id}
            href={`/models/${obj.identity.slug}`}
            className="group flex items-center justify-between p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
          >
            <div>
              <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                Evolutionary Successor
              </span>
              <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300">
                {obj.identity.title}
              </h4>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
