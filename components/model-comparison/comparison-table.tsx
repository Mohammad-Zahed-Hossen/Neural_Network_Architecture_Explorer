'use client';

import Link from 'next/link';
import { 
  ExternalLink, ArrowRight, Trophy, Info, Cpu, Layers, Award, HardDrive, BarChart3, 
  Calendar, Users, Hash, Tag, Lightbulb, ChevronRight, Gauge, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ModelMetadata } from '@/lib/data/model-metadata';
import { formatShortNumber, formatAccuracy, formatMemory } from '@/lib/utils/formatters';
import { modelCategories } from '@/lib/data/model-categories';
import { cn } from '@/lib/utils/cn';
import * as React from 'react';

interface ComparisonTableProps {
  models: ModelMetadata[];
}

// Architecture paradigm mapping from category (dynamic, not hardcoded to specific IDs)
function getArchitecturalParadigm(category: string, tags: string[]): string {
  const paradigms: Record<string, string> = {
    'VGG': 'Sequential (feedforward layer stacks)',
    'ResNet': 'Residual Connections (identity mapping bypass)',
    'DenseNet': 'Dense Connectivity (every-layer-to-every-other)',
    'Inception': 'Multi-branch Parallel Convolutions',
    'Xception': 'Depthwise Separable Convolutions',
    'MobileNet': 'Mobile-first Inverted Bottlenecks & Depthwise',
    'EfficientNet': 'Compound Scaling (width, depth, resolution)',
    'NASNet': 'Neural Architecture Search (NAS) discovered',
  };
  
  if (tags.includes('Residual') || tags.includes('Residual-Connections')) {
    return paradigms['ResNet'];
  }
  if (tags.includes('Dense') || tags.includes('Dense-Connections')) {
    return paradigms['DenseNet'];
  }
  return paradigms[category] || `${category} Architecture`;
}

function getBlockPrimitive(category: string, tags: string[]): string {
  const primitives: Record<string, string> = {
    'VGG': '3×3 Convolution stacks followed by 2×2 Max Pooling',
    'ResNet': 'Bottleneck blocks (1×1 conv → 3×3 conv → 1×1 expansion)',
    'DenseNet': 'Dense Block (growth rates) + Transition layers',
    'Inception': 'Inception modules (1×1, 3×3, 5×5 parallel)',
    'Xception': 'Depthwise Separable Convolution (channel-first, spatial-second)',
    'MobileNet': 'Inverted Residual + Depthwise Separable Convolution',
    'EfficientNet': 'Mobile Inverted Bottleneck + Squeeze-and-Excitation',
    'NASNet': 'NAS-discovered Normal & Reduction cells',
  };
  
  if (tags.includes('Mobile') || tags.includes('Lightweight')) {
    return primitives['MobileNet'];
  }
  if (tags.includes('Residual')) {
    return primitives['ResNet'];
  }
  return primitives[category] || 'Custom Block Primitive';
}

function getBreakthrough(category: string, tags: string[]): string {
  const breakthroughs: Record<string, string> = {
    'VGG': 'Homogeneous 3×3 kernels demonstrate that depth matters more than width.',
    'ResNet': 'Skip connections let identity gradients flow, solving the vanishing gradient degradation.',
    'DenseNet': 'Direct feature concatenation between all layers maximizes feature reuse and efficiency.',
    'Inception': 'Multi-scale receptive fields in parallel let the network decide which features to extract.',
    'Xception': 'Depthwise separable convolutions factorize spatial and channel operations for maximum efficiency.',
    'MobileNet': 'Depthwise separable convolutions separate spatial vs channel convolving, saving ~90% compute.',
    'EfficientNet': 'Compound scaling uniformly scales width, depth, and resolution for optimal accuracy-per-FLOP.',
    'NASNet': 'Neural Architecture Search automates the discovery of optimal cell structures for transfer learning.',
  };
  return breakthroughs[category] || 'Efficient feature aggregation and representation learning.';
}

// Metric row definition
type MetricDirection = 'higher' | 'lower' | 'neutral';

interface MetricDef {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getValue: (m: ModelMetadata) => string | number;
  getRawValue: (m: ModelMetadata) => number;
  direction: MetricDirection;
  format?: (v: number) => string;
  colorScale?: (v: number, models: ModelMetadata[]) => string;
}

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  colSpan: number;
  children?: React.ReactNode;
}

const SectionHeader = ({ icon: Icon, label, colSpan, children }: SectionHeaderProps) => (
  <tr className="bg-slate-900/40 border-y border-border/10">
    <td colSpan={colSpan} className="px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800/60 border border-border/20">
            <Icon className="h-3 w-3 text-slate-400" />
          </div>
          <h3 className="text-[11px] font-extrabold text-slate-300 uppercase tracking-widest">{label}</h3>
        </div>
        {children}
      </div>
    </td>
  </tr>
);

export default function ComparisonTable({ models }: ComparisonTableProps) {
  // Compute metric definitions
  const maxParams = Math.max(...models.map(m => m.totalParameters));
  const maxFLOPs = Math.max(...models.map(m => m.totalFLOPs));
  const maxMemory = Math.max(...models.map(m => m.memoryUsage));
  const maxDepth = Math.max(...models.map(m => m.depth));
  const maxTop1 = Math.max(...models.map(m => m.top1Accuracy));
  const maxTop5 = Math.max(...models.map(m => m.top5Accuracy));

  const metrics: MetricDef[] = [
    {
      key: 'top1',
      label: 'Top-1 ImageNet Accuracy',
      icon: Award,
      getValue: (m) => formatAccuracy(m.top1Accuracy),
      getRawValue: (m) => m.top1Accuracy,
      direction: 'higher',
      format: (v) => formatAccuracy(v),
      colorScale: (v, ms) => {
        const max = Math.max(...ms.map(m => m.top1Accuracy));
        return v === max ? 'text-emerald-400' : 'text-slate-200';
      }
    },
    {
      key: 'top5',
      label: 'Top-5 ImageNet Accuracy',
      icon: Award,
      getValue: (m) => formatAccuracy(m.top5Accuracy),
      getRawValue: (m) => m.top5Accuracy,
      direction: 'higher',
      format: (v) => formatAccuracy(v),
      colorScale: (v, ms) => {
        const max = Math.max(...ms.map(m => m.top5Accuracy));
        return v === max ? 'text-emerald-400' : 'text-slate-200';
      }
    },
    {
      key: 'params',
      label: 'Total Parameters',
      icon: Hash,
      getValue: (m) => formatShortNumber(m.totalParameters),
      getRawValue: (m) => m.totalParameters,
      direction: 'lower',
      format: (v) => formatShortNumber(v),
      colorScale: (v, ms) => {
        const min = Math.min(...ms.map(m => m.totalParameters));
        return v === min ? 'text-emerald-400' : 'text-slate-200';
      }
    },
    {
      key: 'memory',
      label: 'GPU Memory Footprint',
      icon: HardDrive,
      getValue: (m) => formatMemory(m.memoryUsage),
      getRawValue: (m) => m.memoryUsage,
      direction: 'lower',
      format: (v) => formatMemory(v),
      colorScale: (v, ms) => {
        const min = Math.min(...ms.map(m => m.memoryUsage));
        return v === min ? 'text-emerald-400' : 'text-slate-200';
      }
    },
    {
      key: 'flops',
      label: 'Computation Cost (FLOPs)',
      icon: Zap,
      getValue: (m) => formatShortNumber(m.totalFLOPs) + ' FLOPs',
      getRawValue: (m) => m.totalFLOPs,
      direction: 'lower',
      format: (v) => formatShortNumber(v) + ' FLOPs',
      colorScale: (v, ms) => {
        const min = Math.min(...ms.map(m => m.totalFLOPs));
        return v === min ? 'text-emerald-400' : 'text-slate-200';
      }
    },
    {
      key: 'depth',
      label: 'Network Layer Depth',
      icon: Layers,
      getValue: (m) => m.depth,
      getRawValue: (m) => m.depth,
      direction: 'neutral',
      format: (v) => `${v} layers`,
      colorScale: (v, ms) => {
        const min = Math.min(...ms.map(m => m.depth));
        const max = Math.max(...ms.map(m => m.depth));
        if (v === min) return 'text-blue-400';
        if (v === max) return 'text-amber-400';
        return 'text-slate-200';
      }
    },
  ];

  // Determine winners for each metric
  const winners = new Map<string, string>();
  metrics.forEach(metric => {
    if (metric.direction === 'higher') {
      const best = [...models].sort((a, b) => metric.getRawValue(b) - metric.getRawValue(a))[0];
      if (best) winners.set(metric.key, best.id);
    } else if (metric.direction === 'lower') {
      const best = [...models].sort((a, b) => metric.getRawValue(a) - metric.getRawValue(b))[0];
      if (best) winners.set(metric.key, best.id);
    }
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const winnerId = winners.get(metric.key);
          const winner = models.find(m => m.id === winnerId);
          const Icon = metric.icon;
          
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-slate-950/30 border border-border/30 rounded-2xl overflow-hidden backdrop-blur-md hover:border-border/50 transition-colors"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/10 bg-slate-900/20">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
                </div>
                {winner && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <Trophy className="h-3 w-3" />
                    <span>{winner.name}</span>
                  </div>
                )}
              </div>
              
              {/* Card Body - Model Values */}
              <div className="px-5 py-3 space-y-2.5">
                {models.map((model) => {
                  const rawValue = metric.getRawValue(model);
                  const isWinner = model.id === winnerId;
                  const maxVal = Math.max(...models.map(m => metric.getRawValue(m)));
                  const minVal = Math.min(...models.map(m => metric.getRawValue(m)));
                  const range = maxVal - minVal || 1;
                  
                  // Bar percentage: for higher=better, max=100%; for lower=better, min=100%
                  let barPct = 0;
                  if (metric.direction === 'higher') {
                    barPct = ((rawValue - minVal) / range) * 100;
                  } else if (metric.direction === 'lower') {
                    barPct = ((maxVal - rawValue) / range) * 100;
                  } else {
                    barPct = 50; // neutral
                  }
                  
                  const color = metric.colorScale?.(rawValue, models) || 'text-slate-200';
                  const barColor = isWinner ? 'bg-emerald-500' : 'bg-slate-600';
                  
                  return (
                    <div key={model.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: model.colorTheme }} />
                          <span className="text-[11px] font-bold text-slate-300">{model.name}</span>
                          {isWinner && (
                            <Trophy className="h-3 w-3 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <span className={cn("text-xs font-extrabold", color)}>
                          {metric.getValue(model)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", barColor)}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.max(barPct, 5)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-slate-950/20 border border-border/30 rounded-2xl overflow-hidden backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Sticky Header */}
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border/20 bg-slate-950/80 backdrop-blur-md">
                <th className="p-4 sm:p-5 font-extrabold text-slate-500 uppercase tracking-wider w-[24%] text-[10px]">
                  Metrics / Features
                </th>
                {models.map((model) => {
                  const category = modelCategories[model.category];
                  return (
                    <th key={model.id} className="p-4 sm:p-5 min-w-[160px]">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-block w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: model.colorTheme }} 
                          />
                          <span className="font-extrabold text-white text-sm tracking-tight">
                            {model.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border", category?.borderColor || 'border-slate-500/20')}
                            style={{ 
                              backgroundColor: category?.bgColor.replace('bg-', 'rgba(').replace('/10', ',0.1)') || undefined
                            }}
                          >
                            <span className={category?.textColor || 'text-slate-400'}>
                              {model.category}
                            </span>
                          </span>
                          <span className="text-[9px] text-slate-600 font-semibold">
                            {model.tags[1] === 'ImageNet' ? model.tags[2] : model.tags[1]}
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/10 font-sans">
              {/* General Info Section */}
              <SectionHeader icon={Info} label="General Information" colSpan={1 + models.length} />
              
              <tr className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Publication Year
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 font-semibold text-slate-200 text-[11px]">
                    {model.paperYear}
                    {model.releaseYear && model.releaseYear !== model.paperYear && (
                      <span className="text-slate-500 ml-1">({model.releaseYear})</span>
                    )}
                  </td>
                ))}
              </tr>
              
              <tr className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  Authors
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 font-semibold text-slate-200 text-[11px] leading-relaxed">
                    {model.authors.slice(0, 2).join(', ')}{model.authors.length > 2 ? ' et al.' : ''}
                  </td>
                ))}
              </tr>
              
              <tr className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-slate-500" />
                  Tags
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {model.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[9px] font-semibold text-slate-400 bg-slate-800/40 border border-border/20 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  Research Paper
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4">
                    <a 
                      href={model.paperUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-blue-300 transition-colors"
                    >
                      arXiv
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                ))}
              </tr>

              {/* Performance Metrics Section */}
              <SectionHeader icon={BarChart3} label="Performance Metrics" colSpan={1 + models.length} />
              
              {metrics.slice(0, 2).map((metric) => {
                const winnerId = winners.get(metric.key);
                const Icon = metric.icon;
                return (
                  <tr key={metric.key} className="hover:bg-slate-900/10 transition-colors group/row">
                    <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-slate-500" />
                      {metric.label}
                      {metric.direction === 'higher' && (
                        <span className="text-[9px] text-emerald-500/60 font-semibold ml-1">↑ higher is better</span>
                      )}
                    </td>
                    {models.map((model) => {
                      const isWinner = model.id === winnerId;
                      const raw = metric.getRawValue(model);
                      const max = Math.max(...models.map(m => metric.getRawValue(m)));
                      const min = Math.min(...models.map(m => metric.getRawValue(m)));
                      const range = max - min || 1;
                      const pct = ((raw - min) / range) * 100;
                      
                      return (
                        <td 
                          key={model.id} 
                          className={cn(
                            "p-4 border-x border-transparent transition-colors",
                            isWinner && "bg-emerald-500/[0.04] border-x border-emerald-500/10"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-extrabold",
                              isWinner ? 'text-emerald-400' : 'text-slate-200'
                            )}>
                              {metric.getValue(model)}
                            </span>
                            {isWinner && (
                              <Trophy className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <div className="mt-1.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isWinner ? 'bg-emerald-500' : 'bg-slate-600'
                              )}
                              style={{ width: `${Math.max(pct, 5)}%` }}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Efficiency Metrics Section */}
              <SectionHeader icon={Gauge} label="Efficiency & Resource Overhead" colSpan={1 + models.length} />
              
              {metrics.slice(2).map((metric) => {
                const winnerId = winners.get(metric.key);
                const Icon = metric.icon;
                return (
                  <tr key={metric.key} className="hover:bg-slate-900/10 transition-colors group/row">
                    <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-slate-500" />
                      {metric.label}
                      {metric.direction === 'lower' && (
                        <span className="text-[9px] text-amber-500/60 font-semibold ml-1">↓ lower is better</span>
                      )}
                    </td>
                    {models.map((model) => {
                      const isWinner = model.id === winnerId;
                      const raw = metric.getRawValue(model);
                      const max = Math.max(...models.map(m => metric.getRawValue(m)));
                      const min = Math.min(...models.map(m => metric.getRawValue(m)));
                      const range = max - min || 1;
                      // For lower=better, invert the bar
                      const barPct = metric.direction === 'lower' 
                        ? ((max - raw) / range) * 100 
                        : ((raw - min) / range) * 100;
                      
                      return (
                        <td 
                          key={model.id} 
                          className={cn(
                            "p-4 border-x border-transparent transition-colors",
                            isWinner && "bg-emerald-500/[0.04] border-x border-emerald-500/10"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-extrabold",
                              isWinner ? 'text-emerald-400' : 'text-slate-200'
                            )}>
                              {metric.getValue(model)}
                            </span>
                            {isWinner && (
                              <Trophy className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <div className="mt-1.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isWinner ? 'bg-emerald-500' : 'bg-slate-600'
                              )}
                              style={{ width: `${Math.max(barPct, 5)}%` }}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Architecture Design Section */}
              <SectionHeader icon={Lightbulb} label="Architecture Design Characteristics" colSpan={1 + models.length} />
              
              <tr className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-slate-500" />
                  Architectural Paradigm
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 font-semibold text-slate-200 text-[11px] leading-relaxed">
                    {getArchitecturalParadigm(model.category, model.tags)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                  Primary Block Primitive
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 font-semibold text-slate-200 text-[11px] leading-relaxed">
                    {getBlockPrimitive(model.category, model.tags)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-slate-500" />
                  Key Breakthrough
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 font-semibold text-slate-200 text-[11px] leading-relaxed italic">
                    {getBreakthrough(model.category, model.tags)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 pl-5 font-bold text-slate-400 text-[11px] flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-slate-500" />
                  Description
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 font-medium text-slate-300 text-[11px] leading-relaxed">
                    {model.description}
                  </td>
                ))}
              </tr>

              {/* Quick Actions Row */}
              <tr className="bg-slate-950/40 divide-y divide-border/5">
                <td className="p-4 pl-5 font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5" />
                  Topology Explorer
                </td>
                {models.map((model) => (
                  <td key={model.id} className="p-4">
                    <Link
                      href={`/models/${model.id}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors group px-3 py-1.5 rounded-lg border border-border/20 hover:border-border/40 bg-slate-900/30 hover:bg-slate-900/50"
                      style={{ color: model.colorTheme }}
                    >
                      Explore {model.name}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
