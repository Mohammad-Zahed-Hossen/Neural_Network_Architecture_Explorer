'use client';

import { motion } from 'framer-motion';
import { ModelSummary } from '@/lib/schema/model.schema';
import ModelCard from './model-card';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';
import { Lightbulb, SearchX, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ModelGridProps {
  models: ModelSummary[];
  isLoading?: boolean;
  onSelectSuggestion?: (term: string) => void;
  searchQuery?: string;
}

export default function ModelGrid({
  models,
  isLoading = false,
  onSelectSuggestion,
  searchQuery = '',
}: ModelGridProps) {
  const shouldReduceMotion = useReducedMotionPreference();

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-[480px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-border/20 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (models.length === 0) {
    const SUGGESTED_TERMS = [
      { label: 'ResNet', query: 'ResNet' },
      { label: 'Skip Connection', query: 'Skip Connection' },
      { label: 'Depthwise Separable', query: 'Depthwise' },
      { label: 'Attention / ViT', query: 'Attention' },
      { label: 'Mobile & Edge', query: 'Mobile' },
      { label: 'Compound Scaling', query: 'Compound' },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
      >
        <div className="bg-[#020617] border border-[#1f2937] rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[#22d3ee] flex items-center justify-center mx-auto">
            <SearchX className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-100">No matching models found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              We couldn&apos;t find any model matching <span className="text-[#22d3ee] font-semibold">&quot;{searchQuery}&quot;</span>. Try exploring by architectural pattern or natural term:
            </p>
          </div>

          {/* Educational Suggestions */}
          <div className="pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3 flex items-center justify-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              Try searching for these concepts:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
              {SUGGESTED_TERMS.map(term => (
                <button
                  key={term.label}
                  onClick={() => onSelectSuggestion && onSelectSuggestion(term.query)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-[#22d3ee] hover:border-[#22d3ee]/40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{term.label}</span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex justify-center gap-4 text-xs font-semibold">
            <Link
              href="/architecture-patterns"
              className="text-[#22d3ee] hover:underline"
            >
              Browse Architecture Patterns →
            </Link>
            <Link
              href="/papers"
              className="text-indigo-400 hover:underline"
            >
              Browse Research Papers →
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : index * 0.05 },
    }),
  };

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {models.map((model, index) => (
          <motion.div key={model.id} variants={itemVariants} custom={index} className="h-full">
            <ModelCard model={model} index={index} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
