'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ComparisonResult } from '@/lib/comparison/types';
import { resolveEntityLink } from '@/lib/comparison/utils/entity-link';
import { BookOpen, Code, ExternalLink, Copy, Check } from 'lucide-react';

import { CollapsibleText } from './CollapsibleText';

interface ComparisonReferencesProps {
  result: ComparisonResult;
}

export const ComparisonReferences: React.FC<ComparisonReferencesProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl mb-8">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 font-mono tracking-wider uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
          Academic References
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide Academic References' : 'Show Academic References'}</span>
          <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fadeIn">
          {result.objects.map((obj, i) => {
            const colors = ['text-blue-300', 'text-emerald-300', 'text-amber-300', 'text-purple-300', 'text-rose-300', 'text-cyan-300'];
            const titleColor = colors[i % colors.length];

            const selfLink = resolveEntityLink(obj.id, obj.type);
            const meta = obj.rawObject.metadata;
            const domainMeta = (obj.rawObject.extensibility.domainMetadata || {}) as Record<string, unknown>;

            const authors = meta.authors && meta.authors.length > 0 ? meta.authors.join(', ') : null;
            const rawYear = meta.year || domainMeta.year || domainMeta.paperYear;
            const year = rawYear ? String(rawYear) : null;
            const paperUrl = String(domainMeta.paperUrl || domainMeta.url || domainMeta.arxiv || '');
            const codeUrl = String(domainMeta.codeUrl || domainMeta.github || '');
            const snippet = String(obj.implementationDetails.codeSnippet || domainMeta.codeSnippet || domainMeta.math || '');

            return (
              <div
                key={obj.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div>
                  {/* Card Title & Type Pill */}
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={selfLink.href}
                      className={`text-sm font-bold ${titleColor} hover:underline flex items-center gap-1.5 group`}
                    >
                      <span>{obj.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all" />
                    </Link>
                    <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {obj.type}
                    </span>
                  </div>

                  <div className="mb-4">
                    <CollapsibleText
                      text={obj.summary}
                      maxLines={2}
                      className="text-xs text-slate-300 leading-relaxed"
                    />
                  </div>

                  {/* Academic Citation Box */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/90 text-xs space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        Paper Citation
                      </span>
                      {year && <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">{String(year)}</span>}
                    </div>

                    {authors ? (
                      <div className="text-slate-200 font-medium text-[11px] leading-snug">
                        {authors} ({year || 'N/A'}). <span className="italic">{obj.title}: Breakthrough Neural Architecture</span>.
                      </div>
                    ) : obj.researchCitations.length > 0 ? (
                      <div className="text-slate-300 italic text-[11px]">{obj.researchCitations.join('; ')}</div>
                    ) : (
                      <div className="text-slate-400 italic text-[11px]">Foundational Landmark Paper ({year || 'Canonical'})</div>
                    )}

                    {/* External Links */}
                    <div className="flex items-center gap-2 pt-1">
                      {paperUrl && (
                        <a
                          href={paperUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 transition-colors"
                        >
                          <span>ArXiv / Publication</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {codeUrl && (
                        <a
                          href={codeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-purple-400 hover:text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30 transition-colors"
                        >
                          <span>GitHub Repository</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reference Implementation Code Snippet (Collapsible) */}
                  {snippet && (
                    <details className="bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden group">
                      <summary className="px-3 py-2 bg-slate-900 border-b border-slate-800/80 cursor-pointer flex items-center justify-between text-[11px] font-mono text-slate-300 hover:text-white select-none transition-colors">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Code className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Reference Formulation / PyTorch Snippet</span>
                        </span>
                        <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>

                      <div className="p-3 font-mono text-[10px] text-cyan-300 overflow-x-auto max-h-48 scrollbar-thin border-t border-slate-800/60 relative">
                        <div className="flex justify-end mb-2">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(obj.id, snippet)}
                            className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 transition-colors"
                          >
                            {copiedId === obj.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre>{snippet}</pre>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
