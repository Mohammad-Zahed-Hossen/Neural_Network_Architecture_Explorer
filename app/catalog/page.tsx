'use client';

import { Network, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ModelGrid from '@/components/model-catalog/model-grid';
import CategoryTabs from '@/components/model-catalog/category-tabs';
import SearchBar from '@/components/model-catalog/search-bar';
import { getModelSummaries } from '@/lib/data-access/models';
import ContinueLearning from '@/components/ui/continue-learning';
import { useKnowledgeSearch } from '@/lib/hooks/use-knowledge-search';
import { enrichModelEntity } from '@/lib/search/metadata-enrichment';

const modelsData = getModelSummaries();

export default function Catalog() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPatterns,
    setSelectedPatterns,
    selectedApplications,
    setSelectedApplications,
    selectedDifficulties,
    setSelectedDifficulties,
    selectedEfficiency,
    setSelectedEfficiency,
    selectedEras,
    setSelectedEras,
    filteredItems: filteredModels,
  } = useKnowledgeSearch({
    data: modelsData,
    toSearchableEntity: enrichModelEntity,
    syncUrl: true,
  });

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-12 overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-primary z-0" />

      {/* Model Catalog Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 border-b border-border/10 pb-3 sm:pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1 sm:mb-1.5 flex items-center gap-2">
              <Network className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Explore Models Catalog
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">Browse and filter {modelsData.length} architectures by family category, architectural pattern, deployment target, hardware efficiency, and historical era.</p>
          </div>
          <Link
            href="/compare"
            className="text-[10px] sm:text-xs font-semibold text-primary hover:text-blue-300 transition-colors flex items-center gap-1.5 self-start md:self-auto bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-primary/15"
          >
            <span>Compare all models</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Search & Educational Filters */}
        <SearchBar
          models={modelsData}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          selectedEfficiency={selectedEfficiency}
          onEfficiencyFilter={setSelectedEfficiency}
          selectedEras={selectedEras}
          onEraFilter={setSelectedEras}
          selectedPatterns={selectedPatterns}
          onPatternFilter={setSelectedPatterns}
          selectedApplications={selectedApplications}
          onApplicationFilter={setSelectedApplications}
          selectedDifficulties={selectedDifficulties}
          onDifficultyFilter={setSelectedDifficulties}
          totalResults={filteredModels.length}
        />
      </section>

      {/* Model Grid */}
      <ModelGrid
        models={filteredModels}
        searchQuery={searchQuery}
        onSelectSuggestion={(term) => setSearchQuery(term)}
      />

      {/* Continue Learning section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-5 sm:pb-7 lg:pb-9">
        <ContinueLearning
          items={[
            { title: 'Guided Learning Paths', type: 'learn', href: '/learn', description: 'Follow structured beginner, intermediate, and advanced curricula.' },
            { title: 'Architecture Patterns Library', type: 'pattern', href: '/architecture-patterns', description: 'Explore core design blocks (Residual, Dense, Depthwise, Attention).' },
            { title: 'Research Lineage DAG Map', type: 'paper', href: '/research-map', description: 'Explore citation graph connecting landmark papers.' },
            { title: 'Evolution Timeline', type: 'evolution', href: '/evolution', description: 'Trace chronological breakthroughs from 1998 to present.' },
            { title: 'Side-by-Side Model Comparator', type: 'compare', href: '/compare', description: 'Compare parameters, FLOPs, and accuracy across models.' }
          ]}
        />
      </section>
    </div>
  );
}
