'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { comparisonService } from '@/lib/comparison/comparison-service';
import { knowledgeRepository } from '@/lib/knowledge/repository/repository';
import { ComparisonSelector } from './ComparisonSelector';
import { ComparisonPanel } from './ComparisonPanel';

interface ComparisonStudioProps {
  initialObjects?: readonly KnowledgeObject[];
  initialSelectedIds?: string[];
}

function ComparisonStudioContent({
  initialObjects,
  initialSelectedIds,
}: ComparisonStudioProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get('category') || 'architecture';
  const modelsParam = searchParams.get('models') || searchParams.get('ids');

  const [category, setCategory] = useState<string>(categoryParam);
  const [prevCategoryParam, setPrevCategoryParam] = useState<string>(categoryParam);

  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setCategory(categoryParam);
  }

  const availableObjects = useMemo(() => {
    if (initialObjects && initialObjects.length > 0) return initialObjects;
    return comparisonService.getComparableObjects(category);
  }, [category, initialObjects]);

  // Helper to normalize raw slugs or full IDs to valid KnowledgeObject IDs
  const parseIdsFromParam = useCallback(
    (paramValue: string | null): string[] => {
      if (!paramValue) return [];
      const rawTokens = paramValue.split(',').map((s) => s.trim()).filter(Boolean);
      const validIds: string[] = [];

      for (const token of rawTokens) {
        const obj = knowledgeRepository.getKnowledgeObject(token);
        if (obj && !validIds.includes(obj.identity.id)) {
          validIds.push(obj.identity.id);
        }
      }
      return validIds;
    },
    []
  );

  const defaultIds = useMemo(() => {
    if (initialSelectedIds && initialSelectedIds.length >= 2) return initialSelectedIds;
    const defaults = availableObjects.slice(0, 2).map((o) => o.identity.id);
    return defaults.length >= 2 ? defaults : ['model:resnet50', 'model:vgg16'];
  }, [availableObjects, initialSelectedIds]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const fromQuery = parseIdsFromParam(modelsParam);
    return fromQuery.length >= 2 ? fromQuery : defaultIds;
  });

  const [prevModelsParam, setPrevModelsParam] = useState<string | null>(modelsParam);
  if (modelsParam !== prevModelsParam) {
    setPrevModelsParam(modelsParam);
    const parsed = parseIdsFromParam(modelsParam);
    if (parsed.length >= 2) {
      setSelectedIds(parsed);
    }
  }

  // Sync state TO URL query string when selectedIds or category changes (side-effect in useEffect, not in setState reducer)
  useEffect(() => {
    const slugsOrIds = selectedIds.map((id) => {
      const obj = knowledgeRepository.getKnowledgeObject(id);
      return obj ? obj.identity.slug || obj.identity.id : id;
    });

    const params = new URLSearchParams();
    params.set('models', slugsOrIds.join(','));
    if (category && category !== 'architecture') {
      params.set('category', category);
    }

    const queryString = params.toString();
    const targetUrl = `/compare${queryString ? `?${queryString}` : ''}`;

    if (typeof window !== 'undefined') {
      const currentPathWithQuery = window.location.pathname + window.location.search;
      if (currentPathWithQuery !== targetUrl) {
        router.replace(targetUrl, { scroll: false });
      }
    }
  }, [selectedIds, category, router]);

  const handleSelectIds = useCallback(
    (nextIds: string[] | ((prev: string[]) => string[])) => {
      setSelectedIds(nextIds);
    },
    []
  );

  const handleCategoryChange = useCallback(
    (nextCat: string) => {
      setCategory(nextCat);
    },
    []
  );

  const comparisonResult = useMemo(() => {
    return comparisonService.compareObjects(selectedIds, category);
  }, [selectedIds, category]);

  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Studio Header (Compact, Mobile-First) */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-cyan-400 mb-0.5 uppercase tracking-wider">
            <span>Explorer</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">Comparison Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Comparison Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
            Side-by-side quantitative benchmarks, architectural blueprints, and performance trade-offs.
          </p>
        </div>

        {/* Share / Copy URL Icon Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            title={copied ? 'Link copied to clipboard!' : 'Share comparison link'}
            aria-label="Share comparison link"
            className={`p-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center min-h-[44px] min-w-[44px] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
              copied
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-400'
                : 'bg-slate-900 border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white'
            }`}
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Scope Selector */}
      <ComparisonSelector
        availableObjects={availableObjects}
        selectedIds={selectedIds}
        onSelect={handleSelectIds}
        category={category}
        onCategoryChange={handleCategoryChange}
      />

      {/* Comparison Content */}
      <ComparisonPanel result={comparisonResult} />
    </div>
  );
}

export const ComparisonStudio: React.FC<ComparisonStudioProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto px-4 py-12 text-center text-slate-400 animate-pulse">
          Loading Comparison Studio...
        </div>
      }
    >
      <ComparisonStudioContent {...props} />
    </Suspense>
  );
};

