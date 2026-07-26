'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Cpu, Check, Layers, Zap } from 'lucide-react';
import { ModelSummary } from '@/lib/schema/model.schema';
import { modelCategories } from '@/lib/data/model-categories';
import { formatShortNumber } from '@/lib/utils/formatters';

interface ModelSelectorDropdownProps {
  models: ModelSummary[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  className?: string;
}

const efficiencyIcons = {
  lightweight: Zap,
  balanced: Layers,
  powerful: Cpu,
};

export default function ModelSelectorDropdown({
  models,
  selectedModelId,
  onSelect,
  className = '',
}: ModelSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected model details
  const selectedModel = useMemo(
    () => models.find((m) => m.id === selectedModelId),
    [models, selectedModelId]
  );

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;
    const query = searchQuery.toLowerCase();
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.category.toLowerCase().includes(query) ||
        (model.family && model.family.toLowerCase().includes(query)) ||
        model.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [models, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);


  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      <label htmlFor="model-selector" className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2">
        Select Model
      </label>

      {/* Trigger Button */}
      <button
        id="model-selector"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            setSearchQuery('');
          } else {
            setIsOpen(true);
          }
        }}
        className="w-full min-h-[56px] bg-slate-900/80 border border-border/40 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-border/60 hover:bg-slate-900/90 cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Selected Model Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedModel && (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Cpu className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-slate-200 truncate">
                    {selectedModel.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                    <span className="text-slate-400 font-medium truncate">{selectedModel.family || selectedModel.category}</span>
                    <span className="text-slate-700">•</span>
                    <span className="text-slate-400 font-medium">{selectedModel.depth} layers</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chevron Icon */}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-slate-950/95 border border-border/40 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-[460px] flex flex-col"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-border/20 bg-slate-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950/80 border border-border/30 rounded-lg pl-10 pr-4 py-3 text-sm font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* Model List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {filteredModels.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">No models found</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredModels.map((model) => {
                      const category = modelCategories[model.category];
                      const EfficiencyIcon = efficiencyIcons[model.efficiency];
                      const isSelected = model.id === selectedModelId;

                      return (
                        <button
                          key={model.id}
                          onClick={() => handleSelect(model.id)}
                          role="option"
                          aria-selected={isSelected}
                          className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 hover:bg-slate-900/60 cursor-pointer text-left ${
                            isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                          }`}
                        >
                          {/* Model Icon */}
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                              isSelected
                                ? 'bg-primary/20 border-primary/30'
                                : 'bg-slate-900/50 border-border/30'
                            }`}
                          >
                            <Cpu
                              className={`h-3.5 w-3.5 ${
                                isSelected ? 'text-primary' : 'text-slate-400'
                              }`}
                            />
                          </div>

                          {/* Model Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-slate-200'}`}>
                                {model.name}
                              </span>
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[11px]">
                              <span className={`text-[11px] font-medium ${category?.textColor || 'text-slate-400'}`}>{model.family || model.category}</span>
                              <span className="text-slate-700">•</span>
                              <span className="text-[11px] text-slate-400 font-medium">{model.depth} layers</span>
                              <span className="text-slate-700">•</span>
                              <span className="text-[11px] text-slate-400 font-medium">{formatShortNumber(model.totalParameters)}</span>
                            </div>
                          </div>

                          {/* Efficiency Badge */}
                          <div className="shrink-0">
                            <EfficiencyIcon className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-border/20 bg-slate-900/50">
                <div className="text-[10px] text-slate-500 font-medium text-center">
                  {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} available
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
