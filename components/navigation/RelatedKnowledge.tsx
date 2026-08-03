'use client';

import React from 'react';
import Link from 'next/link';
import { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { Network, ArrowRight } from 'lucide-react';

interface RelatedKnowledgeProps {
  objects: readonly KnowledgeObject[];
  title?: string;
  className?: string;
}

export function RelatedKnowledge({
  objects,
  title = 'Graph Related Knowledge',
  className = '',
}: RelatedKnowledgeProps) {
  if (!objects || objects.length === 0) return null;

  const getHref = (obj: KnowledgeObject) => {
    switch (obj.identity.type) {
      case 'model':
        return `/models/${obj.identity.slug}`;
      case 'paper':
        return `/papers/${obj.identity.slug}`;
      case 'concept':
        return `/concepts/training-dynamics?concept=${obj.identity.slug}`;
      case 'pattern':
        return `/architecture-patterns#${obj.identity.slug}`;
      default:
        return `/models/${obj.identity.slug}`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Network className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {objects.map((obj) => (
          <Link
            key={obj.identity.id}
            href={getHref(obj)}
            className="group flex flex-col justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-emerald-500/40 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {obj.identity.type}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                {obj.identity.title}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                {obj.metadata.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
