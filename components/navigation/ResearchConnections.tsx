'use client';

import React from 'react';
import Link from 'next/link';
import { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { BookOpen, ExternalLink } from 'lucide-react';

interface ResearchConnectionsProps {
  papers: readonly KnowledgeObject[];
  className?: string;
}

export function ResearchConnections({ papers, className = '' }: ResearchConnectionsProps) {
  if (!papers || papers.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Scientific Research Provenance
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {papers.map((paper) => (
          <Link
            key={paper.identity.id}
            href={`/papers/${paper.identity.slug}`}
            className="group p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                {paper.metadata.year ? `Paper (${paper.metadata.year})` : 'Research Paper'}
              </span>
              <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-300">
                {paper.identity.title}
              </h4>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
