'use client';

import ModelAdvisor from '@/components/learn/model-advisor';
import { Award } from 'lucide-react';

export default function AdvisorPage() {
  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24">
      {/* Background radial glows */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/5 filter blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/3 w-[500px] h-[500px] rounded-full bg-purple-500/5 filter blur-[150px] pointer-events-none z-0" />

      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border/10 pb-6 mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Award className="h-8 w-8 text-primary" />
            Model Selection Advisor
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed mt-1">
            Answer a few quick questions about your deployment constraints, and our advisor rules engine will recommend the best fitting neural architectures.
          </p>
        </div>

        <ModelAdvisor />
      </section>
    </div>
  );
}
