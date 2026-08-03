'use client';

import React from 'react';

interface VisualizerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function VisualizerContainer({ children, className = '' }: VisualizerContainerProps) {
  return (
    <div
      className={`relative w-full rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-2xl overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
