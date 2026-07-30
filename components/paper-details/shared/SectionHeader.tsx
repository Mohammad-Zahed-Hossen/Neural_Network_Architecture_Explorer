'use client';

import React, { useState } from 'react';
import { Hash, Check } from 'lucide-react';

interface SectionHeaderProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  id,
  title,
  subtitle,
  icon,
  className = '',
}: SectionHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id={id} className={`scroll-mt-24 mb-6 group w-full max-w-full overflow-hidden ${className}`}>
      <div className="flex items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3 min-w-0">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {icon && (
            <div className="text-cyan-400 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2 tracking-tight break-words text-wrap">
              <span className="break-words">{title}</span>
              <button
                onClick={handleCopyLink}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyan-400 p-1 rounded shrink-0 focus:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                title="Copy direct section link"
                aria-label={`Copy link to section ${title}`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Hash className="w-4 h-4" />}
              </button>
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 break-words leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
