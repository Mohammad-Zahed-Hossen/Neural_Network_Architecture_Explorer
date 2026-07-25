'use client';

import React from 'react';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Standardized Math Formula Component for Neural Network Architecture Explorer
 * Renders mathematical expressions with clean LaTeX-like formatting.
 */
export default function MathFormula({
  formula,
  displayMode = true,
  className = '',
}: MathFormulaProps) {
  // Format math symbols nicely for display
  const formattedText = formula
    .replace(/\\times|\*/g, ' × ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\rightarrow|->/g, ' → ')
    .replace(/\\ge|>=/g, ' ≥ ')
    .replace(/\\le|<=/g, ' ≤ ')
    .replace(/\\neq|!=/g, ' ≠ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\beta/g, 'β')
    .replace(/\\mu/g, 'μ')
    .replace(/\\epsilon|\\varepsilon/g, 'ε')
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    .replace(/\\infty/g, '∞');

  if (displayMode) {
    return (
      <div className={`my-2 bg-slate-900/80 border border-primary/20 rounded-xl px-4 py-2.5 text-center font-mono text-xs sm:text-sm text-primary font-bold shadow-inner tracking-wide overflow-x-auto ${className}`}>
        {formattedText}
      </div>
    );
  }

  return (
    <span className={`font-mono text-xs text-primary font-bold px-1.5 py-0.5 rounded bg-slate-900/60 border border-primary/20 ${className}`}>
      {formattedText}
    </span>
  );
}
