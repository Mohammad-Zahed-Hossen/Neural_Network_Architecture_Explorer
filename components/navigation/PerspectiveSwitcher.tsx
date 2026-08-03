'use client';

import React from 'react';
import Link from 'next/link';
import { PerspectiveLink } from '@/lib/knowledge/navigation/navigation-service';
import { Compass } from 'lucide-react';

interface PerspectiveSwitcherProps {
  perspectiveLinks: readonly PerspectiveLink[];
  activePerspectiveId?: string;
  className?: string;
}

export function PerspectiveSwitcher({
  perspectiveLinks,
  activePerspectiveId,
  className = '',
}: PerspectiveSwitcherProps) {
  if (!perspectiveLinks || perspectiveLinks.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1 uppercase tracking-wider mr-2">
        <Compass className="w-3.5 h-3.5 text-emerald-400" />
        Perspectives:
      </span>
      {perspectiveLinks.map((link) => {
        const isActive = activePerspectiveId === link.perspectiveId;
        return (
          <Link
            key={link.perspectiveId}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            {link.title}
          </Link>
        );
      })}
    </div>
  );
}
