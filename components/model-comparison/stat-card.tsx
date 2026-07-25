'use client';

import { Award, Zap, HardDrive } from 'lucide-react';
import { ModelSummary } from '@/lib/schema/model.schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatShortNumber, formatAccuracy } from '@/lib/utils/formatters';

interface StatCardProps {
  models: ModelSummary[];
}

export default function StatCards({ models }: StatCardProps) {
  // Compute key highlights dynamically
  const bestAcc = [...models].sort((a, b) => b.top1Accuracy - a.top1Accuracy)[0];
  const lowestParams = [...models].sort((a, b) => a.totalParameters - b.totalParameters)[0];
  const lowestMem = [...models].sort((a, b) => a.memoryUsage - b.memoryUsage)[0];

  const highlights = [
    {
      title: "Top Accuracy Winner",
      modelName: bestAcc.name,
      value: formatAccuracy(bestAcc.top1Accuracy),
      subtitle: (() => {
        const sorted = [...models].sort((a, b) => b.top1Accuracy - a.top1Accuracy);
        const second = sorted[1];
        return second ? `Followed by ${second.name} (${formatAccuracy(second.top1Accuracy)})` : 'Highest ImageNet validation score';
      })(),
      explanation: "Highest ImageNet validation classification score.",
      icon: Award,
      color: bestAcc.colorTheme,
      borderClass: 'border-emerald-500/20 bg-emerald-500/[0.01]',
      textClass: 'text-emerald-400',
      badge: 'success' as const
    },
    {
      title: "Parameter Efficiency Champion",
      modelName: lowestParams.name,
      value: formatShortNumber(lowestParams.totalParameters),
      subtitle: (() => {
        const sorted = [...models].sort((a, b) => b.totalParameters - a.totalParameters);
        const heaviest = sorted[0];
        if (!heaviest || heaviest.id === lowestParams.id) return 'Most parameter-efficient in comparison';
        const ratio = Math.round(heaviest.totalParameters / lowestParams.totalParameters);
        return `${ratio}x fewer parameters than ${heaviest.name}`;
      })(),
      explanation: "Maximum parameter reuse per layer stack.",
      icon: Zap,
      color: lowestParams.colorTheme,
      borderClass: 'border-violet-500/20 bg-violet-500/[0.01]',
      textClass: 'text-violet-400',
      badge: 'indigo' as const
    },
    {
      title: "Resource Footprint Winner",
      modelName: lowestMem.name,
      value: `${lowestMem.memoryUsage} MB`,
      subtitle: (() => {
        const sorted = [...models].sort((a, b) => b.memoryUsage - a.memoryUsage);
        const heaviest = sorted[0];
        if (!heaviest || heaviest.id === lowestMem.id) return 'Most memory-efficient in comparison';
        const ratio = Math.round(heaviest.memoryUsage / lowestMem.memoryUsage);
        return `${ratio}x less VRAM than ${heaviest.name}`;
      })(),
      explanation: "Extremely compact layout suitable for edge devices.",
      icon: HardDrive,
      color: lowestMem.colorTheme,
      borderClass: 'border-blue-500/20 bg-blue-500/[0.01]',
      textClass: 'text-blue-400',
      badge: 'primary' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {highlights.map((card, i) => {
        const Icon = card.icon;
        return (
          <div 
            key={i}
            className={cn(
              "p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[130px] glass-card shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
              card.borderClass
            )}
          >
            {/* Top Row: Icon & Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold font-sans">
                {card.title}
              </span>
              <Badge variant={card.badge} className="text-[9px] py-0 px-2 uppercase font-extrabold tracking-wider">
                {card.modelName}
              </Badge>
            </div>

            {/* Middle Row: Big Value */}
            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className={cn("text-2xl sm:text-3xl font-black tracking-tight", card.textClass)}>
                  {card.value}
                </span>
                <span className="text-[11px] text-slate-400 font-bold font-sans">
                  {card.modelName}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-semibold leading-relaxed">
                {card.subtitle}
              </p>
            </div>

            {/* Bottom Row: Explanation */}
            <div className="flex items-center gap-1.5 border-t border-border/10 pt-2 mt-1.5">
              <Icon className="h-3 w-3 text-slate-500" />
              <span className="text-[9px] text-slate-500 font-medium">
                {card.explanation}
              </span>
            </div>

            {/* Corner Decorative Colored Glow */}
            <div 
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full filter blur-[40px] pointer-events-none opacity-20"
              style={{ backgroundColor: card.color }}
            />
          </div>
        );
      })}
    </div>
  );
}
