'use client';

import React from 'react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No visualizer plugin available for the current engine state.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-3">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-zinc-400 max-w-sm">{message}</p>
    </div>
  );
}
