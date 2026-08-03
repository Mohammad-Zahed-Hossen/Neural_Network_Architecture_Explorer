'use client';

import React from 'react';
import Link from 'next/link';
import { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface PrerequisiteListProps {
  prerequisites: readonly KnowledgeObject[];
  className?: string;
}

export function PrerequisiteList({ prerequisites, className = '' }: PrerequisiteListProps) {
  if (!prerequisites || prerequisites.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Inferred Prerequisites
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prerequisites.map((obj) => (
          <Link
            key={obj.identity.id}
            href={`/models/${obj.identity.slug}`}
            className="group flex items-center justify-between p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
          >
            <div>
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                Prerequisite
              </span>
              <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300">
                {obj.identity.title}
              </h4>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
