'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ExpandableCardProps {
  title: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function ExpandableCard({
  title,
  subtitle,
  badge,
  defaultExpanded = false,
  children,
  className = '',
  id,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      id={id}
      className={`bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md w-full max-w-full min-w-0 ${className}`}
    >
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group select-none min-w-0"
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-bold text-slate-100 text-sm sm:text-base md:text-lg leading-snug group-hover:text-cyan-300 transition-colors break-words">
              {title}
            </span>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed break-words">
              {subtitle}
            </p>
          )}
        </div>

        <div className="shrink-0 p-1.5 rounded-lg bg-slate-800/50 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-800 transition-colors">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden w-full max-w-full min-w-0"
          >
            <div className="p-4 sm:p-5 pt-3 border-t border-slate-800/80 text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4 w-full max-w-full min-w-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
