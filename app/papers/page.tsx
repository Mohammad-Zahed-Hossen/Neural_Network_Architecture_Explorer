'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Search, ExternalLink, Calendar, 
  Users, Award, CheckCircle2, AlertOctagon, 
  History, ArrowRight, BookOpen, Star,
  Edit3, Check, Quote, ArrowUpDown, Clock
} from 'lucide-react';
import Link from 'next/link';
import papersData from '@/data/papers.json';
import { getModelSummaries } from '@/lib/data-access/models';
import PageBackground from '@/components/layout/page-background';
import ContinueLearning from '@/components/ui/continue-learning';
import { searchEntities } from '@/lib/search/search-engine';
import { enrichPaperEntity } from '@/lib/search/metadata-enrichment';
import { usePaperKnowledgeBase } from '@/lib/hooks/use-paper-knowledge-base';
import { ReadingStatus, PaperType } from '@/lib/schema/paper.schema';

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
  paperType?: PaperType;
  datasets?: string[];
  tags?: string[];
  category?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'foundations', label: 'CNN Foundations', keywords: ['lenet', 'alexnet', 'vgg', 'zfnet'] },
  { id: 'residual', label: 'Residual & Dense', keywords: ['resnet', 'densenet', 'resnext'] },
  { id: 'mobile', label: 'Mobile & Efficient', keywords: ['mobilenet', 'shuffle', 'squeezenet'] },
  { id: 'transformers', label: 'Vision Transformers', keywords: ['vit', 'swin', 'deit', 'transformer'] },
  { id: 'nas', label: 'NAS & Scaling', keywords: ['efficientnet', 'nasnet', 'regnet', 'convnext'] },
];

export default function PaperKnowledgeCenter() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [copiedBibTeXId, setCopiedBibTeXId] = useState<string | null>(null);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  const {
    getPaperState,
    recordPaperView,
    recentlyOpened,
    toggleFavorite,
    setReadingStatus,
    savePersonalNotes,
    activeType,
    activeStatusFilter,
    setActiveStatusFilter,
    activeCategory,
    setActiveCategory,
    sortMode,
    setSortMode,
  } = usePaperKnowledgeBase();

  // Parse location hash on mount and listen to hashchange for robust linking
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const matched = (papersData as Paper[]).find(p => p.id === hash || p.modelIds.includes(hash));
        if (matched) {
          setActivePaperId(matched.id);
          recordPaperView(matched.id);
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
  }, [recordPaperView]);

  const handleSelectPaper = useCallback((paperId: string) => {
    setActivePaperId(prev => {
      const next = prev === paperId ? null : paperId;
      if (next) recordPaperView(next);
      return next;
    });
  }, [recordPaperView]);

  // Generate citation BibTeX string
  const generateBibTeX = useCallback((paper: Paper) => {
    const firstAuthorLastName = paper.authors[0]?.split(' ').pop() || 'author';
    const citeKey = `${firstAuthorLastName.toLowerCase()}${paper.year}${paper.id}`;
    return `@article{${citeKey},\n  title={${paper.title}},\n  author={${paper.authors.join(' and ')}},\n  year={${paper.year}},\n  url={${paper.paperUrl}}\n}`;
  }, []);

  // Copy BibTeX to clipboard
  const handleCopyBibTeX = useCallback((paper: Paper, e: React.MouseEvent) => {
    e.stopPropagation();
    const bibtex = generateBibTeX(paper);
    navigator.clipboard.writeText(bibtex).then(() => {
      setCopiedBibTeXId(paper.id);
      setTimeout(() => setCopiedBibTeXId(null), 2000);
    });
  }, [generateBibTeX]);

  // Copy standard text citation
  const handleCopyCitation = useCallback((paper: Paper, e: React.MouseEvent) => {
    e.stopPropagation();
    const textCitation = `${paper.authors.join(', ')} (${paper.year}). "${paper.title}". Available: ${paper.paperUrl}`;
    navigator.clipboard.writeText(textCitation).then(() => {
      setCopiedCitationId(paper.id);
      setTimeout(() => setCopiedCitationId(null), 2000);
    });
  }, []);

  // Filter & sort papers deterministically
  const filteredPapers = useMemo(() => {
    const searchResults = searchEntities(
      papersData as Paper[],
      { searchQuery },
      enrichPaperEntity
    );
    let result = searchResults.map(r => r.item);

    // Category filter
    if (activeCategory !== 'all') {
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      if (cat && cat.keywords) {
        result = result.filter(p => {
          const text = `${p.id} ${p.title} ${p.modelIds.join(' ')}`.toLowerCase();
          return cat.keywords.some(kw => text.includes(kw));
        });
      }
    }

    // Filter by paper type
    if (activeType !== 'all') {
      result = result.filter(p => (p.paperType || 'research') === activeType);
    }

    // Filter by status / favorites
    if (activeStatusFilter === 'bookmarked') {
      result = result.filter(p => getPaperState(p.id).isFavorite);
    } else if (activeStatusFilter !== 'all') {
      result = result.filter(p => getPaperState(p.id).status === activeStatusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortMode === 'year-desc') return b.year - a.year;
      if (sortMode === 'year-asc') return a.year - b.year;
      if (sortMode === 'title') return a.title.localeCompare(b.title);
      if (sortMode === 'starred') {
        const starA = getPaperState(a.id).isFavorite ? 1 : 0;
        const starB = getPaperState(b.id).isFavorite ? 1 : 0;
        return starB - starA;
      }
      return 0;
    });

    return result;
  }, [searchQuery, activeCategory, activeType, activeStatusFilter, sortMode, getPaperState]);

  const handleStartEditingNotes = useCallback((paperId: string, currentNotes: string) => {
    setEditingNotesId(paperId);
    setTempNotes(currentNotes);
  }, []);

  const handleSaveNotes = useCallback((paperId: string) => {
    savePersonalNotes(paperId, tempNotes);
    setEditingNotesId(null);
  }, [tempNotes, savePersonalNotes]);

  // Recently opened papers objects
  const recentlyOpenedPapers = useMemo(() => {
    return (papersData as Paper[]).filter(p => recentlyOpened.includes(p.id));
  }, [recentlyOpened]);

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-20 overflow-x-hidden">
      <PageBackground variant="primary-indigo" />

      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 sm:py-7 w-full flex-1 flex flex-col gap-5 sm:gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b border-border/10 pb-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              Research Knowledge Base & Reading Workspace
            </h1>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900/60 border border-border/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {filteredPapers.length} / {papersData.length} Publications
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium max-w-2xl leading-snug mt-0.5">
            Original publications, landmark paper breakdowns, citation exports, and personal research notes.
          </p>
        </div>

        {/* Recently Opened Reading Session Bar */}
        {recentlyOpenedPapers.length > 0 && (
          <div className="bg-slate-950/40 border border-border/20 rounded-2xl p-3 backdrop-blur-md flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 pl-1">
              <Clock className="h-3 w-3 text-primary" />
              Recent Workspace:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              {recentlyOpenedPapers.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPaper(p.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-border/20 text-[10px] font-extrabold text-slate-300 hover:text-white hover:border-primary/40 shrink-0 cursor-pointer flex items-center gap-1 transition-all"
                >
                  <BookOpen className="h-2.5 w-2.5 text-primary" />
                  <span className="truncate max-w-[120px]">{p.authors[0]} ({p.year})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Base Control Bar */}
        <div className="flex flex-col gap-3 bg-slate-950/40 border border-border/20 rounded-2xl p-3.5 backdrop-blur-md">
          {/* Top row: Search input & Category Tabs */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md bg-slate-900/60 rounded-xl border border-border/20 px-3 py-1.5 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by title, author, contribution, or dataset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs font-semibold text-white focus:outline-none placeholder-slate-600"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shrink-0 border ${
                      isActive 
                        ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_8px_rgba(34,211,238,0.15)]' 
                        : 'bg-slate-900/40 text-slate-400 border-border/20 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom row: Reading Status Filters & Sort Select */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/10 pt-2.5">
            {/* Reading Status Filters */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'bookmarked', label: 'Starred', icon: Star },
                { id: 'reading', label: 'Reading' },
                { id: 'read', label: 'Read' },
                { id: 'unread', label: 'Unread' },
              ].map((tab) => {
                const isActive = activeStatusFilter === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStatusFilter(tab.id as ReadingStatus | 'all' | 'bookmarked')}
                    className={`min-h-[32px] px-2.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 border ${
                      isActive 
                        ? 'bg-primary text-slate-950 border-primary shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                        : 'bg-slate-900/40 text-slate-400 border-border/20 hover:text-white hover:border-border/40'
                    }`}
                  >
                    {TabIcon && <TabIcon className="h-3 w-3" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Mode Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" /> Sort:
              </span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as 'year-desc' | 'year-asc' | 'title' | 'starred')}
                className="bg-slate-900 border border-border/20 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-primary/40 cursor-pointer"
              >
                <option value="year-desc">Year (Newest)</option>
                <option value="year-asc">Year (Oldest)</option>
                <option value="title">Title (A-Z)</option>
                <option value="starred">Starred First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        {filteredPapers.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/20 border border-border/20 rounded-2xl w-full">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No research publications match your filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-start">
            {filteredPapers.map((paper) => {
              const isSelected = activePaperId === paper.id;
              const paperState = getPaperState(paper.id);
              const linkedModels = getModelSummaries().filter(m => paper.modelIds.includes(m.id));
              const isEditingThisNotes = editingNotesId === paper.id;

              return (
                <div
                  key={paper.id}
                  id={paper.id}
                  className={`glass-card rounded-2xl border transition-all duration-300 ${
                    isSelected 
                      ? 'border-primary/50 bg-slate-950/70 shadow-lg shadow-primary/5' 
                      : 'border-border/20 bg-slate-950/30 hover:border-border/35'
                  }`}
                >
                  {/* Card Header */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isSelected}
                    onClick={() => handleSelectPaper(paper.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectPaper(paper.id);
                      }
                    }}
                    className="p-4 cursor-pointer flex flex-col justify-between gap-3 text-left w-full hover:bg-slate-900/10 transition-colors rounded-t-2xl"
                  >
                    <div className="space-y-1.5 flex-1">
                      {/* Metadata row with year, author, status & star button */}
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-400">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="flex items-center gap-1 bg-slate-900 border border-border/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Calendar className="h-2.5 w-2.5 text-primary" />
                            {paper.year}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-900 border border-border/20 px-2 py-0.5 rounded-full uppercase tracking-wider truncate max-w-[150px]">
                            <Users className="h-2.5 w-2.5 text-primary" />
                            {paper.authors[0]} et al.
                          </span>
                          {/* Reading Status Pill */}
                          <span className={`px-2 py-0.5 rounded-full border uppercase text-[9px] font-extrabold ${
                            paperState.status === 'read' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : paperState.status === 'reading'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-900 text-slate-500 border-border/20'
                          }`}>
                            {paperState.status}
                          </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(paper.id);
                          }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            paperState.isFavorite 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                              : 'bg-slate-900/40 border-border/20 text-slate-500 hover:text-white'
                          }`}
                          title={paperState.isFavorite ? 'Remove bookmark' : 'Bookmark paper'}
                        >
                          <Star className={`h-3.5 w-3.5 ${paperState.isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      <h2 className="text-sm font-extrabold text-white tracking-tight leading-snug">
                        {paper.title}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        Contribution: {paper.contribution}
                      </p>
                    </div>

                    {/* Actions bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/10 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus: ReadingStatus = paperState.status === 'unread' ? 'reading' : paperState.status === 'reading' ? 'read' : 'unread';
                            setReadingStatus(paper.id, nextStatus);
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-white bg-slate-900/50 border border-border/20 px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <span>Mark: {paperState.status === 'unread' ? 'Reading' : paperState.status === 'reading' ? 'Read' : 'Unread'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* BibTeX Citation Copy button */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyBibTeX(paper, e)}
                          className="p-1.5 border border-border/30 hover:border-primary/40 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer bg-slate-950/20 text-[10px] font-bold flex items-center gap-1"
                          title="Copy BibTeX Citation"
                        >
                          <Quote className="h-3 w-3 text-primary" />
                          <span>{copiedBibTeXId === paper.id ? 'Copied!' : 'BibTeX'}</span>
                        </button>

                        {/* Standard Citation Text Copy button */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyCitation(paper, e)}
                          className="p-1.5 border border-border/30 hover:border-primary/40 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer bg-slate-950/20 text-[10px] font-bold flex items-center gap-1"
                          title="Copy text citation"
                        >
                          <span>{copiedCitationId === paper.id ? 'Copied!' : 'Cite'}</span>
                        </button>

                        <a
                          href={paper.paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 sm:p-2 border border-slate-800 hover:border-cyan-500/40 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer bg-slate-900/60"
                          title="Open original paper PDF"
                          aria-label="Open original paper PDF"
                        >
                          <ExternalLink className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                        </a>
                        <Link
                          href={`/papers/${paper.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] sm:text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                          title="Open full canonical paper details specification"
                        >
                          Full Spec <ArrowRight className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPaper(paper.id);
                          }}
                          className="text-[10px] sm:text-xs font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 cursor-pointer uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                        >
                          {isSelected ? 'Collapse' : 'Quick Scan'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content Panel */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-border/10 bg-slate-950/50 rounded-b-2xl"
                      >
                        <div className="p-4 space-y-4 text-xs font-medium">
                          
                          {/* Core Problem */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                              Core Problem Addressed
                            </span>
                            <p className="text-slate-350 leading-relaxed text-[11px]">
                              {paper.problem}
                            </p>
                          </div>

                          {/* Strengths & Weaknesses */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Key Strengths
                              </span>
                              <ul className="space-y-1">
                                {paper.strengths.map((str, idx) => (
                                  <li key={idx} className="text-slate-350 text-[11px] flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                                    <span>{str}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <AlertOctagon className="h-3 w-3" />
                                Trade-offs & Limitations
                              </span>
                              <ul className="space-y-1">
                                {paper.weaknesses.map((weak, idx) => (
                                  <li key={idx} className="text-slate-350 text-[11px] flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                                    <span>{weak}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Legacy & Modern Relevance */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border/10 pt-3">
                            <div>
                              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mb-1">
                                <History className="h-3 w-3" />
                                Legacy Impact
                              </span>
                              <p className="text-[11px] text-slate-350 leading-relaxed">
                                {paper.legacy}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mb-1">
                                <Award className="h-3 w-3" />
                                Modern Relevance
                              </span>
                              <p className="text-[11px] text-slate-350 leading-relaxed">
                                {paper.relevance}
                              </p>
                            </div>
                          </div>

                          {/* Personal Notes & Annotation Workspace */}
                          <div className="border-t border-border/10 pt-3 space-y-2 bg-slate-900/30 p-3 rounded-xl">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-primary font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <Edit3 className="h-3 w-3" />
                                Research Annotations & Personal Notes
                              </span>
                              {!isEditingThisNotes && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditingNotes(paper.id, paperState.personalNotes)}
                                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                                >
                                  {paperState.personalNotes ? 'Edit Notes' : '+ Add Note'}
                                </button>
                              )}
                            </div>

                            {isEditingThisNotes ? (
                              <div className="space-y-2">
                                <textarea
                                  value={tempNotes}
                                  onChange={(e) => setTempNotes(e.target.value)}
                                  placeholder="Write key equations, insights, or reading notes for this publication..."
                                  className="w-full bg-slate-950 border border-border/30 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 min-h-[80px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNotesId(null)}
                                    className="px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveNotes(paper.id)}
                                    className="px-3 py-1 text-[10px] font-extrabold bg-primary text-slate-950 rounded-lg flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="h-3 w-3" />
                                    Save Note
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-300 italic leading-relaxed">
                                {paperState.personalNotes || 'No personal notes recorded yet. Click above to add notes saved to local storage.'}
                              </p>
                            )}
                          </div>

                          {/* Linked Models */}
                          {linkedModels.length > 0 && (
                            <div className="border-t border-border/10 pt-3 space-y-1.5">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                                Catalog Implementation Models:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {linkedModels.map((m) => (
                                  <Link
                                    key={m.id}
                                    href={`/models/${m.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 border border-border/20 bg-slate-900/40 text-[11px] font-bold text-slate-200 hover:text-white hover:border-primary/30 rounded-xl transition-all"
                                  >
                                    <BookOpen className="h-3 w-3 text-primary" />
                                    <span>{m.name} Explorer</span>
                                    <ArrowRight className="h-2.5 w-2.5" />
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
