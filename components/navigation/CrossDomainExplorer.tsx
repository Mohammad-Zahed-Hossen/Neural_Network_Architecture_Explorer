'use client';

import React, { useState } from 'react';
import { CrossDomainConnections } from '@/lib/knowledge/graph/relationship-resolver';
import { RelatedKnowledge } from './RelatedKnowledge';
import { ResearchConnections } from './ResearchConnections';
import { EvolutionTimelineLinks } from './EvolutionTimelineLinks';
import { ImplementationExamples } from './ImplementationExamples';
import { Compass } from 'lucide-react';

interface CrossDomainExplorerProps {
  connections: CrossDomainConnections;
  className?: string;
}

export function CrossDomainExplorer({ connections, className = '' }: CrossDomainExplorerProps) {
  const [activeTab, setActiveTab] = useState<'architecture' | 'training' | 'research' | 'evolution' | 'implementation'>('architecture');

  const { architecture, training, research, evolution, implementation } = connections;

  const totalConnections =
    architecture.length + training.length + research.length + evolution.length + implementation.length;

  if (totalConnections === 0) return null;

  return (
    <div className={`w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Cross-Domain Knowledge Network
          </h3>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {totalConnections} Connected Entities
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            activeTab === 'architecture'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border-zinc-800'
          }`}
        >
          Architecture ({architecture.length})
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            activeTab === 'training'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border-zinc-800'
          }`}
        >
          Training ({training.length})
        </button>

        <button
          onClick={() => setActiveTab('research')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            activeTab === 'research'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border-zinc-800'
          }`}
        >
          Research ({research.length})
        </button>

        <button
          onClick={() => setActiveTab('evolution')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            activeTab === 'evolution'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border-zinc-800'
          }`}
        >
          Evolution ({evolution.length})
        </button>

        <button
          onClick={() => setActiveTab('implementation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            activeTab === 'implementation'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border-zinc-800'
          }`}
        >
          Implementation ({implementation.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'architecture' && (
          <RelatedKnowledge objects={architecture} title="Connected Architectural Patterns & Models" />
        )}
        {activeTab === 'training' && (
          <RelatedKnowledge objects={training} title="Connected Training Dynamics Concepts" />
        )}
        {activeTab === 'research' && <ResearchConnections papers={research} />}
        {activeTab === 'evolution' && <EvolutionTimelineLinks evolutionObjects={evolution} />}
        {activeTab === 'implementation' && <ImplementationExamples implementations={implementation} />}
      </div>
    </div>
  );
}
