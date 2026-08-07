'use client';

import React, { useState } from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';
import { ComparisonSummary } from './ComparisonSummary';
import { ComparisonTable } from './ComparisonTable';
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
    { id: 'all', label: 'Overview' },
    { id: 'metrics', label: 'Metric Matrix' },
    { id: 'telemetry', label: 'Visual Comparison' },
    { id: 'relationships', label: 'Topology Graph' },
    { id: 'timeline', label: 'Research Lineage' },
    { id: 'references', label: 'Academic References' },
  ];

  if (!result.objects || result.objects.length < 2) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center backdrop-blur-md shadow-xl my-6">
        <div className="w-12 h-12 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-white mb-1">Select at least 2 models to compare</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Side-by-side matrix analysis requires selecting 2 to 4 neural network architectures or research entities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-3 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[38px] ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Active Views in Guided Canonical Flow Hierarchy */}
      {(activeTab === 'all' || activeTab === 'metrics') && (
        <ComparisonSummary result={result} />
      )}

      {(activeTab === 'all' || activeTab === 'telemetry') && (
        <ComparisonVisualizer result={result} />
      )}

      {(activeTab === 'all' || activeTab === 'metrics') && (
        <ComparisonTable result={result} />
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

