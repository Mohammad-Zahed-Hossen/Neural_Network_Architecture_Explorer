'use client';

import React from 'react';
import Link from 'next/link';
import { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { Network } from 'lucide-react';

interface RelationshipGraphProps {
  nodes: readonly KnowledgeObject[];
  activeNodeId?: string;
  className?: string;
}

export function RelationshipGraph({
  nodes,
  activeNodeId,
  className = '',
}: RelationshipGraphProps) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className={`p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-lg ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Network className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Interactive Knowledge Graph Nodes
        </h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {nodes.map((node) => {
          const isActive = node.identity.id === activeNodeId || node.identity.slug === activeNodeId;
          return (
            <Link
              key={node.identity.id}
              href={`/models/${node.identity.slug}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                  : 'bg-zinc-900/60 text-zinc-300 hover:text-zinc-100 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {node.identity.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
