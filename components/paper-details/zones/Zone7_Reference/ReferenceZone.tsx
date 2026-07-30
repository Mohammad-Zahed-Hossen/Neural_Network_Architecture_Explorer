'use client';

import React from 'react';
import { DeepReference } from '@/types/paper-schema';
import { SectionHeader } from '../../shared/SectionHeader';
import { ExpandableCard } from '../../shared/ExpandableCard';
import MathFormula from '@/components/ui/math-formula';
import { CodeBlock } from '@/components/code-block';
import { BookOpen, Cpu, Sigma, FileText, Code } from 'lucide-react';

interface ReferenceZoneProps {
  reference: DeepReference;
}

export function ReferenceZone({ reference }: ReferenceZoneProps) {
  const { originalAbstract, originalConclusion, trainingDetails, equationCatalog, bibtex } = reference;

  return (
    <section id="reference" className="space-y-6 scroll-mt-24 pt-4 border-t border-slate-800/80 w-full max-w-full min-w-0">
      <SectionHeader
        id="reference-header"
        title="Deep Reference & Implementation Specs"
        subtitle="Hyperparameters, complete equation index, verbatim paper text, and BibTeX citation."
        icon={<BookOpen className="w-5 h-5" />}
      />

      <div className="space-y-4 w-full max-w-full min-w-0">
        {/* Accordion 1: Experimental Setup & Hyperparameters */}
        <ExpandableCard
          id="reference-training"
          title="Training Details & Hyperparameter Specs"
          subtitle="Optimizer settings, learning rates, mini-batch sizes, hardware, and augmentation pipelines."
          badge={<Cpu className="w-4 h-4 text-cyan-400" />}
          defaultExpanded={false}
        >
          <div className="space-y-4 pt-2 w-full max-w-full min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
              {trainingDetails.optimizer && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-0 overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Optimizer</span>
                  <span className="text-sm font-semibold text-slate-100 truncate block">{trainingDetails.optimizer}</span>
                </div>
              )}
              {trainingDetails.learningRate && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-0 overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Learning Rate</span>
                  <span className="text-sm font-semibold text-slate-100 truncate block">{trainingDetails.learningRate}</span>
                </div>
              )}
              {trainingDetails.batchSize && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-0 overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Batch Size</span>
                  <span className="text-sm font-semibold text-slate-100 truncate block">{trainingDetails.batchSize}</span>
                </div>
              )}
              {trainingDetails.hardwareUsed && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-0 overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hardware Used</span>
                  <span className="text-sm font-semibold text-slate-100 truncate block">{trainingDetails.hardwareUsed}</span>
                </div>
              )}
              {trainingDetails.trainingDuration && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-0 overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Training Duration</span>
                  <span className="text-sm font-semibold text-slate-100 truncate block">{trainingDetails.trainingDuration}</span>
                </div>
              )}
            </div>

            {trainingDetails.hyperparameters && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 w-full min-w-0 overflow-hidden">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Additional Hyperparameters</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs w-full min-w-0">
                  {Object.entries(trainingDetails.hyperparameters).map(([key, val]) => (
                    <div key={key} className="flex items-baseline justify-between bg-slate-900/60 p-2 rounded border border-slate-800/60 min-w-0 gap-2">
                      <span className="font-mono text-cyan-300 font-semibold shrink-0">{key}:</span>
                      <span className="text-slate-200 truncate min-w-0">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ExpandableCard>

        {/* Accordion 2: Complete Equation Index */}
        {equationCatalog && equationCatalog.length > 0 && (
          <ExpandableCard
            id="reference-equations"
            title="Complete Equation Index"
            subtitle="Catalog of mathematical formulas appearing in the original paper."
            badge={<Sigma className="w-4 h-4 text-indigo-400" />}
            defaultExpanded={false}
          >
            <div className="space-y-4 pt-2 w-full max-w-full min-w-0">
              {equationCatalog.map(eq => (
                <div key={eq.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 w-full max-w-full min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold min-w-0 gap-2">
                    <span className="truncate min-w-0">{eq.name}</span>
                    <span className="font-mono text-slate-400 shrink-0">{eq.id}</span>
                  </div>
                  <MathFormula formula={eq.latex} displayMode={true} />
                  <p className="text-xs text-slate-300 italic break-words">{eq.context}</p>
                </div>
              ))}
            </div>
          </ExpandableCard>
        )}

        {/* Accordion 3: Verbatim Original Abstract & Conclusion */}
        <ExpandableCard
          id="reference-abstract"
          title="Verbatim Abstract & Conclusion"
          subtitle="Unmodified text from the published manuscript."
          badge={<FileText className="w-4 h-4 text-slate-400" />}
          defaultExpanded={false}
        >
          <div className="space-y-4 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed w-full max-w-full min-w-0">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 w-full min-w-0">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Original Abstract</h5>
              <p className="italic text-slate-200 break-words">{originalAbstract}</p>
            </div>
            {originalConclusion && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 w-full min-w-0">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Original Conclusion</h5>
                <p className="italic text-slate-200 break-words">{originalConclusion}</p>
              </div>
            )}
          </div>
        </ExpandableCard>

        {/* Accordion 4: Raw BibTeX Entry using Shared CodeBlock */}
        <ExpandableCard
          id="reference-bibtex"
          title="Raw BibTeX Citation"
          subtitle="Formatted LaTeX citation for academic referencing."
          badge={<Code className="w-4 h-4 text-cyan-400" />}
          defaultExpanded={false}
        >
          <div className="pt-2 w-full max-w-full min-w-0 overflow-hidden">
            <CodeBlock
              modelName="BibTeX Citation"
              subtitle="Academic LaTeX Reference"
              code={bibtex}
              language="latex"
              framework="bash"
              filename="citation.bib"
              collapsible={false}
              showLineNumbers={true}
            />
          </div>
        </ExpandableCard>
      </div>
    </section>
  );
}
