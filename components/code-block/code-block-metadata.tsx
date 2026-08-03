'use client';

import React from 'react';
import { TechnicalMetadata } from './code-block.types';
import { Cpu, Database, Image as ImageIcon, Zap, Clock, Flame, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockMetadataProps {
  metadata?: TechnicalMetadata;
  frameworkVersion?: string;
}

export const CodeBlockMetadata: React.FC<CodeBlockMetadataProps> = ({
  metadata,
  frameworkVersion,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!metadata && !frameworkVersion) return null;

  const fwVer = metadata?.frameworkVersion || frameworkVersion;

  return (
    <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 py-2 sm:px-6">
      {/* Mobile Toggle Button for Metadata */}
      <div className="flex items-center justify-between sm:hidden pb-1">
        <span className="text-xs font-mono font-medium text-slate-400">
          Environment & Engineering Spec
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
        >
          {isExpanded ? 'Hide Spec' : 'Show Spec'}
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Metadata Pill Badges Container */}
      <div
        className={`flex flex-wrap items-center gap-2 transition-all ${
          isExpanded ? 'block' : 'hidden sm:flex'
        }`}
      >
        {/* Framework Version */}
        {fwVer && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 text-xs font-mono text-slate-200">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>{fwVer}</span>
          </div>
        )}

        {/* Python Version */}
        {metadata?.pythonVersion && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 text-xs font-mono text-slate-200">
            <span className="text-amber-400 font-bold font-sans text-xs">Py</span>
            <span>{metadata.pythonVersion}</span>
          </div>
        )}

        {/* Input Resolution */}
        {metadata?.inputResolution && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 text-xs font-mono text-slate-200">
            <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
            <span>{metadata.inputResolution}</span>
          </div>
        )}

        {/* Dataset */}
        {metadata?.dataset && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 text-xs font-mono text-slate-200">
            <Database className="h-3.5 w-3.5 text-purple-400" />
            <span>{metadata.dataset}</span>
          </div>
        )}

        {/* GPU Requirement */}
        {metadata?.gpuRequirement && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 text-xs font-mono text-slate-200">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span>GPU {metadata.gpuRequirement}</span>
          </div>
        )}

        {/* Estimated Runtime */}
        {metadata?.estimatedRuntime && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 text-xs font-mono text-slate-200">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{metadata.estimatedRuntime}</span>
          </div>
        )}

        {/* Mixed Precision */}
        {metadata?.mixedPrecisionSupported && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 text-xs font-mono text-emerald-300">
            <Zap className="h-3 w-3 text-emerald-400" />
            <span>Mixed Precision</span>
          </div>
        )}

        {/* Fine-Tuning */}
        {metadata?.fineTuningSupported && (
          <div className="flex items-center gap-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 text-xs font-mono text-cyan-300">
            <Sliders className="h-3 w-3 text-cyan-400" />
            <span>Fine-Tuning Ready</span>
          </div>
        )}

        {/* Custom Badges */}
        {metadata?.customBadges?.map((badge, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 text-xs font-mono text-slate-300"
          >
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
