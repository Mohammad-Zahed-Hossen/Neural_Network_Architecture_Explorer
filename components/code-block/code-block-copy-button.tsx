'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, Layers, PlayCircle, Code2, Database } from 'lucide-react';
import { CodeSection } from './code-block.types';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeBlockCopyButtonProps {
  code: string;
  modelName: string;
  sections?: CodeSection[];
  onCopySuccess?: (msg: string) => void;
}

export const CodeBlockCopyButton: React.FC<CodeBlockCopyButtonProps> = ({
  code,
  modelName,
  sections,
}) => {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const handleCopy = (textToCopy: string, label: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedLabel(label);
      setIsOpenMenu(false);
      setTimeout(() => {
        setCopiedLabel(null);
      }, 3000);
    });
  };

  const getSectionCode = (section: CodeSection): string => {
    const lines = code.split('\n');
    const sliced = lines.slice(section.startLine - 1, section.endLine);
    return sliced.join('\n');
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Toast Banner Notification when Copied */}
      <AnimatePresence>
        {copiedLabel && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 z-30 flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-950/90 border border-emerald-500/40 px-3 py-1.5 text-xs font-medium text-emerald-300 shadow-xl backdrop-blur-md"
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>{copiedLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="inline-flex rounded-lg border border-slate-700/60 bg-slate-900/90 p-0.5 shadow-sm hover:border-cyan-500/40">
        {/* Main Copy Full Code Button */}
        <button
          onClick={() => handleCopy(code, `Copied ${modelName} Full Code`)}
          aria-label={`Copy full code for ${modelName}`}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
        >
          {copiedLabel ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400" />
          )}
          <span>{copiedLabel ? 'Copied!' : 'Copy Code'}</span>
        </button>

        {/* Multi-Section Dropdown Toggle */}
        {sections && sections.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsOpenMenu(!isOpenMenu)}
              aria-label="Copy code options menu"
              aria-expanded={isOpenMenu}
              className="flex items-center justify-center border-l border-slate-800 px-1.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpenMenu && (
                <>
                  {/* Backdrop overlay to close */}
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsOpenMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    className="absolute right-0 top-full mt-1.5 z-30 min-w-[200px] rounded-xl border border-slate-700/80 bg-slate-900/95 py-1.5 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Copy Specific Section
                    </div>

                    <button
                      onClick={() => handleCopy(code, `Copied ${modelName} Full Code`)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-300"
                    >
                      <Layers className="h-3.5 w-3.5 text-cyan-400" />
                      Copy Full Code
                    </button>

                    {sections.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() =>
                          handleCopy(getSectionCode(sec), `Copied ${sec.label}`)
                        }
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-300"
                      >
                        {getSectionIcon(sec.id)}
                        Copy {sec.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

function getSectionIcon(id: string) {
  switch (id) {
    case 'training_loop':
      return <PlayCircle className="h-3.5 w-3.5 text-amber-400" />;
    case 'model_def':
      return <Code2 className="h-3.5 w-3.5 text-purple-400" />;
    case 'data_pipeline':
      return <Database className="h-3.5 w-3.5 text-blue-400" />;
    default:
      return <Layers className="h-3.5 w-3.5 text-cyan-400" />;
  }
}
