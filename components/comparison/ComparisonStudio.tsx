'use client';

import React, { useState, useMemo } from 'react';
import type { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { comparisonService } from '@/lib/comparison/comparison-service';
import { ComparisonSelector } from './ComparisonSelector';
import { ComparisonPanel } from './ComparisonPanel';

interface ComparisonStudioProps {
  initialObjects?: readonly KnowledgeObject[];
  initialSelectedIds?: string[];
}

export const ComparisonStudio: React.FC<ComparisonStudioProps> = ({
  initialObjects,
  initialSelectedIds,
}) => {
  const [category, setCategory] = useState<string>('architecture');

  const availableObjects = useMemo(() => {
    if (initialObjects && initialObjects.length > 0) return initialObjects;
    return comparisonService.getComparableObjects(category);
  }, [category, initialObjects]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedIds && initialSelectedIds.length >= 2) return initialSelectedIds;
    const defaults = availableObjects.slice(0, 2).map((o) => o.identity.id);
    return defaults.length >= 2 ? defaults : ['model:resnet50', 'model:vgg16'];
  });

  const comparisonResult = useMemo(() => {
    return comparisonService.compareObjects(selectedIds, category);
  }, [selectedIds, category]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Studio Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Phase 5.1 — Comparison Studio</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Deterministic, repository-first side-by-side comparison across architectures, training, papers, and telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Scope Selector */}
      <ComparisonSelector
        availableObjects={availableObjects}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
        category={category}
        onCategoryChange={setCategory}
      />

      {/* Comparison Content */}
      <ComparisonPanel result={comparisonResult} />
    </div>
  );
};
