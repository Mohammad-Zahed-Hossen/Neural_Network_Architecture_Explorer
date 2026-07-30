'use client';

import React from 'react';
import { CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface VerificationBadgeProps {
  tier: 'empirical_verified' | 'community_reproduced' | 'unverified';
}

export function VerificationBadge({ tier }: VerificationBadgeProps) {
  if (tier === 'empirical_verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Empirically Verified
      </span>
    );
  }

  if (tier === 'community_reproduced') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
        <ShieldCheck className="w-3.5 h-3.5" />
        Community Reproduced
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
      <HelpCircle className="w-3.5 h-3.5" />
      Unverified
    </span>
  );
}
