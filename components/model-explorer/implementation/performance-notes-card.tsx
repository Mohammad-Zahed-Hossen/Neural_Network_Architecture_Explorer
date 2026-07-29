'use client';

import React from 'react';
import { Gauge, CheckCircle2, XCircle, Cpu, Zap, HardDrive } from 'lucide-react';
import { ModelImplementationData } from '@/lib/schema/implementation.schema';
import { CollapsibleCard } from './collapsible-card';

interface PerformanceNotesCardProps {
  performanceNotes?: ModelImplementationData['performanceNotes'];
}

export function PerformanceNotesCard({ performanceNotes }: PerformanceNotesCardProps) {
  if (!performanceNotes) return null;

  const {
    mixedPrecisionSupported,
    onnxExportSupported,
    torchScriptSupported,
    tensorRTCompatible,
    cpuInferenceLatency,
    gpuInferenceLatency,
    memoryFootprint,
    latencyCategory,
    dynamicShapesSupported,
    batchInferenceEfficiency,
  } = performanceNotes;

  const badges = [
    { label: 'Mixed Precision', supported: mixedPrecisionSupported },
    { label: 'ONNX Export', supported: onnxExportSupported },
    { label: 'TorchScript', supported: torchScriptSupported },
    { label: 'TensorRT Engine', supported: tensorRTCompatible },
    { label: 'Dynamic Shapes', supported: dynamicShapesSupported },
  ].filter((b) => b.supported !== undefined);

  return (
    <CollapsibleCard
      title="Performance & Engineering Characteristics"
      icon={<Gauge className="h-4 w-4 text-cyan-400 shrink-0" />}
      summaryBadge={
        latencyCategory ? (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md">
            {latencyCategory}
          </span>
        ) : null
      }
      defaultExpandedDesktop={true}
      defaultExpandedMobile={false}
    >
      <div className="space-y-3.5">
        {/* Latency & Resource Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {cpuInferenceLatency && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider flex items-center gap-1">
                <Cpu className="h-3 w-3 text-slate-400" /> CPU Latency
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-200 block mt-0.5 font-mono truncate" title={cpuInferenceLatency}>
                {cpuInferenceLatency}
              </span>
            </div>
          )}

          {gpuInferenceLatency && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider flex items-center gap-1">
                <Zap className="h-3 w-3 text-cyan-400" /> GPU Latency
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-cyan-300 block mt-0.5 font-mono truncate" title={gpuInferenceLatency}>
                {gpuInferenceLatency}
              </span>
            </div>
          )}

          {memoryFootprint && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-purple-400" /> Memory Footprint
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-purple-300 block mt-0.5 font-mono truncate" title={memoryFootprint}>
                {memoryFootprint}
              </span>
            </div>
          )}

          {batchInferenceEfficiency && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                Batch Efficiency
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 block mt-0.5 truncate" title={batchInferenceEfficiency}>
                {batchInferenceEfficiency}
              </span>
            </div>
          )}
        </div>

        {/* Export & Compatibility Badges */}
        {badges.length > 0 && (
          <div className="pt-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Target Hardware & Format Capabilities
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {badges.map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-bold border ${
                    item.supported
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {item.supported ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-slate-500 shrink-0" />
                  )}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
