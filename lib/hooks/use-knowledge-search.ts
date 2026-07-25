'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SearchFilterCriteria, SearchResult } from '../search/types';
import { searchEntities } from '../search/search-engine';
import { EfficiencyLevel, ModelCategory } from '@/lib/schema/model.schema';

export interface KnowledgeSearchOptions<T> {
  data: T[];
  toSearchableEntity: (item: T) => import('../search/types').SearchableEntity;
  syncUrl?: boolean;
}

export function useKnowledgeSearch<T>(options: KnowledgeSearchOptions<T>) {
  const { data, toSearchableEntity, syncUrl = true } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filter States initialized from URL params if syncUrl enabled
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return syncUrl ? searchParams.get('q') || '' : '';
  });

  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | null>(() => {
    return syncUrl ? (searchParams.get('category') as ModelCategory) || null : null;
  });

  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(() => {
    const param = syncUrl ? searchParams.get('pattern') : null;
    return param ? param.split(',') : [];
  });

  const [selectedApplications, setSelectedApplications] = useState<string[]>(() => {
    const param = syncUrl ? searchParams.get('app') : null;
    return param ? param.split(',') : [];
  });

  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(() => {
    const param = syncUrl ? searchParams.get('diff') : null;
    return param ? param.split(',') : [];
  });

  const [selectedEfficiency, setSelectedEfficiency] = useState<EfficiencyLevel[]>(() => {
    const param = syncUrl ? searchParams.get('eff') : null;
    return param ? (param.split(',') as EfficiencyLevel[]) : [];
  });

  const [selectedEras, setSelectedEras] = useState<string[]>(() => {
    const param = syncUrl ? searchParams.get('era') : null;
    return param ? param.split(',') : [];
  });

  // Sync states to URL parameters
  useEffect(() => {
    if (!syncUrl) return;
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery) params.set('q', searchQuery);
    if (selectedPatterns.length > 0) params.set('pattern', selectedPatterns.join(','));
    if (selectedApplications.length > 0) params.set('app', selectedApplications.join(','));
    if (selectedDifficulties.length > 0) params.set('diff', selectedDifficulties.join(','));
    if (selectedEfficiency.length > 0) params.set('eff', selectedEfficiency.join(','));
    if (selectedEras.length > 0) params.set('era', selectedEras.join(','));

    const searchString = params.toString();
    const newUrl = searchString ? `${pathname}?${searchString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [
    syncUrl,
    searchQuery,
    selectedCategory,
    selectedPatterns,
    selectedApplications,
    selectedDifficulties,
    selectedEfficiency,
    selectedEras,
    pathname,
    router,
  ]);

  // Combined Search Criteria
  const criteria: SearchFilterCriteria = useMemo(() => {
    return {
      searchQuery,
      categories: selectedCategory ? [selectedCategory] : undefined,
      patterns: selectedPatterns.length > 0 ? selectedPatterns : undefined,
      applications: selectedApplications.length > 0 ? selectedApplications : undefined,
      difficulties: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
      efficiencyLevels: selectedEfficiency.length > 0 ? selectedEfficiency : undefined,
      eras: selectedEras.length > 0 ? selectedEras : undefined,
    };
  }, [
    searchQuery,
    selectedCategory,
    selectedPatterns,
    selectedApplications,
    selectedDifficulties,
    selectedEfficiency,
    selectedEras,
  ]);

  // Execute Search
  const searchResults: SearchResult<T>[] = useMemo(() => {
    return searchEntities(data, criteria, toSearchableEntity);
  }, [data, criteria, toSearchableEntity]);

  const filteredItems = useMemo(() => {
    return searchResults.map(r => r.item);
  }, [searchResults]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return (
      (searchQuery ? 1 : 0) +
      (selectedCategory ? 1 : 0) +
      selectedPatterns.length +
      selectedApplications.length +
      selectedDifficulties.length +
      selectedEfficiency.length +
      selectedEras.length
    );
  }, [
    searchQuery,
    selectedCategory,
    selectedPatterns,
    selectedApplications,
    selectedDifficulties,
    selectedEfficiency,
    selectedEras,
  ]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedPatterns([]);
    setSelectedApplications([]);
    setSelectedDifficulties([]);
    setSelectedEfficiency([]);
    setSelectedEras([]);
  }, []);

  return {
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
    activeFilterCount,
    searchResults,
    filteredItems,
    clearAllFilters,
  };
}
