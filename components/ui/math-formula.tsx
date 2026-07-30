'use client';

import React from 'react';
import MathRenderer from './math-renderer';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Standardized Math Formula Component for Neural Network Architecture Explorer
 * Renders mathematical expressions with KaTeX typesetting, dark mode styling, and graceful fallbacks.
 */
export default function MathFormula({
  formula,
  displayMode = true,
  className = '',
}: MathFormulaProps) {
  return (
    <MathRenderer
      formula={formula}
      displayMode={displayMode}
      className={className}
    />
  );
}
