'use client';

import React from 'react';
import { ArrowRightLeft, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ModelImplementationData } from '@/lib/schema/implementation.schema';

interface InputOutputSpecificationCardProps {
  ioSpecification: NonNullable<ModelImplementationData['ioSpecification']>;
}

export function InputOutputSpecificationCard({ ioSpecification }: InputOutputSpecificationCardProps) {
  if (!ioSpecification) return null;

  const { input, output } = ioSpecification;

  return (
    <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-cyan-400 shrink-0" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Expected Input / Output Specification
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
          Tensor Contract
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Specification Card */}
        {input && (
          <div className="bg-slate-950/70 border border-cyan-500/20 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownRight className="h-4 w-4 text-cyan-400" />
                Input Tensor Contract
              </span>
              {input.shape && (
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                  {input.shape}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {input.tensorFormat && (
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Format</span>
                  <span className="font-mono text-slate-200 font-medium">{input.tensorFormat}</span>
                </div>
              )}
              {input.colorSpace && (
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Color Space</span>
                  <span className="font-mono text-slate-200 font-medium">{input.colorSpace}</span>
                </div>
              )}
              {input.valueRange && (
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Value Range</span>
                  <span className="font-mono text-slate-200 font-medium">{input.valueRange}</span>
                </div>
              )}
              {input.resizeStrategy && (
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Resize Strategy</span>
                  <span className="font-mono text-slate-200 font-medium truncate block" title={input.resizeStrategy}>{input.resizeStrategy}</span>
                </div>
              )}
            </div>

            {input.normalization && (
              <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg text-xs">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Normalization Formula</span>
                <span className="font-mono text-slate-300 text-[11px] block mt-0.5">{input.normalization}</span>
              </div>
            )}
          </div>
        )}

        {/* Output Specification Card */}
        {output && (
          <div className="bg-slate-950/70 border border-purple-500/20 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4 text-purple-400" />
                Output Tensor Contract
              </span>
              {output.tensorFormat && (
                <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-md">
                  {output.tensorFormat}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {output.predictionFormat && (
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Prediction Type</span>
                  <span className="font-mono text-slate-200 font-medium">{output.predictionFormat}</span>
                </div>
              )}
              {output.classMapping && (
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Class Index Map</span>
                  <span className="font-mono text-slate-200 font-medium truncate block" title={output.classMapping}>{output.classMapping}</span>
                </div>
              )}
              {output.confidenceOutput && (
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Confidence Score</span>
                  <span className="font-mono text-slate-200 font-medium">{output.confidenceOutput}</span>
                </div>
              )}
              {output.topK && (
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Top-K Evaluation</span>
                  <span className="font-mono text-slate-200 font-medium">{output.topK}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
