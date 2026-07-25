'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Search, ExternalLink, Calendar, 
  Users, Award, CheckCircle2, AlertOctagon, 
  History, ArrowRight, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import papersData from '@/data/papers.json';
import { getModelSummaries } from '@/lib/data-access/models';
import PageBackground from '@/components/layout/page-background';
import ContinueLearning from '@/components/ui/continue-learning';
import { searchEntities } from '@/lib/search/search-engine';
import { enrichPaperEntity } from '@/lib/search/metadata-enrichment';

interface Paper {
  id: string;
  modelIds: string[];
  title: string;
  authors: string[];
  year: number;
  contribution: string;
  problem: string;
  strengths: string[];
  weaknesses: string[];
  legacy: string;
  relevance: string;
  paperUrl: string;
}

export default function PaperKnowledgeCenter() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePaperId, setActivePaperId] = useState<string | null>(null);

  // Parse location hash on mount and listen to hashchange for robust linking
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1); // remove '#'
        // Find which paper contains this modelId or matches the paper id
        const matched = papersData.find(p => p.id === hash || p.modelIds.includes(hash));
        if (matched) {
          setActivePaperId(matched.id);
          
          // Delay scroll until card is fully expanded (matching the 300ms transition duration)
          setTimeout(() => {
            const element = document.getElementById(matched.id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 350);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filter papers using deterministic search engine
const filteredPapers = useMemo(() => {
  const results = searchEntities(
    papersData as Paper[],
    { searchQuery },
    enrichPaperEntity
  );
  return results.map(r => r.item);
}, [searchQuery]);

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24 overflow-x-hidden">
      <PageBackground variant="primary-indigo" />

      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 w-full flex-1 flex flex-col gap-6 sm:gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border/10 pb-4 sm:pb-6 mb-3 sm:mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Paper Knowledge Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl leading-relaxed mt-1">
            Explore the original research publications that defined modern deep representation learning. Connect standard source code back to theoretical milestones.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md bg-slate-950/50 rounded-2xl border border-border/30 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2.5 backdrop-blur-md">
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search papers by title, author, or contribution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[10px] sm:text-xs font-semibold text-white focus:outline-none placeholder-slate-600"
          />
        </div>

        {/* Papers List Grid/Stack */}
        {filteredPapers.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-slate-950/20 border border-border/20 rounded-2xl w-full">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">No matching papers found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
            {filteredPapers.map((paper) => {
              const isSelected = activePaperId === paper.id;
              
              // Get model names from our catalog summary
              const linkedModels = getModelSummaries().filter(m => paper.modelIds.includes(m.id));

              return (
                <div
                  key={paper.id}
                  id={paper.id}
                  className={`glass-card rounded-3xl border transition-all duration-300 ${
                    isSelected 
                      ? 'border-primary/50 bg-slate-950/60 shadow-lg shadow-primary/5' 
                      : 'border-border/25 bg-slate-950/20 hover:border-border/40'
                  }`}
                >
                   {/* Card Main Block Header */}
                   <div
                     role="button"
                     tabIndex={0}
                     aria-expanded={isSelected}
                     onClick={() => setActivePaperId(isSelected ? null : paper.id)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         setActivePaperId(isSelected ? null : paper.id);
                       }
                     }}
                     className="p-4 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 text-left w-full hover:bg-slate-900/10 transition-colors rounded-t-3xl"
                   >
                     <div className="space-y-1.5 sm:space-y-2 flex-1">
                       <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-400">
                         <span className="flex items-center gap-1 bg-slate-900 border border-border/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider">
                           <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                           {paper.year}
                         </span>
                         <span className="flex items-center gap-1 bg-slate-900 border border-border/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider max-w-[120px] sm:max-w-[140px] md:max-w-[200px] truncate" title={paper.authors.join(', ')}>
                           <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                           {paper.authors[0]} et al.
                         </span>
                       </div>
                       <h2 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight leading-snug transition-colors">
                         {paper.title}
                       </h2>
                       <p className="text-[10px] sm:text-xs text-slate-400 font-medium line-clamp-2 md:line-clamp-1 leading-relaxed">
                         Contribution: {paper.contribution}
                       </p>
                     </div>

                    {/* Toggle expand button indicator */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-auto">
                      <a
                        href={paper.paperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} // prevent expanding card
                        className="min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center p-1.5 sm:p-2 border border-border/30 hover:border-primary/40 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer bg-slate-950/20"
                        title="Read paper PDF"
                      >
                        <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePaperId(isSelected ? null : paper.id);
                        }}
                        className="min-h-[40px] sm:min-h-[44px] flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/15 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 hover:border-primary/25 cursor-pointer"
                      >
                        {isSelected ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                  {/* Expandable Body */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-border/10 bg-slate-950/40 rounded-b-3xl"
                      >
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs sm:text-sm font-medium">
                          
                          {/* Core Problem addressed */}
                          <div className="space-y-1.5 sm:space-y-2">
                            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block">
                              The Problem Addressed
                            </span>
                            <p className="text-slate-350 leading-relaxed">
                              {paper.problem}
                            </p>
                          </div>

                          {/* Strengths & Weaknesses checklist grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {/* Strengths */}
                            <div className="space-y-2 sm:space-y-3">
                              <span className="text-[10px] sm:text-xs text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Key Strengths
                              </span>
                              <ul className="space-y-1.5 sm:space-y-2 pl-0.5">
                                {paper.strengths.map((str, idx) => (
                                  <li key={idx} className="text-slate-350 flex items-start gap-1.5 sm:gap-2 leading-relaxed">
                                    <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                                    <span>{str}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="space-y-2 sm:space-y-3">
                              <span className="text-[10px] sm:text-xs text-amber-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                                <AlertOctagon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Trade-offs & Weaknesses
                              </span>
                              <ul className="space-y-1.5 sm:space-y-2 pl-0.5">
                                {paper.weaknesses.map((weak, idx) => (
                                  <li key={idx} className="text-slate-350 flex items-start gap-1.5 sm:gap-2 leading-relaxed">
                                    <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                                    <span>{weak}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Legacy & Modern Relevance */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-t border-border/10 pt-4 sm:pt-5">
                            <div className="space-y-1">
                              <span className="text-[10px] sm:text-xs text-indigo-400 font-extrabold uppercase tracking-widest flex items-center gap-1 mb-1">
                                <History className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Legacy Impact
                              </span>
                              <p className="text-[10px] sm:text-xs text-slate-350 leading-relaxed font-semibold">
                                {paper.legacy}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] sm:text-xs text-cyan-400 font-extrabold uppercase tracking-widest flex items-center gap-1 mb-1">
                                <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Modern Relevance
                              </span>
                              <p className="text-[10px] sm:text-xs text-slate-350 leading-relaxed font-semibold">
                                {paper.relevance}
                              </p>
                            </div>
                          </div>

                          {/* Links to Catalog items */}
                          {linkedModels.length > 0 && (
                            <div className="border-t border-border/10 pt-4 sm:pt-5 space-y-2 sm:space-y-3">
                              <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-widest block">
                                Linked Models in Catalog:
                              </span>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {linkedModels.map((m) => (
                                  <Link
                                    key={m.id}
                                    href={`/models/${m.id}`}
                                    className="min-h-[40px] sm:min-h-[44px] inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 border border-border/20 bg-slate-900/40 text-[10px] sm:text-xs font-bold text-slate-200 hover:text-white hover:border-primary/30 rounded-xl transition-all"
                                  >
                                    <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                                    <span>{m.name} Explorer</span>
                                    <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}

        {/* Continue Learning section */}
        <ContinueLearning
          items={[
            { title: 'Research Lineage DAG Map', type: 'paper', href: '/research-map', description: 'Visualize interactive citation graph across landmark papers.' },
            { title: 'Evolution Timeline', type: 'evolution', href: '/evolution', description: 'Explore chronological breakthroughs from LeNet to ViT.' },
            { title: 'Architecture Patterns Library', type: 'pattern', href: '/architecture-patterns', description: 'Master mathematical design blocks from papers.' },
            { title: 'Training Dynamics Simulator', type: 'concept', href: '/concepts/training-dynamics', description: 'Simulate paper gradient mathematical proofs.' },
            { title: 'Model Catalog', type: 'model', href: '/catalog', description: 'Explore interactive layer topologies for paper models.' }
          ]}
        />

      </section>
    </div>
  );
}
