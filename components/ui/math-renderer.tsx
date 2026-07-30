'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
  fallbackText?: string;
}

export default function MathRenderer({
  formula,
  displayMode = true,
  className = '',
  fallbackText,
}: MathRendererProps) {
  const renderedHtml = useMemo(() => {
    if (!formula || typeof formula !== 'string') return null;

    try {
      // Clean leading/trailing spaces or dollar signs if provided
      let cleanFormula = formula.trim();
      if (cleanFormula.startsWith('$$') && cleanFormula.endsWith('$$')) {
        cleanFormula = cleanFormula.slice(2, -2).trim();
      } else if (cleanFormula.startsWith('$') && cleanFormula.endsWith('$')) {
        cleanFormula = cleanFormula.slice(1, -1).trim();
      } else if (cleanFormula.startsWith('\\(') && cleanFormula.endsWith('\\)')) {
        cleanFormula = cleanFormula.slice(2, -2).trim();
      } else if (cleanFormula.startsWith('\\[') && cleanFormula.endsWith('\\]')) {
        cleanFormula = cleanFormula.slice(2, -2).trim();
      }

      return katex.renderToString(cleanFormula, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (err) {
      console.warn('KaTeX rendering fallback triggered for formula:', formula, err);
      return null;
    }
  }, [formula, displayMode]);

  if (!renderedHtml) {
    return (
      <code className={`font-mono text-xs text-cyan-300 bg-slate-900/80 border border-slate-800 rounded px-2 py-1 overflow-x-auto ${className}`}>
        {fallbackText || formula}
      </code>
    );
  }

  return (
    <div
      className={`katex-math-wrapper overflow-x-auto py-1 scrollbar-thin text-slate-100 font-sans tracking-wide text-sm sm:text-base selection:bg-cyan-500/30 ${
        displayMode ? 'flex justify-center my-2.5 px-3 py-2.5 bg-slate-950/60 border border-cyan-500/20 rounded-xl shadow-inner' : 'inline-block px-1'
      } ${className}`}
      aria-label={`Math formula: ${formula}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
