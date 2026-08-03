'use client';

import React, { useState, useEffect, useRef } from 'react';
import { highlightCode } from '../../lib/shiki-highlighter';
import { CodeBlockCopyButton } from './code-block-copy-button';
import { CodeSection } from './code-block.types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CodeBlockHighlighterProps {
  code: string;
  language?: string;
  modelName: string;
  highlightLines?: number[];
  sections?: CodeSection[];
  initialLinesVisible?: number;
  collapsible?: boolean;
  showLineNumbers?: boolean;
}

export const CodeBlockHighlighter: React.FC<CodeBlockHighlighterProps> = ({
  code,
  language = 'python',
  modelName,
  highlightLines = [],
  sections,
  initialLinesVisible = 18,
  collapsible = true,
  showLineNumbers = true,
}) => {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const totalLines = lines.length;
  const isOverflowing = collapsible && totalLines > initialLinesVisible;

  useEffect(() => {
    let isMounted = true;

    highlightCode({
      code,
      language,
      highlightLines,
    }).then(({ html }) => {
      if (isMounted) {
        setHighlightedHtml(html);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [code, language, highlightLines]);

  return (
    <div className="relative group bg-[#090e1a]">
      {/* Floating Toolbar with Copy Button */}
      <div className="absolute right-4 top-3 z-10 flex items-center gap-2">
        <CodeBlockCopyButton
          code={code}
          modelName={modelName}
          sections={sections}
        />
      </div>

      {/* Main Code View Container */}
      <div
        ref={codeContainerRef}
        className={`relative overflow-x-auto overflow-y-hidden transition-all duration-300 ${
          isOverflowing && !isExpanded ? 'max-h-[500px]' : 'max-h-none'
        }`}
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-6 font-mono text-sm text-slate-500 flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span>Highlighting syntax...</span>
          </div>
        )}

        {/* Code Content */}
        {!isLoading && (
          <div className="flex font-mono text-[13px] leading-[1.65] selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Line Numbers Column */}
            {showLineNumbers && (
              <div
                className="select-none py-4 pl-4 pr-3 text-right text-slate-600 border-r border-slate-800/80 bg-slate-950/40"
                aria-hidden="true"
              >
                {lines.map((_, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = highlightLines.includes(lineNum);
                  return (
                    <div
                      key={lineNum}
                      className={`h-[21.5px] transition-colors ${
                        isHighlighted
                          ? 'font-bold text-cyan-400'
                          : 'hover:text-slate-400'
                      }`}
                    >
                      {lineNum}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Shiki Highlighted HTML Output */}
            <div className="flex-1 overflow-x-auto py-4 pl-4 pr-16 scrollbar-thin scrollbar-thumb-slate-800">
              <style jsx global>{`
                .shiki {
                  background-color: transparent !important;
                  margin: 0;
                  padding: 0;
                }
                .shiki code {
                  display: block;
                }
                .shiki .line {
                  display: block;
                  min-height: 21.5px;
                }
                .shiki .highlighted-line {
                  background-color: rgba(34, 211, 238, 0.08);
                  border-left: 3px solid #22d3ee;
                  margin-left: -16px;
                  padding-left: 13px;
                }
              `}</style>
              <div
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>
          </div>
        )}

        {/* Gradient Mask Overlay when Collapsed */}
        {isOverflowing && !isExpanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#090e1a] via-[#090e1a]/80 to-transparent" />
        )}
      </div>

      {/* Expand / Collapse Button Bar */}
      {isOverflowing && (
        <div className="relative z-10 flex items-center justify-center border-t border-slate-800/80 bg-slate-950/90 py-2.5 px-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-950 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all group"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
                <span>Collapse snippet</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                <span>Show all {totalLines} lines</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
