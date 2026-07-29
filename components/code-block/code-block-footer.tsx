'use client';

import React from 'react';
import { CodeBlockFooterInfo } from './code-block.types';
import { Clock, BookOpen, Layers, Download, ExternalLink } from 'lucide-react';

interface CodeBlockFooterProps {
  footer?: CodeBlockFooterInfo;
  codeToDownload?: string;
  filenameToDownload?: string;
}

export const CodeBlockFooter: React.FC<CodeBlockFooterProps> = ({
  footer,
  codeToDownload,
  filenameToDownload = 'model_example.py',
}) => {
  if (!footer && !codeToDownload) return null;

  const handleDownload = () => {
    if (!codeToDownload) return;
    const blob = new Blob([codeToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filenameToDownload;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border-t border-cyan-500/15 bg-slate-950/90 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Educational Summary Details */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400">
          {footer?.exampleType && (
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              <span>{footer.exampleType}</span>
            </div>
          )}

          {footer?.estimatedReadingTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>{footer.estimatedReadingTime}</span>
            </div>
          )}

          {footer?.dependencies && footer.dependencies.length > 0 && (
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-slate-500 font-sans">Dependencies:</span>
              <div className="flex items-center gap-1">
                {footer.dependencies.map((dep, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-slate-300"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}

          {footer?.compatibleModels && footer.compatibleModels.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px]">
              <Layers className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500 font-sans">Compatible:</span>
              <span className="text-slate-300">
                {footer.compatibleModels.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons (Download, GitHub, Docs) */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-slate-900 sm:border-t-0">
          {codeToDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
              title="Download file"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Download</span>
            </button>
          )}

          {footer?.githubUrl && (
            <a
              href={footer.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
            >
              <GithubIcon className="h-3.5 w-3.5 text-slate-400" />
              <span>GitHub</span>
            </a>
          )}

          {footer?.docsUrl && (
            <a
              href={footer.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span>Docs</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

function GithubIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
