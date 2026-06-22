'use client';

import { motion } from 'framer-motion';
import { ModelCategory } from '@/lib/data/model-metadata';
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
      className="overflow-x-auto pb-2 mb-6 border-b border-[#1f2937]/40"
    >
      <div className="flex gap-2 min-w-min px-4 sm:px-6 lg:px-8">
        {/* "All" tab */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 border ${
            selectedCategory === null
              ? 'bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.25)]'
              : 'bg-transparent text-[#9ca3af] border-[#1f2937] hover:border-[#22d3ee]/40 hover:text-[#e5e7eb]'
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
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#22d3ee] text-[#020617] border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'bg-transparent text-[#9ca3af] border-[#1f2937] hover:border-[#22d3ee]/40 hover:text-[#e5e7eb]'
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
