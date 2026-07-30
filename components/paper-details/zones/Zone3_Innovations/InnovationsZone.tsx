'use client';

import React from 'react';
import { TechnicalInnovation, ResearchVocabularyTerm, VisualMemoryFigure } from '@/types/paper-schema';
import { SectionHeader } from '../../shared/SectionHeader';
import { ExpandableCard } from '../../shared/ExpandableCard';
import { InnovationTypeBadge } from '../../shared/InnovationTypeBadge';
import MathFormula from '@/components/ui/math-formula';
import { CodeBlock } from '@/components/code-block';
import { Sparkles, BookOpenCheck, BookOpen, Image as ImageIcon } from 'lucide-react';

interface InnovationsZoneProps {
  innovations: TechnicalInnovation[];
  vocabulary?: ResearchVocabularyTerm[];
  visualFigures?: VisualMemoryFigure[];
}

export function InnovationsZone({ innovations, vocabulary, visualFigures }: InnovationsZoneProps) {
  return (
    <section id="innovations" className="space-y-6 scroll-mt-24 w-full max-w-full min-w-0">
      <SectionHeader
        id="innovations-header"
        title="Technical Innovations & RKR Vocabulary"
        subtitle="Key architectural breakthroughs, formal vocabulary, and visual memory figures."
        icon={<Sparkles className="w-5 h-5" />}
      />

      {/* RKR Research Vocabulary Cards */}
      {vocabulary && vocabulary.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 min-w-0 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Research Vocabulary (Core Concepts)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
            {vocabulary.map((v, idx) => (
              <div key={idx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="font-bold text-slate-100 text-sm truncate">{v.term}</span>
                  {v.formalNotation && (
                    <code className="text-xs font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded shrink-0">
                      {v.formalNotation}
                    </code>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed break-words">
                  {v.definition}
                </p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 break-words">
                  <strong className="text-cyan-400">Significance: </strong>
                  {v.significance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RKR Visual Memory Figures */}
      {visualFigures && visualFigures.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 min-w-0 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
            <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Visual Memory Figures</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            {visualFigures.map((fig, idx) => (
              <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-purple-500/20 space-y-1.5 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-purple-300 font-bold">{fig.figureNumber}</span>
                  <span className="text-slate-500 text-[11px] font-mono">Sec {fig.section}</span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate">{fig.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed break-words">{fig.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Innovation Cards Stack */}
      <div className="space-y-4 w-full max-w-full min-w-0">
        {innovations.map((innovation, index) => (
          <ExpandableCard
            key={innovation.id}
            id={`innovations-${innovation.id}`}
            title={innovation.title}
            subtitle={innovation.summary}
            badge={<InnovationTypeBadge type={innovation.type} />}
            defaultExpanded={index === 0}
          >
            <div className="space-y-5 pt-2 w-full max-w-full min-w-0">
              {/* Detailed Explanation */}
              <div className="min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <BookOpenCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Conceptual Mechanism</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  {innovation.detailedDescription}
                </p>
              </div>

              {/* Math & Intuition Block */}
              {innovation.math && (
                <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 sm:p-5 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Mathematical Formulation
                    </span>
                  </div>

                  {/* Formula Display */}
                  <MathFormula formula={innovation.math.latexFormula} displayMode={true} />

                  <p className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-cyan-500/50 pl-3 break-words">
                    {innovation.math.explanation}
                  </p>

                  {/* Variable Glossary */}
                  {innovation.math.variables.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 w-full min-w-0">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Variable Glossary
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
                        {innovation.math.variables.map((v, idx) => (
                          <div key={idx} className="flex items-baseline gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-xs min-w-0 overflow-hidden">
                            <code className="text-cyan-300 font-mono font-bold shrink-0">{v.symbol}</code>
                            <span className="text-slate-300 truncate min-w-0">{v.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Math Significance */}
                  <div className="pt-1 text-xs text-slate-300 bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-500/10 break-words">
                    <strong className="text-cyan-400">Why it matters: </strong>
                    {innovation.math.significance}
                  </div>
                </div>
              )}

              {/* Reference Implementation Shared Production CodeBlock */}
              {innovation.codeSnippet && (
                <div className="w-full max-w-full min-w-0 overflow-hidden pt-1">
                  <CodeBlock
                    modelName={innovation.title}
                    subtitle={`Reference Implementation (${innovation.codeSnippet.language})`}
                    code={innovation.codeSnippet.code}
                    language={innovation.codeSnippet.language}
                    framework={innovation.codeSnippet.language === 'python' ? 'python' : 'bash'}
                    filename={`innovation_${innovation.id.replace(/-/g, '_')}.${innovation.codeSnippet.language === 'python' ? 'py' : 'js'}`}
                    collapsible={true}
                    initialLinesVisible={14}
                    showLineNumbers={true}
                  />
                </div>
              )}
            </div>
          </ExpandableCard>
        ))}
      </div>
    </section>
  );
}
