'use client';

import { motion } from 'framer-motion';
import { ModelMetadata } from '@/lib/data/model-metadata';
import ModelCard from './model-card';

interface ModelGridProps {
  models: ModelMetadata[];
  isLoading?: boolean;
}

export default function ModelGrid({ models, isLoading = false }: ModelGridProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
      >
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-slate-200">No models found</h3>
          <p className="text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: index * 0.05 },
    }),
  };

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {models.map((model, index) => (
          <motion.div key={model.id} variants={itemVariants} custom={index} className="h-full">
            <ModelCard model={model} index={index} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
