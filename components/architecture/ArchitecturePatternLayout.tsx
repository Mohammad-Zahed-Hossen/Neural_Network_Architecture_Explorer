import React from 'react';
import type { ArchitecturePatternLayoutProps } from './types';

export default function ArchitecturePatternLayout({ children }: ArchitecturePatternLayoutProps) {
  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24 overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-[#22d3ee] z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-purple-500 z-0" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9 w-full flex-1 flex flex-col gap-4 sm:gap-6">
        {children}
      </section>
    </div>
  );
}
