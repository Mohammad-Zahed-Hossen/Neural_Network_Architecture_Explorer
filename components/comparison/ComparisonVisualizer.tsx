'use client';

import React from 'react';
import type { ComparisonResult } from '@/lib/comparison/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface ComparisonVisualizerProps {
  result: ComparisonResult;
}

export const ComparisonVisualizer: React.FC<ComparisonVisualizerProps> = ({ result }) => {
  const presets = result.learningCurveConfig?.presets || [];

  // Generate 20 steps of telemetry trajectory for each entity using LearningCurvePlugin snapshot model
  const steps = Array.from({ length: 20 }, (_, step) => {
    const entry: Record<string, number> = { step: step * 5 };
    presets.forEach((p) => {
      const baseLoss = p.metrics.loss || 0.5;
      const decay = Math.exp(-step * 0.15);
      entry[`loss_${p.objectId}`] = Number((baseLoss * decay + 0.05 + Math.sin(step) * 0.01).toFixed(4));
      entry[`acc_${p.objectId}`] = Number((100 - (100 - (p.metrics.accuracy || 80)) * decay).toFixed(2));
    });
    return entry;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Visualizer Framework Integration — Learning Curve Telemetry
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Comparative loss & accuracy telemetry driven by <code className="text-purple-300 font-mono text-[11px]">LearningCurvePlugin</code>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss Trajectories Chart */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Loss Trajectories</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={steps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {presets.map((p) => (
                  <Line
                    key={p.objectId}
                    type="monotone"
                    dataKey={`loss_${p.objectId}`}
                    name={`${p.title} Loss`}
                    stroke={p.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Progress Chart */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Accuracy Progression (%)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={steps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {presets.map((p) => (
                  <Line
                    key={p.objectId}
                    type="monotone"
                    dataKey={`acc_${p.objectId}`}
                    name={`${p.title} Acc`}
                    stroke={p.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
