'use client';

import React, { useState } from 'react';
import { EducationalCallout, CalloutType } from './code-block.types';
import { Lightbulb, AlertTriangle, Rocket, Pin, HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeBlockCalloutsProps {
  callouts?: EducationalCallout[];
}

export const CodeBlockCallouts: React.FC<CodeBlockCalloutsProps> = ({ callouts }) => {
  if (!callouts || callouts.length === 0) return null;

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/70 p-4 sm:p-6 space-y-3">
      <div className="flex items-center gap-2 pb-1">
        <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400">
          Educational Insights & Design Decisions
        </h4>
      </div>

      <div className="grid gap-3">
        {callouts.map((callout) => (
          <CalloutCard key={callout.id} callout={callout} />
        ))}
      </div>
    </div>
  );
};

const CalloutCard: React.FC<{ callout: EducationalCallout }> = ({ callout }) => {
  const [isOpen, setIsOpen] = useState<boolean>(callout.defaultExpanded ?? true);

  const style = getCalloutStyle(callout.type);

  return (
    <div className={`rounded-xl border backdrop-blur-md transition-all overflow-hidden ${style.bg} ${style.border}`}>
      {/* Callout Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.iconBg} ${style.iconColor}`}>
            {style.icon}
          </div>
          <span className={`text-sm font-semibold ${style.textColor}`}>
            {callout.title}
          </span>
        </div>
        <div className={`text-slate-400 hover:text-slate-200 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="border-t border-white/5 px-4 py-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pl-14">
              {callout.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getCalloutStyle(type: CalloutType) {
  switch (type) {
    case 'why':
      return {
        bg: 'bg-amber-950/20',
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        textColor: 'text-amber-200',
        icon: <Lightbulb className="h-4 w-4" />,
      };
    case 'mistake':
      return {
        bg: 'bg-rose-950/20',
        border: 'border-rose-500/30',
        iconBg: 'bg-rose-500/20',
        iconColor: 'text-rose-400',
        textColor: 'text-rose-200',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    case 'tip':
      return {
        bg: 'bg-emerald-950/20',
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        textColor: 'text-emerald-200',
        icon: <Rocket className="h-4 w-4" />,
      };
    case 'strategy':
      return {
        bg: 'bg-purple-950/20',
        border: 'border-purple-500/30',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-400',
        textColor: 'text-purple-200',
        icon: <Pin className="h-4 w-4" />,
      };
    case 'note':
    default:
      return {
        bg: 'bg-blue-950/20',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        textColor: 'text-blue-200',
        icon: <HelpCircle className="h-4 w-4" />,
      };
  }
}
