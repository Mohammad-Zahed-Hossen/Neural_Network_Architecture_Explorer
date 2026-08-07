'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import type { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { knowledgeRepository } from '@/lib/knowledge/repository/repository';
import { Search, Filter, RotateCcw, Copy, Check, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ComparisonSelectorProps {
  availableObjects: readonly KnowledgeObject[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  category: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  { id: 'architecture', label: 'All Entities' },
  { id: 'models', label: 'Models' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'training', label: 'Training Concepts' },
  { id: 'papers', label: 'Research Papers' },
];

interface QuickCollection {
  id: string;
  name: string;
  icon: string;
  slugs: string[];
}

const QUICK_COLLECTIONS: QuickCollection[] = [
  { id: 'research-classics', name: 'Research Classics', icon: '⚡', slugs: ['lenet', 'alexnet', 'vgg16', 'resnet50'] },
  { id: 'mobile-deployment', name: 'Mobile & Edge AI', icon: '📱', slugs: ['mobilenet', 'mobilenetv2', 'efficientnet', 'xception'] },
  { id: 'best-accuracy', name: 'Best Accuracy', icon: '🚀', slugs: ['convnext', 'swin', 'efficientnet', 'vit'] },
  { id: 'efficient-backbones', name: 'Efficient Backbones', icon: '⚙️', slugs: ['resnet50', 'densenet121', 'efficientnet', 'convnext'] },
  { id: 'realtime-latency', name: 'Low Latency', icon: '⏱️', slugs: ['mobilenet', 'resnet18', 'densenet121', 'alexnet'] },
];

export const ComparisonSelector: React.FC<ComparisonSelectorProps> = ({
  availableObjects,
  selectedIds,
  onSelect,
  category,
  onCategoryChange,
}) => {
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredObjects = useMemo(() => {
    if (!searchQuery.trim()) return availableObjects;
    const q = searchQuery.toLowerCase().trim();
    return availableObjects.filter((obj) => {
      const titleMatch = obj.identity.title.toLowerCase().includes(q);
      const slugMatch = obj.identity.slug.toLowerCase().includes(q);
      const summaryMatch = obj.metadata.summary.toLowerCase().includes(q);
      const tagMatch = obj.metadata.tags.some((t) => t.toLowerCase().includes(q));
      const typeMatch = obj.identity.type.toLowerCase().includes(q);
      const yearMatch = String(obj.metadata.year || '').includes(q);
      return titleMatch || slugMatch || summaryMatch || tagMatch || typeMatch || yearMatch;
    });
  }, [availableObjects, searchQuery]);

  // Soft upper bound of 6 models is enforced for optimal UX:
  // - Radar chart polygons stay legible without clutter
  // - Bar charts and metric tables remain readable on mobile
  // - Color distinction is preserved across accessible high-contrast palettes
  const toggleObject = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        if (selectedIds.length <= 2) return;
        onSelect(selectedIds.filter((s) => s !== id));
      } else {
        if (selectedIds.length >= 6) return;
        onSelect([...selectedIds, id]);
      }
    },
    [selectedIds, onSelect]
  );

  const applyCollection = useCallback(
    (collection: QuickCollection) => {
      if (activeCollectionId === collection.id) {
        setActiveCollectionId(null);
        return;
      }

      setActiveCollectionId(collection.id);
      const validIds: string[] = [];
      for (const slug of collection.slugs) {
        const obj = knowledgeRepository.getKnowledgeObject(slug);
        if (obj && !validIds.includes(obj.identity.id)) {
          validIds.push(obj.identity.id);
        }
      }

      if (validIds.length < 2) {
        onSelect(availableObjects.slice(0, 6).map((o) => o.identity.id));
      } else {
        onSelect(validIds.slice(0, 6));
      }
    },
    [activeCollectionId, availableObjects, onSelect]
  );

  const resetSelection = useCallback(() => {
    setActiveCollectionId(null);
    setSearchQuery('');
    onSelect(availableObjects.slice(0, 2).map((o) => o.identity.id));
  }, [availableObjects, onSelect]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('models', selectedIds.join(','));
      navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const focusSearchInput = () => {
    if (!isWorkspaceExpanded) setIsWorkspaceExpanded(true);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 50);
  };

  const colorStyles = [
    { bg: 'bg-blue-950/90', border: 'border-blue-500/80', text: 'text-blue-300', dot: 'bg-blue-400' },
    { bg: 'bg-emerald-950/90', border: 'border-emerald-500/80', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    { bg: 'bg-amber-950/90', border: 'border-amber-500/80', text: 'text-amber-300', dot: 'bg-amber-400' },
    { bg: 'bg-purple-950/90', border: 'border-purple-500/80', text: 'text-purple-300', dot: 'bg-purple-400' },
    { bg: 'bg-rose-950/90', border: 'border-rose-500/80', text: 'text-rose-300', dot: 'bg-rose-400' },
    { bg: 'bg-cyan-950/90', border: 'border-cyan-500/80', text: 'text-cyan-300', dot: 'bg-cyan-400' },
  ];

  // Memoize resolved knowledge objects for active selection to prevent repeated repository queries
  const selectedObjectsMap = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const id of selectedIds) {
      const obj = knowledgeRepository.getKnowledgeObject(id);
      map.set(id, { id, title: obj ? obj.identity.title : id });
    }
    return map;
  }, [selectedIds]);

  // COLLAPSED STATE COMPONENT VIEW
  if (!isWorkspaceExpanded) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-6 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => setIsWorkspaceExpanded(true)}
            className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5 hover:text-cyan-300 transition-colors shrink-0 mr-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 rounded-lg px-1 py-0.5"
            aria-expanded={false}
            title="Click to expand selection workspace"
          >
            <ChevronDown className="w-4 h-4 text-cyan-400 -rotate-90" />
            <span>Selection Workspace ({selectedIds.length} Selected)</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedIds.map((id, idx) => {
              const cached = selectedObjectsMap.get(id);
              const title = cached ? cached.title : id;
              const style = colorStyles[idx % colorStyles.length];

              return (
                <span
                  key={id}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 ${style.bg} ${style.border} ${style.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}></span>
                  <span className="truncate max-w-[110px] sm:max-w-[140px]">{title}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 italic hidden lg:inline">
            For clearest comparison, 2–4 models are recommended.
          </span>
          <button
            type="button"
            onClick={() => setIsWorkspaceExpanded(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Modify Filter</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED STATE COMPONENT VIEW
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-xl shadow-2xl space-y-4">
      {/* Workspace Header & Collapse Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWorkspaceExpanded(false)}
            className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-cyan-300 transition-colors focus-visible:outline-none"
            aria-expanded={true}
          >
            <ChevronUp className="w-4 h-4 text-cyan-400" />
            <span>Selection Workspace</span>
          </button>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">•</span>
          <span className="text-xs text-slate-400 italic hidden sm:inline">
            For clearest comparison, 2–4 models are recommended.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsWorkspaceExpanded(false)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <span>Collapse</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ROW 1: Active Selection Scope Bar & Primary Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        {/* Active Scope Slot Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold shrink-0 flex items-center gap-1.5 mr-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
            Scope ({selectedIds.length}/6):
          </span>

          {selectedIds.map((selectedId, slotIdx) => {
            const style = colorStyles[slotIdx % colorStyles.length];
            const cached = selectedObjectsMap.get(selectedId);
            const title = cached ? cached.title : selectedId;

            return (
              <div
                key={selectedId}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm min-h-[38px] ${style.bg} ${style.border} ${style.text}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`}></span>
                <span className="truncate max-w-[110px] sm:max-w-[140px]">{title}</span>
                {selectedIds.length > 2 && (
                  <button
                    type="button"
                    onClick={() => toggleObject(selectedId)}
                    className="text-slate-400 hover:text-rose-300 ml-1 font-bold leading-none p-1 -mr-1"
                    title={`Remove ${title}`}
                    aria-label={`Remove ${title}`}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {selectedIds.length < 6 && (
            <button
              type="button"
              onClick={focusSearchInput}
              className="px-3 py-1.5 rounded-xl border border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950/40 text-slate-500 hover:text-blue-300 transition-colors text-xs font-medium shrink-0 flex items-center gap-1 min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Model</span>
            </button>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('comparison-matrix-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1 min-h-[36px]"
          >
            <span>Compare {selectedIds.length} Models</span>
            <span>↗</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors flex items-center gap-1 min-h-[36px]"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={resetSelection}
            className="p-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Reset to default selection"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROW 2: Compact Search & Quick Collection Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Inline Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models... (e.g. ResNet, Mobile, Transformer, 2023)"
            className="w-full pl-9 pr-8 py-1.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all min-h-[38px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Collection Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {QUICK_COLLECTIONS.map((col) => {
            const isActive = activeCollectionId === col.id;

            return (
              <button
                key={col.id}
                type="button"
                onClick={() => applyCollection(col)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1 min-h-[34px] ${
                  isActive
                    ? 'bg-purple-950/90 border-purple-500/80 text-purple-200 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="text-[11px]">{col.icon}</span>
                <span>{col.name}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 shrink-0 min-h-[34px] ${
              showAdvancedFilters || category !== 'architecture'
                ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3 text-blue-400" />
            <span>Types</span>
            {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Advanced Category Filters Drawer */}
      {showAdvancedFilters && (
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 animate-fadeIn">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  category === cat.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ROW 3: Horizontal Scrollable Available Object Chips */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1.5">
          <span>AVAILABLE OBJECTS ({filteredObjects.length})</span>
          {searchQuery && <span className="text-blue-400">Match &quot;{searchQuery}&quot;</span>}
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
          {filteredObjects.length > 0 ? (
            filteredObjects.map((obj) => {
              const selectedIndex = selectedIds.findIndex(
                (id) => id === obj.identity.id || id === obj.identity.slug
              );
              const isSelected = selectedIndex !== -1;
              const isDisabled = !isSelected && selectedIds.length >= 6;
              const style = isSelected ? colorStyles[selectedIndex % colorStyles.length] : null;

              return (
                <button
                  key={obj.identity.id}
                  type="button"
                  onClick={() => toggleObject(obj.identity.id)}
                  disabled={isDisabled}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    isSelected && style
                      ? `${style.bg} ${style.border} ${style.text} font-bold shadow-sm`
                      : isDisabled
                      ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isSelected && style ? `${style.dot}` : 'bg-slate-600'
                    }`}
                  ></span>
                  <span>{obj.identity.title}</span>
                  <span className="text-[9px] opacity-60 uppercase font-mono">{obj.identity.type}</span>
                </button>
              );
            })
          ) : (
            <div className="py-3 px-2 text-xs text-slate-500 italic text-center w-full bg-slate-950/50 rounded-lg border border-slate-800/50">
              No entities match search query &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

