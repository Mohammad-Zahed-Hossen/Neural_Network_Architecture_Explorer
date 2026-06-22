'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ModelGrid from '@/components/model-catalog/model-grid';
import CategoryTabs from '@/components/model-catalog/category-tabs';
import SearchBar from '@/components/model-catalog/search-bar';
import { ModelCategory, EfficiencyLevel } from '@/lib/data/model-metadata';
import { filterModels } from '@/lib/utils/filter-models';
import modelsSummary from '@/data/models.json';

// We map our JSON models to match the ModelMetadata type
const modelsData = modelsSummary.map(m => ({
  ...m,
  totalParameters: m.params,
  totalFLOPs: m.flops,
  top1Accuracy: m.top1 / 100,
  top5Accuracy: m.top5 / 100,
  memoryUsage: m.memory_mb,
  releaseYear: m.releaseYear,
  paperYear: m.year,
  depth: m.depth,
  colorTheme: m.colorTheme,
})) as any[];

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEfficiency, setSelectedEfficiency] = useState<EfficiencyLevel[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);

  // Filter models based on all criteria
  const filteredModels = useMemo(() => {
    return filterModels(modelsData, {
      searchQuery,
      categories: selectedCategory ? [selectedCategory] : undefined,
      efficiencyLevels: selectedEfficiency.length > 0 ? selectedEfficiency : undefined,
      yearRange: selectedEras.length > 0 ? {} : undefined,
    }).filter(model => {
      if (selectedEras.length === 0) return true;
      const year = model.releaseYear || model.paperYear;
      const era = getEra(year);
      return selectedEras.includes(era);
    });
  }, [selectedCategory, searchQuery, selectedEfficiency, selectedEras]);

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-12">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-primary z-0" />

      {/* Model Catalog Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-border/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
              <Network className="h-7 w-7 text-primary" />
              Explore Models Catalog
            </h1>
            <p className="text-sm text-slate-500 font-medium">Browse and filter {modelsData.length} architectures by family category, hardware efficiency, and historical era.</p>
          </div>
          <Link
            href="/compare"
            className="text-xs font-semibold text-primary hover:text-blue-300 transition-colors flex items-center gap-1.5 self-start md:self-auto bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 hover:bg-primary/15"
          >
            <span>Compare all models</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Search & Filter */}
        <SearchBar
          models={modelsData}
          onSearch={setSearchQuery}
          onEfficiencyFilter={setSelectedEfficiency}
          onEraFilter={setSelectedEras}
          totalResults={filteredModels.length}
        />
      </section>

      {/* Model Grid */}
      <ModelGrid models={filteredModels} />
    </div>
  );
}

// Helper function to get era
function getEra(year: number): string {
  if (year < 2015) return 'pre-2015';
  if (year < 2018) return '2015-2017';
  if (year < 2020) return '2018-2019';
  return '2020+';
}
