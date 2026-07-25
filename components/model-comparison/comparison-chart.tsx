'use client';

import { useSyncExternalStore, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { ModelSummary } from '@/lib/schema/model.schema';
import { formatShortNumber, formatAccuracy, formatMemory } from '@/lib/utils/formatters';

interface ComparisonChartProps {
  models: ModelSummary[];
  activeMetric: 'parameters' | 'depth' | 'accuracy' | 'memory' | 'flops';
}

export default function ComparisonCharts({ models, activeMetric }: ComparisonChartProps) {
  // Avoid hydration mismatch for SVGs rendered by Recharts
  // Using useSyncExternalStore pattern (React 19 recommended) for external system sync
  const isMobile = useSyncExternalStore(
    (callback) => {
      const handleResize = () => callback();
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    },
    () => window.innerWidth < 640,
    () => false
  );

  // 1. Prepare BarChart Data based on active metric - memoized to avoid recomputation on resize
  const barChartData = useMemo(() => {
    return models.map((model) => {
      let value = 0;
      let formattedValue = '';

      if (activeMetric === 'parameters') {
        value = model.totalParameters;
        formattedValue = formatShortNumber(model.totalParameters);
      } else if (activeMetric === 'depth') {
        value = model.depth;
        formattedValue = `${model.depth} Layers`;
      } else if (activeMetric === 'accuracy') {
        value = model.top1Accuracy * 100; // in percentage
        formattedValue = formatAccuracy(model.top1Accuracy);
      } else if (activeMetric === 'memory') {
        value = model.memoryUsage;
        formattedValue = formatMemory(model.memoryUsage);
      } else if (activeMetric === 'flops') {
        value = model.totalFLOPs;
        formattedValue = formatShortNumber(model.totalFLOPs) + ' FLOPs';
      }

      return {
        name: model.name,
        value,
        formattedValue,
        color: model.colorTheme,
      };
    });
  }, [models, activeMetric]);

  // Helper formatter for YAxis labels
  const formatYAxis = (val: number) => {
    if (activeMetric === 'parameters' || activeMetric === 'flops') {
      return formatShortNumber(val);
    }
    if (activeMetric === 'accuracy') {
      return `${val}%`;
    }
    if (activeMetric === 'memory') {
      return `${val}MB`;
    }
    return val.toString();
  };

  // Helper for logarithmic min-max normalization: S = 100 * (1 - (ln(v) - ln(min)) / (ln(max) - ln(min)))
  // Logarithmic scaling is mathematically required because FLOPs and Parameter counts span over 5 orders of magnitude (340K to 83B FLOPs).
  // Linear scaling compresses all medium/small models to ~90-99% efficiency.
  const calcLogScore = (val: number, minVal: number, maxVal: number) => {
    if (maxVal <= minVal || val <= 0) return 100;
    const logVal = Math.log(val);
    const logMin = Math.log(Math.max(1, minVal));
    const logMax = Math.log(maxVal);
    if (logMax <= logMin) return 100;
    const norm = (logVal - logMin) / (logMax - logMin);
    return Math.max(0, Math.min(100, Math.round((1 - norm) * 100)));
  };

  // 2. Prepare RadarChart Data dynamically from all active compared models (up to 4)
  const radarChartData = useMemo(() => {
    const radarModels = models.slice(0, 4);
    const minParams = Math.min(...models.map(m => m.totalParameters));
    const maxParams = Math.max(...models.map(m => m.totalParameters));
    const minMemory = Math.min(...models.map(m => m.memoryUsage));
    const maxMemory = Math.max(...models.map(m => m.memoryUsage));
    const minFLOPs = Math.min(...models.map(m => m.totalFLOPs));
    const maxFLOPs = Math.max(...models.map(m => m.totalFLOPs));
    const minDepth = Math.min(...models.map(m => m.depth));
    const maxDepth = Math.max(...models.map(m => m.depth));
    const maxAccuracy = Math.max(...models.map(m => m.top1Accuracy));

    return [
      {
        subject: 'Accuracy (Top-1)',
        ...Object.fromEntries(radarModels.map(m => [m.name, Math.round((m.top1Accuracy / (maxAccuracy || 1)) * 100)])),
        fullMark: 100
      },
      {
        subject: 'Weight Compactness',
        ...Object.fromEntries(radarModels.map(m => [m.name, calcLogScore(m.totalParameters, minParams, maxParams)])),
        fullMark: 100
      },
      {
        subject: 'VRAM Efficiency',
        ...Object.fromEntries(radarModels.map(m => [m.name, calcLogScore(m.memoryUsage, minMemory, maxMemory)])),
        fullMark: 100
      },
      {
        subject: 'Compute Efficiency',
        ...Object.fromEntries(radarModels.map(m => [m.name, calcLogScore(m.totalFLOPs, minFLOPs, maxFLOPs)])),
        fullMark: 100
      },
      {
        subject: 'Structural Depth',
        ...Object.fromEntries(radarModels.map(m => [m.name, calcLogScore(m.depth, minDepth, maxDepth)])),
        fullMark: 100
      }
    ];
  }, [models]);

  const chartHeight = isMobile ? 240 : 280;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
      {/* 1. Bar Chart Card */}
      <div className="bg-slate-950/20 border border-border/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between min-h-[340px]">
        <div>
          <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">
            {activeMetric === 'parameters' ? 'Parameter Counts' :
             activeMetric === 'depth' ? 'Network Layer Depth' :
             activeMetric === 'accuracy' ? 'ImageNet Top-1 Accuracy' :
             activeMetric === 'memory' ? 'Memory/VRAM Footprint' : 'Computation Overhead (FLOPs)'}
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Raw quantitative comparison. Lower is better for parameters, memory, and FLOPs.
          </p>
        </div>

        <div className="w-full h-[240px] mt-4 select-none font-sans text-xs">
          <ResponsiveContainer width="99%" height={chartHeight}>
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                fontWeight={700}
                tickLine={false} 
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                fontWeight={700}
                tickLine={false} 
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} 
                tickFormatter={formatYAxis}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-card rounded-xl p-3 border border-border/40 shadow-xl bg-slate-950/90 text-xs flex flex-col gap-1">
                        <span className="font-extrabold text-white tracking-tight uppercase">{data.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                          <span className="font-bold text-slate-350">{data.formattedValue}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barChartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Radar Chart Card */}
      <div className="bg-slate-950/20 border border-border/30 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between min-h-[400px]">
        <div>
          <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">
            Model Trade-offs & Efficiency Index
          </h3>
           <p className="text-[11px] text-slate-500 font-semibold mt-1">
             Normalized scale (0-100). Higher scores mean &quot;better/more efficient&quot; in that metric.
           </p>
        </div>

        <div className="w-full h-[240px] mt-4 select-none font-sans text-[10px] sm:text-xs">
          <ResponsiveContainer width="99%" height={chartHeight}>
            <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "48%" : "72%"} data={radarChartData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis 
                dataKey="subject" 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight={700}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                stroke="#64748b" 
                fontSize={9}
                tick={false}
                axisLine={false}
              />
              
              {models.slice(0, 4).map((model) => (
                <Radar 
                  key={model.id}
                  name={model.name} 
                  dataKey={model.name} 
                  stroke={model.colorTheme} 
                  fill={model.colorTheme} 
                  fillOpacity={0.06} 
                />
              ))}
              
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: '9px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  paddingTop: '10px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}