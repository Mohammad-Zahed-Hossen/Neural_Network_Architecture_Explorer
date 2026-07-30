'use client';

import React from 'react';
import { InnovationType } from '@/types/paper-schema';
import { Box, Layers, Binary, Sigma, Cpu } from 'lucide-react';

interface InnovationTypeBadgeProps {
  type: InnovationType;
  className?: string;
}

const TYPE_CONFIG: Record<InnovationType, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  component: {
    label: 'Component',
    icon: <Box className="w-3.5 h-3.5" />,
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  architecture: {
    label: 'Architecture',
    icon: <Layers className="w-3.5 h-3.5" />,
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  mathematics: {
    label: 'Mathematics',
    icon: <Sigma className="w-3.5 h-3.5" />,
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  loss: {
    label: 'Loss Function',
    icon: <Binary className="w-3.5 h-3.5" />,
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  optimization: {
    label: 'Optimization',
    icon: <Cpu className="w-3.5 h-3.5" />,
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
};

export function InnovationTypeBadge({ type, className = '' }: InnovationTypeBadgeProps) {
  const config = TYPE_CONFIG[type] || {
    label: type,
    icon: <Box className="w-3.5 h-3.5" />,
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass} ${className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
