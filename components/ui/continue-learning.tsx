'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Compass, Layers, GitCommit, Network, BarChart3, FileText } from 'lucide-react';
import { LearningItem } from '@/lib/data/relationships';

interface ContinueLearningProps {
  items: LearningItem[];
  title?: string;
  className?: string;
}

const typeIconMap = {
  model: Layers,
  pattern: GitCommit,
  concept: Compass,
  paper: FileText,
  evolution: Network,
  compare: BarChart3,
  learn: BookOpen,
};

const typeBadgeMap = {
  model: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  pattern: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  concept: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  paper: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  evolution: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  compare: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  learn: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

export default function ContinueLearning({
  items,
  title = 'Continue Learning',
  className = 'w-full mt-10 pt-8 border-t border-border/20',
}: ContinueLearningProps) {
  if (!items || items.length === 0) return null;

  // Cap recommendations at max 5 strictly as per requirement
  const displayItems = items.slice(0, 5);

  return (
    <section aria-label="Continue Learning" className={className}>
      <div className="flex items-center gap-2 mb-5">
        <Compass className="h-5 w-5 text-[#22d3ee]" />
        <h3 className="text-base font-extrabold text-[#e5e7eb] tracking-tight uppercase">
          {title}
        </h3>
        <span className="text-xs text-slate-500 font-semibold ml-auto">Up to 5 Next Steps</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {displayItems.map((item, idx) => {
          const IconComponent = typeIconMap[item.type] || Compass;
          const badgeClass = typeBadgeMap[item.type] || typeBadgeMap.concept;

          return (
            <Link
              key={idx}
              href={item.href}
              className="group relative flex flex-col justify-between p-4 rounded-xl border border-[#1f2937] bg-[#020617] hover:bg-[#091124] hover:border-[#22d3ee]/40 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    <IconComponent className="h-3 w-3" />
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">Step {idx + 1}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 group-hover:text-[#22d3ee] transition-colors line-clamp-2">
                  {item.title}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center text-[11px] font-bold text-[#22d3ee] mt-3 pt-2 border-t border-white/5">
                <span>Explore</span>
                <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
