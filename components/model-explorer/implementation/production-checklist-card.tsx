'use client';

import React from 'react';
import { Server, CheckCircle2, ShieldCheck, Container, Lightbulb } from 'lucide-react';
import { ModelImplementationData } from '@/lib/schema/implementation.schema';
import { CollapsibleCard } from './collapsible-card';

interface ProductionChecklistCardProps {
  productionChecklist?: ModelImplementationData['productionChecklist'];
}

export function ProductionChecklistCard({ productionChecklist }: ProductionChecklistCardProps) {
  if (!productionChecklist) return null;

  const {
    batchInferenceReady,
    streamingInferenceReady,
    modelWarmupRecommended,
    threadSafetyVerified,
    quantizationSupport,
    onnxStatus,
    tensorRTStatus,
    dockerCompatible,
    servingRecommendations,
    memoryOptimizationTips,
  } = productionChecklist;

  const checklistItems = [
    { label: 'Batch Ready', verified: batchInferenceReady },
    { label: 'Streaming Ready', verified: streamingInferenceReady },
    { label: 'Warm-up Rec.', verified: modelWarmupRecommended, isWarning: true },
    { label: 'Thread Safe', verified: threadSafetyVerified },
    { label: 'Docker Compatible', verified: dockerCompatible },
  ].filter((item) => item.verified !== undefined);

  return (
    <CollapsibleCard
      title="Production Readiness & Serving Checklist"
      icon={<Server className="h-4 w-4 text-purple-400 shrink-0" />}
      summaryBadge={
        <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Production Spec
        </span>
      }
      defaultExpandedDesktop={true}
      defaultExpandedMobile={false}
    >
      <div className="space-y-3.5">
        {/* Checklist items & status grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${item.isWarning ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 leading-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Optimization & Export Engines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {quantizationSupport && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                Quantization Support
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-200 block mt-0.5 font-mono truncate" title={quantizationSupport}>
                {quantizationSupport}
              </span>
            </div>
          )}

          {onnxStatus && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                ONNX Runtime Status
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-cyan-300 block mt-0.5 font-mono truncate" title={onnxStatus}>
                {onnxStatus}
              </span>
            </div>
          )}

          {tensorRTStatus && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                TensorRT Acceleration
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-300 block mt-0.5 font-mono truncate" title={tensorRTStatus}>
                {tensorRTStatus}
              </span>
            </div>
          )}
        </div>

        {/* Serving & Memory Recommendations */}
        {((servingRecommendations && servingRecommendations.length > 0) || (memoryOptimizationTips && memoryOptimizationTips.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
            {servingRecommendations && servingRecommendations.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 sm:p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Container className="h-3.5 w-3.5" />
                  Serving Recommendations
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {servingRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {memoryOptimizationTips && memoryOptimizationTips.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 sm:p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Memory Optimization Checklist
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {memoryOptimizationTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
