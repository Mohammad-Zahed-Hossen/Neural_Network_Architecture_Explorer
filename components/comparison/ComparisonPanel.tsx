'use client';

import React, { useState } from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';
import { ComparisonSummary } from './ComparisonSummary';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonMetrics } from './ComparisonMetrics';
import { ComparisonRelationships } from './ComparisonRelationships';
import { ComparisonVisualizer } from './ComparisonVisualizer';
import { ComparisonTimeline } from './ComparisonTimeline';
import { ComparisonReferences } from './ComparisonReferences';

interface ComparisonPanelProps {
  result: ComparisonResult;
}

type TabType = 'all' | 'metrics' | 'telemetry' | 'relationships' | 'timeline' | 'references';

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'Complete Overview' },
    { id: 'metrics', label: 'Metrics Matrix' },
    { id: 'telemetry', label: 'Telemetry (Visualizer)' },
    { id: 'relationships', label: 'Graph Relationships' },
    { id: 'timeline', label: 'Evolution Timeline' },
    { id: 'references', label: 'Citations & Code' },
  ];

  return (
    <div>
      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Active Views */}
      {(activeTab === 'all' || activeTab === 'metrics') && (
        <>
          <ComparisonSummary result={result} />
          <ComparisonTable result={result} />
          <ComparisonMetrics result={result} />
        </>
      )}

      {(activeTab === 'all' || activeTab === 'telemetry') && (
        <ComparisonVisualizer result={result} />
      )}

      {(activeTab === 'all' || activeTab === 'relationships') && (
        <ComparisonRelationships result={result} />
      )}

      {(activeTab === 'all' || activeTab === 'timeline') && (
        <ComparisonTimeline result={result} />
      )}

      {(activeTab === 'all' || activeTab === 'references') && (
        <ComparisonReferences result={result} />
      )}
    </div>
  );
};
