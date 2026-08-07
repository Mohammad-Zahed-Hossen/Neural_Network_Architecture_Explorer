'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import type { ComparisonResult } from '@/lib/comparison/types';
import { metricRegistry } from '@/lib/comparison/metric-registry';
import { BarChart2, PieChart, Activity, Sliders } from 'lucide-react';

interface ComparisonVisualizerProps {
  result: ComparisonResult;
}

type ActiveMetricType = 'parameters' | 'flops' | 'accuracy' | 'depth' | 'memory';

const METRIC_TABS: { id: ActiveMetricType; label: string; desc: string }[] = [
  { id: 'parameters', label: 'Parameters', desc: 'Trainable weight count' },
  { id: 'flops', label: 'FLOPs', desc: 'Compute FLOPs per pass' },
  { id: 'accuracy', label: 'Top-1 Accuracy', desc: 'ImageNet accuracy' },
  { id: 'depth', label: 'Network Depth', desc: 'Sequential layer count' },
  { id: 'memory', label: 'Memory Footprint', desc: 'VRAM inference memory' },
];

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

// Helper for logarithmic min-max normalization with lower-is-better inversion.
// Scores are mapped into [20, 100] to prevent radar chart shapes from collapsing to origin (0).
function calcLogScore(val: number, minVal: number, maxVal: number): number {
  if (val <= 0) return 20;
  if (maxVal <= minVal) return 80;
  const logVal = Math.log(val);
  const logMin = Math.log(Math.max(1e-6, minVal));
  const logMax = Math.log(maxVal);
  if (logMax <= logMin) return 80;
  const norm = (logVal - logMin) / (logMax - logMin);
  const score = Math.round(20 + (1 - Math.max(0, Math.min(1, norm))) * 80);
  return Math.max(20, Math.min(100, score));
}

const emptySubscribe = () => () => {};

export const ComparisonVisualizer: React.FC<ComparisonVisualizerProps> = ({ result }) => {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [chartView, setChartView] = useState<'bars' | 'radar' | 'telemetry'>('bars');
  const [activeMetric, setActiveMetric] = useState<ActiveMetricType>('parameters');

  // 1. Prepare BarChart data dynamically from metricMatrix
  const barChartData = useMemo(() => {
    const metricDef = metricRegistry.get(activeMetric);

    return result.objects.map((obj, i) => {
      const entry = result.metricMatrix[activeMetric]?.[obj.id];
      const rawVal = typeof entry?.value === 'number' ? entry.value : 0;
      const formatted = entry?.formatted || (metricDef ? metricDef.format(rawVal) : String(rawVal));

      return {
        id: obj.id,
        title: obj.title,
        value: rawVal,
        formatted,
        color: PALETTE[i % PALETTE.length],
      };
    });
  }, [result, activeMetric]);

  // 2. Prepare RadarChart Data dynamically across compared objects
  const radarChartData = useMemo(() => {
    const getValues = (metricId: string) =>
      result.objects.map((o) => {
        const val = result.metricMatrix[metricId]?.[o.id]?.value;
        return typeof val === 'number' ? val : 0;
      });

    const paramsArr = getValues('parameters');
    const flopsArr = getValues('flops');
    const accArr = getValues('accuracy');
    const memArr = getValues('memory');

    const validParams = paramsArr.filter((v) => v > 0);
    const minParams = validParams.length > 0 ? Math.min(...validParams) : 1;
    const maxParams = Math.max(...paramsArr, 1);

    const validFLOPs = flopsArr.filter((v) => v > 0);
    const minFLOPs = validFLOPs.length > 0 ? Math.min(...validFLOPs) : 1;
    const maxFLOPs = Math.max(...flopsArr, 1);

    const maxAcc = Math.max(...accArr, 1);

    const validMem = memArr.filter((v) => v > 0);
    const minMem = validMem.length > 0 ? Math.min(...validMem) : 1;
    const maxMem = Math.max(...memArr, 1);

    return [
      {
        subject: 'Top-1 Accuracy',
        ...Object.fromEntries(
          result.objects.map((o) => {
            const acc = typeof result.metricMatrix['accuracy']?.[o.id]?.value === 'number'
              ? (result.metricMatrix['accuracy'][o.id].value as number)
              : 0;
            return [o.title, Math.max(20, Math.round(20 + (acc / (maxAcc || 1)) * 80))];
          })
        ),
        fullMark: 100,
      },
      {
        subject: 'Weight Compactness',
        ...Object.fromEntries(
          result.objects.map((o) => {
            const p = typeof result.metricMatrix['parameters']?.[o.id]?.value === 'number'
              ? (result.metricMatrix['parameters'][o.id].value as number)
              : 0;
            return [o.title, calcLogScore(p, minParams, maxParams)];
          })
        ),
        fullMark: 100,
      },
      {
        subject: 'Compute Efficiency',
        ...Object.fromEntries(
          result.objects.map((o) => {
            const f = typeof result.metricMatrix['flops']?.[o.id]?.value === 'number'
              ? (result.metricMatrix['flops'][o.id].value as number)
              : 0;
            return [o.title, calcLogScore(f, minFLOPs, maxFLOPs)];
          })
        ),
        fullMark: 100,
      },
      {
        subject: 'VRAM Efficiency',
        ...Object.fromEntries(
          result.objects.map((o) => {
            const m = typeof result.metricMatrix['memory']?.[o.id]?.value === 'number'
              ? (result.metricMatrix['memory'][o.id].value as number)
              : 0;
            return [o.title, calcLogScore(m, minMem, maxMem)];
          })
        ),
        fullMark: 100,
      },
    ];
  }, [result]);

  // 3. Telemetry trajectories
  const presets = useMemo(() => result.learningCurveConfig?.presets || [], [result.learningCurveConfig]);
  const telemetrySteps = useMemo(() => {
    return Array.from({ length: 20 }, (_, step) => {
      const entry: Record<string, number> = { step: step * 5 };
      presets.forEach((p) => {
        const baseLoss = p.metrics.loss || 0.5;
        const decay = Math.exp(-step * 0.15);
        entry[`loss_${p.objectId}`] = Number((baseLoss * decay + 0.05 + Math.sin(step) * 0.01).toFixed(4));
        entry[`acc_${p.objectId}`] = Number((100 - (100 - (p.metrics.accuracy || 80)) * decay).toFixed(2));
      });
      return entry;
    });
  }, [presets]);

  if (!mounted) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-8 min-h-[300px] flex items-center justify-center text-slate-500 font-mono text-xs animate-pulse">
        Loading Comparison Visualizer Framework...
      </div>
    );
  }

  const activeDef = metricRegistry.get(activeMetric);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl mb-8">
      {/* Section Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400"></span>
            Visual Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Compare parameter trade-offs, compute efficiency, and simulated training trajectories.
          </p>
        </div>

        {/* Chart View Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setChartView('bars')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartView === 'bars'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Metric Bars</span>
          </button>

          <button
            type="button"
            onClick={() => setChartView('radar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartView === 'radar'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Efficiency Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setChartView('telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartView === 'telemetry'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Loss Curves</span>
          </button>
        </div>
      </div>

      {/* CHART VIEW 1: QUANTITATIVE METRIC BARS */}
      {chartView === 'bars' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {METRIC_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMetric(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeMetric === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bar Chart Canvas */}
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="title" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)',
                  }}
                  formatter={(val: unknown, _name: unknown, item: unknown) => [
                    (item as { payload?: { formatted?: string } })?.payload?.formatted || (val !== undefined && val !== null ? String(val) : 'N/A'),
                    activeDef?.label || activeMetric,
                  ]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barChartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Educational Tooltip Note */}
          {activeDef && (
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2">
              <Sliders className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">{activeDef.label} Intuition: </span>
                <span>{activeDef.educationalDescription}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHART VIEW 2: MULTIDIMENSIONAL EFFICIENCY RADAR */}
      {chartView === 'radar' && (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-xs text-slate-400">
            Spider chart mapping Top-1 Accuracy, Weight Compactness, Compute Efficiency, and VRAM Efficiency (0–100 scale).
          </p>
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)',
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                  formatter={(val: unknown) => [`${val} / 100 Score`, 'Efficiency Score']}
                />
                {result.objects.map((obj, i) => (
                  <Radar
                    key={obj.id}
                    name={obj.title}
                    dataKey={obj.title}
                    stroke={PALETTE[i % PALETTE.length]}
                    fill={PALETTE[i % PALETTE.length]}
                    fillOpacity={0.25}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART VIEW 3: SIMULATED OPTIMIZATION LOSS CURVES */}
      {chartView === 'telemetry' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Loss Chart */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 shadow-inner">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3 font-mono">
                Training Loss Convergence Curve
              </h4>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetrySteps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="step" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    {presets.map((p, idx) => (
                      <Line
                        key={p.objectId}
                        type="monotone"
                        dataKey={`loss_${p.objectId}`}
                        name={`${p.title} Loss`}
                        stroke={PALETTE[idx % PALETTE.length]}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accuracy Chart */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 shadow-inner">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3 font-mono">
                Validation Accuracy Progression (%)
              </h4>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetrySteps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="step" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    {presets.map((p, idx) => (
                      <Line
                        key={p.objectId}
                        type="monotone"
                        dataKey={`acc_${p.objectId}`}
                        name={`${p.title} Acc`}
                        stroke={PALETTE[idx % PALETTE.length]}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

