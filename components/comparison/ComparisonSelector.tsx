'use client';

import React from 'react';
import type { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';

interface ComparisonSelectorProps {
  availableObjects: readonly KnowledgeObject[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  category: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  { id: 'architecture', label: 'Architectures & Patterns' },
  { id: 'models', label: 'Models' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'training', label: 'Training & Concepts' },
  { id: 'papers', label: 'Research Papers' },
];

export const ComparisonSelector: React.FC<ComparisonSelectorProps> = ({
  availableObjects,
  selectedIds,
  onSelect,
  category,
  onCategoryChange,
}) => {
  const toggleObject = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) return; // keep at least 2 for comparison
      onSelect(selectedIds.filter((s) => s !== id));
    } else {
      if (selectedIds.length >= 4) return; // limit max 4 for side-by-side layout
      onSelect([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 mb-8 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Comparison Studio Scope
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Select category and 2 to 4 Knowledge Objects to analyze deterministically.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                category === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Object Selection Pills */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/60">
        {availableObjects.map((obj) => {
          const isSelected = selectedIds.includes(obj.identity.id) || selectedIds.includes(obj.identity.slug);
          return (
            <button
              key={obj.identity.id}
              onClick={() => toggleObject(obj.identity.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
              <span>{obj.identity.title}</span>
              <span className="text-[10px] opacity-60 uppercase font-mono">{obj.identity.type}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
