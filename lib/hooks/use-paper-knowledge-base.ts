'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReadingStatus, PaperType } from '@/lib/schema/paper.schema';

interface UserPaperState {
  status: ReadingStatus;
  isFavorite: boolean;
  personalNotes: string;
  customTags: string[];
  lastRead: string | null;
}

type PaperStateMap = Record<string, UserPaperState>;

const STORAGE_KEY = 'nn_explorer_paper_kb_v1';

export function usePaperKnowledgeBase() {
  const [paperStates, setPaperStates] = useState<PaperStateMap>({});
  const [recentlyOpened, setRecentlyOpened] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Read from localStorage after initial hydration to prevent SSR hydration mismatch
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsMounted(true);
      try {
        const savedStates = localStorage.getItem(STORAGE_KEY);
        if (savedStates) {
          setPaperStates(JSON.parse(savedStates));
        }
        const savedRecent = localStorage.getItem(`${STORAGE_KEY}_recent`);
        if (savedRecent) {
          setRecentlyOpened(JSON.parse(savedRecent));
        }
      } catch {}
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const [activeType, setActiveType] = useState<PaperType | 'all'>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<ReadingStatus | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortMode, setSortMode] = useState<'year-desc' | 'year-asc' | 'title' | 'starred'>('year-desc');

  const recordPaperView = useCallback((paperId: string) => {
    setRecentlyOpened(prev => {
      const filtered = prev.filter(id => id !== paperId);
      const updated = [paperId, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(`${STORAGE_KEY}_recent`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((paperId: string) => {
    setPaperStates(prev => {
      const current = prev[paperId] || {
        status: 'unread',
        isFavorite: false,
        personalNotes: '',
        customTags: [],
        lastRead: null,
      };
      const updated = {
        ...prev,
        [paperId]: {
          ...current,
          isFavorite: !current.isFavorite,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const setReadingStatus = useCallback((paperId: string, status: ReadingStatus) => {
    setPaperStates(prev => {
      const current = prev[paperId] || {
        status: 'unread',
        isFavorite: false,
        personalNotes: '',
        customTags: [],
        lastRead: null,
      };
      const updated = {
        ...prev,
        [paperId]: {
          ...current,
          status,
          lastRead: status === 'read' || status === 'reading' ? new Date().toISOString() : current.lastRead,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const savePersonalNotes = useCallback((paperId: string, notes: string) => {
    setPaperStates(prev => {
      const current = prev[paperId] || {
        status: 'unread',
        isFavorite: false,
        personalNotes: '',
        customTags: [],
        lastRead: null,
      };
      const updated = {
        ...prev,
        [paperId]: {
          ...current,
          personalNotes: notes,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const addCustomTag = useCallback((paperId: string, tag: string) => {
    if (!tag.trim()) return;
    setPaperStates(prev => {
      const current = prev[paperId] || {
        status: 'unread',
        isFavorite: false,
        personalNotes: '',
        customTags: [],
        lastRead: null,
      };
      if (current.customTags.includes(tag.trim())) return prev;
      const updated = {
        ...prev,
        [paperId]: {
          ...current,
          customTags: [...current.customTags, tag.trim()],
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const getPaperState = useCallback((paperId: string): UserPaperState => {
    return paperStates[paperId] || {
      status: 'unread',
      isFavorite: false,
      personalNotes: '',
      customTags: [],
      lastRead: null,
    };
  }, [paperStates]);

  return {
    paperStates,
    recentlyOpened,
    recordPaperView,
    getPaperState,
    toggleFavorite,
    setReadingStatus,
    savePersonalNotes,
    addCustomTag,
    activeType,
    setActiveType,
    activeStatusFilter,
    setActiveStatusFilter,
    activeCategory,
    setActiveCategory,
    sortMode,
    setSortMode,
    isMounted,
  };
}
