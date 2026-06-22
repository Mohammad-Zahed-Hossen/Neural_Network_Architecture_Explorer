'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Calendar, AlertTriangle, Lightbulb, 
  CheckCircle2, XCircle, ArrowUpRight, Network, 
  HelpCircle, Compass, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import evolutionData from '@/data/evolution.json';

interface EvolutionNode {
  id: string;
  name: string;
  year: number;
  problem: string;
  innovation: string;
  keyIdea: string;
  advantages: string[];
  limitations: string[];
  legacy: string;
}

export default function EvolutionTimeline() {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNode(expandedNode === id ? null : id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const nodeVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24 overflow-x-hidden">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/5 filter blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/5 filter blur-[150px] pointer-events-none z-0" />

      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page Header */}
        <div className="flex flex-col gap-2 border-b border-border/10 pb-6 mb-12">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="h-8 w-8 text-primary animate-float" />
            Architecture Evolution Timeline
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
            Trace the lineage of deep visual models. Discover the computational bottlenecks, breakthrough innovations, and legacies that shaped the transition from early CNNs to modern transformers.
          </p>
        </div>

        {/* Timeline track container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative pl-0"
        >
          {/* Vertical timeline spine */}
          <div className="hidden md:block absolute left-[9px] md:left-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-indigo-500 to-purple-500/20 transform -translate-x-[1px] z-0" />

          {/* Timeline Nodes */}
          <div className="space-y-12 relative z-10">
            {evolutionData.map((node: EvolutionNode, index) => {
              const isEven = index % 2 === 0;
              const isExpanded = expandedNode === node.id;

              return (
                <motion.div
                  key={node.id}
                  variants={nodeVariants}
                  viewport={{ once: true, margin: "-100px" }}
                  whileInView="visible"
                  initial="hidden"
                  className={`flex flex-col md:flex-row items-stretch gap-6 md:gap-12 relative ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Spine Dot Indicator */}
                  <div className="hidden md:flex absolute left-[-15px] md:left-1/2 top-4 w-4 h-4 rounded-full border-2 border-primary bg-background transform -translate-x-1/2 z-25 items-center justify-center shadow-lg shadow-primary/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  </div>

                  {/* Left/Right Card Panel */}
                  <div className="w-full md:w-[calc(50%-24px)] flex flex-col">
                    <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-5 md:p-6 backdrop-blur-md relative overflow-hidden hover:border-primary/30 transition-all duration-300">
                      {/* Year badge & Name */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <Calendar className="h-3.5 w-3.5" />
                            {node.year}
                          </div>
                          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">
                            STEP 0{index + 1}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleExpand(node.id)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/40 transition-colors"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <h2 className="text-xl font-black text-white tracking-tight mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span>{node.name}</span>
                        {node.id !== 'vit' && node.id !== 'convnext' && (
                          <Link 
                            href={`/models/${node.id === 'vgg' ? 'vgg16' : node.id === 'resnet' ? 'resnet50' : node.id === 'densenet' ? 'densenet121' : node.id === 'mobilenet' ? 'mobilenet' : node.id === 'efficientnet' ? 'efficientnetb0' : node.id}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary/80 hover:text-primary hover:underline transition-all shrink-0 self-start sm:self-auto"
                          >
                            Interactive Explorer <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        )}
                      </h2>

                      {/* Main Summary info */}
                      <div className="space-y-4 text-xs sm:text-sm font-medium">
                        {/* Problem */}
                        <div className="border-l-2 border-red-500/50 bg-red-500/5 p-3 rounded-r-xl">
                          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            The Problem Addressed
                          </span>
                          <p className="text-slate-350 leading-relaxed">{node.problem}</p>
                        </div>

                        {/* Innovation */}
                        <div className="border-l-2 border-emerald-500/50 bg-emerald-500/5 p-3 rounded-r-xl">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                            <Lightbulb className="h-3.5 w-3.5" />
                            Proposed Innovation
                          </span>
                          <p className="text-slate-350 leading-relaxed">{node.innovation}</p>
                        </div>

                        {/* Key Idea */}
                        <div className="bg-slate-900/30 border border-border/20 p-3.5 rounded-xl">
                          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mb-1">
                            Key Intuition
                          </span>
                          <p className="text-slate-300 italic leading-relaxed">"{node.keyIdea}"</p>
                        </div>
                      </div>

                      {/* Expandable detailed content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-4 pt-4 border-t border-border/20 space-y-4"
                          >
                            {/* Pros & Cons grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Advantages */}
                              <div className="space-y-2">
                                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Advantages
                                </span>
                                <ul className="space-y-1.5 pl-1">
                                  {node.advantages.map((adv, idx) => (
                                    <li key={idx} className="text-xs text-slate-350 flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-emerald-500/70 shrink-0 mt-0.5">•</span>
                                      <span>{adv}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Limitations */}
                              <div className="space-y-2">
                                <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                  <XCircle className="h-3.5 w-3.5" />
                                  Limitations
                                </span>
                                <ul className="space-y-1.5 pl-1">
                                  {node.limitations.map((lim, idx) => (
                                    <li key={idx} className="text-xs text-slate-350 flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-amber-500/70 shrink-0 mt-0.5">•</span>
                                      <span>{lim}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Legacy */}
                            <div className="border-t border-border/10 pt-3">
                              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mb-1">
                                <Compass className="h-3.5 w-3.5" />
                                Legacy & Future Impact
                              </span>
                              <p className="text-xs text-slate-350 leading-relaxed font-medium">
                                {node.legacy}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Expand/Collapse footer bar */}
                      <button
                        onClick={() => toggleExpand(node.id)}
                        className="w-full mt-4 py-1.5 flex items-center justify-center gap-1 border border-border/10 bg-slate-950/20 hover:bg-slate-900/20 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide breakdown details</span>
                            <ChevronUp className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            <span>Show advantages & limitations</span>
                            <ChevronDown className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Empty placeholder panel to maintain timeline columns layout */}
                  <div className="hidden md:block w-[calc(50%-24px)]" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
