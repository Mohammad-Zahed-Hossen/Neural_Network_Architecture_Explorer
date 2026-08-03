'use client';

import React from 'react';
import Link from 'next/link';
import { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { History, ArrowRight } from 'lucide-react';

interface EvolutionTimelineLinksProps {
  evolutionObjects: readonly KnowledgeObject[];
  className?: string;
}

export function EvolutionTimelineLinks({
  evolutionObjects,
  className = '',
}: EvolutionTimelineLinksProps) {
  if (!evolutionObjects || evolutionObjects.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <History className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Evolution Timeline Lineage
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {evolutionObjects.map((obj) => (
          <Link
            key={obj.identity.id}
            href={`/evolution?highlight=${obj.identity.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-xs text-amber-300 transition-colors"
          >
            <span className="font-semibold">{obj.identity.title}</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
