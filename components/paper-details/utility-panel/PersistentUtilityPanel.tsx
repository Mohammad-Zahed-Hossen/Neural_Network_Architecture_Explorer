'use client';

import React, { useState, useEffect } from 'react';
import { PaperMetadata } from '@/types/paper-schema';
import { Bookmark, Download, Copy, Check, FileCode, Layers, Menu, X, Cpu } from 'lucide-react';
import Link from 'next/link';

interface PersistentUtilityPanelProps {
  metadata: PaperMetadata;
  fullJson: unknown;
}

const TOC_SECTIONS = [
  { id: 'quick-scan', label: 'Quick Scan' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'innovations', label: 'Technical Innovations' },
  { id: 'evidence', label: 'Evidence & Benchmarks' },
  { id: 'critical-notes', label: 'Critical Notes' },
  { id: 'connections', label: 'Research Network' },
  { id: 'reference', label: 'Deep Reference' },
];

export function PersistentUtilityPanel({ metadata, fullJson }: PersistentUtilityPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('quick-scan');
  const [copiedType, setCopiedType] = useState<'bibtex' | 'apa' | 'link' | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Lazy initializer to read bookmark state without calling setState inside effect
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`bookmark_paper_${metadata.paperId}`) === 'true';
    }
    return false;
  });

  // ScrollSpy listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const section of TOC_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`bookmark_paper_${metadata.paperId}`, String(nextState));
    }
  };

  const copyToClipboard = (text: string, type: 'bibtex' | 'apa' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullJson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${metadata.paperId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const renderPanelContent = () => (
    <div className="space-y-6 min-w-0">
      {/* Table of Contents Scroll-Spy */}
      <div className="min-w-0">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Table of Contents</span>
        </h4>
        <nav className="space-y-1 min-w-0">
          {TOC_SECTIONS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileDrawerOpen(false)}
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all truncate min-w-0 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 font-semibold pl-3'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Utility Action Buttons */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4 min-w-0">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Researcher Tools
        </h4>

        {/* Bookmark Action */}
        <button
          onClick={toggleBookmark}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[44px] ${
            isBookmarked
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2 truncate">
            <Bookmark className={`w-4 h-4 shrink-0 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            <span className="truncate">{isBookmarked ? 'In Reading List' : 'Save to Reading List'}</span>
          </span>
        </button>

        {/* Export BibTeX */}
        <button
          onClick={() =>
            copyToClipboard(
              `@inproceedings{${metadata.paperId},\n  title={${metadata.title}},\n  year={${metadata.year}}\n}`,
              'bibtex'
            )
          }
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[44px]"
        >
          <span className="flex items-center gap-2 truncate">
            <Copy className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Copy BibTeX Citation</span>
          </span>
          {copiedType === 'bibtex' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
        </button>

        {/* Export Raw JSON */}
        <button
          onClick={handleDownloadJSON}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[44px]"
        >
          <span className="flex items-center gap-2 truncate">
            <Download className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">Export Canonical JSON</span>
          </span>
          <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </button>

        {/* Associated Model Details Link */}
        {metadata.associatedModelId && (
          <Link
            href={`/models/${metadata.associatedModelId}`}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 mt-2 min-h-[44px]"
          >
            <span className="flex items-center gap-2 truncate">
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">View Pretrained Model</span>
            </span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 min-w-0">
        <div className="sticky top-24 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md min-w-0">
          {renderPanelContent()}
        </div>
      </aside>

      {/* Mobile Floating Action Trigger & Bottom Drawer */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setMobileDrawerOpen(prev => !prev)}
          className="p-3.5 rounded-full bg-cyan-500 text-slate-950 shadow-2xl font-bold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 min-w-[48px] min-h-[48px] justify-center"
          aria-label="Toggle paper tools drawer"
        >
          {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-Up Drawer Overlay */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-end p-4 transition-all"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl min-w-0"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 min-w-0">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider truncate">Paper Tools & Contents</h3>
              <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-400 p-1 rounded hover:text-white shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderPanelContent()}
          </div>
        </div>
      )}
    </>
  );
}
