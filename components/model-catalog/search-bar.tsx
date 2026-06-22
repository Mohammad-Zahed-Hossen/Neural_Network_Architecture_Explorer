'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import { ModelMetadata, EfficiencyLevel } from '@/lib/data/model-metadata';
import { getEras } from '@/lib/utils/filter-models';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onEfficiencyFilter: (levels: EfficiencyLevel[]) => void;
  onEraFilter: (eras: string[]) => void;
  totalResults?: number;
  models: ModelMetadata[];
}

export default function SearchBar({
  onSearch,
  onEfficiencyFilter,
  onEraFilter,
  totalResults = 0,
  models,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEfficiency, setSelectedEfficiency] = useState<EfficiencyLevel[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);

  // Get unique eras from models
  const availableEras = useMemo(() => {
    const eras = getEras(models);
    return Array.from(eras).sort();
  }, [models]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    onSearch(value);
  }, [onSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  const handleEfficiencyToggle = useCallback((level: EfficiencyLevel) => {
    const updated = selectedEfficiency.includes(level)
      ? selectedEfficiency.filter(l => l !== level)
      : [...selectedEfficiency, level];
    setSelectedEfficiency(updated);
    onEfficiencyFilter(updated);
  }, [selectedEfficiency, onEfficiencyFilter]);

  const handleEraToggle = useCallback((era: string) => {
    const updated = selectedEras.includes(era)
      ? selectedEras.filter(e => e !== era)
      : [...selectedEras, era];
    setSelectedEras(updated);
    onEraFilter(updated);
  }, [selectedEras, onEraFilter]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedEfficiency([]);
    setSelectedEras([]);
    onSearch('');
    onEfficiencyFilter([]);
    onEraFilter([]);
  }, [onSearch, onEfficiencyFilter, onEraFilter]);

  const activeFilterCount = searchQuery.length > 0 ? 1 : 0 + selectedEfficiency.length + selectedEras.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-6 space-y-3"
    >
      {/* Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search models by name, author, or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-[#020617] border border-[#1f2937] rounded-xl text-[#e5e7eb] placeholder-[#6b7280] focus:outline-none focus:border-[#22d3ee] focus:shadow-[0_0_0_1px_rgba(34,211,238,0.5)] transition-all"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClearSearch}
              className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Filter Toggle & Results */}
      <div className="flex items-center justify-between px-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 bg-[#22d3ee]/20 text-[#22d3ee] rounded-full text-xs font-semibold border border-[#22d3ee]/30"
            >
              {activeFilterCount}
            </motion.span>
          )}
        </motion.button>

        {totalResults >= 0 && (
          <span className="text-xs text-slate-500 font-medium">
            {totalResults} {totalResults === 1 ? 'model' : 'models'}
          </span>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-[#020617] border border-[#1f2937] rounded-xl p-4 space-y-4">
              {/* Efficiency Filter */}
              <div>
                <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider block mb-2.5">
                  Efficiency
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['lightweight', 'balanced', 'powerful'] as EfficiencyLevel[]).map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEfficiencyToggle(level)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                        selectedEfficiency.includes(level)
                          ? 'bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/50'
                          : 'bg-[#020617] text-[#9ca3af] border-[#1f2937] hover:border-[#22d3ee]/30'
                      }`}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Era Filter */}
              <div>
                <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider block mb-2.5">
                  Era
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableEras.map((era) => (
                    <motion.button
                      key={era}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEraToggle(era)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        selectedEras.includes(era)
                          ? 'bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/50'
                          : 'bg-[#020617] text-[#9ca3af] border-[#1f2937] hover:border-[#22d3ee]/30'
                      }`}
                    >
                      {era}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={clearFilters}
                  className="w-full py-2 text-xs font-semibold text-[#6b7280] hover:text-[#e5e7eb] border border-[#1f2937] hover:border-[#22d3ee]/30 rounded-lg transition-colors"
                >
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
