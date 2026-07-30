'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Home, FileText } from 'lucide-react';

interface PaperBreadcrumbsProps {
  category: string;
  title: string;
}

export function PaperBreadcrumbs({ category, title }: PaperBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 sm:mb-6 w-full max-w-full overflow-hidden">
      {/* Desktop & Tablet Breadcrumbs */}
      <ol className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden max-w-full">
        <li className="shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400" />
            <span>Home</span>
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-600 shrink-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li className="shrink-0">
          <Link
            href="/papers"
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Papers</span>
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-600 shrink-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li className="text-slate-400 max-w-[160px] md:max-w-[220px] truncate shrink-0" title={category}>
          {category}
        </li>
        <li aria-hidden="true" className="text-slate-600 shrink-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li className="text-slate-100 font-bold truncate min-w-0" title={title} aria-current="page">
          {title}
        </li>
      </ol>

      {/* Mobile Back Button Bar (320px–640px) */}
      <div className="flex sm:hidden items-center justify-between gap-2 text-xs font-semibold text-slate-300 bg-slate-900/90 border border-slate-800/90 rounded-xl px-3 py-2 shadow-sm max-w-full min-w-0">
        <Link
          href="/papers"
          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Papers</span>
        </Link>
        <span className="text-slate-700 font-normal shrink-0">|</span>
        <span className="text-slate-400 text-[11px] truncate min-w-0 max-w-[150px]" title={title}>
          {title}
        </span>
      </div>
    </nav>
  );
}
