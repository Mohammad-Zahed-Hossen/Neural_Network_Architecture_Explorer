'use client';

import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { ModelMetadata } from '@/lib/data/model-metadata';
import { formatShortNumber, formatAccuracy, formatMemory } from '@/lib/utils/formatters';

interface ComparisonChartProps {
  models: ModelMetadata[];
  activeMetric: 'parameters' | 'depth' | 'accuracy' | 'memory' | 'flops';
}

export default function ComparisonCharts({ models, activeMetric }: ComparisonChartProps) {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for SVGs rendered by Recharts
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[350px] bg-slate-900/10 rounded-2xl border border-border/30 flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading interactive charts...</span>
      </div>
    );
  }

  // 1. Prepare BarChart Data based on active metric
  const barChartData = models.map((model) => {
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

  // 2. Prepare RadarChart Data dynamically from the first 3 models
  const radarModels = models.slice(0, 3);
  const maxParamsRadar = Math.max(...models.map(m => m.totalParameters));
  const maxMemoryRadar = Math.max(...models.map(m => m.memoryUsage));
  const maxFLOPsRadar = Math.max(...models.map(m => m.totalFLOPs));
  const maxDepthRadar = Math.max(...models.map(m => m.depth));
  const maxAccuracyRadar = Math.max(...models.map(m => m.top1Accuracy));

  const radarChartData = [
    {
      subject: 'Accuracy (Top-1)',
      ...Object.fromEntries(radarModels.map(m => [m.name, Math.round((m.top1Accuracy / maxAccuracyRadar) * 100)])),
      fullMark: 100
    },
    {
      subject: 'Weight Compactness',
      ...Object.fromEntries(radarModels.map(m => [m.name, Math.round((1 - m.totalParameters / maxParamsRadar) * 100)])),
      fullMark: 100
    },
    {
      subject: 'VRAM Efficiency',
      ...Object.fromEntries(radarModels.map(m => [m.name, Math.round((1 - m.memoryUsage / maxMemoryRadar) * 100)])),
      fullMark: 100
    },
    {
      subject: 'Compute Efficiency',
      ...Object.fromEntries(radarModels.map(m => [m.name, Math.round((1 - m.totalFLOPs / maxFLOPsRadar) * 100)])),
      fullMark: 100
    },
    {
      subject: 'Structural Depth',
      ...Object.fromEntries(radarModels.map(m => [m.name, Math.round((1 - m.depth / maxDepthRadar) * 100)])),
      fullMark: 100
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* 1. Bar Chart Card */}
      <div className="bg-slate-950/20 border border-border/30 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between min-h-[400px]">
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

        <div className="w-full h-[280px] mt-6 select-none font-sans text-xs">
          <ResponsiveContainer width="99%" height={280}>
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
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
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

        <div className="w-full h-[285px] mt-6 select-none font-sans text-[10px] sm:text-xs">
          <ResponsiveContainer width="99%" height={285}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
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
              
              {radarModels.map((model, idx) => (
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
