'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network, BarChart3, Home, BookOpen, History, GraduationCap, Compass, GitCommit, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';
import BrandLogo from '@/components/ui/brand-logo';

// Static navigation structure - defined once at module scope
// The `active` boolean is derived separately in the component to avoid recreating the array on every render
const STATIC_NAV_GROUPS: Array<{
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}> = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Explore',
    icon: Network,
    items: [
      { href: '/catalog', label: 'Catalog', icon: Network },
      { href: '/compare', label: 'Compare', icon: BarChart3 },
      { href: '/evolution', label: 'Evolution', icon: History },
      { href: '/research-map', label: 'Research Map', icon: Compass },
      { href: '/architecture-patterns', label: 'Patterns', icon: GitCommit },
    ],
  },
  {
    label: 'Learn',
    icon: BookOpen,
    items: [
      { href: '/papers', label: 'Papers', icon: GraduationCap },
      { href: '/learn', label: 'Learn', icon: BookOpen },
    ],
  },
  {
    label: 'Tools',
    icon: Compass,
    items: [
      { href: '/concepts/receptive-field', label: 'Receptive Field Explorer', icon: Compass },
      { href: '/concepts/training-dynamics', label: 'Training Dynamics', icon: Zap },
    ],
  },
];

// Derived type with active state
type NavGroupWithActive = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  items?: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean }>;
};

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotionPreference();

  // Derive active state from pathname - this is the only part that changes on navigation
  const navGroups: NavGroupWithActive[] = useMemo(() => {
    return STATIC_NAV_GROUPS.map(group => {
      if (group.href) {
        // Single link (Home)
        return {
          ...group,
          active: pathname === group.href,
        };
      }
      // Group with items
      return {
        ...group,
        items: group.items?.map(item => ({
          ...item,
          active: pathname === item.href || (item.href === '/catalog' && pathname.startsWith('/models/')),
        })),
      };
    });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1f2937] bg-[#020617]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="NeuralExplorer home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 text-[#22d3ee] group-hover:bg-[#22d3ee]/20 group-hover:scale-105 transition-all duration-300 overflow-hidden">
            <BrandLogo className="h-6 w-6 object-contain" width={24} height={24} alt="NeuralExplorer logo" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#22d3ee] via-[#67e8f9] to-[#a5f3fc] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            NeuralExplorer
          </span>
        </Link>

        {/* Tablet Navigation Links (icon-only) */}
        <nav className="hidden md:flex lg:hidden items-center gap-1" aria-label="Tablet Navigation">
          {navGroups.map((group) => {
            const Icon = group.icon;
            if (group.href) {
              // Single link (Home)
              return (
                <Link
                  key={group.href}
                  href={group.href}
                  className={cn(
                    "relative flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300",
                    group.active
                      ? "text-[#020617] bg-[#22d3ee] border border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                      : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617] border border-transparent"
                  )}
                  title={group.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            }
            // Group with dropdown
            return (
              <div key={group.label} className="relative group">
                <button
                  className={cn(
                    "relative flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300",
                    group.items?.some(item => item.active)
                      ? "text-[#020617] bg-[#22d3ee] border border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                      : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617] border border-transparent"
                  )}
                  title={group.label}
                >
                  <Icon className="h-5 w-5" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-950/95 backdrop-blur-lg border border-border/30 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {group.items?.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
                          item.active
                            ? "text-primary"
                            : "text-slate-300 hover:text-white hover:bg-slate-900/50"
                        )}
                      >
                        <ItemIcon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navGroups.map((group) => {
            if (group.href) {
              // Single link (Home)
              const Icon = group.icon;
              return (
                <Link
                  key={group.href}
                  href={group.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:px-4 xl:py-2 xl:text-sm font-medium transition-all duration-300",
                    group.active
                      ? "text-[#020617] bg-[#22d3ee] border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                      : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617] border border-transparent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{group.label}</span>
                </Link>
              );
            }
            // Group with dropdown
            const GroupIcon = group.icon;
            return (
              <div key={group.label} className="relative group">
                <button
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:px-4 xl:py-2 xl:text-sm font-medium transition-all duration-300",
                    group.items?.some(item => item.active)
                      ? "text-[#020617] bg-[#22d3ee] border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                      : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617] border border-transparent"
                  )}
                >
                  <GroupIcon className="h-4 w-4" />
                  <span>{group.label}</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-950/95 backdrop-blur-lg border border-border/30 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {group.items?.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
                          item.active
                            ? "text-primary"
                            : "text-slate-300 hover:text-white hover:bg-slate-900/50"
                        )}
                      >
                        <ItemIcon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden items-center justify-center h-10 w-10 rounded-xl border border-[#1f2937] text-[#9ca3af] hover:text-white hover:bg-slate-900 focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          <div className="flex flex-col gap-1.5 justify-center items-center w-5 h-5">
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out origin-center",
                isOpen ? "rotate-45 translate-y-[8px]" : ""
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out",
                isOpen ? "opacity-0 scale-x-0" : ""
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out origin-center",
                isOpen ? "-rotate-45 -translate-y-[8px]" : ""
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile Navigation Drawer - Collapsible Groups */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
            className="absolute top-16 left-0 w-full md:hidden overflow-hidden border-b border-[#1f2937] bg-[#020617]/95 backdrop-blur-lg px-4 py-3 shadow-xl z-50"
          >
            <nav className="grid grid-cols-2 gap-2">
              {navGroups.map((group) => {
                if (group.href) {
                  // Single link (Home)
                  const Icon = group.icon;
                  return (
                    <Link
                      key={group.href}
                      href={group.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3.5 py-3.5 text-xs font-bold transition-all duration-300 border border-slate-900/60 bg-slate-900/20",
                        group.active
                          ? "text-[#020617] bg-[#22d3ee] border-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                          : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617]/50 hover:border-slate-800"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{group.label}</span>
                    </Link>
                  );
                }
                return (
                  <div key={group.label} className="col-span-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                      {group.label}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items?.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl px-3.5 py-3.5 text-xs font-bold transition-all duration-300 border border-slate-900/60 bg-slate-900/20",
                              item.active
                                ? "text-[#020617] bg-[#22d3ee] border-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                                : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617]/50 hover:border-slate-800"
                            )}
                          >
                            <ItemIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Fixed for Thumb Zone Reachability) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[#1f2937] bg-[#020617]/95 backdrop-blur-xl px-1 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { href: '/', label: 'Home', icon: Home, active: pathname === '/' },
            { href: '/catalog', label: 'Catalog', icon: Network, active: pathname === '/catalog' || pathname.startsWith('/models/') },
            { href: '/compare', label: 'Compare', icon: BarChart3, active: pathname === '/compare' },
            { href: '/learn', label: 'Learn', icon: BookOpen, active: pathname === '/learn' },
            { href: '/papers', label: 'Papers', icon: GraduationCap, active: pathname === '/papers' },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1 rounded-xl transition-all duration-200 cursor-pointer",
                  item.active
                    ? "text-[#22d3ee] font-extrabold bg-[#22d3ee]/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                )}
              >
                <ItemIcon className={cn("h-4.5 w-4.5 transition-transform", item.active && "scale-110")} />
                <span className="text-[11px] font-bold mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}