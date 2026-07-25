'use client';

import { motion } from 'framer-motion';
import { ModelCategory } from '@/lib/schema/model.schema';
import { modelCategories, categoryOrder } from '@/lib/data/model-categories';

interface CategoryTabsProps {
  onCategoryChange: (category: ModelCategory | null) => void;
  selectedCategory: ModelCategory | null;
}

export default function CategoryTabs({ onCategoryChange, selectedCategory }: CategoryTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-x-auto scroll-fade-x scrollbar-none pb-2 mb-6 border-b border-[#1f2937]/40"
    >
      <div className="flex gap-2 min-w-min px-4 sm:px-6 lg:px-8 py-1" role="tablist" aria-label="Model categories">
        {/* "All" tab */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(null)}
          role="tab"
          aria-selected={selectedCategory === null}
          className={`min-h-[44px] px-4 rounded-xl font-semibold text-xs whitespace-nowrap transition-all duration-300 border flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            selectedCategory === null
              ? 'bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
              : 'bg-transparent text-slate-400 border-slate-800 hover:border-cyan-400/40 hover:text-slate-200'
          }`}
        >
          All Models
        </motion.button>

        {/* Category tabs */}
        {categoryOrder.map((category) => {
          const cat = modelCategories[category];
          const isSelected = selectedCategory === category;

          return (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category)}
              role="tab"
              aria-selected={isSelected}
              className={`min-h-[44px] px-4 rounded-xl font-semibold text-xs whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isSelected
                  ? 'bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'bg-transparent text-slate-400 border-slate-800 hover:border-cyan-400/40 hover:text-slate-200'
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.name}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
