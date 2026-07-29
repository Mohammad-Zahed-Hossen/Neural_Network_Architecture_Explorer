'use client';

import React from 'react';
import { FrameworkType, DifficultyLevel, CodeVariant, CodeSnippet } from './code-block.types';
import { FileCode, Sparkles, CheckCircle2, Cpu, Zap, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface CodeBlockHeaderProps {
  modelName: string;
  subtitle?: string;
  difficulty?: DifficultyLevel;
  isTransferLearning?: boolean;
  implementationType?: string;
  exampleCategory?: string;
  isProductionReady?: boolean;
  currentFramework?: FrameworkType;
  currentFilename?: string;
  variants?: CodeVariant[];
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string) => void;
  snippets?: CodeSnippet[];
  selectedSnippetId?: string;
  onSelectSnippet?: (snippetId: string) => void;
}

export const CodeBlockHeader: React.FC<CodeBlockHeaderProps> = ({
  modelName,
  subtitle,
  difficulty = 'Intermediate',
  isTransferLearning = true,
  implementationType,
  exampleCategory,
  isProductionReady = true,
  currentFramework = 'python',
  currentFilename,
  variants,
  selectedVariantId,
  onSelectVariant,
  snippets,
  selectedSnippetId,
  onSelectSnippet,
}) => {
  return (
    <div className="flex flex-col border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-xl">
      {/* Top Banner Row: Model Context & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Left: Model Name & Framework Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950/50">
            {getFrameworkIcon(currentFramework)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-bold text-base sm:text-lg text-slate-100 tracking-tight">
                {modelName}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 text-xs font-mono font-medium text-cyan-300">
                {getFrameworkLabel(currentFramework)}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 font-sans tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Badges (Difficulty, Implementation Type, Category, Production) */}
        <div className="flex flex-wrap items-center gap-2">
          {implementationType ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 px-2.5 py-1 text-xs font-semibold text-cyan-300 shadow-sm">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              {implementationType}
            </span>
          ) : isTransferLearning ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 px-2.5 py-1 text-xs font-semibold text-cyan-300 shadow-sm">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Transfer Learning
            </span>
          ) : null}

          {exampleCategory && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 text-xs font-semibold text-purple-300 shadow-sm">
              {exampleCategory}
            </span>
          )}

          {isProductionReady && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 shadow-sm">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Production Ready
            </span>
          )}

          {difficulty && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getDifficultyStyle(
                difficulty
              )}`}
            >
              {difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Tabs Row: Variants (Framework Switcher) & File Switcher */}
      {(variants && variants.length > 1) || (snippets && snippets.length > 1) || currentFilename ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-900/60 px-4 py-2 sm:px-6">
          {/* Framework Variant Tabs */}
          {variants && variants.length > 1 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none" role="tablist" aria-label="Framework selection">
              {variants.map((v) => {
                const isActive = v.id === selectedVariantId;
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelectVariant?.(v.id)}
                    role="tab"
                    aria-selected={isActive}
                    className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all min-touch-target sm:min-touch-target-none ${
                      isActive
                        ? 'text-cyan-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeVariantTab"
                        className="absolute inset-0 rounded-lg bg-cyan-950/80 border border-cyan-500/40 shadow-sm shadow-cyan-950"
                        transition={{ type: 'spring', duration: 0.3 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {getFrameworkIcon(v.framework)}
                      {v.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Multi-file tabs or filename pill */}
          {snippets && snippets.length > 1 ? (
            <div className="flex items-center gap-1 overflow-x-auto py-0.5" role="tablist" aria-label="File selection">
              {snippets.map((snip) => {
                const isActive = snip.id === selectedSnippetId;
                return (
                  <button
                    key={snip.id}
                    onClick={() => onSelectSnippet?.(snip.id)}
                    role="tab"
                    aria-selected={isActive}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-slate-400" />
                    {snip.filename}
                  </button>
                );
              })}
            </div>
          ) : currentFilename ? (
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md">
              <FileCode className="h-3.5 w-3.5 text-cyan-400" />
              <span>{currentFilename}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

function getFrameworkLabel(fw: FrameworkType): string {
  switch (fw) {
    case 'pytorch':
      return 'PyTorch';
    case 'tensorflow':
      return 'TensorFlow / Keras';
    case 'keras':
      return 'Keras';
    case 'huggingface':
      return 'Hugging Face';
    case 'jax':
      return 'JAX / Flax';
    case 'onnx':
      return 'ONNX';
    case 'bash':
      return 'Bash';
    default:
      return 'Python 3';
  }
}

function getFrameworkIcon(fw: FrameworkType) {
  switch (fw) {
    case 'pytorch':
      return <Zap className="h-4 w-4 text-orange-400" />;
    case 'tensorflow':
    case 'keras':
      return <Cpu className="h-4 w-4 text-amber-400" />;
    case 'huggingface':
      return <Sparkles className="h-4 w-4 text-yellow-400" />;
    case 'jax':
      return <Layers className="h-4 w-4 text-blue-400" />;
    default:
      return <FileCode className="h-4 w-4 text-cyan-400" />;
  }
}

function getDifficultyStyle(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Intermediate':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    case 'Advanced':
      return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
  }
}
