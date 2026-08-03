import React from 'react';
import { Info, X, Sparkles, BookOpen, ArrowRightLeft } from 'lucide-react';
import type { ComponentInspectorProps } from './types';

export default function ComponentInspector({
  selectedNode,
  onClearSelection,
}: ComponentInspectorProps) {
  if (!selectedNode) {
    return (
      <div className="bg-[#020617]/50 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 text-slate-500 min-h-[140px]">
        <Info className="h-5 w-5 text-slate-600 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          No Component Selected
        </span>
        <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
          Click any component node in the blueprint schematic or layer sequence browser above to inspect its educational role, purpose, and mathematical flow.
        </p>
      </div>
    );
  }

  const {
    label,
    sublabel,
    role,
    purpose,
    informationFlow,
    educationalNotes = [],
    relatedConcepts = [],
    badge,
    strokeColor = '#22d3ee',
  } = selectedNode;

  return (
    <div className="bg-[#020617]/60 border border-[#22d3ee]/30 rounded-xl p-4 space-y-3 relative shadow-lg">
      {/* Inspector Header */}
      <div className="flex items-start justify-between border-b border-border/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: strokeColor }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white tracking-tight">{label}</h4>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase bg-slate-900 border border-slate-700 text-[#22d3ee]">
                  {badge}
                </span>
              )}
            </div>
            {sublabel && (
              <span className="text-[10px] text-slate-400 font-mono block">{sublabel}</span>
            )}
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-800/50 cursor-pointer"
          title="Clear Inspection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Role & Purpose */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#22d3ee]" />
            Component Role
          </span>
          <p className="text-slate-300 font-medium leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-border/10">
            {role}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-emerald-400" />
            Functional Purpose
          </span>
          <p className="text-slate-300 font-medium leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-border/10">
            {purpose}
          </p>
        </div>
      </div>

      {/* Information Flow */}
      <div className="space-y-1 pt-1">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block flex items-center gap-1">
          <ArrowRightLeft className="h-3 w-3 text-purple-400" />
          Information Flow Dynamics
        </span>
        <p className="text-slate-300 text-xs font-medium leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-border/10">
          {informationFlow}
        </p>
      </div>

      {/* Educational Notes */}
      {educationalNotes.length > 0 && (
        <div className="space-y-1 pt-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
            Educational Notes
          </span>
          <ul className="space-y-1 text-xs text-slate-400 font-medium pl-1">
            {educationalNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#22d3ee] shrink-0 mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Concepts Tags */}
      {relatedConcepts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1">
            Related Concepts:
          </span>
          {relatedConcepts.map((concept, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-semibold"
            >
              {concept}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
