'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, Sparkles } from 'lucide-react';
import { ModelSummary, EfficiencyLevel } from '@/lib/schema/model.schema';
import { getEras } from '@/lib/utils/filter-models';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onEfficiencyFilter: (levels: EfficiencyLevel[]) => void;
  onEraFilter: (eras: string[]) => void;
  onPatternFilter?: (patterns: string[]) => void;
  onApplicationFilter?: (apps: string[]) => void;
  onDifficultyFilter?: (diffs: string[]) => void;
  totalResults?: number;
  models: ModelSummary[];
  searchQuery?: string;
  selectedEfficiency?: EfficiencyLevel[];
  selectedEras?: string[];
  selectedPatterns?: string[];
  selectedApplications?: string[];
  selectedDifficulties?: string[];
}

export default function SearchBar({
  onSearch,
  onEfficiencyFilter,
  onEraFilter,
  onPatternFilter,
  onApplicationFilter,
  onDifficultyFilter,
  totalResults = 0,
  models,
  searchQuery: externalQuery,
  selectedEfficiency: externalEfficiency,
  selectedEras: externalEras,
  selectedPatterns: externalPatterns,
  selectedApplications: externalApps,
  selectedDifficulties: externalDiffs,
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [internalEfficiency, setInternalEfficiency] = useState<EfficiencyLevel[]>([]);
  const [internalEras, setInternalEras] = useState<string[]>([]);
  const [internalPatterns, setInternalPatterns] = useState<string[]>([]);
  const [internalApps, setInternalApps] = useState<string[]>([]);
  const [internalDiffs, setInternalDiffs] = useState<string[]>([]);

  const searchQuery = externalQuery !== undefined ? externalQuery : internalQuery;
  const selectedEfficiency = externalEfficiency !== undefined ? externalEfficiency : internalEfficiency;
  const selectedEras = externalEras !== undefined ? externalEras : internalEras;
  const selectedPatterns = externalPatterns !== undefined ? externalPatterns : internalPatterns;
  const selectedApps = externalApps !== undefined ? externalApps : internalApps;
  const selectedDiffs = externalDiffs !== undefined ? externalDiffs : internalDiffs;

  const availableEras = useMemo(() => {
    const eras = getEras(models);
    return Array.from(eras).sort();
  }, [models]);

  const PATTERN_OPTIONS = [
    { id: 'residual', label: 'Residual' },
    { id: 'dense', label: 'Dense' },
    { id: 'depthwise', label: 'Depthwise' },
    { id: 'compound', label: 'Compound Scaling' },
    { id: 'nas', label: 'NAS / AutoML' },
    { id: 'attention', label: 'Attention' },
  ];

  const APPLICATION_OPTIONS = [
    { id: 'mobile', label: 'Mobile & Edge' },
    { id: 'server', label: 'High-Perf Server' },
    { id: 'research', label: 'Research Landmark' },
  ];

  const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSearchChange = useCallback((value: string) => {
    setInternalQuery(value);
    onSearch(value);
  }, [onSearch]);

  const handleClearSearch = useCallback(() => {
    setInternalQuery('');
    onSearch('');
  }, [onSearch]);

  const handleEfficiencyToggle = useCallback((level: EfficiencyLevel) => {
    const updated = selectedEfficiency.includes(level)
      ? selectedEfficiency.filter(l => l !== level)
      : [...selectedEfficiency, level];
    setInternalEfficiency(updated);
    onEfficiencyFilter(updated);
  }, [selectedEfficiency, onEfficiencyFilter]);

  const handleEraToggle = useCallback((era: string) => {
    const updated = selectedEras.includes(era)
      ? selectedEras.filter(e => e !== era)
      : [...selectedEras, era];
    setInternalEras(updated);
    onEraFilter(updated);
  }, [selectedEras, onEraFilter]);

  const handlePatternToggle = useCallback((patternId: string) => {
    const updated = selectedPatterns.includes(patternId)
      ? selectedPatterns.filter(p => p !== patternId)
      : [...selectedPatterns, patternId];
    setInternalPatterns(updated);
    if (onPatternFilter) onPatternFilter(updated);
  }, [selectedPatterns, onPatternFilter]);

  const handleApplicationToggle = useCallback((appId: string) => {
    const updated = selectedApps.includes(appId)
      ? selectedApps.filter(a => a !== appId)
      : [...selectedApps, appId];
    setInternalApps(updated);
    if (onApplicationFilter) onApplicationFilter(updated);
  }, [selectedApps, onApplicationFilter]);

  const handleDifficultyToggle = useCallback((diff: string) => {
    const updated = selectedDiffs.includes(diff)
      ? selectedDiffs.filter(d => d !== diff)
      : [...selectedDiffs, diff];
    setInternalDiffs(updated);
    if (onDifficultyFilter) onDifficultyFilter(updated);
  }, [selectedDiffs, onDifficultyFilter]);

  const clearFilters = useCallback(() => {
    setInternalQuery('');
    setInternalEfficiency([]);
    setInternalEras([]);
    setInternalPatterns([]);
    setInternalApps([]);
    setInternalDiffs([]);
    onSearch('');
    onEfficiencyFilter([]);
    onEraFilter([]);
    if (onPatternFilter) onPatternFilter([]);
    if (onApplicationFilter) onApplicationFilter([]);
    if (onDifficultyFilter) onDifficultyFilter([]);
  }, [onSearch, onEfficiencyFilter, onEraFilter, onPatternFilter, onApplicationFilter, onDifficultyFilter]);

  const activeFilterCount =
    (searchQuery.length > 0 ? 1 : 0) +
    selectedEfficiency.length +
    selectedEras.length +
    selectedPatterns.length +
    selectedApps.length +
    selectedDiffs.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-6 space-y-3"
    >
      {/* Search Input Bar */}
      <div className="relative" role="search">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, alias (ResNet, ViT, NAS), pattern (Residual, Attention), or component..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all min-h-[44px]"
            aria-label="Search neural network architectures"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClearSearch}
              className="absolute right-1 text-slate-400 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Filter Toggle Header */}
      <div className="flex items-center justify-between px-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-label="Toggle educational search filters"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg px-1"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          <span>Educational Filters</span>
          {activeFilterCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold border border-cyan-500/30"
            >
              {activeFilterCount}
            </motion.span>
          )}
        </motion.button>

        {totalResults >= 0 && (
          <span className="text-xs text-slate-500 font-medium">
            {totalResults} {totalResults === 1 ? 'model' : 'models'} found
          </span>
        )}
      </div>

      {/* Educational Filter Panel */}
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
              
              {/* Pattern Filter */}
              <div>
                <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#22d3ee]" />
                  Architectural Pattern
                </label>
                <div className="flex flex-wrap gap-2">
                  {PATTERN_OPTIONS.map((pat) => (
                    <motion.button
                      key={pat.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePatternToggle(pat.id)}
                      className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center cursor-pointer ${
                        selectedPatterns.includes(pat.id)
                          ? 'bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/50'
                          : 'bg-[#020617] text-[#9ca3af] border-[#1f2937] hover:border-[#22d3ee]/30'
                      }`}
                    >
                      {pat.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Deployment Target / Application Filter */}
              <div>
                <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider block mb-2">
                  Deployment Target / Use Case
                </label>
                <div className="flex flex-wrap gap-2">
                  {APPLICATION_OPTIONS.map((app) => (
                    <motion.button
                      key={app.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApplicationToggle(app.id)}
                      className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center cursor-pointer ${
                        selectedApps.includes(app.id)
                          ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                          : 'bg-[#020617] text-[#9ca3af] border-[#1f2937] hover:border-indigo-500/30'
                      }`}
                    >
                      {app.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#1f2937] pt-4">
                {/* Efficiency Filter */}
                <div>
                  <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider block mb-2">
                    Efficiency Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['lightweight', 'balanced', 'powerful'] as EfficiencyLevel[]).map((level) => (
                      <motion.button
                        key={level}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEfficiencyToggle(level)}
                        className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold capitalize transition-all border flex items-center justify-center cursor-pointer ${
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

                {/* Difficulty Filter */}
                <div>
                  <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider block mb-2">
                    Concept Difficulty
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_OPTIONS.map((diff) => (
                      <motion.button
                        key={diff}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDifficultyToggle(diff)}
                        className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center cursor-pointer ${
                          selectedDiffs.includes(diff)
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                            : 'bg-[#020617] text-[#9ca3af] border-[#1f2937] hover:border-purple-500/30'
                        }`}
                      >
                        {diff}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Era Filter */}
                <div>
                  <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider block mb-2">
                    Historical Era
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableEras.map((era) => (
                      <motion.button
                        key={era}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEraToggle(era)}
                        className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center cursor-pointer ${
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
              </div>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={clearFilters}
                  className="w-full min-h-[44px] text-xs font-semibold text-[#6b7280] hover:text-[#e5e7eb] border border-[#1f2937] hover:border-[#22d3ee]/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center mt-2"
                >
                  Clear All Educational Filters
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
