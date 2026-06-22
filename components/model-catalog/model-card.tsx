'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Cpu, ArrowRight, Layers, Zap, Tag } from 'lucide-react';
import { ModelMetadata } from '@/lib/data/model-metadata';
import { modelsMetadata } from '@/lib/data/model-metadata';
import { formatShortNumber, formatAccuracy, formatMemory } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { modelCategories } from '@/lib/data/model-categories';
import {
  getModelThemeColor,
  getModelGlowColor,
  getModelIconBgColor,
} from '@/lib/utils/colors';

interface ModelCardProps {
  model: ModelMetadata;
  index: number;
}

const efficiencyMap = {
  lightweight: { label: 'Lightweight', icon: Zap, color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
  balanced: { label: 'Balanced', icon: Layers, color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  powerful: { label: 'Powerful', icon: Cpu, color: 'bg-red-500/10 text-red-300 border-red-500/20' },
};

// Compute max values across all models for relative bar scaling
const maxParams = Math.max(...modelsMetadata.map(m => m.totalParameters));
const maxDepth = Math.max(...modelsMetadata.map(m => m.depth));
const maxAccuracy = Math.max(...modelsMetadata.map(m => m.top1Accuracy));
const maxMemory = Math.max(...modelsMetadata.map(m => m.memoryUsage));


export default function ModelCard({ model, index }: ModelCardProps) {
  const theme = getModelThemeColor(model);
  const category = modelCategories[model.category];
  const efficiency = efficiencyMap[model.efficiency];
  const glowColor = getModelGlowColor(model);
  const iconBg = getModelIconBgColor(model);

  // Calculate relative bar widths (0-100%)
  const paramPct = Math.round((model.totalParameters / maxParams) * 100);
  const accPct = Math.round((model.top1Accuracy / maxAccuracy) * 100);
  const memPct = Math.round((model.memoryUsage / maxMemory) * 100);
  const depthPct = Math.round((model.depth / maxDepth) * 100);

  // Dynamically order tags as: CNN -> Classification -> Category-specific -> ImageNet
  const orderedTags = useMemo(() => {
    const base = ['CNN', 'Classification'];
    const hasImageNet = model.tags.includes('ImageNet');
    const familyTag = model.tags.find(t => !['CNN', 'Classification', 'ImageNet'].includes(t));
    const res = [...base];
    if (familyTag) res.push(familyTag);
    if (hasImageNet) res.push('ImageNet');
    // Fill up to 4 tags
    model.tags.forEach(t => {
      if (!res.includes(t) && res.length < 4) res.push(t);
    });
    return res;
  }, [model.tags]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] as const }}
      className={`group relative flex flex-col h-full rounded-2xl glass-card overflow-hidden`}
    >
      {/* Colored Top Accent Bar */}
      <div 
        className="h-1 w-full transition-all duration-500 group-hover:h-1.5"
        style={{ backgroundColor: model.colorTheme }}
      />

      {/* Dynamic Background Glow Overlay */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor}`} />

      {/* Header Container */}
      <div className="p-6 pb-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center justify-between mb-3 text-[10px] font-extrabold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className={category?.textColor || 'text-slate-400'}>{model.category}</span>
              <span className="text-slate-700 font-bold font-sans">•</span>
              <span className="text-slate-350">{efficiency.label}</span>
              <span className="text-slate-700 font-bold font-sans">•</span>
              <span className="text-slate-400">{model.releaseYear || model.paperYear}</span>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-start gap-3.5 mb-3.5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBg} transition-transform group-hover:scale-105 duration-300`}>
              <Cpu className={`h-5.5 w-5.5 ${theme}`} />
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight text-[#e5e7eb] group-hover:${theme} transition-colors line-clamp-1`}>
                {model.name}
              </h3>
              <p className="text-[10px] text-slate-500 line-clamp-1 font-bold" title={model.authors.join(', ')}>
                {model.authors[0]} et al.
              </p>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs text-[#9ca3af] leading-relaxed min-h-[55px] line-clamp-3">
            {model.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-4">
          {orderedTags.map(tag => (
            <span 
              key={tag} 
              className="text-[9px] font-extrabold text-[#9ca3af] bg-[#020617]/50 border border-white/5 px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wide"
            >
              <Tag className="h-2.5 w-2.5 text-[#6b7280]" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Section in a 2x2 Grid */}
      <div className="px-6 py-4 border-t border-white/5 bg-slate-950/40 grid grid-cols-2 gap-3.5 shrink-0">
        {/* PARAMS */}
        <div className="bg-slate-900/5 border border-white/[0.03] rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[8px] text-[#6b7280] font-extrabold uppercase tracking-wider block">Params</span>
          <span className="text-xs font-black text-slate-200 mt-1">{formatShortNumber(model.totalParameters)}</span>
          <div className="h-1 w-full bg-slate-900/50 rounded-full overflow-hidden mt-1.5">
            <div className="h-full rounded-full" style={{ backgroundColor: model.colorTheme, width: `${paramPct}%` }} />
          </div>
        </div>

        {/* TOP-1 ACCURACY */}
        <div className="bg-slate-900/5 border border-white/[0.03] rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[8px] text-[#6b7280] font-extrabold uppercase tracking-wider block">Accuracy</span>
          <span className="text-xs font-black text-emerald-400 mt-1">{formatAccuracy(model.top1Accuracy)}</span>
          <div className="h-1 w-full bg-slate-900/50 rounded-full overflow-hidden mt-1.5">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${accPct}%` }} />
          </div>
        </div>

        {/* MEMORY */}
        <div className="bg-slate-900/5 border border-white/[0.03] rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[8px] text-[#6b7280] font-extrabold uppercase tracking-wider block">Memory</span>
          <span className="text-xs font-black text-amber-400 mt-1">{formatMemory(model.memoryUsage)}</span>
          <div className="h-1 w-full bg-slate-900/50 rounded-full overflow-hidden mt-1.5">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${memPct}%` }} />
          </div>
        </div>

        {/* DEPTH */}
        <div className="bg-slate-900/5 border border-white/[0.03] rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[8px] text-[#6b7280] font-extrabold uppercase tracking-wider block">Depth</span>
          <span className="text-xs font-black text-slate-200 mt-1">{model.depth} layers</span>
          <div className="h-1 w-full bg-slate-900/50 rounded-full overflow-hidden mt-1.5">
            <div className="h-full rounded-full bg-slate-500" style={{ width: `${depthPct}%` }} />
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-auto p-6 pt-4 border-t border-white/5 flex items-center justify-between shrink-0 bg-slate-950/20">
        <Link
          href="/compare"
          className="text-xs font-extrabold text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer bg-transparent hover:bg-slate-900/40 px-3 py-1.5 rounded-lg uppercase tracking-wider"
        >
          Compare
        </Link>
        <Link
          href={`/models/${model.id}`}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl bg-[#22d3ee] text-[#020617] hover:bg-[#06b6d4] transition-all duration-300 shadow-md shadow-cyan-500/10 cursor-pointer uppercase tracking-wider"
        >
          <span>Explore</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
