'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  text,
  maxLines = 3,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);

  // If text is short (under ~120 chars), don't show toggle button
  if (!text || text.length < 120) {
    return <p className={className}>{text}</p>;
  }

  const lineClampClass =
    maxLines === 2
      ? 'line-clamp-2'
      : maxLines === 4
      ? 'line-clamp-4'
      : 'line-clamp-3';

  return (
    <div className="space-y-1">
      <p className={`${className} ${expanded ? '' : lineClampClass}`}>
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:underline py-0.5 min-h-[28px]"
        aria-expanded={expanded}
      >
        <span>{expanded ? 'Show Less' : 'See More'}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
    </div>
  );
};
