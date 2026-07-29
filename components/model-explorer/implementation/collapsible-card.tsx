'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  summaryBadge?: React.ReactNode;
  children: React.ReactNode;
  defaultExpandedDesktop?: boolean;
  defaultExpandedMobile?: boolean;
  headerRight?: React.ReactNode;
  className?: string;
}

export function CollapsibleCard({
  title,
  icon,
  summaryBadge,
  children,
  defaultExpandedDesktop = true,
  defaultExpandedMobile = false,
  headerRight,
  className = '',
}: CollapsibleCardProps) {
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotionPreference();
  
  const [isOpen, setIsOpen] = useState(defaultExpandedDesktop);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsOpen(isMobile ? defaultExpandedMobile : defaultExpandedDesktop);
    });
    return () => cancelAnimationFrame(handle);
  }, [isMobile, defaultExpandedMobile, defaultExpandedDesktop]);

  return (
    <div className={`bg-[#020617] border border-[#1f2937] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden transition-colors ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full min-h-[44px] px-3.5 sm:px-5 py-3 flex items-center justify-between gap-2 border-b border-transparent hover:bg-slate-900/40 transition-colors text-left cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {icon}
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 truncate">
            {title}
          </h3>
          {!isOpen && summaryBadge && (
            <div className="inline-flex items-center">
              {summaryBadge}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {headerRight}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}
            />
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="border-t border-slate-800/60 p-3.5 sm:p-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
